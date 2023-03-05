import { NebularTheme, NebularThemeBase } from '../types';
import { fns } from './fns';

export function attachFunctions<TTheme extends NebularTheme>(themeBase: NebularThemeBase): TTheme {
  return {
    ...themeBase,
    fns: {
      ltr: fns.ltr,
      rtl: fns.rtl,
      outline: fns.outline,
      transition: fns.transition,
      scrollbars: fns.scrollbars,
      hidden: fns.hidden,
      mediaBreakpointDown: fns.mediaBreakpointDown,
      mediaBreakpointUp: fns.mediaBreakpointUp,
      mediaBreakpointBetween: fns.mediaBreakpointBetween,
      thumb: fns.thumb,
      track: fns.track
    }
  } as TTheme;
}
