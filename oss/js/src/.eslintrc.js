module.exports = {
  extends: [
    '@cybozu',
    '@cybozu/eslint-config/globals/kintone'
  ],
  globals: {
    'baiduConfig': false,
    'kintoneUIComponent': false,
    'OSS': false,
    'KintoneConfigHelper': false
  },
  rules: {
    'no-prototype-builtins': 'off',
    'default-param-last': 'off',
    'no-import-assign': 'off',
    'prefer-regex-literals': 'off',
    'no-console': 'off',
    'dot-notation': 'off',
    'no-var': 'off',
    'vars-on-top': 'off',
    'prefer-arrow-callback': 'off',
    'block-scoped-var': 'off'
  }
};