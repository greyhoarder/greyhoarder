// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const betterTailwindcss = require('eslint-plugin-better-tailwindcss');

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
    rules: {
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
