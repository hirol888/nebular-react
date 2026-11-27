/** @jest-environment node */
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import fixDtsImports from '../../scripts/utils/fix-dts-imports';

describe('fixDtsImports', () => {
  it('keeps the CommonJS declaration paths valid when the package is rebuilt', async () => {
    const tempDir = await fs.realpath(os.tmpdir());
    const packageDir = await fs.mkdtemp(path.join(tempDir, 'nebular-declarations-'));
    const input = path.join(packageDir, 'lib', 'index.d.ts');
    const output = path.join(packageDir, 'lib-cjs', 'index.d.cts');

    try {
      await fs.outputFile(input, "export * from './components';\n");
      await fs.outputFile(
        path.join(packageDir, 'lib', 'components', 'index.d.ts'),
        'export declare const label: string;\n'
      );

      await fixDtsImports(packageDir);
      expect(await fs.readFile(input, 'utf8')).toBe("export * from './components/index.js';\n");
      expect(await fs.readFile(output, 'utf8')).toBe("export * from './components/index.cjs';\n");

      await fixDtsImports(packageDir);
      expect(await fs.readFile(input, 'utf8')).toBe("export * from './components/index.js';\n");
      expect(await fs.readFile(output, 'utf8')).toBe("export * from './components/index.cjs';\n");
    } finally {
      const resolved = await fs.realpath(packageDir);
      if (path.dirname(resolved) === tempDir) {
        await fs.remove(resolved);
      }
    }
  });
});
