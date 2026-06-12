const nodemailer = require("nodemailer");

let transporter;

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass || !from) {
    const error = new Error("SMTP configuration is incomplete");
    error.code = "missing_smtp_config";
    throw error;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    from
  };
}

function getTransporter() {
  if (!transporter) {
    const config = getMailerConfig();
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const config = getMailerConfig();
  const mailer = getTransporter();

  const info = await mailer.sendMail({
    from: config.from,
    to,
    subject,
    text
  });

  return {
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    messageId: info.messageId || null
  };
}

module.exports = {
  sendEmail
};
