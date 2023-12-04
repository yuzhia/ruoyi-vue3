module.exports = {
  root: true,
  env: {
    // 支持浏览器环境
    browser: true,
    // 识别 CommonJS
    node: true,
    // 识别 ES 的代码，使用 ECMAScript 2021 自动设置 ecmaVersion parser 为 12，
    es2021: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    //   parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['prettier'],
  extends: [
    'eslint:recommended', // eslint 自己的推荐规则，最佳实践最小集
    'plugin:vue/vue3-recommended',
    // 'plugin:@typescript-eslint/recommended',
    './.eslintrc-auto-import.json',
    'plugin:prettier/recommended' // 禁用 eslint 关于代码的风格的规则，使用 prettier 的风格
  ],
  rules: {
    // 'no-undef': 'off',
    'vue/multi-word-component-names': ['off']
    // 'vue/no-v-html': 'off'
    // 'as-needed': { unnecessary: false }
  }
}
