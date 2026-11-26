/* eslint-disable no-param-reassign */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storyFilter = process.env.NEBULAR_STORY_FILTER;

// Storybook resolves story globs relative to this config directory.
const storiesPath = !storyFilter
  ? ['../src/**/*.story.@(ts|tsx)', '../docs/storybook/**/*.mdx']
  : [`../src/nebular-react-*/**/${storyFilter}.story.@(ts|tsx)`];

const packages = ['core', 'hooks', 'next', 'ssr', 'styles'];
const aliases = packages.reduce(
  (acc, packageName) => ({
    ...acc,
    [`@nebular-react/${packageName}`]: path.resolve(
      __dirname,
      `../src/nebular-react-${packageName}/src`
    )
  }),
  {}
);

export default {
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  stories: [...storiesPath],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  typescript: {
    // `react-docgen` extracts props for the Autodocs tables. The previous
    // config disabled docgen because of a bundling regression; it is kept
    // enabled here so documentation pages expose real prop tables.
    reactDocgen: 'react-docgen-typescript'
  },
  webpackFinal: async (config) => {
    // Webpack's native TypeScript experiment does not support TSX. Let
    // the esbuild loader handle TypeScript/TSX files instead.
    config.experiments = {
      ...config.experiments,
      typescript: false
    };

    config.module.rules.push(
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2020',
            tsconfig: path.join(__dirname, '../tsconfig.json')
          }
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'es2020',
            tsconfig: path.join(__dirname, '../tsconfig.json')
          }
        }
      }
    );

    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve.alias || {}),
        ...aliases
      }
    };

    return config;
  }
};
