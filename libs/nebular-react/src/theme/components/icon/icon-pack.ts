import { NbIconModel } from './_icon';

export interface NbIcons {
  [key: string]: NbIconModel | string;
}

export enum NbIconPackType {
  SVG = 'svg',
  FONT = 'font',
}

export interface NbIconPackParams {
  packClass?: string,
  [name: string]: any,
}

export interface NbFontIconPackParams extends NbIconPackParams {
  iconClassPrefix?: string,
}

export interface NbIconPack {
  name: string;
  type: NbIconPackType;
  icons: Map<string, NbIconModel | string>;
  params: NbIconPackParams,
}
