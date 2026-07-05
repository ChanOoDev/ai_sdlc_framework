import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    ignores: [".next/", "node_modules/"],
  }
);
