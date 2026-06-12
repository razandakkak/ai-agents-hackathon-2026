const { buildHearingAssistPrompt } = require("../prompts/hearingSupportPrompt");
const { getOpenAIClient } = require("../services/openaiClient");

function languageFrom(payload) {
  return payload.language === "ar" ? "ar" : "en";
}

function normalizeText(value) {
  return String(value || "").trim();
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

function extractCityHint(text) {
  const source = normalizeText(text).toLowerCase();
  const knownCities = ["beirut", "tripoli", "sidon", "saida", "tyre", "jounieh", "zahle", "baalbek", "nabatieh"];
  return knownCities.find((city) => source.includes(city)) || "Beirut";
}

async function searchHearingWeb(payload) {
  const client = getOpenAIClient();
  const cityHint = extractCityHint(`${payload.userNeed} ${payload.searchScope} ${payload.incomingTranscript}`);

  const response = await client.responses.create({
    model: process.env.OPENAI_SEARCH_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini",
    tools: [
      {
        type: "web_search_preview",
        search_context_size: "medium",
        user_location: {
          type: "approximate",
          country: "LB",
          city: cityHint
        }
      }
    ],
    tool_choice: {
      mode: "required",
      tools: [
        {
          type: "web_search_preview"
        }
      ]
    },
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: `
Use live web search to find real places or services in Lebanon relevant to this hearing-access request.
Prefer official websites, official ordering/contact pages, or strong public listings.
Return only valid JSON with no markdown fences.

Required JSON shape:
{
  "liveSearchSummary": "string",
  "liveSearchResults": [
    {
      "name": "string",
      "type": "string",
      "area": "string",
      "whyMatch": "string",
      "contactHint": "string",
      "sourceUrl": "string"
    }
  ]
}

Rules:
- Return up to 5 results.
- Only include results you actually found via web search.
- If the request is broad, prioritize the clearest matches.
- If no strong matches are found, return an empty liveSearchResults array and explain that in liveSearchSummary.
- Do not invent URLs, names, or contact methods.

Request:
${JSON.stringify(payload, null, 2)}
            `.trim()
          }
        ]
      }
    ]
  });

  return extractJsonObject(response.output_text);
}

function sanitizeAssistPayload(payload) {
  return {
    language: languageFrom(payload),
    inputLanguage: normalizeText(payload.inputLanguage) || "ar",
    userNeed: normalizeText(payload.userNeed),
    searchScope: normalizeText(payload.searchScope),
    incomingTranscript: normalizeText(payload.incomingTranscript),
    replyIntent: normalizeText(payload.replyIntent),
    preferredChannel: normalizeText(payload.preferredChannel) || "text"
  };
}

function ensureUsefulInput(payload) {
  if (payload.userNeed || payload.searchScope || payload.incomingTranscript || payload.replyIntent) {
    return;
  }

  const error = new Error("Add at least one hearing-support input before analysis.");
  error.status = 400;
  throw error;
}

async function assistWithHearingSupport(payload) {
  const sanitized = sanitizeAssistPayload(payload || {});
  ensureUsefulInput(sanitized);

  const prompt = buildHearingAssistPrompt(sanitized);
  const [result, liveSearch] = await Promise.all([
    generateJson(prompt),
    searchHearingWeb(sanitized).catch(() => ({
      liveSearchSummary: "",
      liveSearchResults: []
    }))
  ]);

  return {
    language: sanitized.language,
    reconstructedNeed: normalizeText(result.reconstructedNeed),
    communicationBarrier: normalizeText(result.communicationBarrier),
    barrierSignals: Array.isArray(result.barrierSignals)
      ? result.barrierSignals.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    simpleSummary: normalizeText(result.simpleSummary),
    nextSteps: Array.isArray(result.nextSteps)
      ? result.nextSteps.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    liveSearchSummary: normalizeText(liveSearch.liveSearchSummary),
    liveSearchResults: Array.isArray(liveSearch.liveSearchResults)
      ? liveSearch.liveSearchResults
        .map((item) => ({
          name: normalizeText(item && item.name),
          type: normalizeText(item && item.type),
          area: normalizeText(item && item.area),
          whyMatch: normalizeText(item && item.whyMatch),
          contactHint: normalizeText(item && item.contactHint),
          sourceUrl: normalizeText(item && item.sourceUrl)
        }))
        .filter((item) => item.name && item.sourceUrl)
      : [],
    replyDraft: normalizeText(result.replyDraft),
    spokenReply: normalizeText(result.spokenReply),
    followUpQuestion: normalizeText(result.followUpQuestion)
  };
}

module.exports = {
  assistWithHearingSupport
};
