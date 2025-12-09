import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig, // Disable ESLint rules that conflict with Prettier
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // STRICT MODE: Convert ALL warnings to errors
      // No unused variables - EVER
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Prevent console.log in production
      "no-console": ["error", { allow: ["warn", "error"] }],
      // No debugger statements
      "no-debugger": "error",
      // Require explicit types for function returns (TypeScript only)
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      // Ban @ts-ignore and @ts-nocheck (must fix issues, not hide them)
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],
      // =================================================================
      // QODANA COMPLIANCE RULES
      // Catch issues that Qodana static analysis flags
      // =================================================================
      // Enforce consistent type imports (combine import/import type)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      // Disallow returning value when only returning immediately
      "no-useless-return": "error",
      // Prefer arrow functions for callbacks (cleaner, no redundant vars)
      "prefer-arrow-callback": "error",
      // No unnecessary variables for immediate return
      "no-else-return": ["error", { allowElseIf: false }],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      // JavaScript files: Less strict (no TypeScript-specific rules)
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
]);

export default eslintConfig;
