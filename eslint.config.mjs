import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Your existing rules - they are great!
      '@typescript-eslint/no-explicit-any': 'off', // Kept for flexibility
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_.*' }], // Warn on unused vars, but allow underscores
      '@next/next/no-img-element': 'warn', // Warn about using <img> instead of <Image>
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies in hooks

      // --- New rules for improved code quality and consistency ---

      // Enforce explicit return types on functions to improve readability and type safety.
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        'allowExpressions': true, // Allows for concise arrow functions
      }],

      // Enforce consistent arrow function syntax.
      'arrow-body-style': ['warn', 'as-needed'], // Use block body only when necessary

      // Enforce the use of 'import type' for all type imports.
      '@typescript-eslint/consistent-type-imports': ['warn', {
        'prefer': 'type-imports',
        'fixStyle': 'inline-type-imports',
      }],

      // Disallow console.log statements to keep the console clean in production.
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],

      // --- Optional but recommended rules for better code style ---

      // Enforce a convention for ordering imports to keep them organized.
      'import/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
      }],
    },
  },
];

export default eslintConfig;
