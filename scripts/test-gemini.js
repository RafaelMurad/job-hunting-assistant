// Test script to see what Gemini models are available
/* eslint-disable @typescript-eslint/no-require-imports */
// Diagnostic script uses CommonJS for simplicity (no build step needed)
require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in environment");
  process.exit(1);
}

async function listModels() {
  console.warn("🔍 Testing Gemini API...\n");
  console.warn("API Key:", apiKey.substring(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try different model names
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro",
      "models/gemini-1.5-flash",
    ];

    console.warn("\n📋 Testing models:\n");

    for (const modelName of modelsToTry) {
      try {
        console.warn(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello"');
        const text = result.response.text();
        console.warn(`✅ ${modelName} works! Response: ${text.substring(0, 50)}`);
        break; // Stop at first working model
      } catch (err) {
        console.warn(`❌ ${modelName} failed:`, err.message.substring(0, 100));
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listModels();
