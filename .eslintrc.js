/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // ✅ Allow temporary use of 'any' for faster development
    '@typescript-eslint/no-explicit-any': 'off',

    // ✅ Allow unused vars (for in-progress features)
    '@typescript-eslint/no-unused-vars': 'off',

    // ⚠️ Just warn about image tag
    '@next/next/no-img-element': 'warn',

    // ⚠️ Just warn about missing dependencies in useEffect
    'react-hooks/exhaustive-deps': 'warn',
  }
};
