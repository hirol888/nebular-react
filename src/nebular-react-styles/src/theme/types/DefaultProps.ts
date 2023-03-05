import { CSSProperties } from 'react';
import { CSSObject } from '../../tss/types/css-object';
import { NebularTheme } from './NebularTheme';

export type ClassNames<StylesNames extends string> = Partial<Record<StylesNames, string>>;
export type Styles<StylesNames extends string, StylesParams extends Record<string, any> = never> =
  | Partial<Record<StylesNames, CSSObject>>
  | (<TTheme extends NebularTheme>(
      theme: TTheme,
      params: StylesParams
    ) => Partial<Record<StylesNames, CSSObject>>);

export interface DefaultProps<
  StylesNames extends string = never,
  StylesParams extends Record<string, any> = never
> {
  className?: string;
  style?: CSSProperties;
  classNames?: ClassNames<StylesNames>;
  styles?: Styles<StylesNames, StylesParams>;
  unstyled?: boolean;
}
