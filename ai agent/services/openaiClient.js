const OpenAI = require("openai");

let client;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is missing");
    error.code = "missing_openai_api_key";
    throw error;
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}

module.exports = {
  getOpenAIClient
};
