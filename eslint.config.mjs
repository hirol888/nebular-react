// eslint.config.mjs – ESM + FlatCompat
// Corrigido: define parser antes de importar configs do Airbnb, pois algumas regras
// do preset precisam de parserServices (dot-notation, etc.).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname
});

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignorados
  {
    ignores: [
      'lib/**',
      'esm/**',
      'cjs/**',
      'dist/**',
      'public/**',
      '.cache/**',
      '.eslintrc.js',
      'eslint.config.mjs',
      'jest.config.mjs',
      '.storybook/**',
      'configuration/**',
      '*.d.ts'
    ]
  },

  // Base TS/JS config COM PARSER definido – vem ANTES dos presets
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    }
  },

  // Presets legacy (Airbnb + Airbnb-TS) convertidos
  ...compat.extends('airbnb', 'airbnb-typescript'),

  // Overrides / regras customizadas
  {
    rules: {
      'max-len': [
        'error',
        100,
        {
          ignoreTrailingComments: true,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreRegExpLiterals: true,
          ignoreTemplateLiterals: true
        }
      ],
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-bind': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-no-constructed-context-values': 'off',
      'react/no-unstable-nested-components': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'no-nested-ternary': 'off',
      'consistent-return': 'off',
      'default-case': 'off',
      'arrow-parens': 'off',
      'function-paren-newline': 'off',
      'max-classes-per-file': 'off',
      'react/jsx-curly-newline': 'off',
      'react/no-unused-prop-types': 'off',
      'no-unused-expressions': 'off',
      'no-restricted-syntax': 'off',
      'no-prototype-builtins': 'off',
      'no-param-reassign': 'off',
      'no-multi-assign': 'off',
      'func-names': 'off',
      camelcase: 'off',
      'react/jsx-indent': 'off',
      'react/jsx-wrap-multilines': 'off',
      'no-confusing-arrow': 'off',
      'no-plusplus': 'off',
      'operator-linebreak': 'off',
      'object-curly-newline': 'off',
      'implicit-arrow-linebreak': 'off',
      'spaced-comment': 'off',
      'comma-dangle': ['error', 'never'],
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'react/state-in-constructor': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/static-property-placement': 'off',
      'react/require-default-props': 'off',
      'react/destructuring-assignment': 'off',
      'react/sort-comp': 'off',
      'react/no-danger': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/mouse-events-have-key-events': 'off',
      'import/prefer-default-export': 'off',
      'react/no-array-index-key': 'off',
      'import/no-extraneous-dependencies': 'off',
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/anchor-has-content': 'off'
    }
  }
];
