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
  const result = await generateJson(prompt);

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
    replyDraft: normalizeText(result.replyDraft),
    spokenReply: normalizeText(result.spokenReply),
    followUpQuestion: normalizeText(result.followUpQuestion)
  };
}

module.exports = {
  assistWithHearingSupport
};
