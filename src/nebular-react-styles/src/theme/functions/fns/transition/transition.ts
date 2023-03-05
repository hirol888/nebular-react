import { CSSObject } from '../../../../tss/types/css-object';

export function transition(properties: string[]): CSSObject {
  const result: CSSObject = {
    transitionDuration: '0.15s',
    transitionProperty: properties.join(', '),
    transitionTimingFunction: 'ease-in'
  };

  return result;
}
