export interface SvgIconPack {
  icons: Map<string, string>;
}

export interface OriginalEvaIcon {
  toSvg(options: EvaIconOptions): string;
}

export interface SvgFile {
  file: string;
}

interface EvaIconOptions {
  width: string;
  height: string;
  fill: string;
}

export interface FontIconPackParams {
  packClass?: string;
  iconClassPrefix?: string;
  [name: string]: any;
}

export type SvgIconPacks = Map<string, Map<string, OriginalEvaIcon | SvgFile | string>>;
export type FontIconPacks = Map<string, FontIconPackParams>;

export const defaultFontIconPacks: FontIconPacks = new Map();

export { defaultSvgIconPacks, defaultIconPack } from '../icon-packs/eva';
