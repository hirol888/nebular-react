import path from 'path';
import { fileURLToPath } from 'node:url';

import storybook from '@storybook/react/standalone';

// recria __dirname em ambiente ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

storybook({
  port: 7618,
  mode: 'dev',
  configDir: path.join(__dirname, './.storybook')
});
