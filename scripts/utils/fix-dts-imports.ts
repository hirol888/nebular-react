import path from 'path';
import fs from 'fs-extra';
import fg from 'fast-glob';

const RELATIVE_SPECIFIER = /(from\s+['"]|import\(\s*['"])(\.[^'"]+)(['"])/g;

function resolveSpecifier(baseDir: string, specifier: string, extension: 'js' | 'cjs'): string {
  const normalized = specifier.replace(/\\/g, '/');

  const runtimeExtension = normalized.match(/\.(js|cjs)$/)?.[0];
  if (runtimeExtension) {
    const declaration = normalized.slice(0, -runtimeExtension.length);
    return fs.existsSync(path.resolve(baseDir, `${declaration}.d.ts`))
      ? `${declaration}.${extension}`
      : normalized;
  }

  if (/\.(json|d\.ts|d\.cts)$/.test(normalized)) {
    return normalized;
  }

  const absoluteTarget = path.resolve(baseDir, normalized);

  if (fs.existsSync(`${absoluteTarget}.d.ts`)) {
    return `${normalized}.${extension}`;
  }

  if (fs.existsSync(path.join(absoluteTarget, 'index.d.ts'))) {
    return `${normalized}/index.${extension}`;
  }

  return `${normalized}.${extension}`;
}

function rewriteSpecifiers(
  source: string,
  baseDir: string,
  extension: 'js' | 'cjs'
): string {
  return source.replace(
    RELATIVE_SPECIFIER,
    (match, prefix: string, specifier: string, suffix: string) =>
      `${prefix}${resolveSpecifier(baseDir, specifier, extension)}${suffix}`
  );
}

/**
 * TypeScript emits extensionless relative imports in declarations when using
 * `moduleResolution: bundler`. Node's ESM resolver requires explicit `.js`
 * extensions, so rewrite the published ESM declarations.
 *
 * At the same time, create a parallel `lib-cjs` tree with `.d.cts` files so
 * `require()` consumers receive CommonJS declarations instead of ESM ones.
 * Incremental builds can reuse declarations that already have `.js` specifiers.
 */
export default async function fixDtsImports(packagePath: string) {
  const libDir = path.join(packagePath, 'lib');
  const cjsLibDir = path.join(packagePath, 'lib-cjs');
  const declarationFiles = await fg(['**/*.d.ts'], { cwd: libDir });

  await fs.remove(cjsLibDir);

  await Promise.all(
    declarationFiles.map(async (file) => {
      const sourcePath = path.join(libDir, file);
      const source = await fs.readFile(sourcePath, 'utf8');
      const cjsContent = rewriteSpecifiers(
        source.replace(/^\/\/# sourceMappingURL=.*$/gm, ''),
        path.dirname(sourcePath),
        'cjs'
      );
      const cjsFile = file.replace(/\.d\.ts$/, '.d.cts');

      await fs.outputFile(path.join(cjsLibDir, cjsFile), cjsContent);
    })
  );

  await Promise.all(
    declarationFiles.map(async (file) => {
      const filePath = path.join(libDir, file);
      const source = await fs.readFile(filePath, 'utf8');
      const rewritten = rewriteSpecifiers(source, path.dirname(filePath), 'js');

      if (rewritten !== source) {
        await fs.writeFile(filePath, rewritten);
      }
    })
  );
}
