import { Direction, NebularTheme, useNebularDir, useNebularTheme } from '../theme';
import { CSSObject } from './types';
import { useCss } from './use-css';
import { fromEntries } from './utils/from-entries/from-entries';
import { mergeClassNames } from './utils/merge-class-names.ts/merge-class-names';

export interface UseStylesOptions<Key extends string, TTheme extends NebularTheme> {
  classNames?: Partial<Record<Key, string>>;
  styles?:
    | Partial<Record<Key, CSSObject>>
    | ((theme: TTheme, params: Record<string, any>) => Partial<Record<Key, CSSObject>>);
  name: string | string[];
  unstyled?: boolean;
}

function createRef(refName: string) {
  return `__nebular-ref-${refName || ''}`;
}

function getStyles<Key extends string, TTheme extends NebularTheme>(
  styles: UseStylesOptions<Key, TTheme>['styles'],
  theme: TTheme,
  params: Record<string, any>
): CSSObject {
  const extractStyles = (stylesPartial: UseStylesOptions<Key, TTheme>['styles']) =>
    typeof stylesPartial === 'function' ? stylesPartial(theme, params || {}) : stylesPartial || {};

  if (Array.isArray(styles)) {
    return styles
      .map((item) => extractStyles(item.styles))
      .reduce<Record<string, CSSObject>>((acc, item) => {
        Object.keys(item).forEach((key) => {
          if (!acc[key]) {
            acc[key] = { ...item[key] };
          } else {
            acc[key] = { ...acc[key], ...item[key] };
          }
        });
        return acc;
      }, {});
  }

  return extractStyles(styles);
}

export function createStyles<
  TTheme extends NebularTheme,
  Key extends string = string,
  Params = void
>(
  input:
    | ((
        theme: TTheme,
        params: Params,
        dir: Direction,
        createRef: (refName: string) => string
      ) => Record<Key, CSSObject>)
    | Record<Key, CSSObject>
) {
  const getCssObject = typeof input === 'function' ? input : () => input;

  function useStyles(params: Params, options?: UseStylesOptions<Key, TTheme>) {
    const theme = useNebularTheme<TTheme>();
    const dir = useNebularDir();

    const { css, cx } = useCss();
    const cssObject = getCssObject(theme, params, dir, createRef);

    const componentStyles = getStyles(options?.styles, theme, params);

    const classes = fromEntries(
      Object.keys(cssObject).map((key) => {
        const mergedStyles = cx(
          { [css(cssObject[key])]: !options?.unstyled },
          css(componentStyles[key])
        );
        return [key, mergedStyles];
      })
    ) as Record<Key, string>;

    return {
      classes: mergeClassNames({
        cx,
        classes,
        classNames: options?.classNames,
        name: options?.name
      }),
      cx,
      theme
    };
  }

  return useStyles;
}
