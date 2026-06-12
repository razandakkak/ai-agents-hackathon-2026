require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { toFile } = require("../ai agent/node_modules/openai");
const { sendEmail } = require("./services/mailer");
const { addVolunteerSignup } = require("./services/volunteerRegistry");
const { getOpenAIClient } = require("../ai agent/services/openaiClient");
const {
  institutions,
  triageRequest,
  chatWithBloodSupportAgent
} = require("../ai agent/agents/bloodSupportAgent");
const { assistWithHearingSupport } = require("../ai agent/agents/hearingSupportAgent");
const { assistWithWheelchairSupport } = require("../ai agent/agents/wheelchairSupportAgent");

const app = express();
const port = process.env.PORT || 4000;
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json({
  limit: "15mb"
}));
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "people-in-need",
    focus: "blood-support-agent"
  });
});

app.get("/api/institutions", (req, res) => {
  res.json(institutions);
});

app.post("/api/triage", async (req, res, next) => {
  try {
    console.info("[api] /api/triage request", JSON.stringify(req.body || {}));
    const result = await triageRequest(req.body || {});
    console.info("[api] /api/triage response", JSON.stringify({
      priority: result.priority,
      priorityLabel: result.priorityLabel,
      institutions: (result.officialInstitutions || []).map((item) => item.name)
    }));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/chat", async (req, res, next) => {
  try {
    console.info("[api] /api/chat request", JSON.stringify(req.body || {}));
    const result = await chatWithBloodSupportAgent(req.body || {});
    console.info("[api] /api/chat response", JSON.stringify({
      readyForPlan: result.readyForPlan,
      missingFields: result.missingFields || [],
      hasPlan: Boolean(result.plan)
    }));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/hearing-assist", async (req, res, next) => {
  try {
    console.info("[api] /api/hearing-assist request", JSON.stringify({
      language: req.body && req.body.language ? req.body.language : "en",
      hasUserNeed: Boolean(req.body && req.body.userNeed),
      hasIncomingTranscript: Boolean(req.body && req.body.incomingTranscript),
      hasReplyIntent: Boolean(req.body && req.body.replyIntent),
      preferredChannel: req.body && req.body.preferredChannel ? req.body.preferredChannel : null
    }));

    const result = await assistWithHearingSupport(req.body || {});

    console.info("[api] /api/hearing-assist response", JSON.stringify({
      hasNeed: Boolean(result.reconstructedNeed),
      barrierSignals: result.barrierSignals.length,
      nextSteps: result.nextSteps.length,
      liveSearchResults: Array.isArray(result.liveSearchResults) ? result.liveSearchResults.length : 0
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/wheelchair-assist", async (req, res, next) => {
  try {
    console.info("[api] /api/wheelchair-assist request", JSON.stringify({
      language: req.body && req.body.language ? req.body.language : "en",
      category: req.body && req.body.category ? req.body.category : "mixed",
      city: req.body && req.body.city ? req.body.city : "",
      neighborhood: req.body && req.body.neighborhood ? req.body.neighborhood : "",
      needCount: Array.isArray(req.body && req.body.accessibilityNeeds)
        ? req.body.accessibilityNeeds.length
        : 0,
      hasUserNeed: Boolean(req.body && req.body.userNeed),
      hasPickup: Boolean(req.body && req.body.pickup),
      hasDestination: Boolean(req.body && req.body.destination)
    }));

    const result = await assistWithWheelchairSupport(req.body || {});

    console.info("[api] /api/wheelchair-assist response", JSON.stringify({
      category: result.category,
      practicalChecks: result.practicalChecks.length,
      nextSteps: result.nextSteps.length,
      googleMapsSearches: result.googleMapsSearches.length
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/hearing-transcribe", async (req, res, next) => {
  try {
    const audioBase64 = String(req.body && req.body.audioBase64 ? req.body.audioBase64 : "").trim();
    const mimeType = String(req.body && req.body.mimeType ? req.body.mimeType : "audio/webm").trim();
    const inputLanguage = String(req.body && req.body.inputLanguage ? req.body.inputLanguage : "mixed").trim();

    console.info("[api] /api/hearing-transcribe request", JSON.stringify({
      inputLanguage,
      mimeType,
      hasAudio: Boolean(audioBase64),
      audioLength: audioBase64.length
    }));

    if (!audioBase64) {
      return res.status(400).json({
        error: "Missing recorded audio"
      });
    }

    const client = getOpenAIClient();
    const buffer = Buffer.from(audioBase64, "base64");
    const extension = mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("mpeg")
        ? "mp3"
        : mimeType.includes("ogg")
          ? "ogg"
          : "webm";
    const audioFile = await toFile(buffer, `hearing-input.${extension}`, {
      type: mimeType
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe",
      prompt: "Transcribe exactly what is said. The speaker may switch between Lebanese Arabic, Arabic, English, and Arabizi in the same sentence. Keep names, places, and numbers accurate.",
      response_format: "json"
    });

    const transcript = String(transcription.text || "").trim();

    console.info("[api] /api/hearing-transcribe response", JSON.stringify({
      textLength: transcript.length,
      preview: transcript.slice(0, 120)
    }));

    return res.json({
      success: true,
      transcript
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/hearing-speak", async (req, res, next) => {
  try {
    const text = String(req.body && req.body.text ? req.body.text : "").trim();
    const language = req.body && req.body.language === "ar" ? "ar" : "en";
    const voice = String(req.body && req.body.voice ? req.body.voice : "coral").trim();
    const style = String(req.body && req.body.style ? req.body.style : "warm_female").trim();

    console.info("[api] /api/hearing-speak request", JSON.stringify({
      language,
      voice,
      style,
      textLength: text.length
    }));

    if (!text) {
      return res.status(400).json({
        error: "Missing text for speech generation"
      });
    }

    const client = getOpenAIClient();
    const styleInstruction = language === "ar"
      ? `Speak only in Lebanese Arabic using Arabic script pronunciation and Lebanese phrasing. Avoid MSA announcer tone. Sound like a natural supportive Lebanese speaker. Keep the delivery ${style.replace(/_/g, " ")}, warm, clear, and conversational.`
      : `Speak in natural clear English. Keep the delivery ${style.replace(/_/g, " ")} and supportive.`;

    const speech = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice,
      input: text,
      instructions: styleInstruction,
      response_format: "mp3"
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    console.info("[api] /api/hearing-speak response", JSON.stringify({
      voice,
      size: buffer.length
    }));

    return res.json({
      success: true,
      mimeType: "audio/mpeg",
      audioBase64: buffer.toString("base64")
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/send-email", async (req, res, next) => {
  try {
    console.info("[api] /api/send-email request", JSON.stringify({
      to: req.body && req.body.to ? req.body.to : null,
      hasSubject: Boolean(req.body && req.body.subject),
      hasText: Boolean(req.body && req.body.text)
    }));

    const { to, subject, text } = req.body || {};
    if (!to || !subject || !text) {
      return res.status(400).json({
        error: "Missing required email fields"
      });
    }

    const result = await sendEmail({
      to: String(to).trim(),
      subject: String(subject).trim(),
      text: String(text)
    });

    console.info("[api] /api/send-email response", JSON.stringify(result));
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/volunteer-signup", async (req, res, next) => {
  try {
    console.info("[api] /api/volunteer-signup request", JSON.stringify(req.body || {}));
    const signup = await addVolunteerSignup(req.body || {});
    console.info("[api] /api/volunteer-signup response", JSON.stringify({
      id: signup.id,
      bloodType: signup.bloodType,
      city: signup.city
    }));
    return res.json({
      success: true,
      signup
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: "Invalid JSON body"
    });
  }

  if (error && error.code === "missing_openai_api_key") {
    return res.status(503).json({
      error: "OPENAI_API_KEY is missing. Add it before running the blood agent."
    });
  }

  if (error && error.code === "missing_smtp_config") {
    return res.status(503).json({
      error: "SMTP configuration is missing. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM."
    });
  }

  if (error && error.status >= 400 && error.status < 600) {
    return res.status(error.status).json({
      error: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "The agent could not complete this request."
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Translating Your Needs running on http://localhost:${port}`);
});
