import type React from 'react';

/**
 * Stable theme tokens exposed by the Desktop. Hosts can provide any CSS color/value;
 * undefined entries are skipped so the built-in fallbacks apply.
 */
export interface DesktopThemeTokens {
  accent?: string;
  wallpaper?: string;
  wallpaperImage?: string;
  background?: string;
  textColor?: string;
  taskbarBackground?: string;
  taskbarBorder?: string;
  windowBackground?: string;
  windowBorder?: string;
  windowTitle?: string;
  iconColor?: string;
  iconSelectedBackground?: string;
  selectionBackground?: string;
  widgetsBackground?: string;
  widgetsBorder?: string;
  calendarBackground?: string;
  calendarBorder?: string;
}

export const DESKTOP_THEME_TOKEN_VARS: Record<keyof DesktopThemeTokens, string> = {
  accent: '--desktop-accent',
  wallpaper: '--desktop-wallpaper',
  wallpaperImage: '--desktop-wallpaper-image',
  background: '--desktop-background-color',
  textColor: '--desktop-text-color',
  taskbarBackground: '--desktop-taskbar-background-color',
  taskbarBorder: '--desktop-taskbar-border-color',
  windowBackground: '--desktop-window-background-color',
  windowBorder: '--desktop-window-border-color',
  windowTitle: '--desktop-window-title-color',
  iconColor: '--desktop-icon-color',
  iconSelectedBackground: '--desktop-icon-selected-background-color',
  selectionBackground: '--desktop-icon-selection-background-color',
  widgetsBackground: '--desktop-widgets-background-color',
  widgetsBorder: '--desktop-widgets-border-color',
  calendarBackground: '--desktop-calendar-background-color',
  calendarBorder: '--desktop-calendar-border-color'
};

/**
 * Converts typed theme tokens into CSS custom properties accepted by the `style` prop.
 * This keeps hosts independent from the internal variable names.
 */
export function createDesktopThemeStyle(
  tokens: DesktopThemeTokens
): React.CSSProperties & Record<`--${string}`, string> {
  const style: Record<string, string> = {};

  (Object.keys(tokens) as (keyof DesktopThemeTokens)[]).forEach((token) => {
    const value = tokens[token];

    if (value !== undefined && value !== null && value !== '') {
      style[DESKTOP_THEME_TOKEN_VARS[token]] = value;
    }
  });

  return style as React.CSSProperties & Record<`--${string}`, string>;
}
