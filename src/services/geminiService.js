require("dotenv").config({
  quiet: true,
  override: true,
});

const { GoogleGenAI } = require("@google/genai");

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from .env"
    );
  }

  return apiKey;
}

function createGeminiClient() {
  return new GoogleGenAI({
    apiKey: getApiKey(),
  });
}

async function generateText({
  prompt,
  model = "gemini-2.5-flash",
  client = null,
}) {
  if (
    !prompt ||
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error(
      "Gemini prompt cannot be empty."
    );
  }

  /*
   * During normal application execution,
   * create the real Gemini client.
   *
   * During automated tests, a fake client
   * can be supplied instead.
   */
  const ai =
    client || createGeminiClient();

  try {
    const response =
      await ai.models.generateContent({
        model,
        contents: prompt,
      });

    const text = response?.text;

    if (
      !text ||
      typeof text !== "string" ||
      !text.trim()
    ) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return text.trim();
  } catch (error) {
    /*
     * Avoid wrapping our own validation
     * error twice.
     */
    if (
      error.message ===
      "Gemini returned an empty response."
    ) {
      throw error;
    }

    throw new Error(
      `Gemini generation failed: ${error.message}`
    );
  }
}

module.exports = {
  generateText,
  createGeminiClient,
};