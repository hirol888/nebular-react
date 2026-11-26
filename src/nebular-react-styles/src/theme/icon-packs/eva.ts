import * as evaModule from 'eva-icons';
import type { OriginalEvaIcon, SvgIconPacks } from '../types/IconPack';
import { defaultSvgIconPacks as essentials } from './essentials';

// `eva-icons` is CommonJS and marks itself as `__esModule`, but exposes its API as
// a named `icons` export instead of a default export. Normalize both shapes so the
// same code works with the CJS and ESM builds.
const eva = ((evaModule as any).default?.icons ? (evaModule as any).default : evaModule) as {
  icons: Record<string, OriginalEvaIcon>;
};

export const defaultIconPack: string = 'eva';
export const defaultSvgIconPacks: SvgIconPacks = new Map(essentials);
defaultSvgIconPacks.set(defaultIconPack, new Map(Object.entries(eva.icons)));
