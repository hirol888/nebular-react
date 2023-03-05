import path from 'path';
const storybook = require('@storybook/react/standalone');

storybook({
  port: 7618,
  mode: 'dev',
  configDir: path.join(__dirname, '../configuration/storybook')
});
