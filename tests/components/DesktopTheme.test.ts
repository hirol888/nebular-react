import { createDesktopThemeStyle, DESKTOP_THEME_TOKEN_VARS } from '@nebular-react/core';

describe('Desktop theme tokens', () => {
  it('maps typed tokens to the documented CSS variables', () => {
    const style = createDesktopThemeStyle({
      accent: '#ff6600',
      background: '#101010',
      windowBackground: '#202020',
      calendarBackground: '#303030',
      wallpaper: undefined
    });

    expect(style).toEqual({
      '--desktop-accent': '#ff6600',
      '--desktop-background-color': '#101010',
      '--desktop-window-background-color': '#202020',
      '--desktop-calendar-background-color': '#303030'
    } satisfies Partial<Record<keyof typeof style, string>>);
    expect(DESKTOP_THEME_TOKEN_VARS.accent).toBe('--desktop-accent');
  });

  it('skips empty values so component fallbacks apply', () => {
    expect(createDesktopThemeStyle({ accent: '', wallpaper: undefined })).toEqual({});
  });
});
