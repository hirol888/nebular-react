import { DefaultThemeButton } from '../default-theme';
import { NebularThemeButton } from '../types/nebular-theme';

export const CorporateThemeButton: NebularThemeButton = {
  ...DefaultThemeButton,
  button_hero_glow_size: '0 0 20px 0',
  button_hero_shadow: 'none'
};
