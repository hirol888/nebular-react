import { Property } from 'csstype';
import { CSSObject } from '../../../../tss/types/css-object';

export function outline(
  outlineWidth: Property.OutlineWidth,
  outlineColor: Property.OutlineColor,
  insetShadowLength: Property.Inset = '0'
): CSSObject {
  let result: CSSObject = {
    boxShadow: `0 0 0 ${outlineWidth} ${outlineColor}`
  };

  // eslint-disable-next-line eqeqeq
  if (insetShadowLength != '0') {
    result = {
      ...result,
      '&:not(:hover):not(:active)': {
        boxShadow: `0 0 0 ${outlineWidth} ${
          outlineColor as string
        }, inset ${insetShadowLength} ${outlineColor}`
      }
    };
  }

  return result;
}
