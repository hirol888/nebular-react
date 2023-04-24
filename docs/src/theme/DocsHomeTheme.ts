import { DEFAULT_THEME, NebularTheme } from '@nebular-react/core';
import { Property } from 'csstype';

export interface DocsHomeTheme extends NebularTheme {
  font_family_primary: Property.FontFamily;
  font_family_secondary: Property.FontFamily;
  content_width: Property.Width;
  settings_col_width: Property.Width;
  settings_col_margin: Property.Margin;
  color_fg_heading_light: Property.Color;
  header_menu_fg_active: Property.Color;
  footer_menu_fg: Property.Color;
  code_block_bg: Property.BackgroundColor;
  color_gray_light: Property.Color;
  radius: Property.BorderRadius;
  color_fg_highlight: Property.Color;
  select_min_width: Property.MinWidth;
  color_fg: Property.Color;
  color_fg_heading: Property.Color;
  color_fg_text: Property.Color;
  shadow: Property.BoxShadow;
  layout_background_color: Property.BackgroundColor;
  layout_padding: Property.Padding;
  layout_medium_padding: Property.Padding;
  layout_small_padding: Property.Padding;
  footer_text_color: Property.Color;
  footer_icon_color: Property.Color;
  footer_background_color: Property.Color;
  footer_divider_width: Property.Width;
  header_padding: Property.Padding;
  header_height: Property.Height;
  header_fg: Property.Color;
  menu_item_padding: Property.Padding;
  menu_fg: Property.Color;
  menu_active_fg: Property.Color;
  footer_height: Property.Height;
  footer_padding: Property.Padding;
  menu_font_size: Property.FontSize;
  menu_font_weight: Property.FontWeight;
  link_text_decoration: Property.TextDecoration;
}

const color_fg = 'white';
const color_fg_text = '#919fb1';
const color_fg_heading_light = '#ffffff';
const menu_fg = 'black';
const font_family_primary =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const DOCS_HOME_THEME: DocsHomeTheme = {
  ...DEFAULT_THEME,
  font_family_primary,
  font_family_secondary: font_family_primary,
  content_width: '1140px',
  settings_col_width: 0,
  settings_col_margin: 0,
  color_fg_heading_light,
  header_menu_fg_active: color_fg,
  footer_menu_fg: color_fg_text,
  code_block_bg: 'linear-gradient(225deg, #333c66 0 %, #1d2447 100 %)',
  color_gray_light: '#ced5dd',
  radius: '0.375rem',
  color_fg_highlight: '#40dc7e',
  select_min_width: '5rem',
  color_fg,
  color_fg_heading: '#0d1c2e',
  color_fg_text,
  shadow: 'none',
  layout_background_color: 'transparent',
  layout_padding: 0,
  layout_medium_padding: 0,
  layout_small_padding: 0,
  footer_text_color: color_fg_text,
  footer_icon_color: '#cdd6e3',
  footer_background_color: 'transparent',
  footer_divider_width: 0,
  header_padding: '0 0',
  header_height: '4.25rem',
  header_fg: color_fg_heading_light,
  menu_item_padding: '0.675rem 1rem',
  menu_fg: color_fg_heading_light,
  menu_active_fg: menu_fg,
  footer_height: '18.75rem',
  footer_padding: '1.25rem 0',
  menu_font_size: '0.95rem',
  menu_font_weight: 'normal',
  link_text_decoration: 'none'
};
