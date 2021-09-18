module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  globals: {
    game: 'readonly'
  },
  rules: {
    'no-debugger': 0,
    'no-inner-declarations': 0
  },
  overrides: [
    {
      files: ['gulpfile.js'],
      env: {
        node: true,
        es2021: true
      }
    }
  ]
};
