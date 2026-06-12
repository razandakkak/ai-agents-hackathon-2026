const { buildWheelchairAssistPrompt } = require("../prompts/wheelchairSupportPrompt");
const { getOpenAIClient } = require("../services/openaiClient");

const supportedCategories = new Set(["dining", "stay", "transport", "public_place", "mixed"]);
const supportedNeeds = new Set([
  "ramp",
  "accessible_restroom",
  "elevator",
  "parking",
  "pool",
  "gym",
  "wheelchair_vehicle"
]);

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

function normalizeCategory(value) {
  const category = normalizeText(value).toLowerCase();
  return supportedCategories.has(category) ? category : "mixed";
}

function normalizeNeedList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => normalizeText(item).toLowerCase())
    .filter((item, index, array) => supportedNeeds.has(item) && array.indexOf(item) === index);
}

function sanitizePayload(payload) {
  return {
    language: languageFrom(payload || {}),
    category: normalizeCategory(payload && payload.category),
    city: normalizeText(payload && payload.city),
    neighborhood: normalizeText(payload && payload.neighborhood),
    userNeed: normalizeText(payload && payload.userNeed),
    accessibilityNeeds: normalizeNeedList(payload && payload.accessibilityNeeds),
    pickup: normalizeText(payload && payload.pickup),
    destination: normalizeText(payload && payload.destination)
  };
}

function ensureUsefulInput(payload) {
  if (
    payload.userNeed
    || payload.city
    || payload.neighborhood
    || payload.accessibilityNeeds.length
    || payload.pickup
    || payload.destination
  ) {
    return;
  }

  const error = new Error("Add the need, city, or accessibility requirements before analysis.");
  error.status = 400;
  throw error;
}

function categoryLabel(language, category) {
  const labels = {
    en: {
      dining: "dining",
      stay: "stay",
      transport: "transport",
      public_place: "public place",
      mixed: "mixed accessibility request"
    },
    ar: {
      dining: "مطاعم ومقاهي",
      stay: "إقامة",
      transport: "نقل",
      public_place: "مكان عام",
      mixed: "طلب وصول متنوع"
    }
  };

  return labels[language][category] || labels[language].mixed;
}

function buildAreaText({ city, neighborhood, language }) {
  const cityText = normalizeText(city);
  const neighborhoodText = normalizeText(neighborhood);

  if (cityText && neighborhoodText) {
    return language === "ar"
      ? `${neighborhoodText}، ${cityText}`
      : `${neighborhoodText}, ${cityText}`;
  }

  if (neighborhoodText) {
    return neighborhoodText;
  }

  if (cityText) {
    return cityText;
  }

  return language === "ar" ? "لبنان" : "Lebanon";
}

function buildQueryParts(payload) {
  const needKeywords = [];

  if (payload.accessibilityNeeds.includes("ramp")) {
    needKeywords.push("ramp");
  }
  if (payload.accessibilityNeeds.includes("accessible_restroom")) {
    needKeywords.push("accessible restroom");
  }
  if (payload.accessibilityNeeds.includes("elevator")) {
    needKeywords.push("elevator");
  }
  if (payload.accessibilityNeeds.includes("parking")) {
    needKeywords.push("accessible parking");
  }
  if (payload.accessibilityNeeds.includes("pool")) {
    needKeywords.push("pool access");
  }
  if (payload.accessibilityNeeds.includes("gym")) {
    needKeywords.push("gym access");
  }
  if (payload.accessibilityNeeds.includes("wheelchair_vehicle")) {
    needKeywords.push("wheelchair accessible vehicle");
  }

  return needKeywords;
}

function buildMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildDirectionsUrl(origin, destination) {
  if (!origin || !destination) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

async function searchWheelchairWeb(payload, inferredCategory) {
  const client = getOpenAIClient();
  const cityHint = extractCityHint(`${payload.city} ${payload.neighborhood} ${payload.userNeed} ${payload.pickup} ${payload.destination}`);

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
Use live web search to find real Lebanon-based accessibility-relevant results for this wheelchair request.
Prefer official websites, official booking/contact pages, strong public venue pages, or reputable directories.
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
      "accessHint": "string",
      "sourceUrl": "string"
    }
  ]
}

Rules:
- Return up to 5 results.
- Only include results actually found via web search.
- Do not claim a venue is fully wheelchair accessible unless the source strongly indicates it.
- If accessibility details are uncertain, say that clearly in accessHint.
- If the request is about transport, prefer accessible transport providers, ride services, or community transport pages.
- If no strong matches are found, return an empty array and explain that in liveSearchSummary.

