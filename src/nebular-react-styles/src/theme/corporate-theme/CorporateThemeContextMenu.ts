import { DefaultThemeContextMenu } from '../default-theme';
import { NebularThemeContextMenu } from '../types/nebular-theme';

export const CorporateThemeContextMenu: NebularThemeContextMenu = {
  ...DefaultThemeContextMenu,
  context_menu_border_width: '1px',
  context_menu_border_color: 'var(--border-basic-color-4)'
};
