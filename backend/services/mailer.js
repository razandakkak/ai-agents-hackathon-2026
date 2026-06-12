const { Resend } = require("resend");

let resendClient;

function getMailerConfig() {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.EMAIL_FROM || "").trim();
  const replyTo = String(process.env.EMAIL_REPLY_TO || "").trim();

  if (!apiKey || !from) {
    const error = new Error("Resend configuration is incomplete");
    error.code = "missing_resend_config";
    throw error;
  }

  return {
    apiKey,
    from,
    replyTo
  };
}

function getResendClient() {
  if (!resendClient) {
    const config = getMailerConfig();
    resendClient = new Resend(config.apiKey);
  }

  return resendClient;
}

async function sendEmail({ to, subject, text }) {
  const config = getMailerConfig();
  const resend = getResendClient();

  const payload = {
    from: config.from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text
  };

  if (config.replyTo) {
    payload.reply_to = config.replyTo;
  }

  const result = await resend.emails.send(payload);
  const error = result && result.error ? result.error : null;

  if (error) {
    const sendError = new Error(error.message || "Email send failed");
    sendError.code = "resend_send_failed";
    throw sendError;
  }

  return {
    accepted: Array.isArray(payload.to) ? payload.to : [payload.to],
    rejected: [],
    messageId: result && result.data ? result.data.id || null : null
  };
}

module.exports = {
  sendEmail
};
