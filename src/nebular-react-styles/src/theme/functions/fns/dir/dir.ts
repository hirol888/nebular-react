import { Direction } from '../../../types';
import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';

function dir(_dir: Direction, propValuePairs: CSSInterpolation): CSSObject {
  const result: CSSObject = {};
  result[`[dir=${_dir}] &`] = propValuePairs;

  return result;
}

export function ltr(propValuePairs: CSSInterpolation): CSSObject {
  return dir('ltr', propValuePairs);
}

export function rtl(propValuePairs: CSSInterpolation): CSSObject {
  return dir('rtl', propValuePairs);
}
