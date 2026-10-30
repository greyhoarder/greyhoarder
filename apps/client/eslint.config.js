// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const betterTailwindcss = require('eslint-plugin-better-tailwindcss');

/** docs/coding-guidelines.md and docs/architecture-testing.md: syntax no file may use. */
const RESTRICTED_SYNTAX = [
  { selector: 'TSEnumDeclaration', message: 'Use a string literal union instead of an enum.' },
  { selector: 'ExportAllDeclaration', message: "Re-export by name; no 'export *'." },
  { selector: "CallExpression[callee.property.name='then']", message: 'Use async/await instead of .then().' },
  {
    selector: 'CallExpression[callee.name=/^(it|test)$/][arguments.0.value=/^should\\b/i]',
    message: "Describe the behavior without 'should'.",
  },
];
const NO_DEFAULT_EXPORT = { selector: 'ExportDefaultDeclaration', message: 'Use a named export.' };

module.exports = defineConfig([
  // Generated Spartan helm components follow upstream and use arbitrary values (ADR-0011).
  { ignores: ['src/app/shared/ui/helm/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // docs/coding-guidelines.md
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/max-params': ['error', { max: 5 }],
      'max-depth': ['error', 2],
      // DOM events are changed through their target by design.
      'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['event'] }],
      'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX, NO_DEFAULT_EXPORT],
      // docs/architecture-angular.md
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Angular loads the routes of a domain lazily through their default export.
    files: ['**/*.routes.ts'],
    rules: { 'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX] },
  },
  {
    // docs/coding-guidelines.md, "Types": tests may assert types.
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
      betterTailwindcss.configs.recommended,
    ],
    settings: {
      'better-tailwindcss': { entryPoint: 'src/styles.css' },
    },
    rules: {
      // docs/architecture-angular.md
      '@angular-eslint/template/prefer-control-flow': 'error',
      // Tokens instead of arbitrary values (docs/design-system.md).
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: '\\[([^\\[\\]]*?)\\](?!:)',
              message: "Arbitrary value '$1' is not allowed. Use a theme token instead.",
            },
          ],
        },
      ],
      // Line wrapping is left to Prettier.
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
]);
