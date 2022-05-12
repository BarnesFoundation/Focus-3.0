module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["prettier", "react", "@typescript-eslint", "react-hooks"],
  extends: ["prettier", "plugin:react/recommended"],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    global: false,
    Promise: false,
  },
  rules: {
    "prettier/prettier": ["error"],
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    react: { version: "detect" },
  },
};
