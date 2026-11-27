import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { EmotionCache } from '@emotion/cache';
import { DEFAULT_THEME } from './DefaultTheme';
import {
  FontIconPacks,
  NebularTheme,
  NebularThemeBase,
  SvgIconPacks,
  defaultFontIconPacks,
  defaultIconPack as packageDefaultIconPack,
  defaultSvgIconPacks,
  LayoutDimensions,
  Direction,
  ScrollPosition
} from './types';
import { GlobalStyles } from './GlobalStyles';
import { attachFunctions } from './functions/attach-functions';
import { NormalizeCSS } from './NormalizeCSS';
import { OverlayStyles } from './OverlayStyles';
import { useNebularThemeEvents } from './events';
import { ThemeVariables } from './ThemeVariables';
import {
  DEFAULT_UI_LOCALE,
  formatNebularMessage,
  getNebularLocaleMessages,
  type NebularMessageParams,
  type NebularMessages
} from '../i18n';

interface NebularProviderContextType<TTheme extends NebularTheme> {
  theme: TTheme;
  dir: Direction;
  locale: string;
  hasLocale: boolean;
  messages: NebularMessages;
  emotionCache?: EmotionCache;
  svgIconPacks?: SvgIconPacks;
  fontIconPacks?: FontIconPacks;
  defaultIconPack?: string;
  dimensions?: LayoutDimensions;
  scrollPosition?: ScrollPosition;
  layoutClasses: string[];
  scrollable: boolean;
}

const EMPTY_MESSAGES: NebularMessages = {};

export const NebularProviderContext = createContext<NebularProviderContextType<any>>({
  theme: DEFAULT_THEME,
  dir: 'ltr',
  locale: DEFAULT_UI_LOCALE,
  hasLocale: false,
  messages: {},
  svgIconPacks: defaultSvgIconPacks,
  fontIconPacks: defaultFontIconPacks,
  defaultIconPack: packageDefaultIconPack,
  layoutClasses: [],
  scrollable: true
});

export function useNebularTheme<TTheme extends NebularTheme>() {
  return (useContext(NebularProviderContext)?.theme || DEFAULT_THEME) as TTheme;
}

export function useNebularDir() {
  return useContext(NebularProviderContext)?.dir || 'ltr';
}

export function useNebularLocale() {
  const context = useContext(NebularProviderContext);
  const locale = context.locale || DEFAULT_UI_LOCALE;
  const hasLocale = context.hasLocale ?? false;
  const messages = context.messages || EMPTY_MESSAGES;
  const t = useCallback(
    (key: string, fallback: string, params?: NebularMessageParams) =>
      formatNebularMessage(messages[key] ?? fallback, params),
    [messages]
  );

  return { locale, hasLocale, messages, t };
}

export function useEmotionCacheContext() {
  return useContext(NebularProviderContext)?.emotionCache;
}

export function useNebularIconPacks() {
  const context = useContext(NebularProviderContext);
  return {
    svgIconPacks: context.svgIconPacks,
    fontIconPacks: context.fontIconPacks,
    defaultIconPack: context.defaultIconPack
  };
}

export interface NebularProviderProps {
  theme?: NebularThemeBase;
  dir?: Direction;
  /** BCP 47 locale used by components as the default for dates, numbers and messages. */
  locale?: string;
  /** Message overrides merged over the built-in locale catalog. */
  messages?: NebularMessages;
  emotionCache?: EmotionCache;
  withNormalizeCSS?: boolean;
  withGlobalStyles?: boolean;
  withOverlayStyles?: boolean;
  svgIconPacks?: SvgIconPacks;
  fontIconPacks?: FontIconPacks;
  defaultIconPack?: string;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function NebularProvider<TTheme extends NebularTheme>({
  theme = DEFAULT_THEME,
  dir = 'ltr',
  locale = DEFAULT_UI_LOCALE,
  messages,
  emotionCache,
  withNormalizeCSS = true,
  withGlobalStyles = true,
  withOverlayStyles = true,
  svgIconPacks = defaultSvgIconPacks,
  fontIconPacks = defaultFontIconPacks,
  defaultIconPack = packageDefaultIconPack,
  scrollable = true,
  children
}: NebularProviderProps) {
  const themeWithFunctions = useMemo(() => attachFunctions<TTheme>(theme), [theme]);
  const [_theme, setTheme] = useState<TTheme>(themeWithFunctions);
  const [_dir, setDir] = useState<Direction>(dir);
  const [dimensions, setDimensions] = useState<LayoutDimensions>();
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>();
  const [layoutClasses, setLayoutClasses] = useState<string[]>([]);
  const [_scrollable, setScrollable] = useState<boolean>(scrollable);
  const resolvedMessages = useMemo(
    () => ({ ...getNebularLocaleMessages(locale), ...(messages ?? {}) }),
    [locale, messages]
  );

  useEffect(() => {
    setDir(dir);
  }, [dir]);

  useEffect(() => {
    setTheme(themeWithFunctions);
  }, [theme, themeWithFunctions]);

  const appendLayoutClass = (className: string) => {
    setLayoutClasses((classes) => [...classes, className]);
  };

  const removeLayoutClass = (className: string) => {
    setLayoutClasses((classes) => classes.filter((cl) => cl !== className));
  };

  const changeTheme = (newTheme: TTheme) => {
    setTheme(newTheme);
  };

  const changeDirection = (newDirection: Direction) => {
    setDir(newDirection);
  };

  const changeDimensions = (newDimentions: LayoutDimensions) => {
    setDimensions(newDimentions);
  };

  const changeScrollPosition = (newScrollPosition: ScrollPosition) => {
    setScrollPosition(newScrollPosition);
  };

  const changeScrollable = (newScrollable: boolean) => {
    setScrollable(newScrollable);
  };

  useNebularThemeEvents({
    changeTheme,
    changeDirection,
    changeDimensions,
    changeScrollPosition,
    appendLayoutClass,
    removeLayoutClass,
    changeScrollable
  });

  return (
    <NebularProviderContext.Provider
      value={{
        theme: _theme,
        dir: _dir,
        locale,
        hasLocale: true,
        messages: resolvedMessages,
        emotionCache,
        svgIconPacks,
        fontIconPacks,
        defaultIconPack,
        dimensions,
        scrollPosition,
        layoutClasses,
        scrollable: _scrollable
      }}
    >
      <ThemeVariables theme={_theme} />
      {withNormalizeCSS && <NormalizeCSS />}
      {withGlobalStyles && <GlobalStyles theme={_theme} />}
      {withOverlayStyles && <OverlayStyles theme={_theme} />}
      <div dir={_dir}>{children}</div>
    </NebularProviderContext.Provider>
  );
}
