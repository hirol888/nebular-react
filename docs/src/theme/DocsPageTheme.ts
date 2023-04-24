import { Property } from 'csstype';
import { DocsHomeTheme, DOCS_HOME_THEME } from './DocsHomeTheme';

export interface DocsPageTheme extends DocsHomeTheme {
  color_info: Property.Color;
  color_warning: Property.Color;
  separator: Property.Color;
  color_bg: Property.BackgroundColor;
  header_bg: Property.BackgroundColor;
  sidebar_padding: Property.Padding;
  sidebar_shadow: Property.BoxShadow;
  link_color: Property.Color;
  link_color_hover: Property.Color;
  link_color_visited: Property.Color;
  menu_submenu_fg: Property.Color;
  menu_submenu_item_container_padding: Property.Padding;
  menu_submenu_active_border_color: Property.BorderColor;
  menu_submenu_active_fg: Property.Color;
  menu_active_font_weight: Property.FontWeight;
  card_bg: Property.Color;
  card_header_font_size: Property.FontSize;
  card_header_font_weight: Property.FontWeight;
  card_header_fg_heading: Property.Color;
  card_margin: Property.Margin;
  footer_shadow: Property.BoxShadow;
}

const menu_fg = 'black';

export const DOCS_PAGE_THEME: DocsPageTheme = {
  ...DOCS_HOME_THEME,
  content_width: '1440px',
  settings_col_width: '19rem',
  settings_col_margin: '0.375rem',
  color_gray_light: '#ced5dd',
  color_fg_heading_light: '#8994a3',
  code_block_bg: 'linear-gradient(225deg, #333c66 0%, #1d2447 100%)',
  color_info: '#5699f0',
  color_warning: '#f09301',
  header_menu_fg_active: DOCS_HOME_THEME.color_primary_default,
  radius: '0.25rem',
  separator: 'transparent',
  color_bg: 'transparent',
  color_fg: '#494949',
  color_fg_text: '#494949',
  color_fg_heading: 'rgba(0, 0, 0, 0.88)',
  shadow: '0 8px 20px 0 rgba(218, 224, 235, 0.6)',
  layout_background_color: '#fafafa',
  layout_padding: '3.25rem 1.25rem 3.25rem 1rem',
  header_bg: 'white',
  sidebar_padding: '2rem',
  sidebar_shadow: 'none',
  color_fg_highlight: DOCS_HOME_THEME.color_primary_default,
  link_color: DOCS_HOME_THEME.color_primary_default,
  link_color_hover: DOCS_HOME_THEME.color_primary_default,
  link_color_visited: DOCS_HOME_THEME.color_primary_default,
  header_padding: 0,
  header_fg: 'black',
  menu_fg,
  menu_submenu_fg: '#8994a3',
  menu_active_fg: menu_fg,
  menu_submenu_item_container_padding: '0 1rem',
  menu_submenu_active_border_color: 'transparent',
  menu_submenu_active_fg: DOCS_HOME_THEME.color_fg_highlight,
  menu_active_font_weight: 'bold',
  card_bg: 'white',
  card_header_font_size: '2rem',
  card_header_font_weight: 'bold',
  card_header_fg_heading: 'black',
  card_margin: '2.5rem',
  footer_shadow: 'none',
  footer_text_color: '#8994a3'
};