Request:
${JSON.stringify({
              category: inferredCategory,
              city: payload.city,
              neighborhood: payload.neighborhood,
              userNeed: payload.userNeed,
              accessibilityNeeds: payload.accessibilityNeeds,
              pickup: payload.pickup,
              destination: payload.destination
            }, null, 2)}
            `.trim()
          }
        ]
      }
    ]
  });

  return extractJsonObject(response.output_text);
}

async function searchWheelchairRouteWeb(payload) {
  if (!payload.pickup || !payload.destination) {
    return {
      routeSearchSummary: "",
      routeAnalysis: {
        bestRoadSummary: "",
        roadSteps: [],
        roadWarnings: []
      }
    };
  }

  const client = getOpenAIClient();
  const cityHint = extractCityHint(`${payload.city} ${payload.neighborhood} ${payload.pickup} ${payload.destination}`);

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
Use live web search to support an accessibility-aware route suggestion in Lebanon.
The user needs wheelchair-friendly movement between the pickup and destination.
Return only valid JSON with no markdown fences.

Required JSON shape:
{
  "routeSearchSummary": "string",
  "routeAnalysis": {
    "bestRoadSummary": "string",
    "roadSteps": ["string"],
    "roadWarnings": ["string"]
  }
}

Rules:
- Focus on practical road strategy, major corridors, likely easier drop-off zones, and known uncertainty.
- Do not invent exact live traffic data.
- Do not pretend to know exact curb cuts, ramps, or sidewalk quality unless a source strongly supports it.
- If exact road confidence is limited, say so and recommend the safest high-level route to try first.
- Keep roadSteps short and clear.
- Keep roadWarnings honest.

Request:
${JSON.stringify({
              city: payload.city,
              neighborhood: payload.neighborhood,
              pickup: payload.pickup,
              destination: payload.destination,
              accessibilityNeeds: payload.accessibilityNeeds,
              userNeed: payload.userNeed
            }, null, 2)}
            `.trim()
          }
        ]
      }
    ]
  });

  return extractJsonObject(response.output_text);
}

function buildGoogleMapsSearches(payload, inferredCategory) {
  const language = payload.language;
  const category = normalizeCategory(inferredCategory || payload.category);
  const area = buildAreaText(payload);
  const keywords = buildQueryParts(payload);
  const searches = [];

  const titles = {
    en: {
      primary: "Best primary search",
      nearby: "Broader nearby search",
      details: "Accessibility details search",
      route: "Route and ride search"
    },
    ar: {
      primary: "البحث الأساسي",
      nearby: "بحث أوسع قريب",
      details: "بحث تفاصيل الوصول",
      route: "بحث المسار والنقلة"
    }
  };

  const baseTypeMap = {
    dining: "wheelchair accessible restaurants cafes",
    stay: "wheelchair accessible hotels resorts",
    transport: "wheelchair accessible transport taxi",
    public_place: "wheelchair accessible public places",
    mixed: "wheelchair accessible places"
  };

  const baseQuery = `${baseTypeMap[category]} in ${area} Lebanon ${keywords.join(" ")}`.trim();
  searches.push({
    title: titles[language].primary,
    query: baseQuery,
    whyMatch: language === "ar"
      ? `يبدأ بهذا البحث لأنه يطابق فئة ${categoryLabel(language, category)} مع المنطقة واحتياجات الوصول الأساسية.`
      : `Starts with the main ${categoryLabel(language, category)} search for this area and the key mobility needs.`,
    url: buildMapsUrl(baseQuery)
  });

  const nearbyQuery = `${baseTypeMap[category]} near ${area} Lebanon`.trim();
  searches.push({
    title: titles[language].nearby,
    query: nearbyQuery,
    whyMatch: language === "ar"
      ? "يعطي بدائل أكثر إذا كانت النتائج الأولى محدودة."
      : "Broadens the search in case the first results are limited.",
    url: buildMapsUrl(nearbyQuery)
  });

  const detailKeywords = keywords.length ? keywords.join(" ") : "wheelchair access entrance";
  const detailQuery = `${baseTypeMap[category]} ${detailKeywords} in ${area} Lebanon`.trim();
  searches.push({
    title: titles[language].details,
    query: detailQuery,
    whyMatch: language === "ar"
      ? "يركز على التفاصيل التي يجب التأكد منها قبل الذهاب."
      : "Focuses on the specific accessibility details to verify before going.",
    url: buildMapsUrl(detailQuery)
  });

  if (category === "transport" || payload.pickup || payload.destination) {
    const routeText = payload.pickup && payload.destination
      ? `${payload.pickup} to ${payload.destination}`
      : area;
    const routeQuery = `wheelchair accessible taxi transport ${routeText} Lebanon`.trim();
    searches.push({
      title: titles[language].route,
      query: routeQuery,
      whyMatch: language === "ar"
        ? "مفيد عندما تكون الأولوية للمشوار نفسه أو لسيارة مناسبة للكرسي."
        : "Useful when the main need is the ride itself or a wheelchair-friendly vehicle.",
      url: buildMapsUrl(routeQuery)
    });
  }

  return searches.slice(0, 4);
}

