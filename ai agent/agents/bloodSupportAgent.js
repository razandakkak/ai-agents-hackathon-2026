const institutions = require("../data/institutions");
const demoDonors = require("../data/demoDonors");
const { buildExtractionPrompt, buildPlanPrompt } = require("../prompts/bloodSupportPrompt");
const { getOpenAIClient } = require("../services/openaiClient");
const { fetchOfficialSourceContext } = require("../services/liveSources");
const { readSignups } = require("../../backend/services/volunteerRegistry");

const bloodRarityScore = {
  "O-": 5,
  "AB-": 5,
  "B-": 4,
  "A-": 4,
  "O+": 3,
  "AB+": 2,
  "B+": 2,
  "A+": 1
};

const urgencyScore = {
  immediate: 5,
  within_24h: 4,
  this_week: 2,
  planned: 1
};

const urgencyLabel = {
  en: {
    immediate: "Immediate",
    within_24h: "Within 24 hours",
    this_week: "This week",
    planned: "Planned"
  },
  ar: {
    immediate: "فورا",
    within_24h: "خلال 24 ساعة",
    this_week: "هالأسبوع",
    planned: "مخطط"
  }
};

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function languageFrom(payload) {
  return payload.language === "ar" ? "ar" : "en";
}

function getUrgencyLabel(language, urgency) {
  return urgencyLabel[language][urgency] || urgencyLabel[language].this_week;
}

function getPriorityLabel(language, priority) {
  if (language === "ar") {
    return {
      Critical: "حرج",
      High: "مرتفع",
      Moderate: "متوسط",
      Planned: "منخفض"
    }[priority];
  }

  return priority;
}

function getConfidenceLabel(language, hasLocalMatch) {
  if (language === "ar") {
    return hasLocalMatch ? "قوي" : "جزئي";
  }

  return hasLocalMatch ? "Strong" : "Partial";
}

function rankInstitutions(city) {
  const normalizedCity = normalize(city);

  return institutions
    .map((institution) => {
      let score = 0;

      if (normalize(institution.city) === normalizedCity) {
        score += 4;
      }

      if (institution.city === "Nationwide") {
        score += 3;
      }

      return {
        ...institution,
        score
      };
    })
    .sort((first, second) => second.score - first.score);
}

function resolvePriority(totalScore) {
  if (totalScore >= 11) {
    return "Critical";
  }

  if (totalScore >= 8) {
    return "High";
  }

  if (totalScore >= 5) {
    return "Moderate";
  }

  return "Planned";
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model output");
  }

  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
}

async function generateJson(prompt) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: prompt
          }
        ]
      }
    ]
  });

  return extractJsonObject(response.output_text);
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => ({
      role: message && message.role === "assistant" ? "assistant" : "user",
      text: String(message && message.text ? message.text : "").trim()
    }))
    .filter((message) => message.text);
}

function sanitizeStructuredRequest(data, language) {
  return {
    bloodType: String(data.bloodType || "").trim(),
    city: String(data.city || "").trim(),
    unitsNeeded: Number(data.unitsNeeded || 0),
    urgency: String(data.urgency || "").trim(),
    patientType: String(data.patientType || "").trim() || "medical case",
    contactMethod: String(data.contactMethod || "").trim() || "mixed",
    language
  };
}

