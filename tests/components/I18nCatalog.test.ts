import fs from 'node:fs';
import path from 'node:path';
import { enUSMessages, ptBRMessages } from '@nebular-react/core';

const LOCALE_ALIAS_KEYS = new Set(['en-us', 'pt-br']);

function collectTranslationKeys(dir: string, keys = new Set<string>()): Set<string> {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectTranslationKeys(file, keys);
      return;
    }

    if (!/\.(ts|tsx)$/.test(entry.name) || entry.name.includes('.story.')) {
      return;
    }

    const source = fs.readFileSync(file, 'utf8');

    for (const match of source.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) {
      keys.add(match[1]);
    }
  });

  return keys;
}

describe('i18n catalog', () => {
  const used = collectTranslationKeys(path.join(process.cwd(), 'src/nebular-react-core/src'));

  it('has every translation used by the source in en-US and pt-BR', () => {
    const missingEn = [...used].filter((key) => !(key in enUSMessages));
    const missingPt = [...used].filter((key) => !(key in ptBRMessages));

    expect(missingEn).toEqual([]);
    expect(missingPt).toEqual([]);
  });

  it('keeps en-US and pt-BR catalogs in parity', () => {
    const enKeys = new Set(Object.keys(enUSMessages));
    const ptKeys = new Set(Object.keys(ptBRMessages));
    const onlyEn = [...enKeys].filter((key) => !ptKeys.has(key));
    const onlyPt = [...ptKeys]
      .filter((key) => !enKeys.has(key))
      .filter((key) => !LOCALE_ALIAS_KEYS.has(key));

    expect(onlyEn).toEqual([]);
    expect(onlyPt).toEqual([]);
  });
});
