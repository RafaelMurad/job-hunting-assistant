// Test script to see what Gemini models are available
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  process.exit(1);
}

async function listModels() {
  console.log('🔍 Testing Gemini API...\n');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash',
    ];
    
    console.log('\n📋 Testing models:\n');
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello"');
        const text = result.response.text();
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}`);
        break; // Stop at first working model
      } catch (err) {
        console.log(`❌ ${modelName} failed:`, err.message.substring(0, 100));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
