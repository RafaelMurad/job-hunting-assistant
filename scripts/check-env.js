#!/usr/bin/env node
/**
 * Environment Variable Checker
 *
 * Validates that all required environment variables are set.
 * Used locally and in CI to catch missing env vars early.
 *
 * SECURITY: This script NEVER logs env var values, only names.
 *
 * Usage:
 *   npm run env:check
 *   node scripts/check-env.js
 *
 * Exit codes:
 *   0 - All required vars are set
 *   1 - Missing required vars
 */

// Load .env.local for local development (not in CI)
if (!process.env.CI) {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });
}

const required = [
  // Database
  "DATABASE_URL",

  // Authentication
  "NEON_AUTH_BASE_URL",

  // AI (at least one)
  // Checked separately below
];

const aiProviders = ["GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"];

const optional = ["DATABASE_URL_UNPOOLED", "OWNER_EMAIL", "BLOB_READ_WRITE_TOKEN", "AI_PROVIDER"];

function checkEnv() {
  const missing = [];
  const warnings = [];

  // Check required vars
  for (const name of required) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  // Check AI provider (at least one must be set)
  const hasAiProvider = aiProviders.some((name) => process.env[name]);
  if (!hasAiProvider) {
    missing.push(`One of: ${aiProviders.join(", ")}`);
  }

  // Check optional vars (warn only)
  for (const name of optional) {
    if (!process.env[name]) {
      warnings.push(name);
    }
  }

  // Output results
  console.log("\n🔍 Environment Variable Check\n");
  console.log("━".repeat(50));

  if (missing.length === 0) {
    console.log("✅ All required environment variables are set\n");

    // Show which AI provider is configured
    const aiProvider = process.env.AI_PROVIDER || "gemini";
    console.log(`   AI Provider: ${aiProvider}`);

    if (warnings.length > 0) {
      console.log(`\n⚠️  Optional vars not set (may affect some features):`);
      warnings.forEach((name) => console.log(`   - ${name}`));
    }

    console.log("\n" + "━".repeat(50));
    return 0;
  }

  console.log("❌ Missing required environment variables:\n");
  missing.forEach((name) => console.log(`   - ${name}`));

  console.log("\n📖 See .env.example for setup instructions");
  console.log("   Or run: npm run env:pull (requires Vercel CLI login)");
  console.log("\n" + "━".repeat(50));

  return 1;
}

process.exit(checkEnv());
