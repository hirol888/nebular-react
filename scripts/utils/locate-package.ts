import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { getPackageName } from './get-package-name';

// recria __dirname em ambiente ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function locatePackage(packageName: string) {
  const folder = getPackageName(packageName).replace('@', '').replace('/', '-');
  const packagePath = path.join(__dirname, '../../src', folder);
  const exists = await fs.pathExists(packagePath);
  return exists ? packagePath : null;
}
