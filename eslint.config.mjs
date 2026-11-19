import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist/", "apps/web/.next/", "apps/web/out/", "apps/web/next-env.d.ts"]),

  // Everything: the recommended JavaScript and TypeScript rules.
  js.configs.recommended,
  tseslint.configs.recommended,

  // Config files run in Node.
  {
    files: ["**/*.mjs"],
    languageOptions: { globals: globals.node },
  },

  // The web app: Next.js (with Core Web Vitals) and the React hooks rules.
  {
    files: ["apps/web/**/*.{js,mjs,ts,tsx}"],
    extends: [nextVitals],
    settings: { next: { rootDir: "apps/web/" } },
    rules: {
      // Two pages set state at the start of an effect (mainnet/, report/).
      // Restructuring them changes behaviour, so it is reported, not blocking.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