function findDemoDonorMatches(structuredRequest) {
  const normalizedCity = normalize(structuredRequest.city);

  return demoDonors
    .filter((donor) => donor.bloodType === structuredRequest.bloodType)
    .map((donor) => {
      let score = 0;
      if (normalize(donor.city) === normalizedCity) {
        score += 3;
      }
      if (normalize(donor.availability).includes("today")) {
        score += 2;
      } else if (normalize(donor.availability).includes("24")) {
        score += 1;
      }

      return {
        ...donor,
        score
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeVolunteerSignup(signup) {
  const contact = String(signup.contact || "").trim();

  return {
    id: signup.id,
    name: signup.name,
    bloodType: signup.bloodType,
    city: signup.city,
    area: "Volunteer network",
    availability: signup.availability || "Not specified",
    contactPreference: signup.contactPreference || "phone",
    contact,
    email: isEmail(contact) ? contact : "",
    sourceType: "network"
  };
}

async function findVolunteerMatches(structuredRequest) {
  const normalizedCity = normalize(structuredRequest.city);
  const signups = await readSignups();

  return signups
    .filter((signup) => signup.bloodType === structuredRequest.bloodType)
    .map((signup) => {
      let score = 0;

      if (normalize(signup.city) === normalizedCity) {
        score += 4;
      }

      if (isEmail(signup.contact)) {
        score += 1;
      }

      return {
        ...normalizeVolunteerSignup(signup),
        score
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);
}

async function findAllDonorMatches(structuredRequest) {
  const volunteerMatches = await findVolunteerMatches(structuredRequest);
  const fallbackDemoMatches = findDemoDonorMatches(structuredRequest).map((donor) => ({
    ...donor,
    sourceType: donor.sourceType || "demo"
  }));

  return [...volunteerMatches, ...fallbackDemoMatches]
    .sort((first, second) => second.score - first.score)
    .slice(0, 5);
}

function buildVerificationSummary(language, liveContext, rankedInstitutions) {
  const redCross = liveContext.redCross;
  const aubmc = liveContext.aubmc;
  const lines = [];

  if (language === "ar") {
    if (redCross && redCross.fetched) {
      lines.push("تم التحقق مباشرة من صفحة الصليب الأحمر اللبناني وصفحة التواصل الخاصة به.");
    } else {
      lines.push("تعذر التحقق الحي من موقع الصليب الأحمر اللبناني من بيئة التشغيل الحالية.");
    }

    if (aubmc && aubmc.fetched) {
      lines.push("تم التحقق مباشرة من صفحة AUBMC التي تحتوي على معلومات الاتصال وبنك الدم.");
    } else {
      lines.push("تعذر التحقق الحي من صفحة AUBMC من بيئة التشغيل الحالية.");
    }

    lines.push("لم يتم العثور على مخزون حي معلن حسب الفصيلة أو عدد الوحدات المطلوبة في المصادر العامة.");
    lines.push(`أقوى جهة رسمية حالية للتصرف السريع هي ${rankedInstitutions[0] ? rankedInstitutions[0].name : "الجهات الرسمية المدرجة"}.`);
    return lines;
  }

  if (redCross && redCross.fetched) {
    lines.push("Verified live: Lebanese Red Cross main page and contact page were fetched successfully.");
  } else {
    lines.push("Not verified live: the Lebanese Red Cross site could not be fetched from the current runtime environment.");
  }

  if (aubmc && aubmc.fetched) {
    lines.push("Verified live: the AUBMC contact / blood bank information page was fetched successfully.");
  } else {
    lines.push("Not verified live: the AUBMC page could not be fetched from the current runtime environment.");
  }

  lines.push("Not verified live: no public source exposed confirmed stock for the exact blood type and unit count.");
  lines.push(`Best official contact path right now: ${rankedInstitutions[0] ? rankedInstitutions[0].name : "the listed official institutions"}.`);
  return lines;
}

function injectConcreteContactActions(actions, rankedInstitutions, language) {
  const nextActions = Array.isArray(actions) ? [...actions] : [];
  const redCross = rankedInstitutions.find((item) => item.id === "lebanese-red-cross");
  const aubmc = rankedInstitutions.find((item) => item.id === "aubmc");
  const hasConcreteContact = nextActions.some((item) => /\+961|\b140\b|\b1760\b|@/.test(String(item)));

  if (hasConcreteContact) {
    return nextActions;
  }

  if (language === "ar") {
    if (redCross) {
      nextActions.unshift(
        `اتصلوا مباشرة بالصليب الأحمر اللبناني على ${redCross.contact.emergency} للطوارئ أو ${redCross.contact.hotline} للخط الساخن، ومعكم اسم المستشفى، المدينة، الفصيلة، وعدد الوحدات.`
      );
    }

    if (aubmc) {
      nextActions.push(
        `إذا احتجتم مركزا مرجعيا إضافيا، اتصلوا بـ ${aubmc.name} على ${aubmc.contact.mainPhone} أو بنك الدم على ${aubmc.contact.bloodBankPhone}.`
      );
    }

    return nextActions;
  }

  if (redCross) {
    nextActions.unshift(
      `Call the Lebanese Red Cross directly on ${redCross.contact.emergency} for emergencies or ${redCross.contact.hotline} for the hotline, and provide the hospital name, city, blood type, and units needed.`
    );
  }

  if (aubmc) {
    nextActions.push(
      `If you need a major referral center as backup, contact ${aubmc.name} on ${aubmc.contact.mainPhone} or the blood bank on ${aubmc.contact.bloodBankPhone}.`
    );
  }

  return nextActions;
}

async function analyzeConversation({ messages, language }) {
  const prompt = buildExtractionPrompt({
    language,
    messages
  });

  const result = await generateJson(prompt);

  return {
    assistantReply: String(result.assistantReply || ""),
    structuredRequest: sanitizeStructuredRequest(result, language),
    readyForPlan: Boolean(result.readyForPlan),
    missingFields: Array.isArray(result.missingFields)
      ? result.missingFields.map((item) => String(item))
      : []
  };
}

async function buildPlan(structuredRequest) {
  const language = structuredRequest.language;
  const rarity = bloodRarityScore[structuredRequest.bloodType] || 1;
  const urgencyValue = urgencyScore[structuredRequest.urgency] || 1;
  const unitWeight = Math.min(structuredRequest.unitsNeeded || 1, 5);
  const totalScore = rarity + urgencyValue + unitWeight;
  const priority = resolvePriority(totalScore);
  const rankedInstitutions = rankInstitutions(structuredRequest.city);
  const demoDonorMatches = await findAllDonorMatches(structuredRequest);
  const priorityLabel = getPriorityLabel(language, priority);
  const confidence = getConfidenceLabel(language, rankedInstitutions[0] && rankedInstitutions[0].score >= 4);
  const liveContext = await fetchOfficialSourceContext();

  const reasoningFacts = [
    `${structuredRequest.bloodType} rarity score: ${rarity}/5`,
    `Urgency score: ${urgencyValue}/5`,
    `Units requested weight: ${unitWeight}/5`,
    rankedInstitutions[0]
      ? `Top official institution: ${rankedInstitutions[0].name}`
      : "No ranked official institution found"
  ];

  const prompt = buildPlanPrompt({
    language,
    request: structuredRequest,
    institutions: rankedInstitutions,
    demoDonorMatches,
    liveContext,
    priority: priorityLabel,
    confidence,
    urgencyLabel: getUrgencyLabel(language, structuredRequest.urgency),
    reasoningFacts
  });

  const generated = await generateJson(prompt);
  const recommendedActions = injectConcreteContactActions(
    Array.isArray(generated.recommendedActions) ? generated.recommendedActions.map(String) : [],
    rankedInstitutions,
    language
  );
  const verificationSummary = buildVerificationSummary(language, liveContext, rankedInstitutions);

  return {
    priority,
    priorityLabel,
    confidence,
    summary: String(generated.summary || ""),
    reasoning: Array.isArray(generated.reasoning) ? generated.reasoning.map(String) : [],
    verificationSummary,
    recommendedActions,
    donorMessage: String(generated.donorMessage || ""),
    demoDonorMatches,
    officialInstitutions: rankedInstitutions,
    liveContext
  };
}

async function chatWithBloodSupportAgent(payload) {
  const language = languageFrom(payload);
  const messages = normalizeMessages(payload.messages);
  const analysis = await analyzeConversation({
    messages,
    language
  });

  if (!analysis.readyForPlan) {
    return {
      language,
      assistantMessage: analysis.assistantReply,
      structuredRequest: analysis.structuredRequest,
      missingFields: analysis.missingFields,
      readyForPlan: false
    };
  }

  const plan = await buildPlan(analysis.structuredRequest);

  return {
    language,
    assistantMessage: `${analysis.assistantReply}\n\n${plan.summary}`,
    structuredRequest: analysis.structuredRequest,
    missingFields: [],
    readyForPlan: true,
    plan
  };
}

async function triageRequest(payload) {
  const language = languageFrom(payload);
  const structuredRequest = sanitizeStructuredRequest(payload, language);
  return buildPlan(structuredRequest);
}

module.exports = {
  institutions,
  triageRequest,
  chatWithBloodSupportAgent
};
