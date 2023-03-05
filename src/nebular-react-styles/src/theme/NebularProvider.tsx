import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { EmotionCache } from '@emotion/cache';
import { DEFAULT_THEME } from './DefaultTheme';
import {
  FontIconPacks,
  NebularTheme,
  NebularThemeBase,
  SvgIconPacks,
  defaultFontIconPacks,
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

interface NebularProviderContextType<TTheme extends NebularTheme> {
  theme: TTheme;
  dir: Direction;
  emotionCache?: EmotionCache;
  svgIconPacks?: SvgIconPacks;
  fontIconPacks?: FontIconPacks;
  defaultIconPack?: string;
  dimensions?: LayoutDimensions;
  scrollPosition?: ScrollPosition;
  layoutClasses: string[];
  scrollable: boolean;
}

export const NebularProviderContext = createContext<NebularProviderContextType<any>>({
  theme: DEFAULT_THEME,
  dir: 'ltr',
  svgIconPacks: defaultSvgIconPacks,
  fontIconPacks: defaultFontIconPacks,
  defaultIconPack: 'eva',
  layoutClasses: [],
  scrollable: true
});

export function useNebularTheme<TTheme extends NebularTheme>() {
  return (useContext(NebularProviderContext)?.theme || DEFAULT_THEME) as TTheme;
}

export function useNebularDir() {
  return useContext(NebularProviderContext)?.dir || 'ltr';
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
  emotionCache,
  withNormalizeCSS = true,
  withGlobalStyles = true,
  withOverlayStyles = true,
  svgIconPacks = defaultSvgIconPacks,
  fontIconPacks = defaultFontIconPacks,
  defaultIconPack = 'eva',
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

  useEffect(() => {
    setDir(dir);
  }, [dir]);

  useEffect(() => {
    setTheme(themeWithFunctions);
  }, [theme]);

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
