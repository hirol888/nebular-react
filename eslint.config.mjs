import { configs, plugins } from 'eslint-config-airbnb-extended';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/lib/**',
      '**/lib-cjs/**',
      '**/esm/**',
      '**/cjs/**',
      'dist/**',
      'public/**',
      '.cache/**',
      '.eslintrc.js',
      'eslint.config.mjs',
      'jest.config.mjs',
      '.storybook/**',
      'storybook-static/**',
      'configuration/**',
      '**/*.d.ts'
    ]
  },

  ...Object.values(plugins),
  ...configs.base.all,
  ...configs.react.all,

  // Prettier owns formatting; keep ESLint focused on correctness.
  prettier,

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
      '@typescript-eslint/naming-convention': 'off',
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
      'import-x/prefer-default-export': 'off',
      'import-x/extensions': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'react/no-array-index-key': 'off',
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/anchor-has-content': 'off',

      'dot-notation': 'error',
      'no-implied-eval': 'error',
      'no-throw-literal': 'error',

      // Airbnb Extended follows newer, stricter defaults than this codebase.
      // Keep the correctness rules and disable the stylistic/compiler experiment
      // rules that would require a broad rewrite.
      '@stylistic/lines-between-class-members': 'off',
      '@stylistic/spaced-comment': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off'
    }
  }
];
