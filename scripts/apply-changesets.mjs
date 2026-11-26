import console from 'node:console';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { readPreState } from '@changesets/pre';
import { readChangesets } from '@changesets/read';
import { execa } from 'execa';

const cwd = process.cwd();
const preState = await readPreState(cwd);
const changesets = await readChangesets(cwd);

if (changesets.length > 0 || preState?.mode === 'exit') {
  const cli = fileURLToPath(import.meta.resolve('@changesets/cli/bin.js'));
  await execa(process.execPath, [cli, 'version'], { stdio: 'inherit' });
} else {
  console.log('No unreleased changesets. Package versions are already up to date.');
}
