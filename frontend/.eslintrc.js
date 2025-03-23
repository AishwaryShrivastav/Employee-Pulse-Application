module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': ['warn', {
      endOfLine: 'auto'
    }]
  }
}; 