# Scripts

Utility scripts for development and debugging.

## `test-gemini.js`

**Purpose:** Diagnostic tool to test which Gemini AI model names actually work with your API key.

**When to use:**
- Gemini API returns 404 errors
- Google updates model names (they deprecate models occasionally)
- Verifying your API key works

**How to run:**
```bash
npm install dotenv  # Only needed once
node scripts/test-gemini.js
```

**What it does:**
1. Loads your `GEMINI_API_KEY` from `.env.local`
2. Tests multiple model name variations:
   - `gemini-pro`
   - `gemini-1.5-pro`
   - `gemini-1.5-flash`
   - `models/gemini-pro`
   - `models/gemini-1.5-pro`
   - `models/gemini-1.5-flash`
3. Shows which ones work and which fail

**Example output:**
```
🔍 Testing Gemini API...
API Key: AIzaSyCoF7...

📋 Testing models:

Testing: gemini-pro...
❌ gemini-pro failed: [404 Not Found] models/gemini-pro is not found

Testing: gemini-1.5-flash...
✅ gemini-1.5-flash works! Response: Hello
```

**Why this exists:**
In November 2025, Google deprecated `gemini-pro` and the docs were outdated. This script helped debug which model names actually work. Keep it around for future API changes.

---

## Adding New Scripts

When adding scripts:
1. Create the file in `scripts/`
2. Add description here
3. Make it executable if needed: `chmod +x scripts/your-script.sh`
4. Document what it does and when to use it
