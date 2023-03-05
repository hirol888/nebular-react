import { DefaultThemeCore } from '../default-theme';
import { NebularThemeCore } from '../types';

export const CorporateThemeCore: NebularThemeCore = {
  ...DefaultThemeCore,
  theme_name: 'corporate',
  isDarkTheme: false,
  border_radius: '0.17rem',
  shadow: 'none'
};
