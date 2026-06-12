function buildExtractionPrompt({ language, messages }) {
  const languageInstruction = language === "ar"
    ? "Reply in Lebanese Arabic using Arabic script."
    : "Reply in English.";

  return `
You are helping with blood support requests in Lebanon.
${languageInstruction}

Read the conversation and extract only concrete details the user has actually provided.
Return only valid JSON with no markdown fences.

Required JSON shape:
{
  "assistantReply": "string",
  "bloodType": "string or empty",
  "city": "string or empty",
  "unitsNeeded": "number or 0",
  "urgency": "immediate | within_24h | this_week | planned | empty",
  "patientType": "surgery | accident | chronic treatment | medical case | empty",
  "contactMethod": "whatsapp | phone | mixed | empty",
  "readyForPlan": true,
  "missingFields": ["string"]
}

Rules:
- Extract only what the user actually said.
- If critical details are missing, set readyForPlan to false.
- The minimum needed to generate a plan is: bloodType, city, unitsNeeded, urgency.
- Ask only for the highest-value missing details in assistantReply.
- Keep assistantReply short and natural.
- If enough data is present, assistantReply should say you are preparing the plan.

Conversation:
${JSON.stringify(messages, null, 2)}
`.trim();
}

function buildPlanPrompt({
  language,
  request,
  institutions,
  demoDonorMatches,
  liveContext,
  priority,
  confidence,
  urgencyLabel,
  reasoningFacts
}) {
  const languageInstructions = language === "ar"
    ? "Write all user-facing text in Lebanese Arabic using Arabic script."
    : "Write all user-facing text in clear English.";

  return `
You are a blood-support coordination agent for Lebanon.
${languageInstructions}

Use the structured request, official institutions, and live source context below.
Do not invent hospitals, phone numbers, hours, blood inventory, or successful bookings.
Do not tell the user to browse websites or search on their own.
Instead, use the exact phone numbers, emails, blood bank extensions, and institution details from the provided context.
If live availability is unknown, say that clearly, but still give a final actionable output with the best concrete contacts to use immediately.
If demo donor matches are provided, present them clearly as demo volunteer matches for showcase purposes only, not as verified real donors.
Return only valid JSON with no markdown fences.

Required JSON shape:
{
  "summary": "string",
  "reasoning": ["string", "string", "string", "string"],
  "recommendedActions": ["string"],
  "donorMessage": "string"
}

Rules:
- Keep summary to 2-3 sentences.
- Keep reasoning concise and grounded in the provided facts.
- Keep actions practical and non-medical.
- Recommended actions must use concrete contact details from the provided context whenever available.
- Never tell the user to "go check the website" as the main action.
- The donor message must be ready to copy and share.
- Never claim confirmed blood stock unless the live context explicitly says so.

Deterministic assessment:
${JSON.stringify({
    priority,
    confidence,
    urgencyLabel,
    reasoningFacts
  }, null, 2)}

Structured request:
${JSON.stringify(request, null, 2)}

Official institutions:
${JSON.stringify(institutions, null, 2)}

Live source context:
${JSON.stringify(liveContext, null, 2)}

Demo donor matches:
${JSON.stringify(demoDonorMatches, null, 2)}
`.trim();
}

module.exports = {
  buildExtractionPrompt,
  buildPlanPrompt
};