async function assistWithWheelchairSupport(payload) {
  const sanitized = sanitizePayload(payload || {});
  ensureUsefulInput(sanitized);

  const prompt = buildWheelchairAssistPrompt(sanitized);
  const result = await generateJson(prompt);
  const inferredCategory = normalizeCategory(result.situationType || sanitized.category);
  const [liveSearch, routeSearch] = await Promise.all([
    searchWheelchairWeb(sanitized, inferredCategory).catch(() => ({
      liveSearchSummary: "",
      liveSearchResults: []
    })),
    searchWheelchairRouteWeb(sanitized).catch(() => ({
      routeSearchSummary: "",
      routeAnalysis: {
        bestRoadSummary: "",
        roadSteps: [],
        roadWarnings: []
      }
    }))
  ]);
  const routeSummary = normalizeText(routeSearch.routeAnalysis && routeSearch.routeAnalysis.bestRoadSummary)
    || normalizeText(result.routeSummary);
  const routeSteps = Array.isArray(routeSearch.routeAnalysis && routeSearch.routeAnalysis.roadSteps)
    && routeSearch.routeAnalysis.roadSteps.length
    ? routeSearch.routeAnalysis.roadSteps.map((item) => normalizeText(item)).filter(Boolean)
    : Array.isArray(result.routeSteps)
      ? result.routeSteps.map((item) => normalizeText(item)).filter(Boolean)
      : [];
  const routeWarnings = Array.isArray(routeSearch.routeAnalysis && routeSearch.routeAnalysis.roadWarnings)
    && routeSearch.routeAnalysis.roadWarnings.length
    ? routeSearch.routeAnalysis.roadWarnings.map((item) => normalizeText(item)).filter(Boolean)
    : Array.isArray(result.routeWarnings)
      ? result.routeWarnings.map((item) => normalizeText(item)).filter(Boolean)
      : [];

  return {
    language: sanitized.language,
    category: inferredCategory,
    city: sanitized.city,
    neighborhood: sanitized.neighborhood,
    accessibilityNeeds: sanitized.accessibilityNeeds,
    reconstructedNeed: normalizeText(result.reconstructedNeed),
    mobilitySummary: normalizeText(result.mobilitySummary),
    searchSummary: normalizeText(result.searchSummary),
    routeSummary,
    routeSearchSummary: normalizeText(routeSearch.routeSearchSummary),
    routeSteps,
    routeWarnings,
    practicalChecks: Array.isArray(result.practicalChecks)
      ? result.practicalChecks.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    nextSteps: Array.isArray(result.nextSteps)
      ? result.nextSteps.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    verificationQuestions: Array.isArray(result.verificationQuestions)
      ? result.verificationQuestions.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    liveSearchSummary: normalizeText(liveSearch.liveSearchSummary),
    liveSearchResults: Array.isArray(liveSearch.liveSearchResults)
      ? liveSearch.liveSearchResults
        .map((item) => ({
          name: normalizeText(item && item.name),
          type: normalizeText(item && item.type),
          area: normalizeText(item && item.area),
          whyMatch: normalizeText(item && item.whyMatch),
          accessHint: normalizeText(item && item.accessHint),
          sourceUrl: normalizeText(item && item.sourceUrl)
        }))
        .filter((item) => item.name && item.sourceUrl)
      : [],
    googleMapsSearches: buildGoogleMapsSearches(sanitized, inferredCategory),
    directionsUrl: buildDirectionsUrl(sanitized.pickup, sanitized.destination),
    followUpQuestion: normalizeText(result.followUpQuestion)
  };
}

module.exports = {
  assistWithWheelchairSupport
};
