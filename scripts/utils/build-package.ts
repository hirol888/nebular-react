/* eslint-disable no-await-in-loop */
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import createPackageConfig from '../../configuration/rollup/create-package-config';
import locatePackage from './locate-package';
import compile from './compile';
import generateDts from './generate-dts';
import { Logger } from './Logger';
import { getPackageName } from './get-package-name';

const logger = new Logger('build-package');

export interface BuildOptions {
  analyze: boolean;
  sourcemap: boolean;
  minify: boolean;
  formats: string[];
}

export async function buildPackage(_packageName: string, options?: BuildOptions) {
  const packageName = getPackageName(_packageName);
  const packagePath = await locatePackage(packageName || '');

  if (!packagePath) {
    logger.error(`Package ${chalk.cyan(packageName)} does not exist`);
    process.exit(1);
  }

  logger.info(`Building package ${chalk.cyan(packageName)}`);

  try {
    const startTime = Date.now();
    await generateDts(packagePath);

    // eslint-disable-next-line no-unsafe-optional-chaining
    for (const format of options?.formats) {
      const config = await createPackageConfig({
        ...options,
        basePath: packagePath,
        format
      });

      logger.info(`Building to ${chalk.cyan(format)} format...`);
      await compile(config);

      if (format === 'cjs') {
        await fs.outputJSON(path.join(packagePath, 'cjs', 'package.json'), { type: 'commonjs' });
      }

      if (format === 'es') {
        await fs.outputJSON(path.join(packagePath, 'esm', 'package.json'), { type: 'module' });
      }
    }

    if (packageName === '@nebular-react/core') {
      for (const file of ['esm/client.js', 'cjs/client.js']) {
        const clientPath = path.join(packagePath, file);

        if (await fs.pathExists(clientPath)) {
          const content = await fs.readFile(clientPath, 'utf-8');

          if (!content.startsWith("'use client'")) {
            await fs.writeFile(clientPath, `'use client';\n${content}`);
          }
        }
      }
    }

    logger.info(
      `Package ${chalk.cyan(packageName)} was built in ${chalk.green(
        `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      )}`
    );
  } catch (err) {
    logger.error(`Failed to compile package: ${chalk.cyan(packageName)}`);
    process.stdout.write(`${err.toString('minimal')}\n`);
    process.exit(1);
  }
}
