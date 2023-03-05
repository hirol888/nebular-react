import { DefaultThemeTabset } from '../default-theme';
import { NebularThemeTabset } from '../types/nebular-theme';

export const CorporateThemeTabset: NebularThemeTabset = {
  ...DefaultThemeTabset,
  tabset_border_radius: 'var(--border-radius)',
  tabset_shadow: 'none'
};
