import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "*.tsbuildinfo",
      "*.d.ts",
      "vite.config.*.timestamp-*",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        document: "readonly",
        localStorage: "readonly",
        window: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": "error",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-console": "warn",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
);
