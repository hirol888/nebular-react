import { DefaultThemeUser } from '../default-theme';
import { NebularThemeUser } from '../types/nebular-theme';

export const CorporateThemeUser: NebularThemeUser = {
  ...DefaultThemeUser,
  user_rectangle_border_radius: 'var(--border-radius)'
};
