import { execa } from 'execa';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import { createRequire } from 'node:module';
import fixDtsImports from './fix-dts-imports';

const require = createRequire(import.meta.url);
const nativeTscPath = path.join(
  path.dirname(require.resolve('@typescript/native/package.json')),
  'bin',
  'tsc'
);

export default async function generateDts(packagePath: string) {
  await execa(process.execPath, [nativeTscPath, '--project', 'tsconfig.build.json'], {
    cwd: packagePath
  });

  const files = await fg(['lib/**/*.js'], { cwd: packagePath });

  await Promise.all(files.map((file) => fs.remove(path.join(packagePath, file))));
  await fixDtsImports(packagePath);
}
