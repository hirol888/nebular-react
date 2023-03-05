import { CSSObject } from '../../../../tss/types/css-object';

export function hidden(): CSSObject {
  return {
    position: 'absolute',
    height: '1px',
    width: '1px',
    overflow: 'hidden',
    clip: 'rect(1px, 1px, 1px, 1px)'
  };
}
