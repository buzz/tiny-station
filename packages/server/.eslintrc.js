const baseConfig = require('../../.eslintrc')

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'no-console': 'off',
  },
}
