/* eslint-disable no-console */
import path from 'path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn } from 'child_process';

// recria __dirname em ambiente ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const storybookPackage = require('storybook/package.json');

const storybookBin = path.resolve(
  path.dirname(require.resolve('storybook/package.json')),
  typeof storybookPackage.bin === 'string' ? storybookPackage.bin : storybookPackage.bin.storybook
);

const storybookArgs = process.argv.slice(2);
const storyFilter = storybookArgs.find((arg) => !arg.startsWith('-'));

const storybookProcess = spawn(
  process.execPath,
  [
    storybookBin,
    'dev',
    '-p',
    '7618',
    '-c',
    path.join(__dirname, '../.storybook'),
    ...storybookArgs
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, NEBULAR_STORY_FILTER: storyFilter || '' }
  }
);

storybookProcess.on('close', (code) => {
  if (code === null) {
    console.error('Storybook process terminated unexpectedly');
    process.exitCode = 1;
    return;
  }

  console.log(`Storybook process exited with code ${code}`);
  process.exitCode = code;
});
