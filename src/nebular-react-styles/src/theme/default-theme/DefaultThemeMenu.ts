import { NebularThemeMenu } from '../types/nebular-theme';

const menu_item_hover_text_color = 'var(--text-primary-hover-color)';
const menu_item_active_text_color = 'var(--text-primary-color)';

export const DefaultThemeMenu: NebularThemeMenu = {
  menu_background_color: 'transparent',
  menu_text_color: 'var(--text-basic-color)',
  menu_text_font_family: 'var(--text-subtitle-2-font-family)',
  menu_text_font_size: 'var(--text-subtitle-2-font-size)',
  menu_text_font_weight: 'var(--text-subtitle-2-font-weight)',
  menu_text_line_height: 'var(--text-subtitle-2-line-height)',

  menu_group_text_color: 'var(--text-hint-color)',

  menu_item_border_radius: '0',
  menu_item_padding: '0.75rem 1rem',

  menu_item_hover_background_color: 'var(--menu-background-color)',
  menu_item_hover_cursor: 'pointer',
  menu_item_hover_text_color,
  menu_item_icon_hover_color: 'var(--menu-item-hover-text-color)',

  menu_item_active_background_color: 'var(--menu-background-color)',
  menu_item_active_text_color,
  menu_item_icon_active_color: 'var(--menu-item-active-text-color)',

  menu_item_icon_color: 'var(--text-hint-color)',
  menu_item_icon_margin: '0 0.5rem 0 0',
  menu_item_icon_width: '1.25rem',

  menu_item_divider_color: 'var(--divider-color)',
  menu_item_divider_style: 'var(--divider-style)',
  menu_item_divider_width: 'var(--divider-width)',

  menu_submenu_background_color: 'var(--menu-background-color)',
  menu_submenu_text_color: 'var(--text-basic-color)',
  menu_submenu_margin: '0',
  menu_submenu_padding: '0 1.25rem',

  menu_submenu_item_border_color: 'var(--menu-submenu-background-color)',
  menu_submenu_item_border_style: 'solid',
  menu_submenu_item_border_width: '0',
  menu_submenu_item_border_radius: '0',
  menu_submenu_item_padding: 'var(--menu-item-padding)',

  menu_submenu_item_hover_background_color: 'var(--menu-background-color)',
  menu_submenu_item_hover_border_color: 'var(--menu-submenu-item-border-color)',
  menu_submenu_item_hover_text_color: 'var(--menu-item-hover-text-color)',
  menu_submenu_item_icon_hover_color: 'var(--menu-item-icon-hover-color)',

  menu_submenu_item_active_background_color: 'var(--menu-background-color)',
  menu_submenu_item_active_border_color: 'var(--color-primary-default)',
  menu_submenu_item_active_text_color: 'var(--menu-item-active-text-color)',
  menu_submenu_item_icon_active_color: 'var(--menu-item-icon-active-color)',

  menu_submenu_item_active_hover_background_color:
    'var(--menu-submenu-item-hover-background-color)',
  menu_submenu_item_active_hover_border_color: 'var(--color-primary-hover)',
  menu_submenu_item_active_hover_text_color: 'var(--menu-submenu-item-hover-text-color)',
  menu_submenu_item_icon_active_hover_color: 'var(--menu-submenu-item-icon-hover-color)'
};
