import { DefaultThemeCore } from '../default-theme';
import { NebularThemeCore } from '../types';

export const DarkThemeCore: NebularThemeCore = {
  ...DefaultThemeCore,
  theme_name: 'dark',
  isDarkTheme: true,
  background_basic_color_1: 'var(--color-basic-800)',
  background_basic_color_2: 'var(--color-basic-900)',
  background_basic_color_3: 'var(--color-basic-1000)',
  background_basic_color_4: 'var(--color-basic-1100)',
  border_basic_color_1: 'var(--color-basic-800)',
  border_basic_color_2: 'var(--color-basic-900)',
  border_basic_color_3: 'var(--color-basic-1000)',
  border_basic_color_4: 'var(--color-basic-1100)',
  border_basic_color_5: 'var(--color-basic-1100)',
  background_alternative_color_1: 'var(--color-basic-100)',
  background_alternative_color_2: 'var(--color-basic-200)',
  background_alternative_color_3: 'var(--color-basic-300)',
  background_alternative_color_4: 'var(--color-basic-400)',
  border_alternative_color_1: 'var(--color-basic-100)',
  border_alternative_color_2: 'var(--color-basic-200)',
  border_alternative_color_3: 'var(--color-basic-300)',
  border_alternative_color_4: 'var(--color-basic-400)',
  border_alternative_color_5: 'var(--color-basic-500)',
  text_basic_color: 'var(--color-basic-100)',
  text_alternate_color: 'var(--color-basic-900)',
  text_disabled_color: 'var(--color-basic-transparent-600)',
  shadow: '0 0.5rem 1rem 0 #1a1f33',
  outline_color: 'var(--color-basic-700)'
};
