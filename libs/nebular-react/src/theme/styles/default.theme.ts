import { ThemeModel } from "./theme.types";

const color_primary_100 = "#f2f6ff";
const color_primary_200 = "#d9e4ff";
const color_primary_300 = '#a6c1ff';
const color_primary_400 = '#598bff';
const color_primary_500 = '#3366ff';
const color_primary_600 = '#274bdb';
const color_primary_700 = '#1a34b8';
const color_primary_800 = '#102694';
const color_primary_900 = '#091c7a';

const color_primary_transparent_100 = 'rgba(51, 102, 255, 0.08)';
const color_primary_transparent_200 = 'rgba(51, 102, 255, 0.16)';
const color_primary_transparent_300 = 'rgba(51, 102, 255, 0.24)';
const color_primary_transparent_400 = 'rgba(51, 102, 255, 0.32)';
const color_primary_transparent_500 = 'rgba(51, 102, 255, 0.4)';
const color_primary_transparent_600 = 'rgba(51, 102, 255, 0.48)';

const color_success_100 = '#f0fff5';
const color_success_200 = '#ccfce3';
const color_success_300 = '#8cfac7';
const color_success_400 = '#2ce69b';
const color_success_500 = '#00d68f';
const color_success_600 = '#00b887';
const color_success_700 = '#00997a';
const color_success_800 = '#007d6c';
const color_success_900 = '#004a45';

const color_success_transparent_100 = 'rgba(0, 214, 143, 0.08)';
const color_success_transparent_200 = 'rgba(0, 214, 143, 0.16)';
const color_success_transparent_300 = 'rgba(0, 214, 143, 0.24)';
const color_success_transparent_400 = 'rgba(0, 214, 143, 0.32)';
const color_success_transparent_500 = 'rgba(0, 214, 143, 0.4)';
const color_success_transparent_600 = 'rgba(0, 214, 143, 0.48)';

const color_info_100 = '#f2f8ff';
const color_info_200 = '#c7e2ff';
const color_info_300 = '#94cbff';
const color_info_400 = '#42aaff';
const color_info_500 = '#0095ff';
const color_info_600 = '#006fd6';
const color_info_700 = '#0057c2';
const color_info_800 = '#0041a8';
const color_info_900 = '#002885';

const color_info_transparent_100 = 'rgba(0, 149, 255, 0.08)';
const color_info_transparent_200 = 'rgba(0, 149, 255, 0.16)';
const color_info_transparent_300 = 'rgba(0, 149, 255, 0.24)';
const color_info_transparent_400 = 'rgba(0, 149, 255, 0.32)';
const color_info_transparent_500 = 'rgba(0, 149, 255, 0.4)';
const color_info_transparent_600 = 'rgba(0, 149, 255, 0.48)';

const color_warning_100 = '#fffdf2';
const color_warning_200 = '#fff1c2';
const color_warning_300 = '#ffe59e';
const color_warning_400 = '#ffc94d';
const color_warning_500 = '#ffaa00';
const color_warning_600 = '#db8b00';
const color_warning_700 = '#b86e00';
const color_warning_800 = '#945400';
const color_warning_900 = '#703c00';

const color_warning_transparent_100 = 'rgba(255, 170, 0, 0.08)';
const color_warning_transparent_200 = 'rgba(255, 170, 0, 0.16)';
const color_warning_transparent_300 = 'rgba(255, 170, 0, 0.24)';
const color_warning_transparent_400 = 'rgba(255, 170, 0, 0.32)';
const color_warning_transparent_500 = 'rgba(255, 170, 0, 0.4)';
const color_warning_transparent_600 = 'rgba(255, 170, 0, 0.48)';

const color_danger_100 = '#fff2f2';
const color_danger_200 = '#ffd6d9';
const color_danger_300 = '#ffa8b4';
const color_danger_400 = '#ff708d';
const color_danger_500 = '#ff3d71';
const color_danger_600 = '#db2c66';
const color_danger_700 = '#b81d5b';
const color_danger_800 = '#94124e';
const color_danger_900 = '#700940';

const color_danger_transparent_100 = 'rgba(255, 61, 113, 0.08)';
const color_danger_transparent_200 = 'rgba(255, 61, 113, 0.16)';
const color_danger_transparent_300 = 'rgba(255, 61, 113, 0.24)';
const color_danger_transparent_400 = 'rgba(255, 61, 113, 0.32)';
const color_danger_transparent_500 = 'rgba(255, 61, 113, 0.4)';
const color_danger_transparent_600 = 'rgba(255, 61, 113, 0.48)';

const color_basic_100 = '#ffffff';
const color_basic_200 = '#f7f9fc';
const color_basic_300 = '#edf1f7';
const color_basic_400 = '#e4e9f2';
const color_basic_500 = '#c5cee0';
const color_basic_600 = '#8f9bb3';
const color_basic_700 = '#2e3a59';
const color_basic_800 = '#222b45';
const color_basic_900 = '#192038';
const color_basic_1000 = '#151a30';
const color_basic_1100 = '#101426';

const color_basic_transparent_100 = 'rgba(143, 155, 179, 0.08)';
const color_basic_transparent_200 = 'rgba(143, 155, 179, 0.16)';
const color_basic_transparent_300 = 'rgba(143, 155, 179, 0.24)';
const color_basic_transparent_400 = 'rgba(143, 155, 179, 0.32)';
const color_basic_transparent_500 = 'rgba(143, 155, 179, 0.4)';
const color_basic_transparent_600 = 'rgba(143, 155, 179, 0.48)';

const color_basic_control_transparent_100 = 'rgba(255, 255, 255, 0.08)';
const color_basic_control_transparent_200 = 'rgba(255, 255, 255, 0.16)';
const color_basic_control_transparent_300 = 'rgba(255, 255, 255, 0.24)';
const color_basic_control_transparent_400 = 'rgba(255, 255, 255, 0.32)';
const color_basic_control_transparent_500 = 'rgba(255, 255, 255, 0.4)';
const color_basic_control_transparent_600 = 'rgba(255, 255, 255, 0.48)';

const color_basic_focus = color_basic_400;
const color_basic_hover = color_basic_200;
const color_basic_default = color_basic_300;
const color_basic_active = color_basic_400;
const color_basic_disabled = color_basic_transparent_300;
const color_basic_focus_border = color_basic_500;
const color_basic_hover_border = color_basic_hover;
const color_basic_default_border = color_basic_default;
const color_basic_active_border = color_basic_active;
const color_basic_disabled_border = color_basic_disabled;

const color_basic_transparent_focus = color_basic_transparent_300;
const color_basic_transparent_hover = color_basic_transparent_200;
const color_basic_transparent_default = color_basic_transparent_100;
const color_basic_transparent_active = color_basic_transparent_300;
const color_basic_transparent_disabled = color_basic_transparent_200;
const color_basic_transparent_focus_border = color_basic_600;
const color_basic_transparent_hover_border = color_basic_600;
const color_basic_transparent_default_border = color_basic_600;
const color_basic_transparent_active_border = color_basic_600;
const color_basic_transparent_disabled_border = color_basic_transparent_300;

const color_primary_focus = color_primary_600;
const color_primary_hover = color_primary_400;
const color_primary_default = color_primary_500;
const color_primary_active = color_primary_600;
const color_primary_disabled = color_basic_transparent_300;
const color_primary_focus_border = color_primary_700;
const color_primary_hover_border = color_primary_hover;
const color_primary_default_border = color_primary_default;
const color_primary_active_border = color_primary_active;
const color_primary_disabled_border = color_primary_disabled;

const color_primary_transparent_focus = color_primary_transparent_300;
const color_primary_transparent_hover = color_primary_transparent_200;
const color_primary_transparent_default = color_primary_transparent_100;
const color_primary_transparent_active = color_primary_transparent_300;
const color_primary_transparent_disabled = color_basic_transparent_200;
const color_primary_transparent_focus_border = color_primary_500;
const color_primary_transparent_hover_border = color_primary_500;
const color_primary_transparent_default_border = color_primary_500;
const color_primary_transparent_active_border = color_primary_500;
const color_primary_transparent_disabled_border = color_basic_transparent_300;

const color_success_focus = color_success_600;
const color_success_hover = color_success_400;
const color_success_default = color_success_500;
const color_success_active = color_success_600;
const color_success_disabled = color_basic_transparent_300;
const color_success_focus_border = color_success_700;
const color_success_hover_border = color_success_hover;
const color_success_default_border = color_success_default;
const color_success_active_border = color_success_active;
const color_success_disabled_border = color_success_disabled;

const color_success_transparent_focus = color_success_transparent_300;
const color_success_transparent_focus_border = color_success_500;
const color_success_transparent_hover = color_success_transparent_200;
const color_success_transparent_hover_border = color_success_500;
const color_success_transparent_default = color_success_transparent_100;
const color_success_transparent_default_border = color_success_500;
const color_success_transparent_active = color_success_transparent_300;
const color_success_transparent_active_border = color_success_500;
const color_success_transparent_disabled = color_basic_transparent_200;
const color_success_transparent_disabled_border = color_basic_transparent_300;

const color_info_focus = color_info_600;
const color_info_hover = color_info_400;
const color_info_default = color_info_500;
const color_info_active = color_info_600;
const color_info_disabled = color_basic_transparent_300;
const color_info_focus_border = color_info_700;
const color_info_hover_border = color_info_hover;
const color_info_default_border = color_info_default;
const color_info_active_border = color_info_active;
const color_info_disabled_border = color_info_disabled;

const color_info_transparent_focus = color_info_transparent_300;
const color_info_transparent_hover = color_info_transparent_200;
const color_info_transparent_default = color_info_transparent_100;
const color_info_transparent_active = color_info_transparent_300;
const color_info_transparent_disabled = color_basic_transparent_200;
const color_info_transparent_focus_border = color_info_500;
const color_info_transparent_hover_border = color_info_500;
const color_info_transparent_default_border = color_info_500;
const color_info_transparent_active_border = color_info_500;
const color_info_transparent_disabled_border = color_basic_transparent_300;

const color_warning_focus = color_warning_600;
const color_warning_hover = color_warning_400;
const color_warning_default = color_warning_500;
const color_warning_active = color_warning_600;
const color_warning_disabled = color_basic_transparent_300;
const color_warning_focus_border = color_warning_700;
const color_warning_hover_border = color_warning_hover;
const color_warning_default_border = color_warning_default;
const color_warning_active_border = color_warning_active;
const color_warning_disabled_border = color_warning_disabled;

const color_warning_transparent_focus = color_warning_transparent_300;
const color_warning_transparent_hover = color_warning_transparent_200;
const color_warning_transparent_default = color_warning_transparent_100;
const color_warning_transparent_active = color_warning_transparent_300;
const color_warning_transparent_disabled = color_basic_transparent_200;
const color_warning_transparent_focus_border = color_warning_500;
const color_warning_transparent_hover_border = color_warning_500;
const color_warning_transparent_default_border = color_warning_500;
const color_warning_transparent_active_border = color_warning_500;
const color_warning_transparent_disabled_border = color_basic_transparent_300;

const color_danger_focus = color_danger_600;
const color_danger_hover = color_danger_400;
const color_danger_default = color_danger_500;
const color_danger_active = color_danger_600;
const color_danger_disabled = color_basic_transparent_300;
const color_danger_focus_border = color_danger_700;
const color_danger_hover_border = color_danger_hover;
const color_danger_default_border = color_danger_default;
const color_danger_active_border = color_danger_active;
const color_danger_disabled_border = color_danger_disabled;

const color_danger_transparent_focus = color_danger_transparent_300;
const color_danger_transparent_hover = color_danger_transparent_200;
const color_danger_transparent_default = color_danger_transparent_100;
const color_danger_transparent_active = color_danger_transparent_300;
const color_danger_transparent_disabled = color_basic_transparent_200;
const color_danger_transparent_focus_border = color_danger_500;
const color_danger_transparent_hover_border = color_danger_500;
const color_danger_transparent_default_border = color_danger_500;
const color_danger_transparent_active_border = color_danger_500;
const color_danger_transparent_disabled_border = color_basic_transparent_300;

const color_control_focus = color_basic_300;
const color_control_hover = color_basic_200;
const color_control_default = color_basic_100;
const color_control_active = color_basic_300;
const color_control_disabled = color_basic_transparent_300;
const color_control_focus_border = color_basic_500;
const color_control_hover_border = color_control_hover;
const color_control_default_border = color_control_default;
const color_control_active_border = color_control_active;
const color_control_disabled_border = color_control_disabled;

const color_control_transparent_focus = color_basic_control_transparent_300;
const color_control_transparent_hover = color_basic_control_transparent_200;
const color_control_transparent_default = color_basic_control_transparent_100;
const color_control_transparent_active = color_basic_control_transparent_300;
const color_control_transparent_disabled = color_basic_transparent_200;
const color_control_transparent_focus_border = color_basic_100;
const color_control_transparent_hover_border = color_basic_100;
const color_control_transparent_default_border = color_basic_100;
const color_control_transparent_active_border = color_basic_100;
const color_control_transparent_disabled_border = color_basic_transparent_300;

const background_basic_color_1 = color_basic_100;
const background_basic_color_2 = color_basic_200;
const background_basic_color_3 = color_basic_300;
const background_basic_color_4 = color_basic_400;

const border_basic_color_1 = color_basic_100;
const border_basic_color_2 = color_basic_200;
const border_basic_color_3 = color_basic_300;
const border_basic_color_4 = color_basic_400;
const border_basic_color_5 = color_basic_500;

const background_alternative_color_1 = color_basic_800;
const background_alternative_color_2 = color_basic_900;
const background_alternative_color_3 = color_basic_1000;
const background_alternative_color_4 = color_basic_1100;

const border_alternative_color_1 = color_basic_800;
const border_alternative_color_2 = color_basic_900;
const border_alternative_color_3 = color_basic_1000;
const border_alternative_color_4 = color_basic_1100;
const border_alternative_color_5 = color_basic_1100;

const background_primary_color_1 = color_primary_500;
const background_primary_color_2 = color_primary_600;
const background_primary_color_3 = color_primary_700;
const background_primary_color_4 = color_primary_800;

const border_primary_color_1 = color_basic_500;
const border_primary_color_2 = color_basic_600;
const border_primary_color_3 = color_basic_700;
const border_primary_color_4 = color_basic_800;
const border_primary_color_5 = color_basic_900;

const text_basic_color = color_basic_800;
const text_alternate_color = color_basic_100;
const text_control_color = color_basic_100;
const text_disabled_color = color_basic_transparent_600;
const text_hint_color = color_basic_600;

const text_primary_color = color_primary_default;
const text_primary_focus_color = color_primary_focus;
const text_primary_hover_color = color_primary_hover;
const text_primary_active_color = color_primary_active;
const text_primary_disabled_color = color_primary_400;

const text_success_color = color_success_default;
const text_success_focus_color = color_success_focus;
const text_success_hover_color = color_success_hover;
const text_success_active_color = color_success_active;
const text_success_disabled_color = color_success_400;

const text_info_color = color_info_default;
const text_info_focus_color = color_info_focus;
const text_info_hover_color = color_info_hover;
const text_info_active_color = color_info_active;
const text_info_disabled_color = color_info_400;

const text_warning_color = color_warning_default;
const text_warning_focus_color = color_warning_focus;
const text_warning_hover_color = color_warning_hover;
const text_warning_active_color = color_warning_active;
const text_warning_disabled_color = color_warning_400;

const text_danger_color = color_danger_default;
const text_danger_focus_color = color_danger_focus;
const text_danger_hover_color = color_danger_hover;
const text_danger_active_color = color_danger_active;
const text_danger_disabled_color = color_danger_400;

const font_family_primary = `unquote('Open Sans, sans_serif')`;
const font_family_secondary = font_family_primary;

const text_heading_1_font_family = font_family_secondary;
const text_heading_1_font_size = '2.25rem';
const text_heading_1_font_weight = '700';
const text_heading_1_line_height = '3rem';

const text_heading_2_font_family = font_family_secondary;
const text_heading_2_font_size = '2rem';
const text_heading_2_font_weight = '700';
const text_heading_2_line_height = '2.5rem';

const text_heading_3_font_family = font_family_secondary;
const text_heading_3_font_size = '1.875rem';
const text_heading_3_font_weight = '700';
const text_heading_3_line_height = '2.5rem';

const text_heading_4_font_family = font_family_secondary;
const text_heading_4_font_size = '1.625rem';
const text_heading_4_font_weight = '700';
const text_heading_4_line_height = '2rem';

const text_heading_5_font_family = font_family_secondary;
const text_heading_5_font_size = '1.375rem';
const text_heading_5_font_weight = '700';
const text_heading_5_line_height = '2rem';

const text_heading_6_font_family = font_family_secondary;
const text_heading_6_font_size = '1.125rem';
const text_heading_6_font_weight = '700';
const text_heading_6_line_height = '1.5rem';

const text_subtitle_font_family = font_family_primary;
const text_subtitle_font_size = '0.9375rem';
const text_subtitle_font_weight = '600';
const text_subtitle_line_height = '1.5rem';

const text_subtitle_2_font_family = font_family_primary;
const text_subtitle_2_font_size = '0.8125rem';
const text_subtitle_2_font_weight = '600';
const text_subtitle_2_line_height = '1.5rem';

const text_paragraph_font_family = font_family_primary;
const text_paragraph_font_size = '0.9375rem';
const text_paragraph_font_weight = '400';
const text_paragraph_line_height = '1.25rem';

const text_paragraph_2_font_family = font_family_primary;
const text_paragraph_2_font_size = '0.8125rem';
const text_paragraph_2_font_weight = '400';
const text_paragraph_2_line_height = '1.125rem';

const text_label_font_family = font_family_primary;
const text_label_font_size = '0.75rem';
const text_label_font_weight = '700';
const text_label_line_height = '1rem';

const text_caption_font_family = font_family_primary;
const text_caption_font_size = '0.75rem';
const text_caption_font_weight = '400';
const text_caption_line_height = '1rem';

const text_caption_2_font_family = font_family_primary;
const text_caption_2_font_size = '0.75rem';
const text_caption_2_font_weight = '600';
const text_caption_2_line_height = '1rem';

const text_button_font_family = font_family_primary;
const text_button_font_weight = '700';
const text_button_tiny_font_size = '0.625rem';
const text_button_tiny_line_height = '0.75rem';
const text_button_small_font_size = '0.75rem';
const text_button_small_line_height = '1rem';
const text_button_medium_font_size = '0.875rem';
const text_button_medium_line_height = '1rem';
const text_button_large_font_size = '1rem';
const text_button_large_line_height = '1.25rem';
const text_button_giant_font_size = '1.125rem';
const text_button_giant_line_height = '1.5rem';

const border_radius = '0.25rem';

const outline_width = '0.375rem';
const outline_color = color_basic_transparent_200;

const scrollbar_color = background_basic_color_4;
const scrollbar_background_color = background_basic_color_2;
const scrollbar_width = '0.3125rem';

const shadow = '0 0.5rem 1rem 0 rgba(44, 51, 73, 0.1)';

const divider_color = border_basic_color_3;
const divider_style = 'solid';
const divider_width = '1px';

const link_text_color = text_primary_color;
const link_text_decoration = 'underline';
const link_text_focus_color = text_primary_focus_color;
const link_text_hover_color = text_primary_hover_color;

const card_background_color = background_basic_color_1;
const card_text_color = text_basic_color;
const card_text_font_family = text_paragraph_font_family;
const card_text_font_size = text_paragraph_font_size;
const card_text_font_weight = text_paragraph_font_weight;
const card_text_line_height = text_paragraph_line_height;
const card_border_width = '0.0625rem';
const card_border_style = 'solid';
const card_border_color = border_basic_color_4;
const card_border_radius = border_radius;
const card_padding = '1rem 1.5rem';
const card_shadow = 'none';
const card_divider_color = divider_color;
const card_divider_style = divider_style;
const card_divider_width = divider_width;

const card_header_text_color = text_basic_color;
const card_header_text_font_family = text_subtitle_font_family;
const card_header_text_font_size = text_subtitle_font_size;
const card_header_text_font_weight = text_subtitle_font_weight;
const card_header_text_line_height = text_subtitle_line_height;

const card_header_basic_background_color = background_basic_color_2;
const card_header_basic_text_color = text_basic_color;
const card_header_primary_background_color = color_primary_default;
const card_header_primary_text_color = text_control_color;
const card_header_info_background_color = color_info_default;
const card_header_info_text_color = text_control_color;
const card_header_success_background_color = color_success_default;
const card_header_success_text_color = text_control_color;
const card_header_warning_background_color = color_warning_default;
const card_header_warning_text_color = text_control_color;
const card_header_danger_background_color = color_danger_default;
const card_header_danger_text_color = text_control_color;
const card_header_control_background_color = color_control_default;
const card_header_control_text_color = color_basic_800;

const card_height_tiny = '13.5rem';
const card_height_small = '21.1875rem';
const card_height_medium = '28.875rem';
const card_height_large = '36.5625rem';
const card_height_giant = '44.25rem';
const card_margin_bottom = '1.875rem';

const card_scrollbar_color = scrollbar_color;
const card_scrollbar_background_color = scrollbar_background_color;
const card_scrollbar_width = scrollbar_width;

const header_background_color = background_basic_color_1;
const header_text_color = text_basic_color;
const header_text_font_family = text_paragraph_font_family;
const header_text_font_size = text_paragraph_font_size;
const header_text_font_weight = text_paragraph_font_weight;
const header_text_line_height = text_paragraph_line_height;
const header_height = '4.75rem';
const header_padding = '1.25rem';
const header_shadow = shadow;

const footer_background_color = background_basic_color_1;
const footer_text_color = text_basic_color;
const footer_text_font_family = text_paragraph_font_family;
const footer_text_font_size = text_paragraph_font_size;
const footer_text_font_weight = text_paragraph_font_weight;
const footer_text_line_height = text_paragraph_line_height;
const footer_text_highlight_color = color_primary_hover;
const footer_height = '4.725rem';
const footer_padding = '1.25rem';
const footer_divider_color = divider_color;
const footer_divider_style = divider_style;
const footer_divider_width = divider_width;
const footer_shadow = shadow;

const layout_background_color = background_basic_color_3;
const layout_text_color = text_basic_color;
const layout_text_font_family = text_paragraph_font_family;
const layout_text_font_size = text_paragraph_font_size;
const layout_text_font_weight = text_paragraph_font_weight;
const layout_text_line_height = text_paragraph_line_height;
const layout_min_height = '100vh';
const layout_content_width = '900px';
const layout_window_mode_min_width = '300px';
const layout_window_mode_max_width = '1920px';
const layout_window_mode_background_color = background_basic_color_3;
const layout_window_mode_padding_top = '4.75rem';
const layout_window_shadow = shadow;
const layout_padding = '2.25rem 2.25rem 0.75rem';
const layout_medium_padding = '1.5rem 1.5rem 0.5rem';
const layout_small_padding = '1rem 1rem 0';
const layout_scrollbar_background_color = scrollbar_background_color;
const layout_scrollbar_color = scrollbar_color;
const layout_scrollbar_width = scrollbar_width;

const sidebar_background_color = background_basic_color_1;
const sidebar_text_color = text_basic_color;
const sidebar_text_font_family = text_paragraph_font_family;
const sidebar_text_font_size = text_paragraph_font_size;
const sidebar_text_font_weight = text_paragraph_font_weight;
const sidebar_text_line_height = text_paragraph_line_height;
const sidebar_height = '100vh';
const sidebar_width = '16rem';
const sidebar_width_compact = '3.5rem';
const sidebar_padding = '1.25rem';
const sidebar_header_height = '3.5rem';
const sidebar_footer_height = '3.5rem';
const sidebar_shadow = shadow;
const sidebar_menu_item_highlight_color = color_primary_default;
const sidebar_scrollbar_background_color = scrollbar_background_color;
const sidebar_scrollbar_color = scrollbar_color;
const sidebar_scrollbar_width = scrollbar_width;

const menu_background_color = 'transparent';
const menu_text_color = text_basic_color;
const menu_text_font_family = text_subtitle_2_font_family;
const menu_text_font_size = text_subtitle_2_font_size;
const menu_text_font_weight = text_subtitle_2_font_weight;
const menu_text_line_height = text_subtitle_2_line_height;

const menu_group_text_color = text_hint_color;

const menu_item_border_radius = '0';
const menu_item_padding = '0.75rem 1rem';

const menu_item_hover_background_color = menu_background_color;
const menu_item_hover_cursor = 'pointer';
const menu_item_hover_text_color = text_primary_hover_color;
const menu_item_icon_hover_color = menu_item_hover_text_color;

const menu_item_active_background_color = menu_background_color;
const menu_item_active_text_color = text_primary_color;
const menu_item_icon_active_color = menu_item_active_text_color;

const menu_item_icon_color = text_hint_color;
const menu_item_icon_margin = '0 0.5rem 0 0';
const menu_item_icon_width = '1.25rem';

const menu_item_divider_color = divider_color;
const menu_item_divider_style = divider_style;
const menu_item_divider_width = divider_width;

const menu_submenu_background_color = menu_background_color;
const menu_submenu_text_color = text_basic_color;
const menu_submenu_margin = '0';
const menu_submenu_padding = '0 1.25rem';

const menu_submenu_item_border_color = menu_submenu_background_color;
const menu_submenu_item_border_style = 'solid';
const menu_submenu_item_border_width = '0';
const menu_submenu_item_border_radius = '0';
const menu_submenu_item_padding = menu_item_padding;

const menu_submenu_item_hover_background_color = menu_background_color;
const menu_submenu_item_hover_border_color = menu_submenu_item_border_color;
const menu_submenu_item_hover_text_color = menu_item_hover_text_color;
const menu_submenu_item_icon_hover_color = menu_item_icon_hover_color;

const menu_submenu_item_active_background_color = menu_background_color;
const menu_submenu_item_active_border_color = color_primary_default;
const menu_submenu_item_active_text_color = menu_item_active_text_color;
const menu_submenu_item_icon_active_color = menu_item_icon_active_color;

const menu_submenu_item_active_hover_background_color = menu_submenu_item_hover_background_color;
const menu_submenu_item_active_hover_border_color = color_primary_hover;
const menu_submenu_item_active_hover_text_color = menu_submenu_item_hover_text_color;
const menu_submenu_item_icon_active_hover_color = menu_submenu_item_icon_hover_color;

const tabset_background_color = 'transparent';
const tabset_border_radius = '0';
const tabset_shadow = 'none';

const tabset_tab_background_color = 'transparent';
const tabset_tab_padding = '1rem 2rem';
const tabset_tab_text_color = text_hint_color;
const tabset_tab_text_font_family = text_button_font_family;
const tabset_tab_text_font_size = text_button_medium_font_size;
const tabset_tab_text_font_weight = text_button_font_weight;
const tabset_tab_text_line_height = text_button_medium_line_height;
const tabset_tab_text_transform = 'uppercase';
const tabset_tab_underline_width = '0.25rem';
const tabset_tab_underline_color = 'transparent';
const tabset_tab_active_background_color = 'transparent';
const tabset_tab_active_text_color = text_primary_color;
const tabset_tab_active_underline_color = text_primary_color;
const tabset_tab_focus_background_color = 'transparent';
const tabset_tab_focus_text_color = text_primary_focus_color;
const tabset_tab_focus_underline_color = text_primary_focus_color;
const tabset_tab_hover_background_color = 'transparent';
const tabset_tab_hover_text_color = text_primary_hover_color;
const tabset_tab_hover_underline_color = text_primary_hover_color;
const tabset_tab_disabled_background_color = 'transparent';
const tabset_tab_disabled_text_color = text_disabled_color;
const tabset_tab_disabled_underline_color = 'transparent';
const tabset_tab_badge_dot_mode_horizontal_offset = '0.75rem';
const tabset_tab_badge_dot_mode_padding = '0.25rem';

const tabset_divider_color = divider_color;
const tabset_divider_style = divider_style;
const tabset_divider_width = divider_width;

const tabset_content_background_color = 'transparent';
const tabset_content_padding = '1rem 2rem';
const tabset_content_text_color = text_basic_color;
const tabset_content_text_font_family = text_paragraph_font_family;
const tabset_content_text_font_size = text_paragraph_font_size;
const tabset_content_text_font_weight = text_paragraph_font_weight;
const tabset_content_text_line_height = text_paragraph_line_height;

const tabset_scrollbar_color = scrollbar_color;
const tabset_scrollbar_background_color = scrollbar_background_color;
const tabset_scrollbar_width = scrollbar_width;
const tabset_tab_text_hide_breakpoint = '36rem';

const route_tabset_background_color = 'transparent';
const route_tabset_border_radius = '0';
const route_tabset_shadow = 'none';

const route_tabset_tab_background_color = 'transparent';
const route_tabset_tab_padding = '1rem 2rem';
const route_tabset_tab_text_color = text_hint_color;
const route_tabset_tab_text_font_family = text_button_font_family;
const route_tabset_tab_text_font_size = text_button_medium_font_size;
const route_tabset_tab_text_font_weight = text_button_font_weight;
const route_tabset_tab_text_line_height = text_button_medium_line_height;
const route_tabset_tab_text_transform = 'uppercase';
const route_tabset_tab_underline_width = '0.25rem';
const route_tabset_tab_underline_color = 'transparent';

const route_tabset_tab_active_background_color = 'transparent';
const route_tabset_tab_active_text_color = text_primary_color;
const route_tabset_tab_active_underline_color = text_primary_color;

const route_tabset_tab_focus_background_color = 'transparent';
const route_tabset_tab_focus_text_color = text_primary_focus_color;
const route_tabset_tab_focus_underline_color = text_primary_focus_color;

const route_tabset_tab_hover_background_color = 'transparent';
const route_tabset_tab_hover_text_color = text_primary_hover_color;
const route_tabset_tab_hover_underline_color = text_primary_hover_color;

const route_tabset_tab_disabled_background_color = 'transparent';
const route_tabset_tab_disabled_text_color = text_disabled_color;
const route_tabset_tab_disabled_underline_color = 'transparent';

const route_tabset_divider_color = divider_color;
const route_tabset_divider_style = divider_style;
const route_tabset_divider_width = divider_width;

const route_tabset_scrollbar_color = scrollbar_color;
const route_tabset_scrollbar_background_color = scrollbar_background_color;
const route_tabset_scrollbar_width = scrollbar_width;
const route_tabset_tab_text_hide_breakpoint = '36rem';

const user_picture_box_background_color = 'transparent';
const user_picture_box_border_color = border_basic_color_3;
const user_picture_box_border_width = '1px';
const user_initials_text_color = text_basic_color;
const user_initials_text_font_family = text_paragraph_font_family;
const user_initials_text_font_weight = text_paragraph_font_weight;
const user_name_text_color = text_basic_color;
const user_name_text_font_family = text_paragraph_font_family;
const user_name_text_font_weight = text_paragraph_font_weight;
const user_title_text_color = text_basic_color;
const user_title_text_font_family = text_paragraph_2_font_family;
const user_title_text_font_weight = text_paragraph_2_font_weight;

const user_rectangle_border_radius = '0.5rem';
const user_semi_round_border_radius = '0.75rem';
const user_round_border_radius = '50%';

const user_tiny_height = '1.25rem';
const user_tiny_width = '1.25rem';
const user_tiny_initials_text_font_size = text_caption_font_size;
const user_tiny_initials_text_line_height = text_caption_line_height;
const user_tiny_name_text_font_size = text_caption_font_size;
const user_tiny_name_text_line_height = text_caption_line_height;
const user_tiny_title_text_font_size = text_caption_font_size;
const user_tiny_title_text_line_height = text_caption_line_height;

const user_small_height = '1.5rem';
const user_small_width = '1.5rem';
const user_small_initials_text_font_size = text_caption_font_size;
const user_small_initials_text_line_height = text_caption_line_height;
const user_small_name_text_font_size = text_caption_font_size;
const user_small_name_text_line_height = text_caption_line_height;
const user_small_title_text_font_size = text_caption_font_size;
const user_small_title_text_line_height = text_caption_line_height;

const user_medium_height = '2.5rem';
const user_medium_width = '2.5rem';
const user_medium_initials_text_font_size = text_paragraph_font_size;
const user_medium_initials_text_line_height = text_paragraph_line_height;
const user_medium_name_text_font_size = text_paragraph_font_size;
const user_medium_name_text_line_height = text_paragraph_line_height;
const user_medium_title_text_font_size = text_caption_font_size;
const user_medium_title_text_line_height = text_caption_line_height;

const user_large_height = '3.25rem';
const user_large_width = '3.25rem';
const user_large_initials_text_font_size = text_paragraph_font_size;
const user_large_initials_text_line_height = text_paragraph_line_height;
const user_large_name_text_font_size = text_paragraph_font_size;
const user_large_name_text_line_height = text_paragraph_line_height;
const user_large_title_text_font_size = text_paragraph_2_font_size;
const user_large_title_text_line_height = text_paragraph_2_line_height;

const user_giant_height = '4rem';
const user_giant_width = '4rem';
const user_giant_initials_text_font_size = text_paragraph_font_size;
const user_giant_initials_text_line_height = text_paragraph_line_height;
const user_giant_name_text_font_size = text_paragraph_font_size;
const user_giant_name_text_line_height = text_paragraph_line_height;
const user_giant_title_text_font_size = text_paragraph_font_size;
const user_giant_title_text_line_height = text_paragraph_line_height;

const popover_text_color = text_basic_color;
const popover_text_font_family = text_paragraph_font_family;
const popover_text_font_size = text_paragraph_font_size;
const popover_text_font_weight = text_paragraph_font_weight;
const popover_text_line_height = text_paragraph_line_height;
const popover_background_color = background_basic_color_1;
const popover_border_width = '1px';
const popover_border_color = 'transparent';
const popover_border_radius = border_radius;
const popover_shadow = shadow;
const popover_arrow_size = '0.6875rem';
const popover_padding = '0.75rem 1rem';

const context_menu_background_color = background_basic_color_1;
const context_menu_border_color = 'transparent';
const context_menu_border_style = 'solid';
const context_menu_border_width = '0';
const context_menu_border_radius = border_radius;
const context_menu_text_align = 'center';
const context_menu_min_width = '10rem';
const context_menu_max_width = '15rem';
const context_menu_shadow = shadow;

const actions_background_color = 'transparent';
const actions_divider_color = divider_color;
const actions_divider_style = divider_style;
const actions_divider_width = divider_width;
const actions_icon_color = text_hint_color;
const actions_text_color = text_basic_color;
const actions_text_font_family = text_button_font_family;
const actions_text_font_weight = text_button_font_weight;
const actions_text_line_height = text_button_medium_line_height;

const actions_disabled_icon_color = text_disabled_color;
const actions_disabled_text_color = text_disabled_color;

const actions_tiny_height = '1rem';
const actions_tiny_icon_height = actions_tiny_height;
const actions_tiny_padding = '0 1.25rem';
const actions_tiny_text_font_size = text_button_tiny_font_size;
const actions_small_height = '1.5rem';
const actions_small_icon_height = actions_small_height;
const actions_small_padding = '0 1.25rem';
const actions_small_text_font_size = text_button_small_font_size;
const actions_medium_height = '2.25rem';
const actions_medium_icon_height = actions_medium_height;
const actions_medium_padding = '0 1.25rem';
const actions_medium_text_font_size = text_button_medium_font_size;
const actions_large_height = '3.5rem';
const actions_large_icon_height = actions_large_height;
const actions_large_padding = '0 1.25rem';
const actions_large_text_font_size = text_button_large_font_size;
const actions_giant_height = '4rem';
const actions_giant_icon_height = actions_giant_height;
const actions_giant_padding = '0 1.25rem';
const actions_giant_text_font_size = text_button_giant_font_size;

const search_background_color = background_basic_color_1;
const search_divider_color = divider_color;
const search_divider_style = divider_style;
const search_divider_width = divider_width;
const search_extra_background_color = color_primary_default;
const search_text_color = text_basic_color;
const search_text_font_family = text_heading_1_font_family;
const search_text_font_size = text_heading_1_font_size;
const search_text_font_weight = text_heading_1_font_weight;
const search_text_line_height = text_heading_1_line_height;
const search_placeholder_text_color = text_hint_color;
const search_info_text_color = text_hint_color;
const search_info_text_font_family = text_subtitle_font_family;
const search_info_text_font_size = text_subtitle_font_size;
const search_info_text_font_weight = text_subtitle_font_weight;
const search_info_text_line_height = text_subtitle_line_height;

const toastr_border_style = 'solid';
const toastr_border_width = '1px';
const toastr_border_radius = border_radius;
const toastr_padding = '1rem';
const toastr_shadow = shadow;

const toastr_text_font_family = text_paragraph_2_font_family;
const toastr_text_font_size = text_paragraph_2_font_size;
const toastr_text_font_weight = text_paragraph_2_font_weight;
const toastr_text_line_height = text_paragraph_2_line_height;
const toastr_title_text_font_family = text_subtitle_font_family;
const toastr_title_text_font_size = text_subtitle_font_size;
const toastr_title_text_font_weight = text_subtitle_font_weight;
const toastr_title_text_line_height = text_subtitle_line_height;

const toastr_basic_background_color = background_basic_color_1;
const toastr_basic_border_color = border_basic_color_3;
const toastr_basic_text_color = text_basic_color;
const toastr_icon_basic_background_color = background_basic_color_1;
const toastr_icon_basic_color = text_basic_color;
const toastr_destroyable_basic_hover_background_color = background_basic_color_1;
const toastr_destroyable_basic_hover_border_color = border_basic_color_3;

const toastr_primary_background_color = color_primary_default;
const toastr_primary_border_color = color_primary_default;
const toastr_primary_text_color = text_control_color;
const toastr_icon_primary_background_color = background_basic_color_1;
const toastr_icon_primary_color = color_primary_default;
const toastr_destroyable_primary_hover_background_color = color_primary_hover;
const toastr_destroyable_primary_hover_border_color = color_primary_hover;

const toastr_success_background_color = color_success_default;
const toastr_success_border_color = color_success_default;
const toastr_success_text_color = text_control_color;
const toastr_icon_success_background_color = background_basic_color_1;
const toastr_icon_success_color = color_success_default;
const toastr_destroyable_success_hover_background_color = color_success_hover;
const toastr_destroyable_success_hover_border_color = color_success_hover;

const toastr_info_background_color = color_info_default;
const toastr_info_border_color = color_info_default;
const toastr_info_text_color = text_control_color;
const toastr_icon_info_background_color = background_basic_color_1;
const toastr_icon_info_color = color_info_default;
const toastr_destroyable_info_hover_background_color = color_info_hover;
const toastr_destroyable_info_hover_border_color = color_info_hover;

const toastr_warning_background_color = color_warning_default;
const toastr_warning_border_color = color_warning_default;
const toastr_warning_text_color = text_control_color;
const toastr_icon_warning_background_color = background_basic_color_1;
const toastr_icon_warning_color = color_warning_default;
const toastr_destroyable_warning_hover_background_color = color_warning_hover;
const toastr_destroyable_warning_hover_border_color = color_warning_hover;

const toastr_danger_background_color = color_danger_default;
const toastr_danger_border_color = color_danger_default;
const toastr_danger_text_color = text_control_color;
const toastr_icon_danger_background_color = background_basic_color_1;
const toastr_icon_danger_color = color_danger_default;
const toastr_destroyable_danger_hover_background_color = color_danger_hover;
const toastr_destroyable_danger_hover_border_color = color_danger_hover;

const toastr_control_background_color = color_control_default;
const toastr_control_border_color = color_control_default;
const toastr_control_text_color = color_basic_800;
const toastr_icon_control_background_color = color_control_default;
const toastr_icon_control_color = color_basic_800;
const toastr_destroyable_control_hover_background_color = color_control_hover;
const toastr_destroyable_control_hover_border_color = color_control_hover;

const button_cursor = 'pointer';
const button_outline_width = outline_width;
const button_outline_color = outline_color;
const button_text_font_family = text_button_font_family;
const button_text_font_weight = text_button_font_weight;
const button_disabled_cursor = 'default';

const button_tiny_text_font_size = text_button_tiny_font_size;
const button_tiny_text_line_height = text_button_tiny_line_height;
const button_tiny_icon_size = '0.75rem';
const button_tiny_icon_vertical_margin = '-0.125rem';
const button_tiny_icon_offset = '0.375rem';

const button_small_text_font_size = text_button_small_font_size;
const button_small_text_line_height = text_button_small_line_height;
const button_small_icon_size = '1rem';
const button_small_icon_vertical_margin = '-0.125rem';
const button_small_icon_offset = '0.375rem';

const button_medium_text_font_size = text_button_medium_font_size;
const button_medium_text_line_height = text_button_medium_line_height;
const button_medium_icon_size = '1.25rem';
const button_medium_icon_vertical_margin = '-0.125rem';
const button_medium_icon_offset = '0.5rem';

const button_large_text_font_size = text_button_large_font_size;
const button_large_text_line_height = text_button_large_line_height;
const button_large_icon_size = '1.5rem';
const button_large_icon_vertical_margin = '-0.125rem';
const button_large_icon_offset = '0.75rem';

const button_giant_text_font_size = text_button_giant_font_size;
const button_giant_text_line_height = text_button_giant_line_height;
const button_giant_icon_size = '1.5rem';
const button_giant_icon_vertical_margin = '-0.125rem';
const button_giant_icon_offset = '0.75rem';

const button_rectangle_border_radius = border_radius;
const button_semi_round_border_radius = '0.75rem';
const button_round_border_radius = '1.5rem';

const button_filled_border_style = 'solid';
const button_filled_border_width = '0.0625rem';
const button_filled_text_transform = 'uppercase';

const button_filled_tiny_padding = '0.3125rem 0.625rem';
const button_filled_small_padding = '0.4375rem 0.875rem';
const button_filled_medium_padding = '0.6875rem 1.125rem';
const button_filled_large_padding = '0.8125rem 1.125rem';
const button_filled_giant_padding = '0.9375rem 1.375rem';

const button_filled_basic_background_color = color_basic_default;
const button_filled_basic_border_color = color_basic_default_border;
const button_filled_basic_text_color = color_basic_800;
const button_filled_basic_focus_background_color = color_basic_focus;
const button_filled_basic_focus_border_color = color_basic_focus_border;
const button_filled_basic_hover_background_color = color_basic_hover;
const button_filled_basic_hover_border_color = color_basic_hover_border;
const button_filled_basic_active_background_color = color_basic_active;
const button_filled_basic_active_border_color = color_basic_active_border;
const button_filled_basic_disabled_background_color = color_basic_disabled;
const button_filled_basic_disabled_border_color = color_basic_disabled_border;
const button_filled_basic_disabled_text_color = text_disabled_color;

const button_filled_primary_background_color = color_primary_default;
const button_filled_primary_border_color = color_primary_default_border;
const button_filled_primary_text_color = text_control_color;
const button_filled_primary_focus_background_color = color_primary_focus;
const button_filled_primary_focus_border_color = color_primary_focus_border;
const button_filled_primary_hover_background_color = color_primary_hover;
const button_filled_primary_hover_border_color = color_primary_hover_border;
const button_filled_primary_active_background_color = color_primary_active;
const button_filled_primary_active_border_color = color_primary_active_border;
const button_filled_primary_disabled_background_color = color_primary_disabled;
const button_filled_primary_disabled_border_color = color_primary_disabled_border;
const button_filled_primary_disabled_text_color = text_disabled_color;

const button_filled_success_background_color = color_success_default;
const button_filled_success_border_color = color_success_default_border;
const button_filled_success_text_color = text_control_color;
const button_filled_success_focus_background_color = color_success_focus;
const button_filled_success_focus_border_color = color_success_focus_border;
const button_filled_success_hover_background_color = color_success_hover;
const button_filled_success_hover_border_color = color_success_hover_border;
const button_filled_success_active_background_color = color_success_active;
const button_filled_success_active_border_color = color_success_active_border;
const button_filled_success_disabled_background_color = color_success_disabled;
const button_filled_success_disabled_border_color = color_success_disabled_border;
const button_filled_success_disabled_text_color = text_disabled_color;

const button_filled_info_background_color = color_info_default;
const button_filled_info_border_color = color_info_default_border;
const button_filled_info_text_color = text_control_color;
const button_filled_info_focus_background_color = color_info_focus;
const button_filled_info_focus_border_color = color_info_focus_border;
const button_filled_info_hover_background_color = color_info_hover;
const button_filled_info_hover_border_color = color_info_hover_border;
const button_filled_info_active_background_color = color_info_active;
const button_filled_info_active_border_color = color_info_active_border;
const button_filled_info_disabled_background_color = color_info_disabled;
const button_filled_info_disabled_border_color = color_info_disabled_border;
const button_filled_info_disabled_text_color = text_disabled_color;

const button_filled_warning_background_color = color_warning_default;
const button_filled_warning_border_color = color_warning_default_border;
const button_filled_warning_text_color = text_control_color;
const button_filled_warning_focus_background_color = color_warning_focus;
const button_filled_warning_focus_border_color = color_warning_focus_border;
const button_filled_warning_hover_background_color = color_warning_hover;
const button_filled_warning_hover_border_color = color_warning_hover_border;
const button_filled_warning_active_background_color = color_warning_active;
const button_filled_warning_active_border_color = color_warning_active_border;
const button_filled_warning_disabled_background_color = color_warning_disabled;
const button_filled_warning_disabled_border_color = color_warning_disabled_border;
const button_filled_warning_disabled_text_color = text_disabled_color;

const button_filled_danger_background_color = color_danger_default;
const button_filled_danger_border_color = color_danger_default_border;
const button_filled_danger_text_color = text_control_color;
const button_filled_danger_focus_background_color = color_danger_focus;
const button_filled_danger_focus_border_color = color_danger_focus_border;
const button_filled_danger_hover_background_color = color_danger_hover;
const button_filled_danger_hover_border_color = color_danger_hover_border;
const button_filled_danger_active_background_color = color_danger_active;
const button_filled_danger_active_border_color = color_danger_active_border;
const button_filled_danger_disabled_background_color = color_danger_disabled;
const button_filled_danger_disabled_border_color = color_danger_disabled_border;
const button_filled_danger_disabled_text_color = text_disabled_color;

const button_filled_control_background_color = color_control_default;
const button_filled_control_border_color = color_control_default_border;
const button_filled_control_text_color = color_basic_800;
const button_filled_control_focus_background_color = color_control_focus;
const button_filled_control_focus_border_color = color_control_focus_border;
const button_filled_control_hover_background_color = color_control_hover;
const button_filled_control_hover_border_color = color_control_hover_border;
const button_filled_control_active_background_color = color_control_active;
const button_filled_control_active_border_color = color_control_active_border;
const button_filled_control_disabled_background_color = color_control_disabled;
const button_filled_control_disabled_border_color = color_control_disabled_border;
const button_filled_control_disabled_text_color = text_disabled_color;

const button_outline_border_style = 'solid';
const button_outline_border_width = '0.0625rem';
const button_outline_text_transform = 'uppercase';
const button_outline_focus_inset_shadow_length = '0 0 0 100vmax';

const button_outline_tiny_padding = '0.3125rem 0.625rem';
const button_outline_small_padding = '0.4375rem 0.875rem';
const button_outline_medium_padding = '0.6875rem 1.125rem';
const button_outline_large_padding = '0.8125rem 1.125rem';
const button_outline_giant_padding = '0.9375rem 1.375rem';

const button_outline_basic_background_color = color_basic_transparent_default;
const button_outline_basic_border_color = color_basic_transparent_default_border;
const button_outline_basic_text_color = text_hint_color;
const button_outline_basic_focus_background_color = color_basic_transparent_focus;
const button_outline_basic_focus_border_color = color_basic_transparent_focus_border;
const button_outline_basic_focus_text_color = text_hint_color;
const button_outline_basic_hover_background_color = color_basic_transparent_hover;
const button_outline_basic_hover_border_color = color_basic_transparent_hover_border;
const button_outline_basic_hover_text_color = text_hint_color;
const button_outline_basic_active_background_color = color_basic_transparent_active;
const button_outline_basic_active_border_color = color_basic_transparent_active_border;
const button_outline_basic_active_text_color = text_hint_color;
const button_outline_basic_disabled_background_color = color_basic_transparent_disabled;
const button_outline_basic_disabled_border_color = color_basic_transparent_disabled_border;
const button_outline_basic_disabled_text_color = text_disabled_color;

const button_outline_primary_background_color = color_primary_transparent_default;
const button_outline_primary_border_color = color_primary_transparent_default_border;
const button_outline_primary_text_color = text_primary_color;
const button_outline_primary_focus_background_color = color_primary_transparent_focus;
const button_outline_primary_focus_border_color = color_primary_transparent_focus_border;
const button_outline_primary_focus_text_color = text_primary_color;
const button_outline_primary_hover_background_color = color_primary_transparent_hover;
const button_outline_primary_hover_border_color = color_primary_transparent_hover_border;
const button_outline_primary_hover_text_color = text_primary_color;
const button_outline_primary_active_background_color = color_primary_transparent_active;
const button_outline_primary_active_border_color = color_primary_transparent_active_border;
const button_outline_primary_active_text_color = text_primary_color;
const button_outline_primary_disabled_background_color = color_primary_transparent_disabled;
const button_outline_primary_disabled_border_color = color_primary_transparent_disabled_border;
const button_outline_primary_disabled_text_color = text_disabled_color;

const button_outline_success_background_color = color_success_transparent_default;
const button_outline_success_border_color = color_success_transparent_default_border;
const button_outline_success_text_color = text_success_color;
const button_outline_success_focus_background_color = color_success_transparent_focus;
const button_outline_success_focus_border_color = color_success_transparent_focus_border;
const button_outline_success_focus_text_color = text_success_color;
const button_outline_success_hover_background_color = color_success_transparent_hover;
const button_outline_success_hover_border_color = color_success_transparent_hover_border;
const button_outline_success_hover_text_color = text_success_color;
const button_outline_success_active_background_color = color_success_transparent_active;
const button_outline_success_active_border_color = color_success_transparent_active_border;
const button_outline_success_active_text_color = text_success_color;
const button_outline_success_disabled_background_color = color_success_transparent_disabled;
const button_outline_success_disabled_border_color = color_success_transparent_disabled_border;
const button_outline_success_disabled_text_color = text_disabled_color;

const button_outline_info_background_color = color_info_transparent_default;
const button_outline_info_border_color = color_info_transparent_default_border;
const button_outline_info_text_color = text_info_color;
const button_outline_info_focus_background_color = color_info_transparent_focus;
const button_outline_info_focus_border_color = color_info_transparent_focus_border;
const button_outline_info_focus_text_color = text_info_color;
const button_outline_info_hover_background_color = color_info_transparent_hover;
const button_outline_info_hover_border_color = color_info_transparent_hover_border;
const button_outline_info_hover_text_color = text_info_color;
const button_outline_info_active_background_color = color_info_transparent_active;
const button_outline_info_active_border_color = color_info_transparent_active_border;
const button_outline_info_active_text_color = text_info_color;
const button_outline_info_disabled_background_color = color_info_transparent_disabled;
const button_outline_info_disabled_border_color = color_info_transparent_disabled_border;
const button_outline_info_disabled_text_color = text_disabled_color;

const button_outline_warning_background_color = color_warning_transparent_default;
const button_outline_warning_border_color = color_warning_transparent_default_border;
const button_outline_warning_text_color = text_warning_color;
const button_outline_warning_focus_background_color = color_warning_transparent_focus;
const button_outline_warning_focus_border_color = color_warning_transparent_focus_border;
const button_outline_warning_focus_text_color = text_warning_color;
const button_outline_warning_hover_background_color = color_warning_transparent_hover;
const button_outline_warning_hover_border_color = color_warning_transparent_hover_border;
const button_outline_warning_hover_text_color = text_warning_color;
const button_outline_warning_active_background_color = color_warning_transparent_active;
const button_outline_warning_active_border_color = color_warning_transparent_active_border;
const button_outline_warning_active_text_color = text_warning_color;
const button_outline_warning_disabled_background_color = color_warning_transparent_disabled;
const button_outline_warning_disabled_border_color = color_warning_transparent_disabled_border;
const button_outline_warning_disabled_text_color = text_disabled_color;

const button_outline_danger_background_color = color_danger_transparent_default;
const button_outline_danger_border_color = color_danger_transparent_default_border;
const button_outline_danger_text_color = text_danger_color;
const button_outline_danger_focus_background_color = color_danger_transparent_focus;
const button_outline_danger_focus_border_color = color_danger_transparent_focus_border;
const button_outline_danger_focus_text_color = text_danger_color;
const button_outline_danger_hover_background_color = color_danger_transparent_hover;
const button_outline_danger_hover_border_color = color_danger_transparent_hover_border;
const button_outline_danger_hover_text_color = text_danger_color;
const button_outline_danger_active_background_color = color_danger_transparent_active;
const button_outline_danger_active_border_color = color_danger_transparent_active_border;
const button_outline_danger_active_text_color = text_danger_color;
const button_outline_danger_disabled_background_color = color_danger_transparent_disabled;
const button_outline_danger_disabled_border_color = color_danger_transparent_disabled_border;
const button_outline_danger_disabled_text_color = text_disabled_color;

const button_outline_control_background_color = color_control_transparent_default;
const button_outline_control_border_color = color_control_transparent_default_border;
const button_outline_control_text_color = text_control_color;
const button_outline_control_focus_background_color = color_control_transparent_focus;
const button_outline_control_focus_border_color = color_control_transparent_focus_border;
const button_outline_control_focus_text_color = text_control_color;
const button_outline_control_hover_background_color = color_control_transparent_hover;
const button_outline_control_hover_border_color = color_control_transparent_hover_border;
const button_outline_control_hover_text_color = text_control_color;
const button_outline_control_active_background_color = color_control_transparent_active;
const button_outline_control_active_border_color = color_control_transparent_active_border;
const button_outline_control_active_text_color = text_control_color;
const button_outline_control_disabled_background_color = color_control_transparent_disabled;
const button_outline_control_disabled_border_color = color_control_transparent_disabled_border;
const button_outline_control_disabled_text_color = text_disabled_color;

const button_ghost_background_color = 'transparent';
const button_ghost_border_color = 'transparent';
const button_ghost_border_style = 'solid';
const button_ghost_border_width = '0.0625rem';
const button_ghost_text_transform = 'uppercase';
const button_ghost_focus_inset_shadow_length = '0 0 0 100vmax';

const button_ghost_tiny_padding = '0.3125rem 0.625rem';
const button_ghost_small_padding = '0.4375rem 0.875rem';
const button_ghost_medium_padding = '0.6875rem 1.125rem';
const button_ghost_large_padding = '0.8125rem 1.125rem';
const button_ghost_giant_padding = '0.9375rem 1.375rem';

const button_ghost_basic_text_color = color_basic_600;
const button_ghost_basic_focus_background_color = color_basic_transparent_200;
const button_ghost_basic_focus_border_color = color_basic_transparent_500;
const button_ghost_basic_focus_text_color = color_basic_600;
const button_ghost_basic_hover_background_color = color_basic_transparent_100;
const button_ghost_basic_hover_border_color = 'transparent';
const button_ghost_basic_hover_text_color = color_basic_600;
const button_ghost_basic_active_background_color = color_basic_transparent_200;
const button_ghost_basic_active_border_color = 'transparent';
const button_ghost_basic_active_text_color = color_basic_600;
const button_ghost_basic_disabled_background_color = color_basic_transparent_200;
const button_ghost_basic_disabled_border_color = 'transparent';
const button_ghost_basic_disabled_text_color = text_disabled_color;

const button_ghost_primary_text_color = text_primary_color;
const button_ghost_primary_focus_background_color = color_basic_transparent_200;
const button_ghost_primary_focus_border_color = color_basic_transparent_500;
const button_ghost_primary_focus_text_color = text_primary_color;
const button_ghost_primary_hover_background_color = color_basic_transparent_100;
const button_ghost_primary_hover_border_color = 'transparent';
const button_ghost_primary_hover_text_color = text_primary_color;
const button_ghost_primary_active_background_color = color_basic_transparent_200;
const button_ghost_primary_active_border_color = 'transparent';
const button_ghost_primary_active_text_color = text_primary_color;
const button_ghost_primary_disabled_background_color = color_basic_transparent_200;
const button_ghost_primary_disabled_border_color = 'transparent';
const button_ghost_primary_disabled_text_color = text_disabled_color;

const button_ghost_success_text_color = text_success_color;
const button_ghost_success_focus_background_color = color_basic_transparent_200;
const button_ghost_success_focus_border_color = color_basic_transparent_500;
const button_ghost_success_focus_text_color = text_success_color;
const button_ghost_success_hover_background_color = color_basic_transparent_100;
const button_ghost_success_hover_border_color = 'transparent';
const button_ghost_success_hover_text_color = text_success_color;
const button_ghost_success_active_background_color = color_basic_transparent_200;
const button_ghost_success_active_border_color = 'transparent';
const button_ghost_success_active_text_color = text_success_color;
const button_ghost_success_disabled_background_color = color_basic_transparent_200;
const button_ghost_success_disabled_border_color = 'transparent';
const button_ghost_success_disabled_text_color = text_disabled_color;

const button_ghost_info_text_color = text_info_color;
const button_ghost_info_focus_background_color = color_basic_transparent_200;
const button_ghost_info_focus_border_color = color_basic_transparent_500;
const button_ghost_info_focus_text_color = text_info_color;
const button_ghost_info_hover_background_color = color_basic_transparent_100;
const button_ghost_info_hover_border_color = 'transparent';
const button_ghost_info_hover_text_color = text_info_color;
const button_ghost_info_active_background_color = color_basic_transparent_200;
const button_ghost_info_active_border_color = 'transparent';
const button_ghost_info_active_text_color = text_info_color;
const button_ghost_info_disabled_background_color = color_basic_transparent_200;
const button_ghost_info_disabled_border_color = 'transparent';
const button_ghost_info_disabled_text_color = text_disabled_color;

const button_ghost_warning_text_color = text_warning_color;
const button_ghost_warning_focus_background_color = color_basic_transparent_200;
const button_ghost_warning_focus_border_color = color_basic_transparent_500;
const button_ghost_warning_focus_text_color = text_warning_color;
const button_ghost_warning_hover_background_color = color_basic_transparent_100;
const button_ghost_warning_hover_border_color = 'transparent';
const button_ghost_warning_hover_text_color = text_warning_color;
const button_ghost_warning_active_background_color = color_basic_transparent_200;
const button_ghost_warning_active_border_color = 'transparent';
const button_ghost_warning_active_text_color = text_warning_color;
const button_ghost_warning_disabled_background_color = color_basic_transparent_200;
const button_ghost_warning_disabled_border_color = 'transparent';
const button_ghost_warning_disabled_text_color = text_disabled_color;

const button_ghost_danger_text_color = text_danger_color;
const button_ghost_danger_focus_background_color = color_basic_transparent_200;
const button_ghost_danger_focus_border_color = color_basic_transparent_500;
const button_ghost_danger_focus_text_color = text_danger_color;
const button_ghost_danger_hover_background_color = color_basic_transparent_100;
const button_ghost_danger_hover_border_color = 'transparent';
const button_ghost_danger_hover_text_color = text_danger_color;
const button_ghost_danger_active_background_color = color_basic_transparent_200;
const button_ghost_danger_active_border_color = 'transparent';
const button_ghost_danger_active_text_color = text_danger_color;
const button_ghost_danger_disabled_background_color = color_basic_transparent_200;
const button_ghost_danger_disabled_border_color = 'transparent';
const button_ghost_danger_disabled_text_color = text_disabled_color;

const button_ghost_control_text_color = color_basic_100;
const button_ghost_control_focus_background_color = color_basic_transparent_200;
const button_ghost_control_focus_border_color = color_basic_transparent_500;
const button_ghost_control_focus_text_color = color_basic_100;
const button_ghost_control_hover_background_color = color_basic_transparent_100;
const button_ghost_control_hover_border_color = 'transparent';
const button_ghost_control_hover_text_color = color_basic_100;
const button_ghost_control_active_background_color = color_basic_transparent_200;
const button_ghost_control_active_border_color = 'transparent';
const button_ghost_control_active_text_color = color_basic_100;
const button_ghost_control_disabled_background_color = color_basic_transparent_200;
const button_ghost_control_disabled_border_color = 'transparent';
const button_ghost_control_disabled_text_color = text_disabled_color;

const button_hero_border_color = 'transparent';
const button_hero_border_style = 'solid';
const button_hero_border_width = '0';
const button_hero_text_transform = 'uppercase';

const button_hero_tiny_padding = '0.375rem 0.6875rem';
const button_hero_small_padding = '0.5rem 0.9375rem';
const button_hero_medium_padding = '0.75rem 1.1875rem';
const button_hero_large_padding = '0.875rem 1.1875rem';
const button_hero_giant_padding = '1rem 1.4375rem';

const button_hero_shadow = '0 0 transparent';
const button_hero_text_shadow = shadow;
const button_hero_bevel_size = '0 0 0 0';
const button_hero_glow_size = '0 0 0 0';
const button_hero_outline_color = outline_color;
const button_hero_outline_width = outline_width;

const button_hero_basic_text_color = color_basic_600;
const button_hero_basic_bevel_color = color_basic_600;
const button_hero_basic_glow_color = color_basic_700;
const button_hero_basic_left_background_color = color_basic_200;
const button_hero_basic_right_background_color = color_basic_default;
const button_hero_basic_focus_left_background_color = color_basic_300;
const button_hero_basic_focus_right_background_color = color_basic_focus;
const button_hero_basic_hover_left_background_color = color_basic_100;
const button_hero_basic_hover_right_background_color = color_basic_hover;
const button_hero_basic_active_left_background_color = color_basic_300;
const button_hero_basic_active_right_background_color = color_basic_active;
const button_hero_basic_disabled_background_color = color_basic_disabled;
const button_hero_basic_disabled_text_color = text_disabled_color;

const button_hero_primary_text_color = text_control_color;
const button_hero_primary_bevel_color = color_primary_600;
const button_hero_primary_glow_color = color_primary_700;
const button_hero_primary_left_background_color = color_primary_400;
const button_hero_primary_right_background_color = color_primary_default;
const button_hero_primary_focus_left_background_color = color_primary_500;
const button_hero_primary_focus_right_background_color = color_primary_focus;
const button_hero_primary_hover_left_background_color = color_primary_300;
const button_hero_primary_hover_right_background_color = color_primary_hover;
const button_hero_primary_active_left_background_color = color_primary_500;
const button_hero_primary_active_right_background_color = color_primary_active;
const button_hero_primary_disabled_background_color = color_primary_disabled;
const button_hero_primary_disabled_text_color = text_disabled_color;

const button_hero_success_text_color = text_control_color;
const button_hero_success_bevel_color = color_success_600;
const button_hero_success_glow_color = color_success_700;
const button_hero_success_left_background_color = color_success_400;
const button_hero_success_right_background_color = color_success_default;
const button_hero_success_focus_left_background_color = color_success_500;
const button_hero_success_focus_right_background_color = color_success_focus;
const button_hero_success_hover_left_background_color = color_success_300;
const button_hero_success_hover_right_background_color = color_success_hover;
const button_hero_success_active_left_background_color = color_success_500;
const button_hero_success_active_right_background_color = color_success_active;
const button_hero_success_disabled_background_color = color_success_disabled;
const button_hero_success_disabled_text_color = text_disabled_color;

const button_hero_info_text_color = text_control_color;
const button_hero_info_bevel_color = color_info_600;
const button_hero_info_glow_color = color_info_700;
const button_hero_info_left_background_color = color_info_400;
const button_hero_info_right_background_color = color_info_default;
const button_hero_info_focus_left_background_color = color_info_500;
const button_hero_info_focus_right_background_color = color_info_focus;
const button_hero_info_hover_left_background_color = color_info_300;
const button_hero_info_hover_right_background_color = color_info_hover;
const button_hero_info_active_left_background_color = color_info_500;
const button_hero_info_active_right_background_color = color_info_active;
const button_hero_info_disabled_background_color = color_info_disabled;
const button_hero_info_disabled_text_color = text_disabled_color;

const button_hero_warning_text_color = text_control_color;
const button_hero_warning_bevel_color = color_warning_600;
const button_hero_warning_glow_color = color_warning_700;
const button_hero_warning_left_background_color = color_warning_400;
const button_hero_warning_right_background_color = color_warning_default;
const button_hero_warning_focus_left_background_color = color_warning_500;
const button_hero_warning_focus_right_background_color = color_warning_focus;
const button_hero_warning_hover_left_background_color = color_warning_300;
const button_hero_warning_hover_right_background_color = color_warning_hover;
const button_hero_warning_active_left_background_color = color_warning_500;
const button_hero_warning_active_right_background_color = color_warning_active;
const button_hero_warning_disabled_background_color = color_warning_disabled;
const button_hero_warning_disabled_text_color = text_disabled_color;

const button_hero_danger_text_color = text_control_color;
const button_hero_danger_bevel_color = color_danger_600;
const button_hero_danger_glow_color = color_danger_700;
const button_hero_danger_left_background_color = color_danger_400;
const button_hero_danger_right_background_color = color_danger_default;
const button_hero_danger_focus_left_background_color = color_danger_500;
const button_hero_danger_focus_right_background_color = color_danger_focus;
const button_hero_danger_hover_left_background_color = color_danger_300;
const button_hero_danger_hover_right_background_color = color_danger_hover;
const button_hero_danger_active_left_background_color = color_danger_500;
const button_hero_danger_active_right_background_color = color_danger_active;
const button_hero_danger_disabled_background_color = color_danger_disabled;
const button_hero_danger_disabled_text_color = text_disabled_color;

const button_hero_control_text_color = color_basic_800;
const button_hero_control_bevel_color = color_basic_600;
const button_hero_control_glow_color = color_basic_700;
const button_hero_control_left_background_color = color_control_default;
const button_hero_control_right_background_color = color_control_default;
const button_hero_control_focus_left_background_color = color_basic_200;
const button_hero_control_focus_right_background_color = color_control_focus;
const button_hero_control_hover_left_background_color = color_basic_100;
const button_hero_control_hover_right_background_color = color_control_hover;
const button_hero_control_active_left_background_color = color_basic_200;
const button_hero_control_active_right_background_color = color_control_active;
const button_hero_control_disabled_background_color = color_basic_transparent_300;
const button_hero_control_disabled_text_color = text_disabled_color;

const button_group_filled_button_basic_text_color = text_hint_color;
const button_group_filled_button_primary_text_color = button_filled_primary_text_color;
const button_group_filled_button_success_text_color = button_filled_success_text_color;
const button_group_filled_button_info_text_color = button_filled_info_text_color;
const button_group_filled_button_warning_text_color = button_filled_warning_text_color;
const button_group_filled_button_danger_text_color = button_filled_danger_text_color;
const button_group_filled_button_control_text_color = button_filled_control_text_color;

const button_group_filled_basic_divider_color = color_basic_focus_border;
const button_group_filled_primary_divider_color = color_primary_focus;
const button_group_filled_success_divider_color = color_success_focus;
const button_group_filled_info_divider_color = color_info_focus;
const button_group_filled_warning_divider_color = color_warning_focus;
const button_group_filled_danger_divider_color = color_danger_focus;
const button_group_filled_control_divider_color = color_control_focus;

const button_group_ghost_divider_color = color_basic_focus_border;

const icon_button_filled_tiny_padding = '0.4375rem 0.3125rem';
const icon_button_filled_small_padding = '0.5625rem 0.4375rem';
const icon_button_filled_medium_padding = '0.6875rem 0.5625rem';
const icon_button_filled_large_padding = '0.8125rem 0.6875rem';
const icon_button_filled_giant_padding = '1.0625rem 0.9375rem';

const icon_button_outline_tiny_padding = '0.4375rem 0.3125rem';
const icon_button_outline_small_padding = '0.5625rem 0.4375rem';
const icon_button_outline_medium_padding = '0.6875rem 0.5625rem';
const icon_button_outline_large_padding = '0.8125rem 0.6875rem';
const icon_button_outline_giant_padding = '1.0625rem 0.9375rem';

const icon_button_ghost_tiny_padding = '0.4375rem 0.3125rem';
const icon_button_ghost_small_padding = '0.5625rem 0.4375rem';
const icon_button_ghost_medium_padding = '0.6875rem 0.5625rem';
const icon_button_ghost_large_padding = '0.8125rem 0.6875rem';
const icon_button_ghost_giant_padding = '1.0625rem 0.9375rem';

const icon_button_hero_tiny_padding = '0.5rem 0.375rem';
const icon_button_hero_small_padding = '0.5625rem 0.5rem';
const icon_button_hero_medium_padding = '0.75rem 0.5625rem';
const icon_button_hero_large_padding = '0.875rem 0.6875rem';
const icon_button_hero_giant_padding = '1.0625rem 1rem';

const input_border_style = 'solid';
const input_border_width = '1px';
const input_outline_color = outline_color;
const input_outline_width = outline_width;
const input_placeholder_text_font_family = text_paragraph_font_family;
const input_text_font_family = text_subtitle_font_family;

const input_basic_text_color = text_basic_color;
const input_basic_placeholder_text_color = text_hint_color;
const input_basic_background_color = background_basic_color_2;
const input_basic_border_color = border_basic_color_4;
const input_basic_focus_background_color = background_basic_color_1;
const input_basic_focus_border_color = color_primary_default_border;
const input_basic_hover_background_color = background_basic_color_3;
const input_basic_hover_border_color = border_basic_color_4;
const input_basic_disabled_background_color = background_basic_color_2;
const input_basic_disabled_border_color = border_basic_color_4;
const input_basic_disabled_text_color = text_disabled_color;
const input_basic_disabled_placeholder_text_color = text_disabled_color;

const input_primary_text_color = text_basic_color;
const input_primary_placeholder_text_color = text_hint_color;
const input_primary_background_color = background_basic_color_2;
const input_primary_border_color = color_primary_default;
const input_primary_focus_background_color = background_basic_color_1;
const input_primary_focus_border_color = color_primary_focus_border;
const input_primary_hover_background_color = background_basic_color_3;
const input_primary_hover_border_color = color_primary_hover_border;
const input_primary_disabled_background_color = background_basic_color_2;
const input_primary_disabled_border_color = border_basic_color_4;
const input_primary_disabled_text_color = text_disabled_color;
const input_primary_disabled_placeholder_text_color = text_disabled_color;

const input_success_text_color = text_basic_color;
const input_success_placeholder_text_color = text_hint_color;
const input_success_background_color = background_basic_color_2;
const input_success_border_color = color_success_default;
const input_success_focus_background_color = background_basic_color_1;
const input_success_focus_border_color = color_success_focus_border;
const input_success_hover_background_color = background_basic_color_3;
const input_success_hover_border_color = color_success_hover_border;
const input_success_disabled_background_color = background_basic_color_2;
const input_success_disabled_border_color = border_basic_color_4;
const input_success_disabled_text_color = text_disabled_color;
const input_success_disabled_placeholder_text_color = text_disabled_color;

const input_info_text_color = text_basic_color;
const input_info_placeholder_text_color = text_hint_color;
const input_info_background_color = background_basic_color_2;
const input_info_border_color = color_info_default;
const input_info_focus_background_color = background_basic_color_1;
const input_info_focus_border_color = color_info_focus_border;
const input_info_hover_background_color = background_basic_color_3;
const input_info_hover_border_color = color_info_hover_border;
const input_info_disabled_background_color = background_basic_color_2;
const input_info_disabled_border_color = border_basic_color_4;
const input_info_disabled_text_color = text_disabled_color;
const input_info_disabled_placeholder_text_color = text_disabled_color;

const input_warning_text_color = text_basic_color;
const input_warning_placeholder_text_color = text_hint_color;
const input_warning_background_color = background_basic_color_2;
const input_warning_border_color = color_warning_default;
const input_warning_focus_background_color = background_basic_color_1;
const input_warning_focus_border_color = color_warning_focus_border;
const input_warning_hover_background_color = background_basic_color_3;
const input_warning_hover_border_color = color_warning_hover_border;
const input_warning_disabled_background_color = background_basic_color_2;
const input_warning_disabled_border_color = border_basic_color_4;
const input_warning_disabled_text_color = text_disabled_color;
const input_warning_disabled_placeholder_text_color = text_disabled_color;

const input_danger_text_color = text_basic_color;
const input_danger_placeholder_text_color = text_hint_color;
const input_danger_background_color = background_basic_color_2;
const input_danger_border_color = color_danger_default;
const input_danger_focus_background_color = background_basic_color_1;
const input_danger_focus_border_color = color_danger_focus_border;
const input_danger_hover_background_color = background_basic_color_3;
const input_danger_hover_border_color = color_danger_hover_border;
const input_danger_disabled_background_color = background_basic_color_2;
const input_danger_disabled_border_color = border_basic_color_4;
const input_danger_disabled_text_color = text_disabled_color;
const input_danger_disabled_placeholder_text_color = text_disabled_color;

const input_control_text_color = text_control_color;
const input_control_placeholder_text_color = text_control_color;
const input_control_background_color = color_basic_control_transparent_300;
const input_control_border_color = color_basic_control_transparent_500;
const input_control_focus_background_color = color_basic_control_transparent_500;
const input_control_focus_border_color = color_control_transparent_focus_border;
const input_control_hover_background_color = color_basic_control_transparent_400;
const input_control_hover_border_color = color_control_transparent_hover_border;
const input_control_disabled_background_color = color_control_transparent_disabled;
const input_control_disabled_border_color = color_control_transparent_disabled_border;
const input_control_disabled_text_color = text_control_color;
const input_control_disabled_placeholder_text_color = text_control_color;

const input_rectangle_border_radius = border_radius;
const input_semi_round_border_radius = '0.75rem';
const input_round_border_radius = '1.5rem';

const input_tiny_text_font_size = text_caption_2_font_size;
const input_tiny_text_font_weight = text_caption_2_font_weight;
const input_tiny_text_line_height = text_caption_2_line_height;
const input_tiny_placeholder_text_font_size = text_paragraph_font_size;
const input_tiny_placeholder_text_font_weight = text_paragraph_font_weight;
const input_tiny_placeholder_text_line_height = text_paragraph_line_height;
const input_tiny_padding = '0.1875rem 1rem';
const input_tiny_max_width = '20rem';

const input_small_text_font_size = text_subtitle_2_font_size;
const input_small_text_font_weight = text_subtitle_2_font_weight;
const input_small_text_line_height = text_subtitle_2_line_height;
const input_small_placeholder_text_font_size = text_paragraph_font_size;
const input_small_placeholder_text_font_weight = text_paragraph_font_weight;
const input_small_placeholder_text_line_height = text_paragraph_line_height;
const input_small_padding = '0.1875rem 1rem';
const input_small_max_width = '20rem';

const input_medium_text_font_size = text_subtitle_font_size;
const input_medium_text_font_weight = text_subtitle_font_weight;
const input_medium_text_line_height = text_subtitle_line_height;
const input_medium_placeholder_text_font_size = text_paragraph_font_size;
const input_medium_placeholder_text_font_weight = text_paragraph_font_weight;
const input_medium_placeholder_text_line_height = text_paragraph_line_height;
const input_medium_padding = '0.4375rem 1rem';
const input_medium_max_width = '20rem';

const input_large_text_font_size = text_subtitle_font_size;
const input_large_text_font_weight = text_subtitle_font_weight;
const input_large_text_line_height = text_subtitle_line_height;
const input_large_placeholder_text_font_size = text_paragraph_font_size;
const input_large_placeholder_text_font_weight = text_paragraph_font_weight;
const input_large_placeholder_text_line_height = text_paragraph_line_height;
const input_large_padding = '0.6875rem 1rem';
const input_large_max_width = '30rem';

const input_giant_text_font_size = text_heading_6_font_size;
const input_giant_text_font_weight = text_heading_6_font_weight;
const input_giant_text_line_height = text_heading_6_line_height;
const input_giant_placeholder_text_font_size = text_paragraph_font_size;
const input_giant_placeholder_text_font_weight = text_paragraph_font_weight;
const input_giant_placeholder_text_line_height = text_paragraph_line_height;
const input_giant_padding = '0.9375rem 1rem';
const input_giant_max_width = '30rem';

const checkbox_height = '1.25rem';
const checkbox_width = '1.25rem';
const checkbox_border_style = 'solid';
const checkbox_border_width = '1px';
const checkbox_border_radius = '3px';
const checkbox_outline_width = outline_width;
const checkbox_outline_color = outline_color;
const checkbox_text_font_family = text_subtitle_2_font_family;
const checkbox_text_font_size = text_subtitle_2_font_size;
const checkbox_text_font_weight = text_subtitle_2_font_weight;
const checkbox_text_line_height = text_subtitle_2_line_height;
const checkbox_text_space = '0.6875rem';
const checkbox_padding = '0';
const checkbox_focus_inset_shadow_length = '0 0 0 100vmax';

const checkbox_basic_text_color = text_basic_color;
const checkbox_basic_background_color = color_basic_transparent_default;
const checkbox_basic_border_color = color_basic_transparent_default_border;
const checkbox_basic_checked_background_color = color_primary_default;
const checkbox_basic_checked_border_color = color_primary_default_border;
const checkbox_basic_checked_checkmark_color = text_control_color;
const checkbox_basic_indeterminate_background_color = color_primary_default;
const checkbox_basic_indeterminate_border_color = color_primary_default_border;
const checkbox_basic_indeterminate_checkmark_color = text_control_color;
const checkbox_basic_focus_background_color = color_basic_transparent_focus;
const checkbox_basic_focus_border_color = color_basic_transparent_focus_border;
const checkbox_basic_focus_checked_background_color = color_primary_focus;
const checkbox_basic_focus_checked_border_color = color_primary_focus_border;
const checkbox_basic_hover_background_color = color_primary_transparent_hover;
const checkbox_basic_hover_border_color = color_primary_transparent_hover_border;
const checkbox_basic_hover_checked_background_color = color_primary_hover;
const checkbox_basic_hover_checked_border_color = color_primary_hover_border;
const checkbox_basic_active_background_color = color_basic_transparent_active;
const checkbox_basic_active_border_color = color_basic_transparent_active_border;
const checkbox_basic_active_checked_background_color = color_primary_active;
const checkbox_basic_active_checked_border_color = color_primary_active_border;
const checkbox_basic_disabled_background_color = color_basic_transparent_disabled;
const checkbox_basic_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_basic_disabled_checkmark_color = text_control_color;
const checkbox_basic_disabled_text_color = text_disabled_color;
const checkbox_basic_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_basic_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_primary_text_color = text_basic_color;
const checkbox_primary_background_color = color_primary_transparent_default;
const checkbox_primary_border_color = color_primary_transparent_default_border;
const checkbox_primary_checked_background_color = color_primary_default;
const checkbox_primary_checked_border_color = color_primary_default_border;
const checkbox_primary_checked_checkmark_color = text_control_color;
const checkbox_primary_indeterminate_background_color = color_primary_default;
const checkbox_primary_indeterminate_border_color = color_primary_default_border;
const checkbox_primary_indeterminate_checkmark_color = text_control_color;
const checkbox_primary_focus_background_color = color_primary_transparent_focus;
const checkbox_primary_focus_border_color = color_primary_transparent_focus_border;
const checkbox_primary_focus_checked_background_color = color_primary_focus;
const checkbox_primary_focus_checked_border_color = color_primary_focus_border;
const checkbox_primary_hover_background_color = color_primary_transparent_hover;
const checkbox_primary_hover_border_color = color_primary_transparent_hover_border;
const checkbox_primary_hover_checked_background_color = color_primary_hover;
const checkbox_primary_hover_checked_border_color = color_primary_hover_border;
const checkbox_primary_active_background_color = color_primary_transparent_active;
const checkbox_primary_active_border_color = color_primary_transparent_active_border;
const checkbox_primary_active_checked_background_color = color_primary_active;
const checkbox_primary_active_checked_border_color = color_primary_active_border;
const checkbox_primary_disabled_background_color = color_basic_transparent_disabled;
const checkbox_primary_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_primary_disabled_checkmark_color = text_control_color;
const checkbox_primary_disabled_text_color = text_disabled_color;
const checkbox_primary_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_primary_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_success_text_color = text_basic_color;
const checkbox_success_background_color = color_success_transparent_default;
const checkbox_success_border_color = color_success_transparent_default_border;
const checkbox_success_checked_background_color = color_success_default;
const checkbox_success_checked_border_color = color_success_default_border;
const checkbox_success_checked_checkmark_color = text_control_color;
const checkbox_success_indeterminate_background_color = color_success_default;
const checkbox_success_indeterminate_border_color = color_success_default_border;
const checkbox_success_indeterminate_checkmark_color = text_control_color;
const checkbox_success_focus_background_color = color_success_transparent_focus;
const checkbox_success_focus_border_color = color_success_transparent_focus_border;
const checkbox_success_focus_checked_background_color = color_success_focus;
const checkbox_success_focus_checked_border_color = color_success_focus_border;
const checkbox_success_hover_background_color = color_success_transparent_hover;
const checkbox_success_hover_border_color = color_success_transparent_hover_border;
const checkbox_success_hover_checked_background_color = color_success_hover;
const checkbox_success_hover_checked_border_color = color_success_hover_border;
const checkbox_success_active_background_color = color_success_transparent_active;
const checkbox_success_active_border_color = color_success_transparent_active_border;
const checkbox_success_active_checked_background_color = color_success_active;
const checkbox_success_active_checked_border_color = color_success_active_border;
const checkbox_success_disabled_background_color = color_basic_transparent_disabled;
const checkbox_success_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_success_disabled_checkmark_color = text_control_color;
const checkbox_success_disabled_text_color = text_disabled_color;
const checkbox_success_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_success_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_info_text_color = text_basic_color;
const checkbox_info_background_color = color_info_transparent_default;
const checkbox_info_border_color = color_info_transparent_default_border;
const checkbox_info_checked_background_color = color_info_default;
const checkbox_info_checked_border_color = color_info_default_border;
const checkbox_info_checked_checkmark_color = text_control_color;
const checkbox_info_indeterminate_background_color = color_info_default;
const checkbox_info_indeterminate_border_color = color_info_default_border;
const checkbox_info_indeterminate_checkmark_color = text_control_color;
const checkbox_info_focus_background_color = color_info_transparent_focus;
const checkbox_info_focus_border_color = color_info_transparent_focus_border;
const checkbox_info_focus_checked_background_color = color_info_focus;
const checkbox_info_focus_checked_border_color = color_info_focus_border;
const checkbox_info_hover_background_color = color_info_transparent_hover;
const checkbox_info_hover_border_color = color_info_transparent_hover_border;
const checkbox_info_hover_checked_background_color = color_info_hover;
const checkbox_info_hover_checked_border_color = color_info_hover_border;
const checkbox_info_active_background_color = color_info_transparent_active;
const checkbox_info_active_border_color = color_info_transparent_active_border;
const checkbox_info_active_checked_background_color = color_info_active;
const checkbox_info_active_checked_border_color = color_info_active_border;
const checkbox_info_disabled_background_color = color_basic_transparent_disabled;
const checkbox_info_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_info_disabled_checkmark_color = text_control_color;
const checkbox_info_disabled_text_color = text_disabled_color;
const checkbox_info_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_info_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_warning_text_color = text_basic_color;
const checkbox_warning_background_color = color_warning_transparent_default;
const checkbox_warning_border_color = color_warning_transparent_default_border;
const checkbox_warning_checked_background_color = color_warning_default;
const checkbox_warning_checked_border_color = color_warning_default_border;
const checkbox_warning_checked_checkmark_color = text_control_color;
const checkbox_warning_indeterminate_background_color = color_warning_default;
const checkbox_warning_indeterminate_border_color = color_warning_default_border;
const checkbox_warning_indeterminate_checkmark_color = text_control_color;
const checkbox_warning_focus_background_color = color_warning_transparent_focus;
const checkbox_warning_focus_border_color = color_warning_transparent_focus_border;
const checkbox_warning_focus_checked_background_color = color_warning_focus;
const checkbox_warning_focus_checked_border_color = color_warning_focus_border;
const checkbox_warning_hover_background_color = color_warning_transparent_hover;
const checkbox_warning_hover_border_color = color_warning_transparent_hover_border;
const checkbox_warning_hover_checked_background_color = color_warning_hover;
const checkbox_warning_hover_checked_border_color = color_warning_hover_border;
const checkbox_warning_active_background_color = color_warning_transparent_active;
const checkbox_warning_active_border_color = color_warning_transparent_active_border;
const checkbox_warning_active_checked_background_color = color_warning_active;
const checkbox_warning_active_checked_border_color = color_warning_active_border;
const checkbox_warning_disabled_background_color = color_basic_transparent_disabled;
const checkbox_warning_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_warning_disabled_checkmark_color = text_control_color;
const checkbox_warning_disabled_text_color = text_disabled_color;
const checkbox_warning_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_warning_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_danger_text_color = text_basic_color;
const checkbox_danger_background_color = color_danger_transparent_default;
const checkbox_danger_border_color = color_danger_transparent_default_border;
const checkbox_danger_checked_background_color = color_danger_default;
const checkbox_danger_checked_border_color = color_danger_default_border;
const checkbox_danger_checked_checkmark_color = text_control_color;
const checkbox_danger_indeterminate_background_color = color_danger_default;
const checkbox_danger_indeterminate_border_color = color_danger_default_border;
const checkbox_danger_indeterminate_checkmark_color = text_control_color;
const checkbox_danger_focus_background_color = color_danger_transparent_focus;
const checkbox_danger_focus_border_color = color_danger_transparent_focus_border;
const checkbox_danger_focus_checked_background_color = color_danger_focus;
const checkbox_danger_focus_checked_border_color = color_danger_focus_border;
const checkbox_danger_hover_background_color = color_danger_transparent_hover;
const checkbox_danger_hover_border_color = color_danger_transparent_hover_border;
const checkbox_danger_hover_checked_background_color = color_danger_hover;
const checkbox_danger_hover_checked_border_color = color_danger_hover_border;
const checkbox_danger_active_background_color = color_danger_transparent_active;
const checkbox_danger_active_border_color = color_danger_transparent_active_border;
const checkbox_danger_active_checked_background_color = color_danger_active;
const checkbox_danger_active_checked_border_color = color_danger_active_border;
const checkbox_danger_disabled_background_color = color_basic_transparent_disabled;
const checkbox_danger_disabled_border_color = color_basic_transparent_disabled_border;
const checkbox_danger_disabled_checkmark_color = text_control_color;
const checkbox_danger_disabled_text_color = text_disabled_color;
const checkbox_danger_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_danger_disabled_checked_border_color = color_basic_transparent_600;

const checkbox_control_text_color = text_control_color;
const checkbox_control_background_color = color_control_transparent_default;
const checkbox_control_border_color = color_control_transparent_default_border;
const checkbox_control_checked_background_color = color_control_default;
const checkbox_control_checked_border_color = color_control_default_border;
const checkbox_control_checked_checkmark_color = color_basic_800;
const checkbox_control_indeterminate_background_color = color_control_default;
const checkbox_control_indeterminate_border_color = color_control_default_border;
const checkbox_control_indeterminate_checkmark_color = color_basic_800;
const checkbox_control_focus_background_color = color_control_transparent_focus;
const checkbox_control_focus_border_color = color_control_transparent_focus_border;
const checkbox_control_focus_checked_background_color = color_control_focus;
const checkbox_control_focus_checked_border_color = color_control_focus_border;
const checkbox_control_hover_background_color = color_control_transparent_hover;
const checkbox_control_hover_border_color = color_control_transparent_hover_border;
const checkbox_control_hover_checked_background_color = color_control_hover;
const checkbox_control_hover_checked_border_color = color_control_hover_border;
const checkbox_control_active_background_color = color_control_transparent_active;
const checkbox_control_active_border_color = color_control_transparent_active_border;
const checkbox_control_active_checked_background_color = color_control_active;
const checkbox_control_active_checked_border_color = color_control_active_border;
const checkbox_control_disabled_background_color = color_control_transparent_disabled;
const checkbox_control_disabled_border_color = color_control_transparent_disabled_border;
const checkbox_control_disabled_checkmark_color = text_control_color;
const checkbox_control_disabled_text_color = text_control_color;
const checkbox_control_disabled_checked_background_color = color_basic_transparent_600;
const checkbox_control_disabled_checked_border_color = color_basic_transparent_600;

const badge_dot_mode_border_radius = '0.5rem';
const badge_dot_mode_padding = '0.3rem';

const badge_border_radius = border_radius;
const badge_text_font_family = text_button_font_family;
const badge_text_font_size = text_button_tiny_font_size;
const badge_text_font_weight = text_button_font_weight;
const badge_text_line_height = text_button_tiny_line_height;
const badge_padding = '0.25rem 0.4rem';

const badge_basic_background_color = background_basic_color_2;
const badge_basic_text_color = text_basic_color;
const badge_primary_background_color = color_primary_default;
const badge_primary_text_color = text_control_color;
const badge_success_background_color = color_success_default;
const badge_success_text_color = text_control_color;
const badge_info_background_color = color_info_default;
const badge_info_text_color = text_control_color;
const badge_warning_background_color = color_warning_default;
const badge_warning_text_color = text_control_color;
const badge_danger_background_color = color_danger_default;
const badge_danger_text_color = text_control_color;
const badge_control_background_color = color_control_default;
const badge_control_text_color = color_basic_800;

const progress_bar_animation_duration = '400ms';
const progress_bar_border_radius = border_radius;
const progress_bar_text_font_family = text_subtitle_font_family;

const progress_bar_tiny_height = '1rem';
const progress_bar_tiny_text_font_size = text_subtitle_2_font_size;
const progress_bar_tiny_text_font_weight = text_subtitle_2_font_weight;
const progress_bar_tiny_text_line_height = text_subtitle_2_line_height;
const progress_bar_small_height = '1.25rem';
const progress_bar_small_text_font_size = text_subtitle_2_font_size;
const progress_bar_small_text_font_weight = text_subtitle_2_font_weight;
const progress_bar_small_text_line_height = text_subtitle_2_line_height;
const progress_bar_medium_height = '1.375rem';
const progress_bar_medium_text_font_size = text_subtitle_font_size;
const progress_bar_medium_text_font_weight = text_subtitle_font_weight;
const progress_bar_medium_text_line_height = text_subtitle_line_height;
const progress_bar_large_height = '1.5rem';
const progress_bar_large_text_font_size = text_subtitle_font_size;
const progress_bar_large_text_font_weight = text_subtitle_font_weight;
const progress_bar_large_text_line_height = text_subtitle_line_height;
const progress_bar_giant_height = '1.75rem';
const progress_bar_giant_text_font_size = text_subtitle_font_size;
const progress_bar_giant_text_font_weight = text_subtitle_font_weight;
const progress_bar_giant_text_line_height = text_subtitle_line_height;

const progress_bar_basic_background_color = background_basic_color_2;
const progress_bar_basic_filled_background_color = background_basic_color_4;
const progress_bar_basic_text_color = text_basic_color;

const progress_bar_primary_background_color = background_basic_color_3;
const progress_bar_primary_filled_background_color = color_primary_default;
const progress_bar_primary_text_color = text_control_color;

const progress_bar_success_background_color = background_basic_color_3;
const progress_bar_success_filled_background_color = color_success_default;
const progress_bar_success_text_color = text_control_color;

const progress_bar_info_background_color = background_basic_color_3;
const progress_bar_info_filled_background_color = color_info_default;
const progress_bar_info_text_color = text_control_color;

const progress_bar_warning_background_color = background_basic_color_3;
const progress_bar_warning_filled_background_color = color_warning_default;
const progress_bar_warning_text_color = text_control_color;

const progress_bar_danger_background_color = background_basic_color_3;
const progress_bar_danger_filled_background_color = color_danger_default;
const progress_bar_danger_text_color = text_control_color;

const progress_bar_control_background_color = background_basic_color_3;
const progress_bar_control_filled_background_color = color_control_default;
const progress_bar_control_text_color = color_basic_800;

const alert_border_radius = border_radius;
const alert_bottom_margin = '1.5rem';
const alert_padding = '1rem 1.125rem';
const alert_scrollbar_color = scrollbar_color;
const alert_scrollbar_background_color = scrollbar_background_color;
const alert_scrollbar_width = scrollbar_width;
const alert_shadow = 'none';
const alert_text_font_family = text_paragraph_font_family;
const alert_text_font_size = text_subtitle_font_size;
const alert_text_font_weight = text_subtitle_font_weight;
const alert_text_line_height = text_subtitle_line_height;

const alert_closable_start_padding = '3rem';

const alert_tiny_height = '4.5rem';
const alert_small_height = '5.75rem';
const alert_medium_height = '7rem';
const alert_medium_padding = '1rem 1.125rem';
const alert_large_height = '8.25rem';
const alert_giant_height = '9.5rem';

const alert_basic_background_color = background_basic_color_2;
const alert_basic_text_color = text_basic_color;
const alert_primary_background_color = color_primary_default;
const alert_primary_text_color = text_control_color;
const alert_success_background_color = color_success_default;
const alert_success_text_color = text_control_color;
const alert_info_background_color = color_info_default;
const alert_info_text_color = text_control_color;
const alert_warning_background_color = color_warning_default;
const alert_warning_text_color = text_control_color;
const alert_danger_background_color = color_danger_default;
const alert_danger_text_color = text_control_color;
const alert_control_background_color = color_control_default;
const alert_control_text_color = color_basic_800;

const alert_accent_basic_color = border_basic_color_3;
const alert_accent_primary_color = color_primary_default;
const alert_accent_info_color = color_info_default;
const alert_accent_success_color = color_success_default;
const alert_accent_warning_color = color_warning_default;
const alert_accent_danger_color = color_danger_default;
const alert_accent_control_color = color_control_default;

const alert_outline_width = '1px';
const alert_outline_basic_color = color_basic_focus_border;
const alert_outline_primary_color = color_primary_focus_border;
const alert_outline_info_color = color_info_focus_border;
const alert_outline_success_color = color_success_focus_border;
const alert_outline_warning_color = color_warning_focus_border;
const alert_outline_danger_color = color_danger_focus_border;
const alert_outline_control_color = color_control_focus_border;

const chat_background_color = background_basic_color_1;
const chat_border = 'none';
const chat_border_radius = border_radius;
const chat_shadow = shadow;
const chat_padding = '1rem 1.25rem';
const chat_scrollbar_color = scrollbar_color;
const chat_scrollbar_background_color = scrollbar_background_color;
const chat_scrollbar_width = scrollbar_width;

const chat_text_color = text_basic_color;
const chat_text_font_family = text_paragraph_font_family;
const chat_text_font_size = text_paragraph_font_size;
const chat_text_font_weight = text_paragraph_font_weight;
const chat_text_line_height = text_paragraph_line_height;

const chat_header_text_font_family = text_subtitle_font_family;
const chat_header_text_font_size = text_subtitle_font_size;
const chat_header_text_font_weight = text_subtitle_font_weight;
const chat_header_text_line_height = text_subtitle_line_height;

const chat_tiny_height = '13.5rem';
const chat_small_height = '21rem';
const chat_medium_height = '28.5rem';
const chat_large_height = '36rem';
const chat_giant_height = '43.5rem';

const chat_basic_background_color = background_basic_color_1;
const chat_basic_text_color = text_basic_color;
const chat_primary_background_color = color_primary_default;
const chat_primary_text_color = text_control_color;
const chat_success_background_color = color_success_default;
const chat_success_text_color = text_control_color;
const chat_info_background_color = color_info_default;
const chat_info_text_color = text_control_color;
const chat_warning_background_color = color_warning_default;
const chat_warning_text_color = text_control_color;
const chat_danger_background_color = color_danger_default;
const chat_danger_text_color = text_control_color;
const chat_control_background_color = color_control_default;
const chat_control_text_color = color_basic_800;

const chat_divider_color = divider_color;
const chat_divider_style = divider_style;
const chat_divider_width = divider_width;

const chat_message_background = color_primary_default;
const chat_message_text_color = text_control_color;
const chat_message_reply_background_color = background_basic_color_2;
const chat_message_reply_text_color = text_basic_color;
const chat_message_avatar_background_color = color_basic_500;
const chat_message_sender_text_color = text_hint_color;
const chat_message_quote_background_color = background_basic_color_2;
const chat_message_quote_text_color = text_hint_color;
const chat_message_file_text_color = text_hint_color;
const chat_message_file_background_color = 'transparent';

const spinner_text_color = text_basic_color;
const spinner_text_font_family = text_button_font_family;
const spinner_text_font_size = text_button_medium_font_size;
const spinner_text_font_weight = text_button_font_weight;
const spinner_text_line_height = text_button_medium_line_height;

const spinner_basic_background_color = color_basic_transparent_200;
const spinner_basic_circle_filled_color = text_hint_color;
const spinner_basic_circle_empty_color = 'transparent';

const spinner_primary_background_color = color_basic_transparent_200;
const spinner_primary_circle_filled_color = color_primary_default;
const spinner_primary_circle_empty_color = 'transparent';

const spinner_info_background_color = color_basic_transparent_200;
const spinner_info_circle_filled_color = color_info_default;
const spinner_info_circle_empty_color = 'transparent';

const spinner_success_background_color = color_basic_transparent_200;
const spinner_success_circle_filled_color = color_success_default;
const spinner_success_circle_empty_color = 'transparent';

const spinner_warning_background_color = color_basic_transparent_200;
const spinner_warning_circle_filled_color = color_warning_default;
const spinner_warning_circle_empty_color = 'transparent';

const spinner_danger_background_color = color_basic_transparent_200;
const spinner_danger_circle_filled_color = color_danger_default;
const spinner_danger_circle_empty_color = 'transparent';

const spinner_control_background_color = color_basic_control_transparent_200;
const spinner_control_circle_filled_color = color_control_default;
const spinner_control_circle_empty_color = 'transparent';

const spinner_height_tiny = '1rem';
const spinner_height_small = '1.25rem';
const spinner_height_medium = '1.5rem';
const spinner_height_large = '1.75rem';
const spinner_height_giant = '2rem';

const stepper_step_text_color = text_hint_color;
const stepper_step_text_font_family = text_paragraph_font_family;
const stepper_step_text_font_size = text_paragraph_font_size;
const stepper_step_text_font_weight = text_paragraph_font_weight;
const stepper_step_text_line_height = text_paragraph_line_height;
const stepper_step_active_text_color = text_primary_active_color;
const stepper_step_completed_text_color = text_primary_color;

const stepper_step_index_border_color = border_basic_color_4;
const stepper_step_index_border_style = 'solid';
const stepper_step_index_border_width = '1px';
const stepper_step_index_border_radius = '50%';
const stepper_step_index_width = '2rem';
const stepper_step_index_active_border_color = color_primary_active;
const stepper_step_index_completed_background_color = color_primary_default;
const stepper_step_index_completed_border_color = color_primary_default;
const stepper_step_index_completed_text_color = text_control_color;

const stepper_connector_background_color = background_basic_color_3;
const stepper_connector_completed_background_color = color_primary_default;
const stepper_horizontal_connector_margin = '1rem';
const stepper_vertical_connector_margin = '1rem';

const stepper_step_content_padding = '1.25rem';

const accordion_border_radius = border_radius;
const accordion_padding = '1.25rem';
const accordion_shadow = shadow;
const accordion_header_text_color = text_basic_color;
const accordion_header_text_font_family = text_subtitle_font_family;
const accordion_header_text_font_size = text_subtitle_font_size;
const accordion_header_text_font_weight = text_subtitle_font_weight;
const accordion_header_text_line_height = text_subtitle_line_height;
const accordion_header_disabled_text_color = text_disabled_color;
const accordion_header_border_color = border_basic_color_3;
const accordion_header_border_style = 'solid';
const accordion_header_border_width = '1px';
const accordion_item_background_color = background_basic_color_1;
const accordion_item_text_color = text_basic_color;
const accordion_item_text_font_family = text_paragraph_font_family;
const accordion_item_text_font_size = text_paragraph_font_size;
const accordion_item_text_font_weight = text_paragraph_font_weight;
const accordion_item_text_line_height = text_paragraph_line_height;

const list_item_divider_color = divider_color;
const list_item_divider_style = divider_style;
const list_item_divider_width = divider_width;
const list_item_padding = '1rem';
const list_item_text_color = text_basic_color;
const list_item_font_family = text_paragraph_font_family;
const list_item_font_size = text_paragraph_font_size;
const list_item_font_weight = text_paragraph_font_weight;
const list_item_line_height = text_paragraph_line_height;

const calendar_width = '20.625rem';
const calendar_background_color = background_basic_color_1;
const calendar_border_color = border_basic_color_4;
const calendar_border_style = 'solid';
const calendar_border_width = '0.0625rem';
const calendar_border_radius = border_radius;
const calendar_text_color = text_basic_color;
const calendar_text_font_family = text_subtitle_font_family;
const calendar_text_font_size = text_subtitle_font_size;
const calendar_text_font_weight = text_subtitle_font_weight;
const calendar_text_line_height = text_subtitle_line_height;

const calendar_picker_padding_top = '0.25rem';
const calendar_picker_padding_bottom = '0.625rem';
const calendar_picker_padding_start = '0.625rem';
const calendar_picker_padding_end = '0.625rem';

const calendar_navigation_text_color = text_basic_color;
const calendar_navigation_text_font_family = text_button_font_family;
const calendar_navigation_title_text_font_size = text_button_medium_font_size;
const calendar_navigation_title_text_font_weight = text_button_font_weight;
const calendar_navigation_title_text_line_height = text_button_medium_line_height;
const calendar_navigation_padding = '0.625rem 0.25rem';

const calendar_cell_inactive_text_color = text_hint_color;

const calendar_cell_disabled_text_color = text_disabled_color;

const calendar_cell_hover_background_color = background_basic_color_2;
const calendar_cell_hover_border_color = background_basic_color_2;
const calendar_cell_hover_text_color = text_basic_color;
const calendar_cell_hover_text_font_size = calendar_text_font_size;
const calendar_cell_hover_text_font_weight = calendar_text_font_weight;
const calendar_cell_hover_text_line_height = calendar_text_line_height;

const calendar_cell_active_background_color = color_primary_active;
const calendar_cell_active_border_color = color_primary_active_border;
const calendar_cell_active_text_color = text_control_color;
const calendar_cell_active_text_font_size = calendar_text_font_size;
const calendar_cell_active_text_font_weight = calendar_text_font_weight;
const calendar_cell_active_text_line_height = calendar_text_line_height;

const calendar_cell_today_background_color = color_primary_transparent_default;
const calendar_cell_today_border_color = color_primary_transparent_default_border;
const calendar_cell_today_text_color = text_basic_color;
const calendar_cell_today_text_font_size = calendar_text_font_size;
const calendar_cell_today_text_font_weight = calendar_text_font_weight;
const calendar_cell_today_text_line_height = calendar_text_line_height;
const calendar_cell_today_hover_background_color = color_primary_transparent_hover;
const calendar_cell_today_hover_border_color = color_primary_transparent_hover_border;
const calendar_cell_today_active_background_color = color_primary_transparent_active;
const calendar_cell_today_active_border_color = color_primary_transparent_active_border;
const calendar_cell_today_disabled_border_color = border_basic_color_4;

const calendar_cell_today_selected_background_color = color_control_transparent_default;
const calendar_cell_today_selected_border_color = 'transparent';
const calendar_cell_today_selected_text_color = text_control_color;
const calendar_cell_today_selected_hover_background_color = color_control_transparent_hover;
const calendar_cell_today_selected_hover_border_color = 'transparent';
const calendar_cell_today_selected_active_background_color = color_control_transparent_active;
const calendar_cell_today_selected_active_border_color = 'transparent';

const calendar_cell_today_in_range_background_color = color_control_transparent_default;
const calendar_cell_today_in_range_border_color = 'transparent';
const calendar_cell_today_in_range_text_color = text_control_color;
const calendar_cell_today_in_range_hover_background_color = color_control_transparent_hover;
const calendar_cell_today_in_range_hover_border_color = 'transparent';
const calendar_cell_today_in_range_active_background_color = color_control_transparent_active;
const calendar_cell_today_in_range_active_border_color = 'transparent';

const calendar_cell_selected_background_color = color_primary_default;
const calendar_cell_selected_border_color = color_primary_default_border;
const calendar_cell_selected_text_color = text_control_color;
const calendar_cell_selected_text_font_size = calendar_text_font_size;
const calendar_cell_selected_text_font_weight = calendar_text_font_weight;
const calendar_cell_selected_text_line_height = calendar_text_line_height;
const calendar_cell_selected_hover_background_color = color_primary_hover;
const calendar_cell_selected_hover_border_color = color_primary_hover_border;
const calendar_cell_selected_active_background_color = color_primary_active;
const calendar_cell_selected_active_border_color = color_primary_active_border;

const calendar_day_cell_width = '2.75rem';
const calendar_day_cell_height = '2.75rem';
const calendar_month_cell_width = '4.8125rem';
const calendar_month_cell_height = calendar_day_cell_height;
const calendar_year_cell_width = calendar_month_cell_width;
const calendar_year_cell_height = calendar_month_cell_height;

const calendar_weekday_background = 'transparent';
const calendar_weekday_divider_color = divider_color;
const calendar_weekday_divider_width = divider_width;
const calendar_weekday_text_color = text_hint_color;
const calendar_weekday_text_font_size = text_subtitle_font_size;
const calendar_weekday_text_font_weight = text_subtitle_font_weight;
const calendar_weekday_text_line_height = text_subtitle_line_height;
const calendar_weekday_holiday_text_color = calendar_weekday_text_color;
const calendar_weekday_height = calendar_day_cell_height;
const calendar_weekday_width = calendar_day_cell_width;

const calendar_weeknumber_background = 'transparent';
const calendar_weeknumber_divider_color = divider_color;
const calendar_weeknumber_divider_width = divider_width;
const calendar_weeknumber_text_color = text_hint_color;
const calendar_weeknumber_text_font_size = text_subtitle_font_size;
const calendar_weeknumber_text_font_weight = text_subtitle_font_weight;
const calendar_weeknumber_text_line_height = text_subtitle_line_height;
const calendar_weeknumber_height = calendar_weekday_height;
const calendar_weeknumber_width = calendar_weekday_width;

const calendar_large_width = '22.375rem';
const calendar_day_cell_large_width = '3rem';
const calendar_day_cell_large_height = '3rem';
const calendar_weekday_large_height = calendar_day_cell_large_width;
const calendar_weekday_large_width = calendar_day_cell_large_height;
const calendar_weeknumber_large_height = calendar_weekday_large_height;
const calendar_weeknumber_large_width = calendar_weekday_large_width;
const calendar_month_cell_large_width = '5.25rem';
const calendar_month_cell_large_height = calendar_day_cell_large_height;
const calendar_year_cell_large_width = calendar_month_cell_large_width;
const calendar_year_cell_large_height = calendar_month_cell_large_height;

const overlay_backdrop_background_color = 'rgba(0; 0; 0; 0.35)';

const tooltip_background_color = background_alternative_color_3;
const tooltip_border_color = 'transparent';
const tooltip_border_style = 'dashed';
const tooltip_border_width = '0';
const tooltip_border_radius = border_radius;
const tooltip_padding = '0.5rem 1rem';
const tooltip_text_color = text_alternate_color;
const tooltip_text_font_family = text_caption_font_family;
const tooltip_text_font_size = text_caption_font_size;
const tooltip_text_font_weight = text_caption_font_weight;
const tooltip_text_line_height = text_caption_line_height;
const tooltip_icon_height = '1rem';
const tooltip_icon_width = '1rem';
const tooltip_max_width = '16rem';

const tooltip_basic_background_color = background_basic_color_3;
const tooltip_basic_border_color = 'transparent';
const tooltip_basic_text_color = text_basic_color;
const tooltip_primary_background_color = color_primary_default;
const tooltip_primary_border_color = 'transparent';
const tooltip_primary_text_color = text_control_color;
const tooltip_info_background_color = color_info_default;
const tooltip_info_border_color = 'transparent';
const tooltip_info_text_color = text_control_color;
const tooltip_success_background_color = color_success_default;
const tooltip_success_border_color = 'transparent';
const tooltip_success_text_color = text_control_color;
const tooltip_warning_background_color = color_warning_default;
const tooltip_warning_border_color = 'transparent';
const tooltip_warning_text_color = text_control_color;
const tooltip_danger_background_color = color_danger_default;
const tooltip_danger_border_color = 'transparent';
const tooltip_danger_text_color = text_control_color;
const tooltip_control_background_color = color_control_default;
const tooltip_control_border_color = 'transparent';
const tooltip_control_text_color = color_basic_800;
const tooltip_shadow = shadow;

const option_list_max_height = '20rem';
const option_list_shadow = 'none';
const option_list_background_color = background_basic_color_1;
const option_list_border_style = 'solid';
const option_list_border_width = '0.0625rem';
const option_list_border_color = border_basic_color_4;
const option_list_border_radius = border_radius;
const option_list_adjacent_border_color = option_list_border_color;
const option_list_adjacent_border_style = option_list_border_style;
const option_list_adjacent_border_width = option_list_border_width;

const option_group_text_color = text_hint_color;
const option_group_tiny_start_padding = '1.25rem';
const option_group_small_start_padding = '1.75rem';
const option_group_medium_start_padding = '2.25rem';
const option_group_large_start_padding = '2.25rem';
const option_group_giant_start_padding = '2.75rem';

const option_background_color = background_basic_color_1;
const option_text_color = text_basic_color;
const option_text_font_family = text_subtitle_font_family;
const option_hover_background_color = color_basic_transparent_hover;
const option_hover_text_color = text_basic_color;
const option_active_background_color = color_basic_transparent_active;
const option_active_text_color = text_basic_color;
const option_focus_background_color = color_basic_transparent_focus;
const option_focus_text_color = text_basic_color;
const option_selected_background_color = color_primary_default;
const option_selected_text_color = text_control_color;
const option_selected_hover_background_color = color_primary_hover;
const option_selected_hover_text_color = text_control_color;
const option_selected_active_background_color = color_primary_active;
const option_selected_active_text_color = text_control_color;
const option_selected_focus_background_color = color_primary_focus;
const option_selected_focus_text_color = text_control_color;
const option_disabled_background_color = background_basic_color_1;
const option_disabled_text_color = text_disabled_color;

const select_outline_tiny_padding = '0.1875rem 1rem';
const select_outline_small_padding = '0.1875rem 1rem';
const select_outline_medium_padding = '0.4375rem 1rem';
const select_outline_large_padding = '0.6875rem 1rem';
const select_outline_giant_padding = '0.9375rem 1rem';

const option_tiny_text_font_size = text_caption_2_font_size;
const option_tiny_text_font_weight = text_caption_2_font_weight;
const option_tiny_text_line_height = text_caption_2_line_height;
const option_tiny_padding = select_outline_tiny_padding;

const option_small_text_font_size = text_subtitle_2_font_size;
const option_small_text_font_weight = text_subtitle_2_font_weight;
const option_small_text_line_height = text_subtitle_2_line_height;
const option_small_padding = select_outline_small_padding;

const option_medium_text_font_size = text_subtitle_font_size;
const option_medium_text_font_weight = text_subtitle_font_weight;
const option_medium_text_line_height = text_subtitle_line_height;
const option_medium_padding = select_outline_medium_padding;

const option_large_text_font_size = text_subtitle_font_size;
const option_large_text_font_weight = text_subtitle_font_weight;
const option_large_text_line_height = text_subtitle_line_height;
const option_large_padding = select_outline_large_padding;

const option_giant_text_font_size = text_heading_6_font_size;
const option_giant_text_font_weight = text_heading_6_font_weight;
const option_giant_text_line_height = text_heading_6_line_height;
const option_giant_padding = select_outline_giant_padding;

const select_cursor = 'pointer';
const select_disabled_cursor = 'default';
const select_min_width = '13rem';
const select_outline_width = outline_width;
const select_outline_color = outline_color;
const select_icon_offset = '2rem';

const select_text_font_family = text_subtitle_font_family;
const select_placeholder_text_font_family = text_paragraph_font_family;

const select_tiny_text_font_size = text_caption_2_font_size;
const select_tiny_text_font_weight = text_caption_2_font_weight;
const select_tiny_text_line_height = text_caption_2_line_height;
const select_tiny_placeholder_text_font_size = text_paragraph_font_size;
const select_tiny_placeholder_text_font_weight = text_paragraph_font_weight;
const select_tiny_max_width = '20rem';

const select_small_text_font_size = text_subtitle_2_font_size;
const select_small_text_font_weight = text_subtitle_2_font_weight;
const select_small_text_line_height = text_subtitle_2_line_height;
const select_small_placeholder_text_font_size = text_paragraph_font_size;
const select_small_placeholder_text_font_weight = text_paragraph_font_weight;
const select_small_max_width = '20rem';

const select_medium_text_font_size = text_subtitle_font_size;
const select_medium_text_font_weight = text_subtitle_font_weight;
const select_medium_text_line_height = text_subtitle_line_height;
const select_medium_placeholder_text_font_size = text_paragraph_font_size;
const select_medium_placeholder_text_font_weight = text_paragraph_font_weight;
const select_medium_max_width = '20rem';

const select_large_text_font_size = text_subtitle_font_size;
const select_large_text_font_weight = text_subtitle_font_weight;
const select_large_text_line_height = text_subtitle_line_height;
const select_large_placeholder_text_font_size = text_paragraph_font_size;
const select_large_placeholder_text_font_weight = text_paragraph_font_weight;
const select_large_max_width = '30rem';

const select_giant_text_font_size = text_heading_6_font_size;
const select_giant_text_font_weight = text_heading_6_font_weight;
const select_giant_text_line_height = text_heading_6_line_height;
const select_giant_placeholder_text_font_size = text_paragraph_font_size;
const select_giant_placeholder_text_font_weight = text_paragraph_font_weight;
const select_giant_max_width = '30rem';

const select_rectangle_border_radius = border_radius;
const select_semi_round_border_radius = '0.75rem';
const select_round_border_radius = '1.5rem';

const select_outline_border_style = 'solid';
const select_outline_border_width = '1px';

const select_outline_basic_icon_color = text_hint_color;
const select_outline_basic_text_color = text_basic_color;
const select_outline_basic_placeholder_text_color = text_hint_color;
const select_outline_basic_background_color = background_basic_color_2;
const select_outline_basic_border_color = border_basic_color_4;
const select_outline_basic_focus_background_color = background_basic_color_1;
const select_outline_basic_focus_border_color = color_primary_default;
const select_outline_basic_hover_background_color = background_basic_color_3;
const select_outline_basic_hover_border_color = border_basic_color_4;
const select_outline_basic_disabled_background_color = background_basic_color_2;
const select_outline_basic_disabled_border_color = border_basic_color_4;
const select_outline_basic_disabled_icon_color = text_disabled_color;
const select_outline_basic_disabled_text_color = text_disabled_color;

const select_outline_primary_icon_color = text_hint_color;
const select_outline_primary_text_color = text_basic_color;
const select_outline_primary_placeholder_text_color = text_hint_color;
const select_outline_primary_background_color = background_basic_color_2;
const select_outline_primary_border_color = color_primary_default;
const select_outline_primary_focus_background_color = background_basic_color_1;
const select_outline_primary_focus_border_color = color_primary_focus;
const select_outline_primary_hover_background_color = background_basic_color_3;
const select_outline_primary_hover_border_color = color_primary_hover;
const select_outline_primary_disabled_background_color = background_basic_color_2;
const select_outline_primary_disabled_border_color = border_basic_color_4;
const select_outline_primary_disabled_icon_color = text_disabled_color;
const select_outline_primary_disabled_text_color = text_disabled_color;

const select_outline_success_icon_color = text_hint_color;
const select_outline_success_text_color = text_basic_color;
const select_outline_success_placeholder_text_color = text_hint_color;
const select_outline_success_background_color = background_basic_color_2;
const select_outline_success_border_color = color_success_default;
const select_outline_success_focus_background_color = background_basic_color_1;
const select_outline_success_focus_border_color = color_success_focus;
const select_outline_success_hover_background_color = background_basic_color_3;
const select_outline_success_hover_border_color = color_success_hover;
const select_outline_success_disabled_background_color = background_basic_color_2;
const select_outline_success_disabled_border_color = border_basic_color_4;
const select_outline_success_disabled_icon_color = text_disabled_color;
const select_outline_success_disabled_text_color = text_disabled_color;

const select_outline_info_icon_color = text_hint_color;
const select_outline_info_text_color = text_basic_color;
const select_outline_info_placeholder_text_color = text_hint_color;
const select_outline_info_background_color = background_basic_color_2;
const select_outline_info_border_color = color_info_default;
const select_outline_info_focus_background_color = background_basic_color_1;
const select_outline_info_focus_border_color = color_info_focus;
const select_outline_info_hover_background_color = background_basic_color_3;
const select_outline_info_hover_border_color = color_info_hover;
const select_outline_info_disabled_background_color = background_basic_color_2;
const select_outline_info_disabled_border_color = border_basic_color_4;
const select_outline_info_disabled_icon_color = text_disabled_color;
const select_outline_info_disabled_text_color = text_disabled_color;

const select_outline_warning_icon_color = text_hint_color;
const select_outline_warning_text_color = text_basic_color;
const select_outline_warning_placeholder_text_color = text_hint_color;
const select_outline_warning_background_color = background_basic_color_2;
const select_outline_warning_border_color = color_warning_default;
const select_outline_warning_focus_background_color = background_basic_color_1;
const select_outline_warning_focus_border_color = color_warning_focus;
const select_outline_warning_hover_background_color = background_basic_color_3;
const select_outline_warning_hover_border_color = color_warning_hover;
const select_outline_warning_disabled_background_color = background_basic_color_2;
const select_outline_warning_disabled_border_color = border_basic_color_4;
const select_outline_warning_disabled_icon_color = text_disabled_color;
const select_outline_warning_disabled_text_color = text_disabled_color;

const select_outline_danger_icon_color = text_hint_color;
const select_outline_danger_text_color = text_basic_color;
const select_outline_danger_placeholder_text_color = text_hint_color;
const select_outline_danger_background_color = background_basic_color_2;
const select_outline_danger_border_color = color_danger_default;
const select_outline_danger_focus_background_color = background_basic_color_1;
const select_outline_danger_focus_border_color = color_danger_focus;
const select_outline_danger_hover_background_color = background_basic_color_3;
const select_outline_danger_hover_border_color = color_danger_hover;
const select_outline_danger_disabled_background_color = background_basic_color_2;
const select_outline_danger_disabled_border_color = border_basic_color_4;
const select_outline_danger_disabled_icon_color = text_disabled_color;
const select_outline_danger_disabled_text_color = text_disabled_color;

const select_outline_control_icon_color = color_basic_100;
const select_outline_control_text_color = color_basic_100;
const select_outline_control_placeholder_text_color = color_basic_100;
const select_outline_control_background_color = color_basic_control_transparent_300;
const select_outline_control_border_color = color_basic_control_transparent_500;
const select_outline_control_focus_background_color = color_basic_control_transparent_500;
const select_outline_control_focus_border_color = color_control_transparent_focus_border;
const select_outline_control_hover_background_color = color_basic_control_transparent_400;
const select_outline_control_hover_border_color = color_control_transparent_hover_border;
const select_outline_control_disabled_background_color = color_control_transparent_disabled;
const select_outline_control_disabled_border_color = color_basic_control_transparent_500;
const select_outline_control_disabled_icon_color = color_basic_100;
const select_outline_control_disabled_text_color = color_basic_100;

const select_outline_adjacent_border_style = select_outline_border_style;
const select_outline_adjacent_border_width = select_outline_border_width;
const select_outline_basic_open_border_color = select_outline_basic_border_color;
const select_outline_basic_adjacent_border_color = select_outline_basic_border_color;
const select_outline_primary_open_border_color = select_outline_primary_border_color;
const select_outline_primary_adjacent_border_color = select_outline_primary_border_color;
const select_outline_success_open_border_color = select_outline_success_border_color;
const select_outline_success_adjacent_border_color = select_outline_success_border_color;
const select_outline_info_open_border_color = select_outline_info_border_color;
const select_outline_info_adjacent_border_color = select_outline_info_border_color;
const select_outline_warning_open_border_color = select_outline_warning_border_color;
const select_outline_warning_adjacent_border_color = select_outline_warning_border_color;
const select_outline_danger_open_border_color = select_outline_danger_border_color;
const select_outline_danger_adjacent_border_color = select_outline_danger_border_color;
const select_outline_control_open_border_color = select_outline_control_border_color;
const select_outline_control_adjacent_border_color = select_outline_control_border_color;

const select_filled_border_style = 'solid';
const select_filled_border_width = '1px';

const select_filled_tiny_padding = '0.1875rem 1rem';
const select_filled_small_padding = '0.1875rem 1rem';
const select_filled_medium_padding = '0.4375rem 1rem';
const select_filled_large_padding = '0.6875rem 1rem';
const select_filled_giant_padding = '0.9375rem 1rem';

const select_filled_basic_background_color = color_basic_default;
const select_filled_basic_border_color = color_basic_default_border;
const select_filled_basic_icon_color = color_basic_800;
const select_filled_basic_text_color = color_basic_800;
const select_filled_basic_placeholder_text_color = text_hint_color;

const select_filled_basic_focus_background_color = color_basic_focus;
const select_filled_basic_focus_border_color = color_basic_focus_border;
const select_filled_basic_hover_background_color = color_basic_hover;
const select_filled_basic_hover_border_color = color_basic_hover_border;
const select_filled_basic_disabled_background_color = background_basic_color_2;
const select_filled_basic_disabled_border_color = border_basic_color_2;
const select_filled_basic_disabled_icon_color = text_disabled_color;
const select_filled_basic_disabled_text_color = text_disabled_color;

const select_filled_primary_background_color = color_primary_default;
const select_filled_primary_border_color = color_primary_default_border;
const select_filled_primary_icon_color = text_control_color;
const select_filled_primary_text_color = text_control_color;
const select_filled_primary_placeholder_text_color = text_control_color;

const select_filled_primary_focus_background_color = color_primary_focus;
const select_filled_primary_focus_border_color = color_primary_focus_border;
const select_filled_primary_hover_background_color = color_primary_hover;
const select_filled_primary_hover_border_color = color_primary_hover_border;
const select_filled_primary_disabled_background_color = background_basic_color_2;
const select_filled_primary_disabled_border_color = border_basic_color_2;
const select_filled_primary_disabled_icon_color = text_disabled_color;
const select_filled_primary_disabled_text_color = text_disabled_color;

const select_filled_success_background_color = color_success_default;
const select_filled_success_border_color = color_success_default_border;
const select_filled_success_icon_color = text_control_color;
const select_filled_success_text_color = text_control_color;
const select_filled_success_placeholder_text_color = text_control_color;

const select_filled_success_focus_background_color = color_success_focus;
const select_filled_success_focus_border_color = color_success_focus_border;
const select_filled_success_hover_background_color = color_success_hover;
const select_filled_success_hover_border_color = color_success_hover_border;
const select_filled_success_disabled_background_color = background_basic_color_2;
const select_filled_success_disabled_border_color = border_basic_color_2;
const select_filled_success_disabled_icon_color = text_disabled_color;
const select_filled_success_disabled_text_color = text_disabled_color;

const select_filled_info_background_color = color_info_default;
const select_filled_info_border_color = color_info_default_border;
const select_filled_info_icon_color = text_control_color;
const select_filled_info_text_color = text_control_color;
const select_filled_info_placeholder_text_color = text_control_color;

const select_filled_info_focus_background_color = color_info_focus;
const select_filled_info_focus_border_color = color_info_focus_border;
const select_filled_info_hover_background_color = color_info_hover;
const select_filled_info_hover_border_color = color_info_hover_border;
const select_filled_info_disabled_background_color = background_basic_color_2;
const select_filled_info_disabled_border_color = border_basic_color_2;
const select_filled_info_disabled_icon_color = text_disabled_color;
const select_filled_info_disabled_text_color = text_disabled_color;

const select_filled_warning_background_color = color_warning_default;
const select_filled_warning_border_color = color_warning_default_border;
const select_filled_warning_icon_color = text_control_color;
const select_filled_warning_text_color = text_control_color;
const select_filled_warning_placeholder_text_color = text_control_color;

const select_filled_warning_focus_background_color = color_warning_focus;
const select_filled_warning_focus_border_color = color_warning_focus_border;
const select_filled_warning_hover_background_color = color_warning_hover;
const select_filled_warning_hover_border_color = color_warning_hover_border;
const select_filled_warning_disabled_background_color = background_basic_color_2;
const select_filled_warning_disabled_border_color = border_basic_color_2;
const select_filled_warning_disabled_icon_color = text_disabled_color;
const select_filled_warning_disabled_text_color = text_disabled_color;

const select_filled_danger_background_color = color_danger_default;
const select_filled_danger_border_color = color_danger_default_border;
const select_filled_danger_icon_color = text_control_color;
const select_filled_danger_text_color = text_control_color;
const select_filled_danger_placeholder_text_color = text_control_color;

const select_filled_danger_focus_background_color = color_danger_focus;
const select_filled_danger_focus_border_color = color_danger_focus_border;
const select_filled_danger_hover_background_color = color_danger_hover;
const select_filled_danger_hover_border_color = color_danger_hover_border;
const select_filled_danger_disabled_background_color = background_basic_color_2;
const select_filled_danger_disabled_border_color = border_basic_color_2;
const select_filled_danger_disabled_icon_color = text_disabled_color;
const select_filled_danger_disabled_text_color = text_disabled_color;

const select_filled_control_background_color = color_control_default;
const select_filled_control_border_color = color_control_default_border;
const select_filled_control_icon_color = color_basic_800;
const select_filled_control_text_color = color_basic_800;
const select_filled_control_placeholder_text_color = text_hint_color;

const select_filled_control_focus_background_color = color_control_focus;
const select_filled_control_focus_border_color = color_control_focus_border;
const select_filled_control_hover_background_color = color_control_hover;
const select_filled_control_hover_border_color = color_control_hover_border;
const select_filled_control_disabled_background_color = background_basic_color_2;
const select_filled_control_disabled_border_color = border_basic_color_2;
const select_filled_control_disabled_icon_color = text_disabled_color;
const select_filled_control_disabled_text_color = text_disabled_color;

const select_hero_tiny_padding = '0.25rem 1rem';
const select_hero_small_padding = '0.25rem 1rem';
const select_hero_medium_padding = '0.5rem 1rem';
const select_hero_large_padding = '0.75rem 1rem';
const select_hero_giant_padding = '1rem 1rem';

const select_hero_basic_left_background_color = color_basic_200;
const select_hero_basic_right_background_color = color_basic_default;
const select_hero_basic_icon_color = color_basic_800;
const select_hero_basic_text_color = color_basic_800;
const select_hero_basic_placeholder_text_color = text_hint_color;

const select_hero_basic_focus_left_background_color = color_basic_300;
const select_hero_basic_focus_right_background_color = color_basic_400;
const select_hero_basic_hover_left_background_color = color_basic_100;
const select_hero_basic_hover_right_background_color = color_basic_hover;
const select_hero_basic_disabled_background_color = background_basic_color_2;
const select_hero_basic_disabled_icon_color = text_disabled_color;
const select_hero_basic_disabled_text_color = text_disabled_color;

const select_hero_primary_left_background_color = color_primary_400;
const select_hero_primary_right_background_color = color_primary_default;
const select_hero_primary_icon_color = text_control_color;
const select_hero_primary_text_color = text_control_color;
const select_hero_primary_placeholder_text_color = text_control_color;

const select_hero_primary_focus_left_background_color = color_primary_500;
const select_hero_primary_focus_right_background_color = color_primary_focus;
const select_hero_primary_hover_left_background_color = color_primary_300;
const select_hero_primary_hover_right_background_color = color_primary_hover;
const select_hero_primary_disabled_background_color = background_basic_color_2;
const select_hero_primary_disabled_icon_color = text_disabled_color;
const select_hero_primary_disabled_text_color = text_disabled_color;

const select_hero_success_left_background_color = color_success_400;
const select_hero_success_right_background_color = color_success_default;
const select_hero_success_icon_color = text_control_color;
const select_hero_success_text_color = text_control_color;
const select_hero_success_placeholder_text_color = text_control_color;

const select_hero_success_focus_left_background_color = color_success_500;
const select_hero_success_focus_right_background_color = color_success_focus;
const select_hero_success_hover_left_background_color = color_success_300;
const select_hero_success_hover_right_background_color = color_success_hover;
const select_hero_success_disabled_background_color = background_basic_color_2;
const select_hero_success_disabled_icon_color = text_disabled_color;
const select_hero_success_disabled_text_color = text_disabled_color;

const select_hero_info_left_background_color = color_info_400;
const select_hero_info_right_background_color = color_info_default;
const select_hero_info_icon_color = text_control_color;
const select_hero_info_text_color = text_control_color;
const select_hero_info_placeholder_text_color = text_control_color;

const select_hero_info_focus_left_background_color = color_info_500;
const select_hero_info_focus_right_background_color = color_info_focus;
const select_hero_info_hover_left_background_color = color_info_300;
const select_hero_info_hover_right_background_color = color_info_hover;
const select_hero_info_disabled_background_color = background_basic_color_2;
const select_hero_info_disabled_icon_color = text_disabled_color;
const select_hero_info_disabled_text_color = text_disabled_color;

const select_hero_warning_left_background_color = color_warning_400;
const select_hero_warning_right_background_color = color_warning_default;
const select_hero_warning_icon_color = text_control_color;
const select_hero_warning_text_color = text_control_color;
const select_hero_warning_placeholder_text_color = text_control_color;

const select_hero_warning_focus_left_background_color = color_warning_500;
const select_hero_warning_focus_right_background_color = color_warning_focus;
const select_hero_warning_hover_left_background_color = color_warning_300;
const select_hero_warning_hover_right_background_color = color_warning_hover;
const select_hero_warning_disabled_background_color = background_basic_color_2;
const select_hero_warning_disabled_icon_color = text_disabled_color;
const select_hero_warning_disabled_text_color = text_disabled_color;

const select_hero_danger_left_background_color = color_danger_400;
const select_hero_danger_right_background_color = color_danger_default;
const select_hero_danger_icon_color = text_control_color;
const select_hero_danger_text_color = text_control_color;
const select_hero_danger_placeholder_text_color = text_control_color;

const select_hero_danger_focus_left_background_color = color_danger_500;
const select_hero_danger_focus_right_background_color = color_danger_focus;
const select_hero_danger_hover_left_background_color = color_danger_300;
const select_hero_danger_hover_right_background_color = color_danger_hover;
const select_hero_danger_disabled_background_color = background_basic_color_2;
const select_hero_danger_disabled_icon_color = text_disabled_color;
const select_hero_danger_disabled_text_color = text_disabled_color;

const select_hero_control_left_background_color = color_control_default;
const select_hero_control_right_background_color = color_control_default;
const select_hero_control_icon_color = color_basic_800;
const select_hero_control_text_color = color_basic_800;
const select_hero_control_placeholder_text_color = text_hint_color;

const select_hero_control_focus_left_background_color = color_basic_200;
const select_hero_control_focus_right_background_color = color_control_focus;
const select_hero_control_hover_left_background_color = color_basic_100;
const select_hero_control_hover_right_background_color = color_control_hover;
const select_hero_control_disabled_background_color = background_basic_color_2;
const select_hero_control_disabled_icon_color = text_disabled_color;
const select_hero_control_disabled_text_color = text_disabled_color;

const datepicker_background_color = background_basic_color_1;
const datepicker_border_color = border_basic_color_4;
const datepicker_border_style = 'solid';
const datepicker_border_width = '0.0625rem';
const datepicker_border_radius = border_radius;
const datepicker_shadow = 'none';

const timepicker_cell_text_color = text_basic_color;
const timepicker_cell_hover_background_color = background_basic_color_2;
const timepicker_cell_hover_text_color = text_basic_color;
const timepicker_cell_focus_background_color = color_basic_focus;
const timepicker_cell_focus_text_color = text_basic_color;
const timepicker_cell_active_background_color = color_primary_default;
const timepicker_cell_active_text_color = text_control_color;
const timepicker_cell_text_font_size = text_subtitle_font_size;
const timepicker_cell_text_font_family = text_subtitle_font_family;
const timepicker_cell_text_line_height = text_subtitle_line_height;
const timepicker_cell_text_font_weight = text_subtitle_font_weight;
const timepicker_cell_height = '2.75rem';
const timepicker_header_cell_text_color = text_hint_color;
const timepicker_header_cell_text_font_size = text_subtitle_font_size;
const timepicker_header_cell_text_font_family = text_subtitle_font_family;
const timepicker_header_cell_height = '2.75rem';
const timepicker_header_cell_text_line_height = text_subtitle_line_height;
const timepicker_header_cell_text_font_weight = text_subtitle_font_weight;
const timepicker_border_color = datepicker_border_color;
const timepicker_border_style = datepicker_border_style;
const timepicker_border_width = datepicker_border_width;
const timepicker_scrollbar_color = scrollbar_color;
const timepicker_scrollbar_background_color = scrollbar_background_color;
const timepicker_scrollbar_width = scrollbar_width;
const timepicker_single_column_width = '5rem';
const timepicker_multiple_column_width = '13.875rem';
const timepicker_title_height = '3.75rem';
const timepicker_title_padding = text_paragraph_line_height;
const timepicker_container_width = '20rem';
const timepicker_container_height = '26.1875rem';

const radio_width = '1.25rem';
const radio_height = '1.25rem';
const radio_border_style = 'solid';
const radio_border_width = '1px';
const radio_text_font_family = text_subtitle_2_font_family;
const radio_text_font_size = text_subtitle_2_font_size;
const radio_text_font_weight = text_subtitle_2_font_weight;
const radio_text_line_height = text_subtitle_2_line_height;
const radio_outline_color = outline_color;
const radio_outline_width = outline_width;

const radio_basic_text_color = text_basic_color;
const radio_basic_border_color = color_basic_transparent_default_border;
const radio_basic_background_color = color_basic_transparent_default;
const radio_basic_checked_background_color = 'transparent';
const radio_basic_checked_border_color = color_primary_default_border;
const radio_basic_inner_circle_color = color_primary_default;
const radio_basic_focus_border_color = color_primary_transparent_focus_border;
const radio_basic_focus_background_color = color_primary_transparent_focus;
const radio_basic_focus_checked_background_color = 'transparent';
const radio_basic_focus_checked_border_color = color_primary_focus_border;
const radio_basic_focus_inner_circle_color = color_primary_focus;
const radio_basic_hover_background_color = color_primary_transparent_hover;
const radio_basic_hover_border_color = color_primary_transparent_hover_border;
const radio_basic_hover_inner_circle_color = color_primary_hover;
const radio_basic_hover_checked_background_color = 'transparent';
const radio_basic_hover_checked_border_color = color_primary_hover_border;
const radio_basic_active_background_color = color_primary_transparent_active;
const radio_basic_active_border_color = color_primary_transparent_active_border;
const radio_basic_active_inner_circle_color = color_primary_active;
const radio_basic_active_checked_background_color = 'transparent';
const radio_basic_active_checked_border_color = color_primary_active_border;
const radio_basic_disabled_background_color = color_basic_transparent_disabled;
const radio_basic_disabled_border_color = color_basic_transparent_disabled_border;
const radio_basic_disabled_text_color = text_disabled_color;
const radio_basic_disabled_checked_background_color = 'transparent';
const radio_basic_disabled_checked_border_color = color_basic_transparent_600;
const radio_basic_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_primary_text_color = text_basic_color;
const radio_primary_border_color = color_primary_transparent_default_border;
const radio_primary_background_color = color_primary_transparent_default;
const radio_primary_checked_background_color = 'transparent';
const radio_primary_checked_border_color = color_primary_default_border;
const radio_primary_inner_circle_color = color_primary_default;
const radio_primary_focus_border_color = color_primary_transparent_focus_border;
const radio_primary_focus_background_color = color_primary_transparent_focus;
const radio_primary_focus_checked_background_color = 'transparent';
const radio_primary_focus_checked_border_color = color_primary_focus_border;
const radio_primary_focus_inner_circle_color = color_primary_focus;
const radio_primary_hover_background_color = color_primary_transparent_hover;
const radio_primary_hover_border_color = color_primary_transparent_hover_border;
const radio_primary_hover_inner_circle_color = color_primary_hover;
const radio_primary_hover_checked_background_color = 'transparent';
const radio_primary_hover_checked_border_color = color_primary_hover_border;
const radio_primary_active_border_color = color_primary_transparent_active_border;
const radio_primary_active_background_color = color_primary_transparent_active;
const radio_primary_active_checked_background_color = 'transparent';
const radio_primary_active_checked_border_color = color_primary_active_border;
const radio_primary_active_inner_circle_color = color_primary_active;
const radio_primary_disabled_background_color = color_basic_transparent_disabled;
const radio_primary_disabled_border_color = color_basic_transparent_disabled_border;
const radio_primary_disabled_text_color = text_disabled_color;
const radio_primary_disabled_checked_background_color = 'transparent';
const radio_primary_disabled_checked_border_color = color_basic_transparent_600;
const radio_primary_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_success_text_color = text_basic_color;
const radio_success_border_color = color_success_transparent_default_border;
const radio_success_background_color = color_success_transparent_default;
const radio_success_checked_background_color = 'transparent';
const radio_success_checked_border_color = color_success_default_border;
const radio_success_inner_circle_color = color_success_default;
const radio_success_focus_border_color = color_success_transparent_focus_border;
const radio_success_focus_background_color = color_success_transparent_focus;
const radio_success_focus_checked_background_color = 'transparent';
const radio_success_focus_checked_border_color = color_success_focus_border;
const radio_success_focus_inner_circle_color = color_success_focus;
const radio_success_hover_background_color = color_success_transparent_hover;
const radio_success_hover_border_color = color_success_transparent_hover_border;
const radio_success_hover_inner_circle_color = color_success_hover;
const radio_success_hover_checked_background_color = 'transparent';
const radio_success_hover_checked_border_color = color_success_hover_border;
const radio_success_active_background_color = color_success_transparent_active;
const radio_success_active_border_color = color_success_transparent_active_border;
const radio_success_active_checked_background_color = 'transparent';
const radio_success_active_checked_border_color = color_success_active_border;
const radio_success_active_inner_circle_color = color_success_active;
const radio_success_disabled_background_color = color_basic_transparent_disabled;
const radio_success_disabled_border_color = color_basic_transparent_disabled_border;
const radio_success_disabled_text_color = text_disabled_color;
const radio_success_disabled_checked_background_color = 'transparent';
const radio_success_disabled_checked_border_color = color_basic_transparent_600;
const radio_success_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_info_text_color = text_basic_color;
const radio_info_border_color = color_info_transparent_default_border;
const radio_info_background_color = color_info_transparent_default;
const radio_info_checked_background_color = 'transparent';
const radio_info_checked_border_color = color_info_default_border;
const radio_info_inner_circle_color = color_info_default;
const radio_info_focus_background_color = color_info_transparent_focus;
const radio_info_focus_border_color = color_info_transparent_focus_border;
const radio_info_focus_checked_background_color = 'transparent';
const radio_info_focus_checked_border_color = color_info_focus_border;
const radio_info_focus_inner_circle_color = color_info_focus;
const radio_info_hover_background_color = color_info_transparent_hover;
const radio_info_hover_border_color = color_info_transparent_hover_border;
const radio_info_hover_inner_circle_color = color_info_hover;
const radio_info_hover_checked_background_color = 'transparent';
const radio_info_hover_checked_border_color = color_info_hover_border;
const radio_info_active_background_color = color_info_transparent_active;
const radio_info_active_border_color = color_info_transparent_active_border;
const radio_info_active_checked_background_color = 'transparent';
const radio_info_active_checked_border_color = color_info_active_border;
const radio_info_active_inner_circle_color = color_info_active;
const radio_info_disabled_background_color = color_basic_transparent_disabled;
const radio_info_disabled_border_color = color_basic_transparent_disabled_border;
const radio_info_disabled_text_color = text_disabled_color;
const radio_info_disabled_checked_background_color = 'transparent';
const radio_info_disabled_checked_border_color = color_basic_transparent_600;
const radio_info_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_warning_text_color = text_basic_color;
const radio_warning_border_color = color_warning_transparent_default_border;
const radio_warning_background_color = color_warning_transparent_default;
const radio_warning_checked_background_color = 'transparent';
const radio_warning_checked_border_color = color_warning_default_border;
const radio_warning_inner_circle_color = color_warning_default;
const radio_warning_focus_background_color = color_warning_transparent_focus;
const radio_warning_focus_border_color = color_warning_transparent_focus_border;
const radio_warning_focus_checked_background_color = 'transparent';
const radio_warning_focus_checked_border_color = color_warning_focus_border;
const radio_warning_focus_inner_circle_color = color_warning_focus;
const radio_warning_hover_background_color = color_warning_transparent_hover;
const radio_warning_hover_border_color = color_warning_transparent_hover_border;
const radio_warning_hover_inner_circle_color = color_warning_hover;
const radio_warning_hover_checked_background_color = 'transparent';
const radio_warning_hover_checked_border_color = color_warning_hover_border;
const radio_warning_active_background_color = color_warning_transparent_active;
const radio_warning_active_border_color = color_warning_transparent_active_border;
const radio_warning_active_checked_background_color = 'transparent';
const radio_warning_active_checked_border_color = color_warning_active_border;
const radio_warning_active_inner_circle_color = color_warning_active;
const radio_warning_disabled_background_color = color_basic_transparent_disabled;
const radio_warning_disabled_border_color = color_basic_transparent_disabled_border;
const radio_warning_disabled_text_color = text_disabled_color;
const radio_warning_disabled_checked_background_color = 'transparent';
const radio_warning_disabled_checked_border_color = color_basic_transparent_600;
const radio_warning_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_danger_text_color = text_basic_color;
const radio_danger_border_color = color_danger_transparent_default_border;
const radio_danger_background_color = color_danger_transparent_default;
const radio_danger_checked_background_color = 'transparent';
const radio_danger_checked_border_color = color_danger_default_border;
const radio_danger_inner_circle_color = color_danger_default;
const radio_danger_focus_background_color = color_danger_transparent_focus;
const radio_danger_focus_border_color = color_danger_transparent_focus_border;
const radio_danger_focus_checked_background_color = 'transparent';
const radio_danger_focus_checked_border_color = color_danger_focus_border;
const radio_danger_focus_inner_circle_color = color_danger_focus;
const radio_danger_hover_background_color = color_danger_transparent_hover;
const radio_danger_hover_border_color = color_danger_transparent_hover_border;
const radio_danger_hover_inner_circle_color = color_danger_hover;
const radio_danger_hover_checked_background_color = 'transparent';
const radio_danger_hover_checked_border_color = color_danger_hover_border;
const radio_danger_active_background_color = color_danger_transparent_active;
const radio_danger_active_border_color = color_danger_transparent_active_border;
const radio_danger_active_checked_background_color = 'transparent';
const radio_danger_active_checked_border_color = color_danger_active_border;
const radio_danger_active_inner_circle_color = color_danger_active;
const radio_danger_disabled_background_color = color_basic_transparent_disabled;
const radio_danger_disabled_border_color = color_basic_transparent_disabled_border;
const radio_danger_disabled_text_color = text_disabled_color;
const radio_danger_disabled_checked_background_color = 'transparent';
const radio_danger_disabled_checked_border_color = color_basic_transparent_600;
const radio_danger_disabled_checked_inner_circle_color = color_basic_transparent_600;

const radio_control_text_color = text_control_color;
const radio_control_background_color = color_control_transparent_default;
const radio_control_border_color = color_control_transparent_default_border;
const radio_control_checked_background_color = 'transparent';
const radio_control_checked_border_color = color_control_default_border;
const radio_control_inner_circle_color = color_control_default;
const radio_control_focus_background_color = color_control_transparent_focus;
const radio_control_focus_border_color = color_control_transparent_focus_border;
const radio_control_focus_checked_background_color = 'transparent';
const radio_control_focus_checked_border_color = color_control_focus_border;
const radio_control_focus_inner_circle_color = color_control_focus;
const radio_control_hover_background_color = color_control_transparent_hover;
const radio_control_hover_border_color = color_control_transparent_hover_border;
const radio_control_hover_inner_circle_color = color_control_hover;
const radio_control_hover_checked_background_color = 'transparent';
const radio_control_hover_checked_border_color = color_control_hover_border;
const radio_control_active_background_color = color_control_transparent_active;
const radio_control_active_border_color = color_control_transparent_active_border;
const radio_control_active_checked_background_color = 'transparent';
const radio_control_active_checked_border_color = color_control_active_border;
const radio_control_active_inner_circle_color = color_control_active;
const radio_control_disabled_background_color = color_control_transparent_disabled;
const radio_control_disabled_border_color = color_control_transparent_disabled_border;
const radio_control_disabled_text_color = color_basic_100;
const radio_control_disabled_checked_background_color = 'transparent';
const radio_control_disabled_checked_border_color = color_basic_transparent_600;
const radio_control_disabled_checked_inner_circle_color = color_basic_transparent_600;

const tree_grid_cell_border_width = '1px';
const tree_grid_cell_border_style = 'solid';
const tree_grid_cell_border_color = border_basic_color_2;
const tree_grid_row_min_height = '2rem';
const tree_grid_cell_padding = '0.875rem 1.25rem';

const tree_grid_header_background_color = background_basic_color_1;
const tree_grid_header_text_color = text_basic_color;
const tree_grid_header_text_font_family = text_subtitle_font_family;
const tree_grid_header_text_font_size = text_subtitle_font_size;
const tree_grid_header_text_font_weight = text_subtitle_font_weight;
const tree_grid_header_text_line_height = text_subtitle_line_height;

const tree_grid_footer_background_color = background_basic_color_1;
const tree_grid_footer_text_color = text_basic_color;
const tree_grid_footer_text_font_family = tree_grid_header_text_font_family;
const tree_grid_footer_text_font_size = tree_grid_header_text_font_size;
const tree_grid_footer_text_font_weight = tree_grid_header_text_font_weight;
const tree_grid_footer_text_line_height = tree_grid_header_text_line_height;

const tree_grid_row_background_color = background_basic_color_1;
const tree_grid_row_even_background_color = background_basic_color_1;
const tree_grid_row_hover_background_color = background_basic_color_1;
const tree_grid_row_text_color = text_basic_color;
const tree_grid_row_text_font_family = text_paragraph_font_family;
const tree_grid_row_text_font_size = text_paragraph_font_size;
const tree_grid_row_text_font_weight = text_paragraph_font_weight;
const tree_grid_row_text_line_height = text_paragraph_line_height;

const tree_grid_sort_header_button_background_color = 'transparent';
const tree_grid_sort_header_button_border = 'none';
const tree_grid_sort_header_button_padding = '0';

const icon_font_size = '1.25rem';
const icon_line_height = '1';
const icon_width = '1em';
const icon_height = '1em';
const icon_svg_vertical_align = 'top';
const icon_basic_color = text_hint_color;
const icon_primary_color = color_primary_default;
const icon_info_color = color_info_default;
const icon_success_color = color_success_default;
const icon_warning_color = color_warning_default;
const icon_danger_color = color_danger_default;
const icon_control_color = color_basic_100;

const tag_text_font_family = text_subtitle_font_family;
const tag_text_transform = 'capitalize';
const tag_border_width = '0.0625rem';
const tag_border_style = 'solid';
const tag_border_radius = '1.5rem';

const tag_tiny_text_font_size = input_tiny_text_font_size;
const tag_tiny_text_font_weight = input_tiny_text_font_weight;
const tag_tiny_text_line_height = input_tiny_text_line_height;
const tag_tiny_padding = '0.0625rem 0.9375rem';
const tag_tiny_close_offset = '0.625rem';

const tag_small_text_font_size = input_small_text_font_size;
const tag_small_text_font_weight = input_small_text_font_weight;
const tag_small_text_line_height = input_small_text_line_height;
const tag_small_padding = '0.0625rem 0.9375rem';
const tag_small_close_offset = '0.625rem';

const tag_medium_text_font_size = input_medium_text_font_size;
const tag_medium_text_font_weight = input_medium_text_font_weight;
const tag_medium_text_line_height = input_medium_text_line_height;
const tag_medium_padding = '0.1875rem 0.9375rem';
const tag_medium_close_offset = '0.625rem';

const tag_large_text_font_size = input_large_text_font_size;
const tag_large_text_font_weight = input_large_text_font_weight;
const tag_large_text_line_height = input_large_text_line_height;
const tag_large_padding = '0.3125rem 0.9375rem';
const tag_large_close_offset = '0.625rem';

const tag_giant_text_font_size = input_giant_text_font_size;
const tag_giant_text_font_weight = input_giant_text_font_weight;
const tag_giant_text_line_height = input_giant_text_line_height;
const tag_giant_padding = '0.4375rem 0.9375rem';
const tag_giant_close_offset = '0.625rem';

const tag_filled_basic_background_color = color_basic_default;
const tag_filled_basic_border_color = color_basic_default_border;
const tag_filled_basic_text_color = color_basic_800;
const tag_filled_basic_active_background_color = color_basic_focus;
const tag_filled_basic_active_border_color = color_basic_focus_border;
const tag_filled_basic_hover_background_color = color_basic_hover;
const tag_filled_basic_hover_border_color = color_basic_hover_border;
const tag_filled_basic_selected_background_color = color_basic_active;
const tag_filled_basic_selected_border_color = color_basic_active_border;

const tag_filled_primary_background_color = color_primary_default;
const tag_filled_primary_border_color = color_primary_default_border;
const tag_filled_primary_text_color = text_control_color;
const tag_filled_primary_active_background_color = color_primary_focus;
const tag_filled_primary_active_border_color = color_primary_focus_border;
const tag_filled_primary_hover_background_color = color_primary_hover;
const tag_filled_primary_hover_border_color = color_primary_hover_border;
const tag_filled_primary_selected_background_color = color_primary_active;
const tag_filled_primary_selected_border_color = color_primary_active_border;

const tag_filled_success_background_color = color_success_default;
const tag_filled_success_border_color = color_success_default_border;
const tag_filled_success_text_color = text_control_color;
const tag_filled_success_active_background_color = color_success_focus;
const tag_filled_success_active_border_color = color_success_focus_border;
const tag_filled_success_hover_background_color = color_success_hover;
const tag_filled_success_hover_border_color = color_success_hover_border;
const tag_filled_success_selected_background_color = color_success_active;
const tag_filled_success_selected_border_color = color_success_active_border;

const tag_filled_info_background_color = color_info_default;
const tag_filled_info_border_color = color_info_default_border;
const tag_filled_info_text_color = text_control_color;
const tag_filled_info_active_background_color = color_info_focus;
const tag_filled_info_active_border_color = color_info_focus_border;
const tag_filled_info_hover_background_color = color_info_hover;
const tag_filled_info_hover_border_color = color_info_hover_border;
const tag_filled_info_selected_background_color = color_info_active;
const tag_filled_info_selected_border_color = color_info_active_border;

const tag_filled_warning_background_color = color_warning_default;
const tag_filled_warning_border_color = color_warning_default_border;
const tag_filled_warning_text_color = text_control_color;
const tag_filled_warning_active_background_color = color_warning_focus;
const tag_filled_warning_active_border_color = color_warning_focus_border;
const tag_filled_warning_hover_background_color = color_warning_hover;
const tag_filled_warning_hover_border_color = color_warning_hover_border;
const tag_filled_warning_selected_background_color = color_warning_active;
const tag_filled_warning_selected_border_color = color_warning_active_border;

const tag_filled_danger_background_color = color_danger_default;
const tag_filled_danger_border_color = color_danger_default_border;
const tag_filled_danger_text_color = text_control_color;
const tag_filled_danger_active_background_color = color_danger_focus;
const tag_filled_danger_active_border_color = color_danger_focus_border;
const tag_filled_danger_hover_background_color = color_danger_hover;
const tag_filled_danger_hover_border_color = color_danger_hover_border;
const tag_filled_danger_selected_background_color = color_danger_active;
const tag_filled_danger_selected_border_color = color_danger_active_border;

const tag_filled_control_background_color = color_control_default;
const tag_filled_control_border_color = color_control_default_border;
const tag_filled_control_text_color = color_basic_800;
const tag_filled_control_active_background_color = color_control_hover;
const tag_filled_control_active_border_color = color_control_hover_border;
const tag_filled_control_hover_background_color = color_control_focus;
const tag_filled_control_hover_border_color = color_control_focus_border;
const tag_filled_control_selected_background_color = color_control_active;
const tag_filled_control_selected_border_color = color_control_active_border;

const tag_outline_basic_background_color = color_basic_transparent_default;
const tag_outline_basic_border_color = color_basic_transparent_default_border;
const tag_outline_basic_text_color = text_hint_color;
const tag_outline_basic_active_background_color = color_basic_transparent_focus;
const tag_outline_basic_active_border_color = color_basic_transparent_focus_border;
const tag_outline_basic_active_text_color = text_hint_color;
const tag_outline_basic_hover_background_color = color_basic_transparent_hover;
const tag_outline_basic_hover_border_color = color_basic_transparent_hover_border;
const tag_outline_basic_hover_text_color = text_hint_color;
const tag_outline_basic_selected_background_color = color_basic_transparent_active;
const tag_outline_basic_selected_border_color = color_basic_transparent_active_border;
const tag_outline_basic_selected_text_color = text_hint_color;

const tag_outline_primary_background_color = color_primary_transparent_default;
const tag_outline_primary_border_color = color_primary_transparent_default_border;
const tag_outline_primary_text_color = text_primary_color;
const tag_outline_primary_active_background_color = color_primary_transparent_focus;
const tag_outline_primary_active_border_color = color_primary_transparent_focus_border;
const tag_outline_primary_active_text_color = text_primary_color;
const tag_outline_primary_hover_background_color = color_primary_transparent_hover;
const tag_outline_primary_hover_border_color = color_primary_transparent_hover_border;
const tag_outline_primary_hover_text_color = text_primary_color;
const tag_outline_primary_selected_background_color = color_primary_transparent_active;
const tag_outline_primary_selected_border_color = color_primary_transparent_active_border;
const tag_outline_primary_selected_text_color = text_primary_color;

const tag_outline_success_background_color = color_success_transparent_default;
const tag_outline_success_border_color = color_success_transparent_default_border;
const tag_outline_success_text_color = text_success_color;
const tag_outline_success_active_background_color = color_success_transparent_focus;
const tag_outline_success_active_border_color = color_success_transparent_focus_border;
const tag_outline_success_active_text_color = text_success_color;
const tag_outline_success_hover_background_color = color_success_transparent_hover;
const tag_outline_success_hover_border_color = color_success_transparent_hover_border;
const tag_outline_success_hover_text_color = text_success_color;
const tag_outline_success_selected_background_color = color_success_transparent_active;
const tag_outline_success_selected_border_color = color_success_transparent_active_border;
const tag_outline_success_selected_text_color = text_success_color;

const tag_outline_info_background_color = color_info_transparent_default;
const tag_outline_info_border_color = color_info_transparent_default_border;
const tag_outline_info_text_color = text_info_color;
const tag_outline_info_active_background_color = color_info_transparent_focus;
const tag_outline_info_active_border_color = color_info_transparent_focus_border;
const tag_outline_info_active_text_color = text_info_color;
const tag_outline_info_hover_background_color = color_info_transparent_hover;
const tag_outline_info_hover_border_color = color_info_transparent_hover_border;
const tag_outline_info_hover_text_color = text_info_color;
const tag_outline_info_selected_background_color = color_info_transparent_active;
const tag_outline_info_selected_border_color = color_info_transparent_active_border;
const tag_outline_info_selected_text_color = text_info_color;

const tag_outline_warning_background_color = color_warning_transparent_default;
const tag_outline_warning_border_color = color_warning_transparent_default_border;
const tag_outline_warning_text_color = text_warning_color;
const tag_outline_warning_active_background_color = color_warning_transparent_focus;
const tag_outline_warning_active_border_color = color_warning_transparent_focus_border;
const tag_outline_warning_active_text_color = text_warning_color;
const tag_outline_warning_hover_background_color = color_warning_transparent_hover;
const tag_outline_warning_hover_border_color = color_warning_transparent_hover_border;
const tag_outline_warning_hover_text_color = text_warning_color;
const tag_outline_warning_selected_background_color = color_warning_transparent_active;
const tag_outline_warning_selected_border_color = color_warning_transparent_active_border;
const tag_outline_warning_selected_text_color = text_warning_color;

const tag_outline_danger_background_color = color_danger_transparent_default;
const tag_outline_danger_border_color = color_danger_transparent_default_border;
const tag_outline_danger_text_color = text_danger_color;
const tag_outline_danger_active_background_color = color_danger_transparent_focus;
const tag_outline_danger_active_border_color = color_danger_transparent_focus_border;
const tag_outline_danger_active_text_color = text_danger_color;
const tag_outline_danger_hover_background_color = color_danger_transparent_hover;
const tag_outline_danger_hover_border_color = color_danger_transparent_hover_border;
const tag_outline_danger_hover_text_color = text_danger_color;
const tag_outline_danger_selected_background_color = color_danger_transparent_active;
const tag_outline_danger_selected_border_color = color_danger_transparent_active_border;
const tag_outline_danger_selected_text_color = text_danger_color;

const tag_outline_control_background_color = color_control_transparent_default;
const tag_outline_control_border_color = color_control_transparent_default_border;
const tag_outline_control_text_color = text_control_color;
const tag_outline_control_active_background_color = color_control_transparent_focus;
const tag_outline_control_active_border_color = color_control_transparent_focus_border;
const tag_outline_control_active_text_color = text_control_color;
const tag_outline_control_hover_background_color = color_control_transparent_hover;
const tag_outline_control_hover_border_color = color_control_transparent_hover_border;
const tag_outline_control_hover_text_color = text_control_color;
const tag_outline_control_selected_background_color = color_control_transparent_active;
const tag_outline_control_selected_border_color = color_control_transparent_active_border;
const tag_outline_control_selected_text_color = text_control_color;

const tag_list_tiny_tag_offset = '0.0625rem';
const tag_list_small_tag_offset = '0.125rem';
const tag_list_medium_tag_offset = '0.25rem';
const tag_list_large_tag_offset = '0.375rem';
const tag_list_giant_tag_offset = '0.5rem';

const tag_list_with_input_tiny_padding = '0.0625rem 1rem';
const tag_list_with_input_small_padding = '0.0625rem 1rem';
const tag_list_with_input_medium_padding = '0.1875rem 1rem';
const tag_list_with_input_large_padding = '0.3125rem 1rem';
const tag_list_with_input_giant_padding = '0.4375rem 1rem';

const tag_list_with_input_rectangle_border_radius = input_rectangle_border_radius;
const tag_list_with_input_semi_round_border_radius = input_semi_round_border_radius;
const tag_list_with_input_round_border_radius = input_round_border_radius;

const tag_input_min_width = '6rem';
const tag_input_text_font_family = input_text_font_family;
const tag_input_placeholder_text_font_family = input_placeholder_text_font_family;

const tag_input_basic_background_color = input_basic_background_color;
const tag_input_basic_border_color = input_basic_border_color;
const tag_input_basic_text_color = input_basic_text_color;
const tag_input_basic_placeholder_text_color = input_basic_placeholder_text_color;
const tag_input_basic_focus_background_color = input_basic_focus_background_color;
const tag_input_basic_focus_border_color = input_basic_focus_border_color;
const tag_input_basic_disabled_text_color = input_basic_disabled_text_color;
const tag_input_basic_disabled_placeholder_text_color = input_basic_disabled_placeholder_text_color;

const tag_input_primary_background_color = input_primary_background_color;
const tag_input_primary_border_color = input_primary_border_color;
const tag_input_primary_text_color = input_primary_text_color;
const tag_input_primary_placeholder_text_color = input_primary_placeholder_text_color;
const tag_input_primary_focus_background_color = input_primary_focus_background_color;
const tag_input_primary_focus_border_color = input_primary_focus_border_color;
const tag_input_primary_disabled_text_color = input_primary_disabled_text_color;
const tag_input_primary_disabled_placeholder_text_color = input_primary_disabled_placeholder_text_color;

const tag_input_success_background_color = input_success_background_color;
const tag_input_success_border_color = input_success_border_color;
const tag_input_success_text_color = input_success_text_color;
const tag_input_success_placeholder_text_color = input_success_placeholder_text_color;
const tag_input_success_focus_background_color = input_success_focus_background_color;
const tag_input_success_focus_border_color = input_success_focus_border_color;
const tag_input_success_disabled_text_color = input_success_disabled_text_color;
const tag_input_success_disabled_placeholder_text_color = input_success_disabled_placeholder_text_color;

const tag_input_info_background_color = input_info_background_color;
const tag_input_info_border_color = input_info_border_color;
const tag_input_info_text_color = input_info_text_color;
const tag_input_info_placeholder_text_color = input_info_placeholder_text_color;
const tag_input_info_focus_background_color = input_info_focus_background_color;
const tag_input_info_focus_border_color = input_info_focus_border_color;
const tag_input_info_disabled_text_color = input_info_disabled_text_color;
const tag_input_info_disabled_placeholder_text_color = input_info_disabled_placeholder_text_color;

const tag_input_warning_background_color = input_warning_background_color;
const tag_input_warning_border_color = input_warning_border_color;
const tag_input_warning_text_color = input_warning_text_color;
const tag_input_warning_placeholder_text_color = input_warning_placeholder_text_color;
const tag_input_warning_focus_background_color = input_warning_focus_background_color;
const tag_input_warning_focus_border_color = input_warning_focus_border_color;
const tag_input_warning_disabled_text_color = input_warning_disabled_text_color;
const tag_input_warning_disabled_placeholder_text_color = input_warning_disabled_placeholder_text_color;

const tag_input_danger_background_color = input_danger_background_color;
const tag_input_danger_border_color = input_danger_border_color;
const tag_input_danger_text_color = input_danger_text_color;
const tag_input_danger_placeholder_text_color = input_danger_placeholder_text_color;
const tag_input_danger_focus_background_color = input_danger_focus_background_color;
const tag_input_danger_focus_border_color = input_danger_focus_border_color;
const tag_input_danger_disabled_text_color = input_danger_disabled_text_color;
const tag_input_danger_disabled_placeholder_text_color = input_danger_disabled_placeholder_text_color;

const tag_input_control_background_color = input_control_background_color;
const tag_input_control_border_color = input_control_border_color;
const tag_input_control_text_color = input_control_text_color;
const tag_input_control_placeholder_text_color = input_control_placeholder_text_color;
const tag_input_control_focus_background_color = input_control_focus_background_color;
const tag_input_control_focus_border_color = input_control_focus_border_color;
const tag_input_control_disabled_text_color = input_control_disabled_text_color;
const tag_input_control_disabled_placeholder_text_color = input_control_disabled_placeholder_text_color;

const tag_input_tiny_text_font_size = input_tiny_text_font_size;
const tag_input_tiny_text_font_weight = input_tiny_text_font_weight;
const tag_input_tiny_text_line_height = input_tiny_text_line_height;
const tag_input_tiny_placeholder_text_font_size = input_tiny_placeholder_text_font_size;
const tag_input_tiny_placeholder_text_font_weight = input_tiny_placeholder_text_font_weight;
const tag_input_tiny_placeholder_text_line_height = input_tiny_placeholder_text_line_height;
const tag_input_tiny_padding = '0.125rem 0';

const tag_input_small_text_font_size = input_small_text_font_size;
const tag_input_small_text_font_weight = input_small_text_font_weight;
const tag_input_small_text_line_height = input_small_text_line_height;
const tag_input_small_placeholder_text_font_size = input_small_placeholder_text_font_size;
const tag_input_small_placeholder_text_font_weight = input_small_placeholder_text_font_weight;
const tag_input_small_placeholder_text_line_height = input_small_placeholder_text_line_height;
const tag_input_small_padding = '0.125rem 0';

const tag_input_medium_text_font_size = input_medium_text_font_size;
const tag_input_medium_text_font_weight = input_medium_text_font_weight;
const tag_input_medium_text_line_height = input_medium_text_line_height;
const tag_input_medium_placeholder_text_font_size = input_medium_placeholder_text_font_size;
const tag_input_medium_placeholder_text_font_weight = input_medium_placeholder_text_font_weight;
const tag_input_medium_placeholder_text_line_height = input_medium_placeholder_text_line_height;
const tag_input_medium_padding = '0.25rem 0';

const tag_input_large_text_font_size = input_large_text_font_size;
const tag_input_large_text_font_weight = input_large_text_font_weight;
const tag_input_large_text_line_height = input_large_text_line_height;
const tag_input_large_placeholder_text_font_size = input_large_placeholder_text_font_size;
const tag_input_large_placeholder_text_font_weight = input_large_placeholder_text_font_weight;
const tag_input_large_placeholder_text_line_height = input_large_placeholder_text_line_height;
const tag_input_large_padding = '0.375rem 0';

const tag_input_giant_text_font_size = input_giant_text_font_size;
const tag_input_giant_text_font_weight = input_giant_text_font_weight;
const tag_input_giant_text_line_height = input_giant_text_line_height;
const tag_input_giant_placeholder_text_font_size = input_giant_placeholder_text_font_size;
const tag_input_giant_placeholder_text_font_weight = input_giant_placeholder_text_font_weight;
const tag_input_giant_placeholder_text_line_height = input_giant_placeholder_text_line_height;
const tag_input_giant_padding = '0.5rem 0';

const toggle_height = '1.875rem';
const toggle_width = '3.125rem';
const toggle_border_width = '1px';
const toggle_border_radius = '100px';
const toggle_outline_width = outline_width;
const toggle_outline_color = outline_color;
const toggle_switcher_size = '1.75rem';
const toggle_switcher_icon_size = '0.75rem';
const toggle_text_font_family = text_subtitle_2_font_family;
const toggle_text_font_size = text_subtitle_2_font_size;
const toggle_text_font_weight = text_subtitle_2_font_weight;
const toggle_text_line_height = text_subtitle_2_line_height;
const toggle_cursor = 'pointer';
const toggle_disabled_cursor = 'default';

const toggle_basic_text_color = text_basic_color;
const toggle_basic_background_color = color_basic_transparent_default;
const toggle_basic_border_color = color_basic_transparent_default_border;
const toggle_basic_checked_background_color = color_primary_default;
const toggle_basic_checked_border_color = color_primary_default_border;
const toggle_basic_checked_switcher_background_color = background_basic_color_1;
const toggle_basic_checked_switcher_checkmark_color = color_primary_default;
const toggle_basic_focus_background_color = color_primary_transparent_focus;
const toggle_basic_focus_border_color = color_primary_transparent_focus_border;
const toggle_basic_focus_checked_background_color = color_primary_focus;
const toggle_basic_focus_checked_border_color = color_primary_focus_border;
const toggle_basic_hover_background_color = color_primary_transparent_hover;
const toggle_basic_hover_border_color = color_primary_transparent_hover_border;
const toggle_basic_hover_checked_background_color = color_primary_hover;
const toggle_basic_hover_checked_border_color = color_primary_hover_border;
const toggle_basic_active_background_color = color_primary_transparent_active;
const toggle_basic_active_border_color = color_primary_transparent_active_border;
const toggle_basic_active_checked_background_color = color_primary_active;
const toggle_basic_active_checked_border_color = color_primary_active_border;
const toggle_basic_disabled_background_color = color_basic_transparent_disabled;
const toggle_basic_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_basic_disabled_switcher_background_color = color_basic_disabled;
const toggle_basic_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_basic_disabled_text_color = text_disabled_color;

const toggle_primary_text_color = text_basic_color;
const toggle_primary_background_color = color_primary_transparent_default;
const toggle_primary_border_color = color_primary_transparent_default_border;
const toggle_primary_checked_background_color = color_primary_default;
const toggle_primary_checked_border_color = color_primary_default_border;
const toggle_primary_checked_switcher_background_color = background_basic_color_1;
const toggle_primary_checked_switcher_checkmark_color = color_primary_default;
const toggle_primary_focus_background_color = color_primary_transparent_focus;
const toggle_primary_focus_border_color = color_primary_transparent_focus_border;
const toggle_primary_focus_checked_background_color = color_primary_focus;
const toggle_primary_focus_checked_border_color = color_primary_focus_border;
const toggle_primary_hover_background_color = color_primary_transparent_hover;
const toggle_primary_hover_border_color = color_primary_transparent_hover_border;
const toggle_primary_hover_checked_background_color = color_primary_hover;
const toggle_primary_hover_checked_border_color = color_primary_hover_border;
const toggle_primary_active_background_color = color_primary_transparent_active;
const toggle_primary_active_border_color = color_primary_transparent_active_border;
const toggle_primary_active_checked_background_color = color_primary_active;
const toggle_primary_active_checked_border_color = color_primary_active_border;
const toggle_primary_disabled_background_color = color_basic_transparent_disabled;
const toggle_primary_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_primary_disabled_switcher_background_color = color_basic_disabled;
const toggle_primary_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_primary_disabled_text_color = text_disabled_color;

const toggle_success_text_color = text_basic_color;
const toggle_success_background_color = color_success_transparent_default;
const toggle_success_border_color = color_success_transparent_default_border;
const toggle_success_checked_background_color = color_success_default;
const toggle_success_checked_border_color = color_success_default_border;
const toggle_success_checked_switcher_background_color = background_basic_color_1;
const toggle_success_checked_switcher_checkmark_color = color_success_default;
const toggle_success_focus_background_color = color_success_transparent_focus;
const toggle_success_focus_border_color = color_success_transparent_focus_border;
const toggle_success_focus_checked_background_color = color_success_focus;
const toggle_success_focus_checked_border_color = color_success_focus_border;
const toggle_success_hover_background_color = color_success_transparent_hover;
const toggle_success_hover_border_color = color_success_transparent_hover_border;
const toggle_success_hover_checked_background_color = color_success_hover;
const toggle_success_hover_checked_border_color = color_success_hover_border;
const toggle_success_active_background_color = color_success_transparent_active;
const toggle_success_active_border_color = color_success_transparent_active_border;
const toggle_success_active_checked_background_color = color_success_active;
const toggle_success_active_checked_border_color = color_success_active_border;
const toggle_success_disabled_background_color = color_basic_transparent_disabled;
const toggle_success_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_success_disabled_switcher_background_color = color_basic_disabled;
const toggle_success_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_success_disabled_text_color = text_disabled_color;

const toggle_info_text_color = text_basic_color;
const toggle_info_background_color = color_info_transparent_default;
const toggle_info_border_color = color_info_transparent_default_border;
const toggle_info_checked_background_color = color_info_default;
const toggle_info_checked_border_color = color_info_default_border;
const toggle_info_checked_switcher_background_color = background_basic_color_1;
const toggle_info_checked_switcher_checkmark_color = color_info_default;
const toggle_info_focus_background_color = color_info_transparent_focus;
const toggle_info_focus_border_color = color_info_transparent_focus_border;
const toggle_info_focus_checked_background_color = color_info_focus;
const toggle_info_focus_checked_border_color = color_info_focus_border;
const toggle_info_hover_background_color = color_info_transparent_hover;
const toggle_info_hover_border_color = color_info_transparent_hover_border;
const toggle_info_hover_checked_background_color = color_info_hover;
const toggle_info_hover_checked_border_color = color_info_hover_border;
const toggle_info_active_background_color = color_info_transparent_active;
const toggle_info_active_border_color = color_info_transparent_active_border;
const toggle_info_active_checked_background_color = color_info_active;
const toggle_info_active_checked_border_color = color_info_active_border;
const toggle_info_disabled_background_color = color_basic_transparent_disabled;
const toggle_info_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_info_disabled_switcher_background_color = color_basic_disabled;
const toggle_info_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_info_disabled_text_color = text_disabled_color;

const toggle_warning_text_color = text_basic_color;
const toggle_warning_background_color = color_warning_transparent_default;
const toggle_warning_border_color = color_warning_transparent_default_border;
const toggle_warning_checked_background_color = color_warning_default;
const toggle_warning_checked_border_color = color_warning_default_border;
const toggle_warning_checked_switcher_background_color = background_basic_color_1;
const toggle_warning_checked_switcher_checkmark_color = color_warning_default;
const toggle_warning_focus_background_color = color_warning_transparent_focus;
const toggle_warning_focus_border_color = color_warning_transparent_focus_border;
const toggle_warning_focus_checked_background_color = color_warning_focus;
const toggle_warning_focus_checked_border_color = color_warning_focus_border;
const toggle_warning_hover_background_color = color_warning_transparent_hover;
const toggle_warning_hover_border_color = color_warning_transparent_hover_border;
const toggle_warning_hover_checked_background_color = color_warning_hover;
const toggle_warning_hover_checked_border_color = color_warning_hover_border;
const toggle_warning_active_background_color = color_warning_transparent_active;
const toggle_warning_active_border_color = color_warning_transparent_active_border;
const toggle_warning_active_checked_background_color = color_warning_active;
const toggle_warning_active_checked_border_color = color_warning_active_border;
const toggle_warning_disabled_background_color = color_basic_transparent_disabled;
const toggle_warning_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_warning_disabled_switcher_background_color = color_basic_disabled;
const toggle_warning_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_warning_disabled_text_color = text_disabled_color;

const toggle_danger_text_color = text_basic_color;
const toggle_danger_background_color = color_danger_transparent_default;
const toggle_danger_border_color = color_danger_transparent_default_border;
const toggle_danger_checked_background_color = color_danger_default;
const toggle_danger_checked_border_color = color_danger_default_border;
const toggle_danger_checked_switcher_background_color = background_basic_color_1;
const toggle_danger_checked_switcher_checkmark_color = color_danger_default;
const toggle_danger_focus_background_color = color_danger_transparent_focus;
const toggle_danger_focus_border_color = color_danger_transparent_focus_border;
const toggle_danger_focus_checked_background_color = color_danger_focus;
const toggle_danger_focus_checked_border_color = color_danger_focus_border;
const toggle_danger_hover_background_color = color_danger_transparent_hover;
const toggle_danger_hover_border_color = color_danger_transparent_hover_border;
const toggle_danger_hover_checked_background_color = color_danger_hover;
const toggle_danger_hover_checked_border_color = color_danger_hover_border;
const toggle_danger_active_background_color = color_danger_transparent_active;
const toggle_danger_active_border_color = color_danger_transparent_active_border;
const toggle_danger_active_checked_background_color = color_danger_active;
const toggle_danger_active_checked_border_color = color_danger_active_border;
const toggle_danger_disabled_background_color = color_basic_transparent_disabled;
const toggle_danger_disabled_border_color = color_basic_transparent_disabled_border;
const toggle_danger_disabled_switcher_background_color = color_basic_disabled;
const toggle_danger_disabled_checked_switcher_checkmark_color = text_control_color;
const toggle_danger_disabled_text_color = text_disabled_color;

const toggle_control_text_color = color_basic_100;
const toggle_control_background_color = color_control_transparent_default;
const toggle_control_border_color = color_control_transparent_default_border;
const toggle_control_checked_background_color = color_control_transparent_default;
const toggle_control_checked_border_color = color_control_transparent_default_border;
const toggle_control_checked_switcher_background_color = color_control_default;
const toggle_control_checked_switcher_checkmark_color = color_basic_800;
const toggle_control_focus_background_color = color_control_transparent_focus;
const toggle_control_focus_border_color = color_control_transparent_focus_border;
const toggle_control_focus_checked_background_color = color_control_transparent_focus;
const toggle_control_focus_checked_border_color = color_control_transparent_focus_border;
const toggle_control_hover_background_color = color_control_transparent_hover;
const toggle_control_hover_border_color = color_control_transparent_hover_border;
const toggle_control_hover_checked_background_color = color_control_transparent_hover;
const toggle_control_hover_checked_border_color = color_control_transparent_hover_border;
const toggle_control_active_background_color = color_control_transparent_active;
const toggle_control_active_border_color = color_control_transparent_active_border;
const toggle_control_active_checked_background_color = color_control_transparent_active;
const toggle_control_active_checked_border_color = color_control_transparent_active_border;
const toggle_control_disabled_background_color = color_control_transparent_disabled;
const toggle_control_disabled_border_color = color_control_transparent_disabled_border;
const toggle_control_disabled_switcher_background_color = color_basic_transparent_600;
const toggle_control_disabled_checked_switcher_checkmark_color = color_basic_100;
const toggle_control_disabled_text_color = text_control_color;

const form_field_tiny_max_width = input_tiny_max_width;
const form_field_small_max_width = input_small_max_width;
const form_field_medium_max_width = input_medium_max_width;
const form_field_large_max_width = input_large_max_width;
const form_field_giant_max_width = input_giant_max_width;

const form_field_addon_basic_text_color = color_basic_600;
const form_field_addon_basic_highlight_text_color = color_primary_500;
const form_field_addon_primary_text_color = color_primary_500;
const form_field_addon_primary_highlight_text_color = color_primary_600;
const form_field_addon_success_text_color = color_success_500;
const form_field_addon_success_highlight_text_color = color_success_600;
const form_field_addon_info_text_color = color_info_500;
const form_field_addon_info_highlight_text_color = color_info_600;
const form_field_addon_warning_text_color = color_warning_500;
const form_field_addon_warning_highlight_text_color = color_warning_600;
const form_field_addon_danger_text_color = color_danger_500;
const form_field_addon_danger_highlight_text_color = color_danger_600;
const form_field_addon_control_text_color = color_control_default;
const form_field_addon_control_highlight_text_color = color_control_default;
const form_field_addon_disabled_text_color = text_disabled_color;

const form_field_addon_tiny_height = '1.5rem';
const form_field_addon_tiny_width = form_field_addon_tiny_height;
const form_field_addon_tiny_icon_size = button_tiny_icon_size;
const form_field_addon_tiny_font_size = text_button_tiny_font_size;
const form_field_addon_tiny_line_height = text_button_tiny_line_height;
const form_field_addon_tiny_font_weight = text_button_font_weight;
const form_field_addon_small_height = '2rem';
const form_field_addon_small_width = form_field_addon_small_height;
const form_field_addon_small_icon_size = button_small_icon_size;
const form_field_addon_small_font_size = text_button_small_font_size;
const form_field_addon_small_line_height = text_button_small_line_height;
const form_field_addon_small_font_weight = text_button_font_weight;
const form_field_addon_medium_height = '2.5rem';
const form_field_addon_medium_width = form_field_addon_medium_height;
const form_field_addon_medium_icon_size = button_medium_icon_size;
const form_field_addon_medium_font_size = text_button_medium_font_size;
const form_field_addon_medium_line_height = text_button_medium_line_height;
const form_field_addon_medium_font_weight = text_button_font_weight;
const form_field_addon_large_height = '3rem';
const form_field_addon_large_width = form_field_addon_large_height;
const form_field_addon_large_icon_size = button_large_icon_size;
const form_field_addon_large_font_size = text_button_large_font_size;
const form_field_addon_large_line_height = text_button_large_line_height;
const form_field_addon_large_font_weight = text_button_font_weight;
const form_field_addon_giant_height = '3.5rem';
const form_field_addon_giant_width = form_field_addon_giant_height;
const form_field_addon_giant_icon_size = button_giant_icon_size;
const form_field_addon_giant_font_size = text_button_giant_font_size;
const form_field_addon_giant_line_height = text_button_giant_line_height;
const form_field_addon_giant_font_weight = text_button_font_weight;

export const DefaultTheme: ThemeModel = {
  color_primary_100,
  color_primary_200,
  color_primary_300,
  color_primary_400,
  color_primary_500,
  color_primary_600,
  color_primary_700,
  color_primary_800,
  color_primary_900,

  color_primary_transparent_100,
  color_primary_transparent_200,
  color_primary_transparent_300,
  color_primary_transparent_400,
  color_primary_transparent_500,
  color_primary_transparent_600,

  color_success_100,
  color_success_200,
  color_success_300,
  color_success_400,
  color_success_500,
  color_success_600,
  color_success_700,
  color_success_800,
  color_success_900,

  color_success_transparent_100,
  color_success_transparent_200,
  color_success_transparent_300,
  color_success_transparent_400,
  color_success_transparent_500,
  color_success_transparent_600,

  color_info_100,
  color_info_200,
  color_info_300,
  color_info_400,
  color_info_500,
  color_info_600,
  color_info_700,
  color_info_800,
  color_info_900,

  color_info_transparent_100,
  color_info_transparent_200,
  color_info_transparent_300,
  color_info_transparent_400,
  color_info_transparent_500,
  color_info_transparent_600,

  color_warning_100,
  color_warning_200,
  color_warning_300,
  color_warning_400,
  color_warning_500,
  color_warning_600,
  color_warning_700,
  color_warning_800,
  color_warning_900,

  color_warning_transparent_100,
  color_warning_transparent_200,
  color_warning_transparent_300,
  color_warning_transparent_400,
  color_warning_transparent_500,
  color_warning_transparent_600,

  color_danger_100,
  color_danger_200,
  color_danger_300,
  color_danger_400,
  color_danger_500,
  color_danger_600,
  color_danger_700,
  color_danger_800,
  color_danger_900,

  color_danger_transparent_100,
  color_danger_transparent_200,
  color_danger_transparent_300,
  color_danger_transparent_400,
  color_danger_transparent_500,
  color_danger_transparent_600,

  color_basic_100,
  color_basic_200,
  color_basic_300,
  color_basic_400,
  color_basic_500,
  color_basic_600,
  color_basic_700,
  color_basic_800,
  color_basic_900,
  color_basic_1000,
  color_basic_1100,

  color_basic_transparent_100,
  color_basic_transparent_200,
  color_basic_transparent_300,
  color_basic_transparent_400,
  color_basic_transparent_500,
  color_basic_transparent_600,

  color_basic_control_transparent_100,
  color_basic_control_transparent_200,
  color_basic_control_transparent_300,
  color_basic_control_transparent_400,
  color_basic_control_transparent_500,
  color_basic_control_transparent_600,

  color_basic_focus,
  color_basic_hover,
  color_basic_default,
  color_basic_active,
  color_basic_disabled,
  color_basic_focus_border,
  color_basic_hover_border,
  color_basic_default_border,
  color_basic_active_border,
  color_basic_disabled_border,

  color_basic_transparent_focus,
  color_basic_transparent_hover,
  color_basic_transparent_default,
  color_basic_transparent_active,
  color_basic_transparent_disabled,
  color_basic_transparent_focus_border,
  color_basic_transparent_hover_border,
  color_basic_transparent_default_border,
  color_basic_transparent_active_border,
  color_basic_transparent_disabled_border,

  color_primary_focus,
  color_primary_hover,
  color_primary_default,
  color_primary_active,
  color_primary_disabled,
  color_primary_focus_border,
  color_primary_hover_border,
  color_primary_default_border,
  color_primary_active_border,
  color_primary_disabled_border,

  color_primary_transparent_focus,
  color_primary_transparent_hover,
  color_primary_transparent_default,
  color_primary_transparent_active,
  color_primary_transparent_disabled,
  color_primary_transparent_focus_border,
  color_primary_transparent_hover_border,
  color_primary_transparent_default_border,
  color_primary_transparent_active_border,
  color_primary_transparent_disabled_border,

  color_success_focus,
  color_success_hover,
  color_success_default,
  color_success_active,
  color_success_disabled,
  color_success_focus_border,
  color_success_hover_border,
  color_success_default_border,
  color_success_active_border,
  color_success_disabled_border,

  color_success_transparent_focus,
  color_success_transparent_focus_border,
  color_success_transparent_hover,
  color_success_transparent_hover_border,
  color_success_transparent_default,
  color_success_transparent_default_border,
  color_success_transparent_active,
  color_success_transparent_active_border,
  color_success_transparent_disabled,
  color_success_transparent_disabled_border,

  color_info_focus,
  color_info_hover,
  color_info_default,
  color_info_active,
  color_info_disabled,
  color_info_focus_border,
  color_info_hover_border,
  color_info_default_border,
  color_info_active_border,
  color_info_disabled_border,

  color_info_transparent_focus,
  color_info_transparent_hover,
  color_info_transparent_default,
  color_info_transparent_active,
  color_info_transparent_disabled,
  color_info_transparent_focus_border,
  color_info_transparent_hover_border,
  color_info_transparent_default_border,
  color_info_transparent_active_border,
  color_info_transparent_disabled_border,

  color_warning_focus,
  color_warning_hover,
  color_warning_default,
  color_warning_active,
  color_warning_disabled,
  color_warning_focus_border,
  color_warning_hover_border,
  color_warning_default_border,
  color_warning_active_border,
  color_warning_disabled_border,

  color_warning_transparent_focus,
  color_warning_transparent_hover,
  color_warning_transparent_default,
  color_warning_transparent_active,
  color_warning_transparent_disabled,
  color_warning_transparent_focus_border,
  color_warning_transparent_hover_border,
  color_warning_transparent_default_border,
  color_warning_transparent_active_border,
  color_warning_transparent_disabled_border,

  color_danger_focus,
  color_danger_hover,
  color_danger_default,
  color_danger_active,
  color_danger_disabled,
  color_danger_focus_border,
  color_danger_hover_border,
  color_danger_default_border,
  color_danger_active_border,
  color_danger_disabled_border,

  color_danger_transparent_focus,
  color_danger_transparent_hover,
  color_danger_transparent_default,
  color_danger_transparent_active,
  color_danger_transparent_disabled,
  color_danger_transparent_focus_border,
  color_danger_transparent_hover_border,
  color_danger_transparent_default_border,
  color_danger_transparent_active_border,
  color_danger_transparent_disabled_border,

  color_control_focus,
  color_control_hover,
  color_control_default,
  color_control_active,
  color_control_disabled,
  color_control_focus_border,
  color_control_hover_border,
  color_control_default_border,
  color_control_active_border,
  color_control_disabled_border,

  color_control_transparent_focus,
  color_control_transparent_hover,
  color_control_transparent_default,
  color_control_transparent_active,
  color_control_transparent_disabled,
  color_control_transparent_focus_border,
  color_control_transparent_hover_border,
  color_control_transparent_default_border,
  color_control_transparent_active_border,
  color_control_transparent_disabled_border,

  background_basic_color_1,
  background_basic_color_2,
  background_basic_color_3,
  background_basic_color_4,

  border_basic_color_1,
  border_basic_color_2,
  border_basic_color_3,
  border_basic_color_4,
  border_basic_color_5,

  background_alternative_color_1,
  background_alternative_color_2,
  background_alternative_color_3,
  background_alternative_color_4,

  border_alternative_color_1,
  border_alternative_color_2,
  border_alternative_color_3,
  border_alternative_color_4,
  border_alternative_color_5,

  background_primary_color_1,
  background_primary_color_2,
  background_primary_color_3,
  background_primary_color_4,

  border_primary_color_1,
  border_primary_color_2,
  border_primary_color_3,
  border_primary_color_4,
  border_primary_color_5,

  text_basic_color,
  text_alternate_color,
  text_control_color,
  text_disabled_color,
  text_hint_color,

  text_primary_color,
  text_primary_focus_color,
  text_primary_hover_color,
  text_primary_active_color,
  text_primary_disabled_color,

  text_success_color,
  text_success_focus_color,
  text_success_hover_color,
  text_success_active_color,
  text_success_disabled_color,

  text_info_color,
  text_info_focus_color,
  text_info_hover_color,
  text_info_active_color,
  text_info_disabled_color,

  text_warning_color,
  text_warning_focus_color,
  text_warning_hover_color,
  text_warning_active_color,
  text_warning_disabled_color,

  text_danger_color,
  text_danger_focus_color,
  text_danger_hover_color,
  text_danger_active_color,
  text_danger_disabled_color,

  font_family_primary,
  font_family_secondary,

  text_heading_1_font_family,
  text_heading_1_font_size,
  text_heading_1_font_weight,
  text_heading_1_line_height,

  text_heading_2_font_family,
  text_heading_2_font_size,
  text_heading_2_font_weight,
  text_heading_2_line_height,

  text_heading_3_font_family,
  text_heading_3_font_size,
  text_heading_3_font_weight,
  text_heading_3_line_height,

  text_heading_4_font_family,
  text_heading_4_font_size,
  text_heading_4_font_weight,
  text_heading_4_line_height,

  text_heading_5_font_family,
  text_heading_5_font_size,
  text_heading_5_font_weight,
  text_heading_5_line_height,

  text_heading_6_font_family,
  text_heading_6_font_size,
  text_heading_6_font_weight,
  text_heading_6_line_height,

  text_subtitle_font_family,
  text_subtitle_font_size,
  text_subtitle_font_weight,
  text_subtitle_line_height,

  text_subtitle_2_font_family,
  text_subtitle_2_font_size,
  text_subtitle_2_font_weight,
  text_subtitle_2_line_height,

  text_paragraph_font_family,
  text_paragraph_font_size,
  text_paragraph_font_weight,
  text_paragraph_line_height,

  text_paragraph_2_font_family,
  text_paragraph_2_font_size,
  text_paragraph_2_font_weight,
  text_paragraph_2_line_height,

  text_label_font_family,
  text_label_font_size,
  text_label_font_weight,
  text_label_line_height,

  text_caption_font_family,
  text_caption_font_size,
  text_caption_font_weight,
  text_caption_line_height,

  text_caption_2_font_family,
  text_caption_2_font_size,
  text_caption_2_font_weight,
  text_caption_2_line_height,

  text_button_font_family,
  text_button_font_weight,
  text_button_tiny_font_size,
  text_button_tiny_line_height,
  text_button_small_font_size,
  text_button_small_line_height,
  text_button_medium_font_size,
  text_button_medium_line_height,
  text_button_large_font_size,
  text_button_large_line_height,
  text_button_giant_font_size,
  text_button_giant_line_height,

  border_radius,

  outline_width,
  outline_color,

  scrollbar_color,
  scrollbar_background_color,
  scrollbar_width,

  shadow,

  divider_color,
  divider_style,
  divider_width,

  link_text_color,
  link_text_decoration,
  link_text_focus_color,
  link_text_hover_color,

  card_background_color,
  card_text_color,
  card_text_font_family,
  card_text_font_size,
  card_text_font_weight,
  card_text_line_height,
  card_border_width,
  card_border_style,
  card_border_color,
  card_border_radius,
  card_padding,
  card_shadow,
  card_divider_color,
  card_divider_style,
  card_divider_width,

  card_header_text_color,
  card_header_text_font_family,
  card_header_text_font_size,
  card_header_text_font_weight,
  card_header_text_line_height,

  card_header_basic_background_color,
  card_header_basic_text_color,
  card_header_primary_background_color,
  card_header_primary_text_color,
  card_header_info_background_color,
  card_header_info_text_color,
  card_header_success_background_color,
  card_header_success_text_color,
  card_header_warning_background_color,
  card_header_warning_text_color,
  card_header_danger_background_color,
  card_header_danger_text_color,
  card_header_control_background_color,
  card_header_control_text_color,

  card_height_tiny,
  card_height_small,
  card_height_medium,
  card_height_large,
  card_height_giant,
  card_margin_bottom,

  card_scrollbar_color,
  card_scrollbar_background_color,
  card_scrollbar_width,

  header_background_color,
  header_text_color,
  header_text_font_family,
  header_text_font_size,
  header_text_font_weight,
  header_text_line_height,
  header_height,
  header_padding,
  header_shadow,

  footer_background_color,
  footer_text_color,
  footer_text_font_family,
  footer_text_font_size,
  footer_text_font_weight,
  footer_text_line_height,
  footer_text_highlight_color,
  footer_height,
  footer_padding,
  footer_divider_color,
  footer_divider_style,
  footer_divider_width,
  footer_shadow,

  layout_background_color,
  layout_text_color,
  layout_text_font_family,
  layout_text_font_size,
  layout_text_font_weight,
  layout_text_line_height,
  layout_min_height,
  layout_content_width,
  layout_window_mode_min_width,
  layout_window_mode_max_width,
  layout_window_mode_background_color,
  layout_window_mode_padding_top,
  layout_window_shadow,
  layout_padding,
  layout_medium_padding,
  layout_small_padding,
  layout_scrollbar_background_color,
  layout_scrollbar_color,
  layout_scrollbar_width,

  sidebar_background_color,
  sidebar_text_color,
  sidebar_text_font_family,
  sidebar_text_font_size,
  sidebar_text_font_weight,
  sidebar_text_line_height,
  sidebar_height,
  sidebar_width,
  sidebar_width_compact,
  sidebar_padding,
  sidebar_header_height,
  sidebar_footer_height,
  sidebar_shadow,
  sidebar_menu_item_highlight_color,
  sidebar_scrollbar_background_color,
  sidebar_scrollbar_color,
  sidebar_scrollbar_width,

  menu_background_color,
  menu_text_color,
  menu_text_font_family,
  menu_text_font_size,
  menu_text_font_weight,
  menu_text_line_height,

  menu_group_text_color,

  menu_item_border_radius,
  menu_item_padding,

  menu_item_hover_background_color,
  menu_item_hover_cursor,
  menu_item_hover_text_color,
  menu_item_icon_hover_color,

  menu_item_active_background_color,
  menu_item_active_text_color,
  menu_item_icon_active_color,

  menu_item_icon_color,
  menu_item_icon_margin,
  menu_item_icon_width,

  menu_item_divider_color,
  menu_item_divider_style,
  menu_item_divider_width,

  menu_submenu_background_color,
  menu_submenu_text_color,
  menu_submenu_margin,
  menu_submenu_padding,

  menu_submenu_item_border_color,
  menu_submenu_item_border_style,
  menu_submenu_item_border_width,
  menu_submenu_item_border_radius,
  menu_submenu_item_padding,

  menu_submenu_item_hover_background_color,
  menu_submenu_item_hover_border_color,
  menu_submenu_item_hover_text_color,
  menu_submenu_item_icon_hover_color,

  menu_submenu_item_active_background_color,
  menu_submenu_item_active_border_color,
  menu_submenu_item_active_text_color,
  menu_submenu_item_icon_active_color,

  menu_submenu_item_active_hover_background_color,
  menu_submenu_item_active_hover_border_color,
  menu_submenu_item_active_hover_text_color,
  menu_submenu_item_icon_active_hover_color,

  tabset_background_color,
  tabset_border_radius,
  tabset_shadow,

  tabset_tab_background_color,
  tabset_tab_padding,
  tabset_tab_text_color,
  tabset_tab_text_font_family,
  tabset_tab_text_font_size,
  tabset_tab_text_font_weight,
  tabset_tab_text_line_height,
  tabset_tab_text_transform,
  tabset_tab_underline_width,
  tabset_tab_underline_color,
  tabset_tab_active_background_color,
  tabset_tab_active_text_color,
  tabset_tab_active_underline_color,
  tabset_tab_focus_background_color,
  tabset_tab_focus_text_color,
  tabset_tab_focus_underline_color,
  tabset_tab_hover_background_color,
  tabset_tab_hover_text_color,
  tabset_tab_hover_underline_color,
  tabset_tab_disabled_background_color,
  tabset_tab_disabled_text_color,
  tabset_tab_disabled_underline_color,
  tabset_tab_badge_dot_mode_horizontal_offset,
  tabset_tab_badge_dot_mode_padding,

  tabset_divider_color,
  tabset_divider_style,
  tabset_divider_width,

  tabset_content_background_color,
  tabset_content_padding,
  tabset_content_text_color,
  tabset_content_text_font_family,
  tabset_content_text_font_size,
  tabset_content_text_font_weight,
  tabset_content_text_line_height,

  tabset_scrollbar_color,
  tabset_scrollbar_background_color,
  tabset_scrollbar_width,
  tabset_tab_text_hide_breakpoint,

  route_tabset_background_color,
  route_tabset_border_radius,
  route_tabset_shadow,

  route_tabset_tab_background_color,
  route_tabset_tab_padding,
  route_tabset_tab_text_color,
  route_tabset_tab_text_font_family,
  route_tabset_tab_text_font_size,
  route_tabset_tab_text_font_weight,
  route_tabset_tab_text_line_height,
  route_tabset_tab_text_transform,
  route_tabset_tab_underline_width,
  route_tabset_tab_underline_color,

  route_tabset_tab_active_background_color,
  route_tabset_tab_active_text_color,
  route_tabset_tab_active_underline_color,

  route_tabset_tab_focus_background_color,
  route_tabset_tab_focus_text_color,
  route_tabset_tab_focus_underline_color,

  route_tabset_tab_hover_background_color,
  route_tabset_tab_hover_text_color,
  route_tabset_tab_hover_underline_color,

  route_tabset_tab_disabled_background_color,
  route_tabset_tab_disabled_text_color,
  route_tabset_tab_disabled_underline_color,

  route_tabset_divider_color,
  route_tabset_divider_style,
  route_tabset_divider_width,

  route_tabset_scrollbar_color,
  route_tabset_scrollbar_background_color,
  route_tabset_scrollbar_width,
  route_tabset_tab_text_hide_breakpoint,

  user_picture_box_background_color,
  user_picture_box_border_color,
  user_picture_box_border_width,
  user_initials_text_color,
  user_initials_text_font_family,
  user_initials_text_font_weight,
  user_name_text_color,
  user_name_text_font_family,
  user_name_text_font_weight,
  user_title_text_color,
  user_title_text_font_family,
  user_title_text_font_weight,

  user_rectangle_border_radius,
  user_semi_round_border_radius,
  user_round_border_radius,

  user_tiny_height,
  user_tiny_width,
  user_tiny_initials_text_font_size,
  user_tiny_initials_text_line_height,
  user_tiny_name_text_font_size,
  user_tiny_name_text_line_height,
  user_tiny_title_text_font_size,
  user_tiny_title_text_line_height,

  user_small_height,
  user_small_width,
  user_small_initials_text_font_size,
  user_small_initials_text_line_height,
  user_small_name_text_font_size,
  user_small_name_text_line_height,
  user_small_title_text_font_size,
  user_small_title_text_line_height,

  user_medium_height,
  user_medium_width,
  user_medium_initials_text_font_size,
  user_medium_initials_text_line_height,
  user_medium_name_text_font_size,
  user_medium_name_text_line_height,
  user_medium_title_text_font_size,
  user_medium_title_text_line_height,

  user_large_height,
  user_large_width,
  user_large_initials_text_font_size,
  user_large_initials_text_line_height,
  user_large_name_text_font_size,
  user_large_name_text_line_height,
  user_large_title_text_font_size,
  user_large_title_text_line_height,

  user_giant_height,
  user_giant_width,
  user_giant_initials_text_font_size,
  user_giant_initials_text_line_height,
  user_giant_name_text_font_size,
  user_giant_name_text_line_height,
  user_giant_title_text_font_size,
  user_giant_title_text_line_height,

  popover_text_color,
  popover_text_font_family,
  popover_text_font_size,
  popover_text_font_weight,
  popover_text_line_height,
  popover_background_color,
  popover_border_width,
  popover_border_color,
  popover_border_radius,
  popover_shadow,
  popover_arrow_size,
  popover_padding,

  context_menu_background_color,
  context_menu_border_color,
  context_menu_border_style,
  context_menu_border_width,
  context_menu_border_radius,
  context_menu_text_align,
  context_menu_min_width,
  context_menu_max_width,
  context_menu_shadow,

  actions_background_color,
  actions_divider_color,
  actions_divider_style,
  actions_divider_width,
  actions_icon_color,
  actions_text_color,
  actions_text_font_family,
  actions_text_font_weight,
  actions_text_line_height,

  actions_disabled_icon_color,
  actions_disabled_text_color,

  actions_tiny_height,
  actions_tiny_icon_height,
  actions_tiny_padding,
  actions_tiny_text_font_size,
  actions_small_height,
  actions_small_icon_height,
  actions_small_padding,
  actions_small_text_font_size,
  actions_medium_height,
  actions_medium_icon_height,
  actions_medium_padding,
  actions_medium_text_font_size,
  actions_large_height,
  actions_large_icon_height,
  actions_large_padding,
  actions_large_text_font_size,
  actions_giant_height,
  actions_giant_icon_height,
  actions_giant_padding,
  actions_giant_text_font_size,

  search_background_color,
  search_divider_color,
  search_divider_style,
  search_divider_width,
  search_extra_background_color,
  search_text_color,
  search_text_font_family,
  search_text_font_size,
  search_text_font_weight,
  search_text_line_height,
  search_placeholder_text_color,
  search_info_text_color,
  search_info_text_font_family,
  search_info_text_font_size,
  search_info_text_font_weight,
  search_info_text_line_height,

  toastr_border_style,
  toastr_border_width,
  toastr_border_radius,
  toastr_padding,
  toastr_shadow,

  toastr_text_font_family,
  toastr_text_font_size,
  toastr_text_font_weight,
  toastr_text_line_height,
  toastr_title_text_font_family,
  toastr_title_text_font_size,
  toastr_title_text_font_weight,
  toastr_title_text_line_height,

  toastr_basic_background_color,
  toastr_basic_border_color,
  toastr_basic_text_color,
  toastr_icon_basic_background_color,
  toastr_icon_basic_color,
  toastr_destroyable_basic_hover_background_color,
  toastr_destroyable_basic_hover_border_color,

  toastr_primary_background_color,
  toastr_primary_border_color,
  toastr_primary_text_color,
  toastr_icon_primary_background_color,
  toastr_icon_primary_color,
  toastr_destroyable_primary_hover_background_color,
  toastr_destroyable_primary_hover_border_color,

  toastr_success_background_color,
  toastr_success_border_color,
  toastr_success_text_color,
  toastr_icon_success_background_color,
  toastr_icon_success_color,
  toastr_destroyable_success_hover_background_color,
  toastr_destroyable_success_hover_border_color,

  toastr_info_background_color,
  toastr_info_border_color,
  toastr_info_text_color,
  toastr_icon_info_background_color,
  toastr_icon_info_color,
  toastr_destroyable_info_hover_background_color,
  toastr_destroyable_info_hover_border_color,

  toastr_warning_background_color,
  toastr_warning_border_color,
  toastr_warning_text_color,
  toastr_icon_warning_background_color,
  toastr_icon_warning_color,
  toastr_destroyable_warning_hover_background_color,
  toastr_destroyable_warning_hover_border_color,

  toastr_danger_background_color,
  toastr_danger_border_color,
  toastr_danger_text_color,
  toastr_icon_danger_background_color,
  toastr_icon_danger_color,
  toastr_destroyable_danger_hover_background_color,
  toastr_destroyable_danger_hover_border_color,

  toastr_control_background_color,
  toastr_control_border_color,
  toastr_control_text_color,
  toastr_icon_control_background_color,
  toastr_icon_control_color,
  toastr_destroyable_control_hover_background_color,
  toastr_destroyable_control_hover_border_color,

  button_cursor,
  button_outline_width,
  button_outline_color,
  button_text_font_family,
  button_text_font_weight,
  button_disabled_cursor,

  button_tiny_text_font_size,
  button_tiny_text_line_height,
  button_tiny_icon_size,
  button_tiny_icon_vertical_margin,
  button_tiny_icon_offset,

  button_small_text_font_size,
  button_small_text_line_height,
  button_small_icon_size,
  button_small_icon_vertical_margin,
  button_small_icon_offset,

  button_medium_text_font_size,
  button_medium_text_line_height,
  button_medium_icon_size,
  button_medium_icon_vertical_margin,
  button_medium_icon_offset,

  button_large_text_font_size,
  button_large_text_line_height,
  button_large_icon_size,
  button_large_icon_vertical_margin,
  button_large_icon_offset,

  button_giant_text_font_size,
  button_giant_text_line_height,
  button_giant_icon_size,
  button_giant_icon_vertical_margin,
  button_giant_icon_offset,

  button_rectangle_border_radius,
  button_semi_round_border_radius,
  button_round_border_radius,

  button_filled_border_style,
  button_filled_border_width,
  button_filled_text_transform,

  button_filled_tiny_padding,
  button_filled_small_padding,
  button_filled_medium_padding,
  button_filled_large_padding,
  button_filled_giant_padding,

  button_filled_basic_background_color,
  button_filled_basic_border_color,
  button_filled_basic_text_color,
  button_filled_basic_focus_background_color,
  button_filled_basic_focus_border_color,
  button_filled_basic_hover_background_color,
  button_filled_basic_hover_border_color,
  button_filled_basic_active_background_color,
  button_filled_basic_active_border_color,
  button_filled_basic_disabled_background_color,
  button_filled_basic_disabled_border_color,
  button_filled_basic_disabled_text_color,

  button_filled_primary_background_color,
  button_filled_primary_border_color,
  button_filled_primary_text_color,
  button_filled_primary_focus_background_color,
  button_filled_primary_focus_border_color,
  button_filled_primary_hover_background_color,
  button_filled_primary_hover_border_color,
  button_filled_primary_active_background_color,
  button_filled_primary_active_border_color,
  button_filled_primary_disabled_background_color,
  button_filled_primary_disabled_border_color,
  button_filled_primary_disabled_text_color,

  button_filled_success_background_color,
  button_filled_success_border_color,
  button_filled_success_text_color,
  button_filled_success_focus_background_color,
  button_filled_success_focus_border_color,
  button_filled_success_hover_background_color,
  button_filled_success_hover_border_color,
  button_filled_success_active_background_color,
  button_filled_success_active_border_color,
  button_filled_success_disabled_background_color,
  button_filled_success_disabled_border_color,
  button_filled_success_disabled_text_color,

  button_filled_info_background_color,
  button_filled_info_border_color,
  button_filled_info_text_color,
  button_filled_info_focus_background_color,
  button_filled_info_focus_border_color,
  button_filled_info_hover_background_color,
  button_filled_info_hover_border_color,
  button_filled_info_active_background_color,
  button_filled_info_active_border_color,
  button_filled_info_disabled_background_color,
  button_filled_info_disabled_border_color,
  button_filled_info_disabled_text_color,

  button_filled_warning_background_color,
  button_filled_warning_border_color,
  button_filled_warning_text_color,
  button_filled_warning_focus_background_color,
  button_filled_warning_focus_border_color,
  button_filled_warning_hover_background_color,
  button_filled_warning_hover_border_color,
  button_filled_warning_active_background_color,
  button_filled_warning_active_border_color,
  button_filled_warning_disabled_background_color,
  button_filled_warning_disabled_border_color,
  button_filled_warning_disabled_text_color,

  button_filled_danger_background_color,
  button_filled_danger_border_color,
  button_filled_danger_text_color,
  button_filled_danger_focus_background_color,
  button_filled_danger_focus_border_color,
  button_filled_danger_hover_background_color,
  button_filled_danger_hover_border_color,
  button_filled_danger_active_background_color,
  button_filled_danger_active_border_color,
  button_filled_danger_disabled_background_color,
  button_filled_danger_disabled_border_color,
  button_filled_danger_disabled_text_color,

  button_filled_control_background_color,
  button_filled_control_border_color,
  button_filled_control_text_color,
  button_filled_control_focus_background_color,
  button_filled_control_focus_border_color,
  button_filled_control_hover_background_color,
  button_filled_control_hover_border_color,
  button_filled_control_active_background_color,
  button_filled_control_active_border_color,
  button_filled_control_disabled_background_color,
  button_filled_control_disabled_border_color,
  button_filled_control_disabled_text_color,

  button_outline_border_style,
  button_outline_border_width,
  button_outline_text_transform,
  button_outline_focus_inset_shadow_length,

  button_outline_tiny_padding,
  button_outline_small_padding,
  button_outline_medium_padding,
  button_outline_large_padding,
  button_outline_giant_padding,

  button_outline_basic_background_color,
  button_outline_basic_border_color,
  button_outline_basic_text_color,
  button_outline_basic_focus_background_color,
  button_outline_basic_focus_border_color,
  button_outline_basic_focus_text_color,
  button_outline_basic_hover_background_color,
  button_outline_basic_hover_border_color,
  button_outline_basic_hover_text_color,
  button_outline_basic_active_background_color,
  button_outline_basic_active_border_color,
  button_outline_basic_active_text_color,
  button_outline_basic_disabled_background_color,
  button_outline_basic_disabled_border_color,
  button_outline_basic_disabled_text_color,

  button_outline_primary_background_color,
  button_outline_primary_border_color,
  button_outline_primary_text_color,
  button_outline_primary_focus_background_color,
  button_outline_primary_focus_border_color,
  button_outline_primary_focus_text_color,
  button_outline_primary_hover_background_color,
  button_outline_primary_hover_border_color,
  button_outline_primary_hover_text_color,
  button_outline_primary_active_background_color,
  button_outline_primary_active_border_color,
  button_outline_primary_active_text_color,
  button_outline_primary_disabled_background_color,
  button_outline_primary_disabled_border_color,
  button_outline_primary_disabled_text_color,

  button_outline_success_background_color,
  button_outline_success_border_color,
  button_outline_success_text_color,
  button_outline_success_focus_background_color,
  button_outline_success_focus_border_color,
  button_outline_success_focus_text_color,
  button_outline_success_hover_background_color,
  button_outline_success_hover_border_color,
  button_outline_success_hover_text_color,
  button_outline_success_active_background_color,
  button_outline_success_active_border_color,
  button_outline_success_active_text_color,
  button_outline_success_disabled_background_color,
  button_outline_success_disabled_border_color,
  button_outline_success_disabled_text_color,

  button_outline_info_background_color,
  button_outline_info_border_color,
  button_outline_info_text_color,
  button_outline_info_focus_background_color,
  button_outline_info_focus_border_color,
  button_outline_info_focus_text_color,
  button_outline_info_hover_background_color,
  button_outline_info_hover_border_color,
  button_outline_info_hover_text_color,
  button_outline_info_active_background_color,
  button_outline_info_active_border_color,
  button_outline_info_active_text_color,
  button_outline_info_disabled_background_color,
  button_outline_info_disabled_border_color,
  button_outline_info_disabled_text_color,

  button_outline_warning_background_color,
  button_outline_warning_border_color,
  button_outline_warning_text_color,
  button_outline_warning_focus_background_color,
  button_outline_warning_focus_border_color,
  button_outline_warning_focus_text_color,
  button_outline_warning_hover_background_color,
  button_outline_warning_hover_border_color,
  button_outline_warning_hover_text_color,
  button_outline_warning_active_background_color,
  button_outline_warning_active_border_color,
  button_outline_warning_active_text_color,
  button_outline_warning_disabled_background_color,
  button_outline_warning_disabled_border_color,
  button_outline_warning_disabled_text_color,

  button_outline_danger_background_color,
  button_outline_danger_border_color,
  button_outline_danger_text_color,
  button_outline_danger_focus_background_color,
  button_outline_danger_focus_border_color,
  button_outline_danger_focus_text_color,
  button_outline_danger_hover_background_color,
  button_outline_danger_hover_border_color,
  button_outline_danger_hover_text_color,
  button_outline_danger_active_background_color,
  button_outline_danger_active_border_color,
  button_outline_danger_active_text_color,
  button_outline_danger_disabled_background_color,
  button_outline_danger_disabled_border_color,
  button_outline_danger_disabled_text_color,

  button_outline_control_background_color,
  button_outline_control_border_color,
  button_outline_control_text_color,
  button_outline_control_focus_background_color,
  button_outline_control_focus_border_color,
  button_outline_control_focus_text_color,
  button_outline_control_hover_background_color,
  button_outline_control_hover_border_color,
  button_outline_control_hover_text_color,
  button_outline_control_active_background_color,
  button_outline_control_active_border_color,
  button_outline_control_active_text_color,
  button_outline_control_disabled_background_color,
  button_outline_control_disabled_border_color,
  button_outline_control_disabled_text_color,

  button_ghost_background_color,
  button_ghost_border_color,
  button_ghost_border_style,
  button_ghost_border_width,
  button_ghost_text_transform,
  button_ghost_focus_inset_shadow_length,

  button_ghost_tiny_padding,
  button_ghost_small_padding,
  button_ghost_medium_padding,
  button_ghost_large_padding,
  button_ghost_giant_padding,

  button_ghost_basic_text_color,
  button_ghost_basic_focus_background_color,
  button_ghost_basic_focus_border_color,
  button_ghost_basic_focus_text_color,
  button_ghost_basic_hover_background_color,
  button_ghost_basic_hover_border_color,
  button_ghost_basic_hover_text_color,
  button_ghost_basic_active_background_color,
  button_ghost_basic_active_border_color,
  button_ghost_basic_active_text_color,
  button_ghost_basic_disabled_background_color,
  button_ghost_basic_disabled_border_color,
  button_ghost_basic_disabled_text_color,

  button_ghost_primary_text_color,
  button_ghost_primary_focus_background_color,
  button_ghost_primary_focus_border_color,
  button_ghost_primary_focus_text_color,
  button_ghost_primary_hover_background_color,
  button_ghost_primary_hover_border_color,
  button_ghost_primary_hover_text_color,
  button_ghost_primary_active_background_color,
  button_ghost_primary_active_border_color,
  button_ghost_primary_active_text_color,
  button_ghost_primary_disabled_background_color,
  button_ghost_primary_disabled_border_color,
  button_ghost_primary_disabled_text_color,

  button_ghost_success_text_color,
  button_ghost_success_focus_background_color,
  button_ghost_success_focus_border_color,
  button_ghost_success_focus_text_color,
  button_ghost_success_hover_background_color,
  button_ghost_success_hover_border_color,
  button_ghost_success_hover_text_color,
  button_ghost_success_active_background_color,
  button_ghost_success_active_border_color,
  button_ghost_success_active_text_color,
  button_ghost_success_disabled_background_color,
  button_ghost_success_disabled_border_color,
  button_ghost_success_disabled_text_color,

  button_ghost_info_text_color,
  button_ghost_info_focus_background_color,
  button_ghost_info_focus_border_color,
  button_ghost_info_focus_text_color,
  button_ghost_info_hover_background_color,
  button_ghost_info_hover_border_color,
  button_ghost_info_hover_text_color,
  button_ghost_info_active_background_color,
  button_ghost_info_active_border_color,
  button_ghost_info_active_text_color,
  button_ghost_info_disabled_background_color,
  button_ghost_info_disabled_border_color,
  button_ghost_info_disabled_text_color,

  button_ghost_warning_text_color,
  button_ghost_warning_focus_background_color,
  button_ghost_warning_focus_border_color,
  button_ghost_warning_focus_text_color,
  button_ghost_warning_hover_background_color,
  button_ghost_warning_hover_border_color,
  button_ghost_warning_hover_text_color,
  button_ghost_warning_active_background_color,
  button_ghost_warning_active_border_color,
  button_ghost_warning_active_text_color,
  button_ghost_warning_disabled_background_color,
  button_ghost_warning_disabled_border_color,
  button_ghost_warning_disabled_text_color,

  button_ghost_danger_text_color,
  button_ghost_danger_focus_background_color,
  button_ghost_danger_focus_border_color,
  button_ghost_danger_focus_text_color,
  button_ghost_danger_hover_background_color,
  button_ghost_danger_hover_border_color,
  button_ghost_danger_hover_text_color,
  button_ghost_danger_active_background_color,
  button_ghost_danger_active_border_color,
  button_ghost_danger_active_text_color,
  button_ghost_danger_disabled_background_color,
  button_ghost_danger_disabled_border_color,
  button_ghost_danger_disabled_text_color,

  button_ghost_control_text_color,
  button_ghost_control_focus_background_color,
  button_ghost_control_focus_border_color,
  button_ghost_control_focus_text_color,
  button_ghost_control_hover_background_color,
  button_ghost_control_hover_border_color,
  button_ghost_control_hover_text_color,
  button_ghost_control_active_background_color,
  button_ghost_control_active_border_color,
  button_ghost_control_active_text_color,
  button_ghost_control_disabled_background_color,
  button_ghost_control_disabled_border_color,
  button_ghost_control_disabled_text_color,

  button_hero_border_color,
  button_hero_border_style,
  button_hero_border_width,
  button_hero_text_transform,

  button_hero_tiny_padding,
  button_hero_small_padding,
  button_hero_medium_padding,
  button_hero_large_padding,
  button_hero_giant_padding,

  button_hero_shadow,
  button_hero_text_shadow,
  button_hero_bevel_size,
  button_hero_glow_size,
  button_hero_outline_color,
  button_hero_outline_width,

  button_hero_basic_text_color,
  button_hero_basic_bevel_color,
  button_hero_basic_glow_color,
  button_hero_basic_left_background_color,
  button_hero_basic_right_background_color,
  button_hero_basic_focus_left_background_color,
  button_hero_basic_focus_right_background_color,
  button_hero_basic_hover_left_background_color,
  button_hero_basic_hover_right_background_color,
  button_hero_basic_active_left_background_color,
  button_hero_basic_active_right_background_color,
  button_hero_basic_disabled_background_color,
  button_hero_basic_disabled_text_color,

  button_hero_primary_text_color,
  button_hero_primary_bevel_color,
  button_hero_primary_glow_color,
  button_hero_primary_left_background_color,
  button_hero_primary_right_background_color,
  button_hero_primary_focus_left_background_color,
  button_hero_primary_focus_right_background_color,
  button_hero_primary_hover_left_background_color,
  button_hero_primary_hover_right_background_color,
  button_hero_primary_active_left_background_color,
  button_hero_primary_active_right_background_color,
  button_hero_primary_disabled_background_color,
  button_hero_primary_disabled_text_color,

  button_hero_success_text_color,
  button_hero_success_bevel_color,
  button_hero_success_glow_color,
  button_hero_success_left_background_color,
  button_hero_success_right_background_color,
  button_hero_success_focus_left_background_color,
  button_hero_success_focus_right_background_color,
  button_hero_success_hover_left_background_color,
  button_hero_success_hover_right_background_color,
  button_hero_success_active_left_background_color,
  button_hero_success_active_right_background_color,
  button_hero_success_disabled_background_color,
  button_hero_success_disabled_text_color,

  button_hero_info_text_color,
  button_hero_info_bevel_color,
  button_hero_info_glow_color,
  button_hero_info_left_background_color,
  button_hero_info_right_background_color,
  button_hero_info_focus_left_background_color,
  button_hero_info_focus_right_background_color,
  button_hero_info_hover_left_background_color,
  button_hero_info_hover_right_background_color,
  button_hero_info_active_left_background_color,
  button_hero_info_active_right_background_color,
  button_hero_info_disabled_background_color,
  button_hero_info_disabled_text_color,

  button_hero_warning_text_color,
  button_hero_warning_bevel_color,
  button_hero_warning_glow_color,
  button_hero_warning_left_background_color,
  button_hero_warning_right_background_color,
  button_hero_warning_focus_left_background_color,
  button_hero_warning_focus_right_background_color,
  button_hero_warning_hover_left_background_color,
  button_hero_warning_hover_right_background_color,
  button_hero_warning_active_left_background_color,
  button_hero_warning_active_right_background_color,
  button_hero_warning_disabled_background_color,
  button_hero_warning_disabled_text_color,

  button_hero_danger_text_color,
  button_hero_danger_bevel_color,
  button_hero_danger_glow_color,
  button_hero_danger_left_background_color,
  button_hero_danger_right_background_color,
  button_hero_danger_focus_left_background_color,
  button_hero_danger_focus_right_background_color,
  button_hero_danger_hover_left_background_color,
  button_hero_danger_hover_right_background_color,
  button_hero_danger_active_left_background_color,
  button_hero_danger_active_right_background_color,
  button_hero_danger_disabled_background_color,
  button_hero_danger_disabled_text_color,

  button_hero_control_text_color,
  button_hero_control_bevel_color,
  button_hero_control_glow_color,
  button_hero_control_left_background_color,
  button_hero_control_right_background_color,
  button_hero_control_focus_left_background_color,
  button_hero_control_focus_right_background_color,
  button_hero_control_hover_left_background_color,
  button_hero_control_hover_right_background_color,
  button_hero_control_active_left_background_color,
  button_hero_control_active_right_background_color,
  button_hero_control_disabled_background_color,
  button_hero_control_disabled_text_color,

  button_group_filled_button_basic_text_color,
  button_group_filled_button_primary_text_color,
  button_group_filled_button_success_text_color,
  button_group_filled_button_info_text_color,
  button_group_filled_button_warning_text_color,
  button_group_filled_button_danger_text_color,
  button_group_filled_button_control_text_color,

  button_group_filled_basic_divider_color,
  button_group_filled_primary_divider_color,
  button_group_filled_success_divider_color,
  button_group_filled_info_divider_color,
  button_group_filled_warning_divider_color,
  button_group_filled_danger_divider_color,
  button_group_filled_control_divider_color,

  button_group_ghost_divider_color,

  icon_button_filled_tiny_padding,
  icon_button_filled_small_padding,
  icon_button_filled_medium_padding,
  icon_button_filled_large_padding,
  icon_button_filled_giant_padding,

  icon_button_outline_tiny_padding,
  icon_button_outline_small_padding,
  icon_button_outline_medium_padding,
  icon_button_outline_large_padding,
  icon_button_outline_giant_padding,

  icon_button_ghost_tiny_padding,
  icon_button_ghost_small_padding,
  icon_button_ghost_medium_padding,
  icon_button_ghost_large_padding,
  icon_button_ghost_giant_padding,

  icon_button_hero_tiny_padding,
  icon_button_hero_small_padding,
  icon_button_hero_medium_padding,
  icon_button_hero_large_padding,
  icon_button_hero_giant_padding,

  input_border_style,
  input_border_width,
  input_outline_color,
  input_outline_width,
  input_placeholder_text_font_family,
  input_text_font_family,

  input_basic_text_color,
  input_basic_placeholder_text_color,
  input_basic_background_color,
  input_basic_border_color,
  input_basic_focus_background_color,
  input_basic_focus_border_color,
  input_basic_hover_background_color,
  input_basic_hover_border_color,
  input_basic_disabled_background_color,
  input_basic_disabled_border_color,
  input_basic_disabled_text_color,
  input_basic_disabled_placeholder_text_color,

  input_primary_text_color,
  input_primary_placeholder_text_color,
  input_primary_background_color,
  input_primary_border_color,
  input_primary_focus_background_color,
  input_primary_focus_border_color,
  input_primary_hover_background_color,
  input_primary_hover_border_color,
  input_primary_disabled_background_color,
  input_primary_disabled_border_color,
  input_primary_disabled_text_color,
  input_primary_disabled_placeholder_text_color,

  input_success_text_color,
  input_success_placeholder_text_color,
  input_success_background_color,
  input_success_border_color,
  input_success_focus_background_color,
  input_success_focus_border_color,
  input_success_hover_background_color,
  input_success_hover_border_color,
  input_success_disabled_background_color,
  input_success_disabled_border_color,
  input_success_disabled_text_color,
  input_success_disabled_placeholder_text_color,

  input_info_text_color,
  input_info_placeholder_text_color,
  input_info_background_color,
  input_info_border_color,
  input_info_focus_background_color,
  input_info_focus_border_color,
  input_info_hover_background_color,
  input_info_hover_border_color,
  input_info_disabled_background_color,
  input_info_disabled_border_color,
  input_info_disabled_text_color,
  input_info_disabled_placeholder_text_color,

  input_warning_text_color,
  input_warning_placeholder_text_color,
  input_warning_background_color,
  input_warning_border_color,
  input_warning_focus_background_color,
  input_warning_focus_border_color,
  input_warning_hover_background_color,
  input_warning_hover_border_color,
  input_warning_disabled_background_color,
  input_warning_disabled_border_color,
  input_warning_disabled_text_color,
  input_warning_disabled_placeholder_text_color,

  input_danger_text_color,
  input_danger_placeholder_text_color,
  input_danger_background_color,
  input_danger_border_color,
  input_danger_focus_background_color,
  input_danger_focus_border_color,
  input_danger_hover_background_color,
  input_danger_hover_border_color,
  input_danger_disabled_background_color,
  input_danger_disabled_border_color,
  input_danger_disabled_text_color,
  input_danger_disabled_placeholder_text_color,

  input_control_text_color,
  input_control_placeholder_text_color,
  input_control_background_color,
  input_control_border_color,
  input_control_focus_background_color,
  input_control_focus_border_color,
  input_control_hover_background_color,
  input_control_hover_border_color,
  input_control_disabled_background_color,
  input_control_disabled_border_color,
  input_control_disabled_text_color,
  input_control_disabled_placeholder_text_color,

  input_rectangle_border_radius,
  input_semi_round_border_radius,
  input_round_border_radius,

  input_tiny_text_font_size,
  input_tiny_text_font_weight,
  input_tiny_text_line_height,
  input_tiny_placeholder_text_font_size,
  input_tiny_placeholder_text_font_weight,
  input_tiny_placeholder_text_line_height,
  input_tiny_padding,
  input_tiny_max_width,

  input_small_text_font_size,
  input_small_text_font_weight,
  input_small_text_line_height,
  input_small_placeholder_text_font_size,
  input_small_placeholder_text_font_weight,
  input_small_placeholder_text_line_height,
  input_small_padding,
  input_small_max_width,

  input_medium_text_font_size,
  input_medium_text_font_weight,
  input_medium_text_line_height,
  input_medium_placeholder_text_font_size,
  input_medium_placeholder_text_font_weight,
  input_medium_placeholder_text_line_height,
  input_medium_padding,
  input_medium_max_width,

  input_large_text_font_size,
  input_large_text_font_weight,
  input_large_text_line_height,
  input_large_placeholder_text_font_size,
  input_large_placeholder_text_font_weight,
  input_large_placeholder_text_line_height,
  input_large_padding,
  input_large_max_width,

  input_giant_text_font_size,
  input_giant_text_font_weight,
  input_giant_text_line_height,
  input_giant_placeholder_text_font_size,
  input_giant_placeholder_text_font_weight,
  input_giant_placeholder_text_line_height,
  input_giant_padding,
  input_giant_max_width,

  checkbox_height,
  checkbox_width,
  checkbox_border_style,
  checkbox_border_width,
  checkbox_border_radius,
  checkbox_outline_width,
  checkbox_outline_color,
  checkbox_text_font_family,
  checkbox_text_font_size,
  checkbox_text_font_weight,
  checkbox_text_line_height,
  checkbox_text_space,
  checkbox_padding,
  checkbox_focus_inset_shadow_length,

  checkbox_basic_text_color,
  checkbox_basic_background_color,
  checkbox_basic_border_color,
  checkbox_basic_checked_background_color,
  checkbox_basic_checked_border_color,
  checkbox_basic_checked_checkmark_color,
  checkbox_basic_indeterminate_background_color,
  checkbox_basic_indeterminate_border_color,
  checkbox_basic_indeterminate_checkmark_color,
  checkbox_basic_focus_background_color,
  checkbox_basic_focus_border_color,
  checkbox_basic_focus_checked_background_color,
  checkbox_basic_focus_checked_border_color,
  checkbox_basic_hover_background_color,
  checkbox_basic_hover_border_color,
  checkbox_basic_hover_checked_background_color,
  checkbox_basic_hover_checked_border_color,
  checkbox_basic_active_background_color,
  checkbox_basic_active_border_color,
  checkbox_basic_active_checked_background_color,
  checkbox_basic_active_checked_border_color,
  checkbox_basic_disabled_background_color,
  checkbox_basic_disabled_border_color,
  checkbox_basic_disabled_checkmark_color,
  checkbox_basic_disabled_text_color,
  checkbox_basic_disabled_checked_background_color,
  checkbox_basic_disabled_checked_border_color,

  checkbox_primary_text_color,
  checkbox_primary_background_color,
  checkbox_primary_border_color,
  checkbox_primary_checked_background_color,
  checkbox_primary_checked_border_color,
  checkbox_primary_checked_checkmark_color,
  checkbox_primary_indeterminate_background_color,
  checkbox_primary_indeterminate_border_color,
  checkbox_primary_indeterminate_checkmark_color,
  checkbox_primary_focus_background_color,
  checkbox_primary_focus_border_color,
  checkbox_primary_focus_checked_background_color,
  checkbox_primary_focus_checked_border_color,
  checkbox_primary_hover_background_color,
  checkbox_primary_hover_border_color,
  checkbox_primary_hover_checked_background_color,
  checkbox_primary_hover_checked_border_color,
  checkbox_primary_active_background_color,
  checkbox_primary_active_border_color,
  checkbox_primary_active_checked_background_color,
  checkbox_primary_active_checked_border_color,
  checkbox_primary_disabled_background_color,
  checkbox_primary_disabled_border_color,
  checkbox_primary_disabled_checkmark_color,
  checkbox_primary_disabled_text_color,
  checkbox_primary_disabled_checked_background_color,
  checkbox_primary_disabled_checked_border_color,

  checkbox_success_text_color,
  checkbox_success_background_color,
  checkbox_success_border_color,
  checkbox_success_checked_background_color,
  checkbox_success_checked_border_color,
  checkbox_success_checked_checkmark_color,
  checkbox_success_indeterminate_background_color,
  checkbox_success_indeterminate_border_color,
  checkbox_success_indeterminate_checkmark_color,
  checkbox_success_focus_background_color,
  checkbox_success_focus_border_color,
  checkbox_success_focus_checked_background_color,
  checkbox_success_focus_checked_border_color,
  checkbox_success_hover_background_color,
  checkbox_success_hover_border_color,
  checkbox_success_hover_checked_background_color,
  checkbox_success_hover_checked_border_color,
  checkbox_success_active_background_color,
  checkbox_success_active_border_color,
  checkbox_success_active_checked_background_color,
  checkbox_success_active_checked_border_color,
  checkbox_success_disabled_background_color,
  checkbox_success_disabled_border_color,
  checkbox_success_disabled_checkmark_color,
  checkbox_success_disabled_text_color,
  checkbox_success_disabled_checked_background_color,
  checkbox_success_disabled_checked_border_color,

  checkbox_info_text_color,
  checkbox_info_background_color,
  checkbox_info_border_color,
  checkbox_info_checked_background_color,
  checkbox_info_checked_border_color,
  checkbox_info_checked_checkmark_color,
  checkbox_info_indeterminate_background_color,
  checkbox_info_indeterminate_border_color,
  checkbox_info_indeterminate_checkmark_color,
  checkbox_info_focus_background_color,
  checkbox_info_focus_border_color,
  checkbox_info_focus_checked_background_color,
  checkbox_info_focus_checked_border_color,
  checkbox_info_hover_background_color,
  checkbox_info_hover_border_color,
  checkbox_info_hover_checked_background_color,
  checkbox_info_hover_checked_border_color,
  checkbox_info_active_background_color,
  checkbox_info_active_border_color,
  checkbox_info_active_checked_background_color,
  checkbox_info_active_checked_border_color,
  checkbox_info_disabled_background_color,
  checkbox_info_disabled_border_color,
  checkbox_info_disabled_checkmark_color,
  checkbox_info_disabled_text_color,
  checkbox_info_disabled_checked_background_color,
  checkbox_info_disabled_checked_border_color,

  checkbox_warning_text_color,
  checkbox_warning_background_color,
  checkbox_warning_border_color,
  checkbox_warning_checked_background_color,
  checkbox_warning_checked_border_color,
  checkbox_warning_checked_checkmark_color,
  checkbox_warning_indeterminate_background_color,
  checkbox_warning_indeterminate_border_color,
  checkbox_warning_indeterminate_checkmark_color,
  checkbox_warning_focus_background_color,
  checkbox_warning_focus_border_color,
  checkbox_warning_focus_checked_background_color,
  checkbox_warning_focus_checked_border_color,
  checkbox_warning_hover_background_color,
  checkbox_warning_hover_border_color,
  checkbox_warning_hover_checked_background_color,
  checkbox_warning_hover_checked_border_color,
  checkbox_warning_active_background_color,
  checkbox_warning_active_border_color,
  checkbox_warning_active_checked_background_color,
  checkbox_warning_active_checked_border_color,
  checkbox_warning_disabled_background_color,
  checkbox_warning_disabled_border_color,
  checkbox_warning_disabled_checkmark_color,
  checkbox_warning_disabled_text_color,
  checkbox_warning_disabled_checked_background_color,
  checkbox_warning_disabled_checked_border_color,

  checkbox_danger_text_color,
  checkbox_danger_background_color,
  checkbox_danger_border_color,
  checkbox_danger_checked_background_color,
  checkbox_danger_checked_border_color,
  checkbox_danger_checked_checkmark_color,
  checkbox_danger_indeterminate_background_color,
  checkbox_danger_indeterminate_border_color,
  checkbox_danger_indeterminate_checkmark_color,
  checkbox_danger_focus_background_color,
  checkbox_danger_focus_border_color,
  checkbox_danger_focus_checked_background_color,
  checkbox_danger_focus_checked_border_color,
  checkbox_danger_hover_background_color,
  checkbox_danger_hover_border_color,
  checkbox_danger_hover_checked_background_color,
  checkbox_danger_hover_checked_border_color,
  checkbox_danger_active_background_color,
  checkbox_danger_active_border_color,
  checkbox_danger_active_checked_background_color,
  checkbox_danger_active_checked_border_color,
  checkbox_danger_disabled_background_color,
  checkbox_danger_disabled_border_color,
  checkbox_danger_disabled_checkmark_color,
  checkbox_danger_disabled_text_color,
  checkbox_danger_disabled_checked_background_color,
  checkbox_danger_disabled_checked_border_color,

  checkbox_control_text_color,
  checkbox_control_background_color,
  checkbox_control_border_color,
  checkbox_control_checked_background_color,
  checkbox_control_checked_border_color,
  checkbox_control_checked_checkmark_color,
  checkbox_control_indeterminate_background_color,
  checkbox_control_indeterminate_border_color,
  checkbox_control_indeterminate_checkmark_color,
  checkbox_control_focus_background_color,
  checkbox_control_focus_border_color,
  checkbox_control_focus_checked_background_color,
  checkbox_control_focus_checked_border_color,
  checkbox_control_hover_background_color,
  checkbox_control_hover_border_color,
  checkbox_control_hover_checked_background_color,
  checkbox_control_hover_checked_border_color,
  checkbox_control_active_background_color,
  checkbox_control_active_border_color,
  checkbox_control_active_checked_background_color,
  checkbox_control_active_checked_border_color,
  checkbox_control_disabled_background_color,
  checkbox_control_disabled_border_color,
  checkbox_control_disabled_checkmark_color,
  checkbox_control_disabled_text_color,
  checkbox_control_disabled_checked_background_color,
  checkbox_control_disabled_checked_border_color,

  badge_dot_mode_border_radius,
  badge_dot_mode_padding,

  badge_border_radius,
  badge_text_font_family,
  badge_text_font_size,
  badge_text_font_weight,
  badge_text_line_height,
  badge_padding,

  badge_basic_background_color,
  badge_basic_text_color,
  badge_primary_background_color,
  badge_primary_text_color,
  badge_success_background_color,
  badge_success_text_color,
  badge_info_background_color,
  badge_info_text_color,
  badge_warning_background_color,
  badge_warning_text_color,
  badge_danger_background_color,
  badge_danger_text_color,
  badge_control_background_color,
  badge_control_text_color,

  progress_bar_animation_duration,
  progress_bar_border_radius,
  progress_bar_text_font_family,

  progress_bar_tiny_height,
  progress_bar_tiny_text_font_size,
  progress_bar_tiny_text_font_weight,
  progress_bar_tiny_text_line_height,
  progress_bar_small_height,
  progress_bar_small_text_font_size,
  progress_bar_small_text_font_weight,
  progress_bar_small_text_line_height,
  progress_bar_medium_height,
  progress_bar_medium_text_font_size,
  progress_bar_medium_text_font_weight,
  progress_bar_medium_text_line_height,
  progress_bar_large_height,
  progress_bar_large_text_font_size,
  progress_bar_large_text_font_weight,
  progress_bar_large_text_line_height,
  progress_bar_giant_height,
  progress_bar_giant_text_font_size,
  progress_bar_giant_text_font_weight,
  progress_bar_giant_text_line_height,

  progress_bar_basic_background_color,
  progress_bar_basic_filled_background_color,
  progress_bar_basic_text_color,

  progress_bar_primary_background_color,
  progress_bar_primary_filled_background_color,
  progress_bar_primary_text_color,

  progress_bar_success_background_color,
  progress_bar_success_filled_background_color,
  progress_bar_success_text_color,

  progress_bar_info_background_color,
  progress_bar_info_filled_background_color,
  progress_bar_info_text_color,

  progress_bar_warning_background_color,
  progress_bar_warning_filled_background_color,
  progress_bar_warning_text_color,

  progress_bar_danger_background_color,
  progress_bar_danger_filled_background_color,
  progress_bar_danger_text_color,

  progress_bar_control_background_color,
  progress_bar_control_filled_background_color,
  progress_bar_control_text_color,

  alert_border_radius,
  alert_bottom_margin,
  alert_padding,
  alert_scrollbar_color,
  alert_scrollbar_background_color,
  alert_scrollbar_width,
  alert_shadow,
  alert_text_font_family,
  alert_text_font_size,
  alert_text_font_weight,
  alert_text_line_height,

  alert_closable_start_padding,

  alert_tiny_height,
  alert_small_height,
  alert_medium_height,
  alert_medium_padding,
  alert_large_height,
  alert_giant_height,

  alert_basic_background_color,
  alert_basic_text_color,
  alert_primary_background_color,
  alert_primary_text_color,
  alert_success_background_color,
  alert_success_text_color,
  alert_info_background_color,
  alert_info_text_color,
  alert_warning_background_color,
  alert_warning_text_color,
  alert_danger_background_color,
  alert_danger_text_color,
  alert_control_background_color,
  alert_control_text_color,

  alert_accent_basic_color,
  alert_accent_primary_color,
  alert_accent_info_color,
  alert_accent_success_color,
  alert_accent_warning_color,
  alert_accent_danger_color,
  alert_accent_control_color,

  alert_outline_width,
  alert_outline_basic_color,
  alert_outline_primary_color,
  alert_outline_info_color,
  alert_outline_success_color,
  alert_outline_warning_color,
  alert_outline_danger_color,
  alert_outline_control_color,

  chat_background_color,
  chat_border,
  chat_border_radius,
  chat_shadow,
  chat_padding,
  chat_scrollbar_color,
  chat_scrollbar_background_color,
  chat_scrollbar_width,

  chat_text_color,
  chat_text_font_family,
  chat_text_font_size,
  chat_text_font_weight,
  chat_text_line_height,

  chat_header_text_font_family,
  chat_header_text_font_size,
  chat_header_text_font_weight,
  chat_header_text_line_height,

  chat_tiny_height,
  chat_small_height,
  chat_medium_height,
  chat_large_height,
  chat_giant_height,

  chat_basic_background_color,
  chat_basic_text_color,
  chat_primary_background_color,
  chat_primary_text_color,
  chat_success_background_color,
  chat_success_text_color,
  chat_info_background_color,
  chat_info_text_color,
  chat_warning_background_color,
  chat_warning_text_color,
  chat_danger_background_color,
  chat_danger_text_color,
  chat_control_background_color,
  chat_control_text_color,

  chat_divider_color,
  chat_divider_style,
  chat_divider_width,

  chat_message_background,
  chat_message_text_color,
  chat_message_reply_background_color,
  chat_message_reply_text_color,
  chat_message_avatar_background_color,
  chat_message_sender_text_color,
  chat_message_quote_background_color,
  chat_message_quote_text_color,
  chat_message_file_text_color,
  chat_message_file_background_color,

  spinner_text_color,
  spinner_text_font_family,
  spinner_text_font_size,
  spinner_text_font_weight,
  spinner_text_line_height,

  spinner_basic_background_color,
  spinner_basic_circle_filled_color,
  spinner_basic_circle_empty_color,

  spinner_primary_background_color,
  spinner_primary_circle_filled_color,
  spinner_primary_circle_empty_color,

  spinner_info_background_color,
  spinner_info_circle_filled_color,
  spinner_info_circle_empty_color,

  spinner_success_background_color,
  spinner_success_circle_filled_color,
  spinner_success_circle_empty_color,

  spinner_warning_background_color,
  spinner_warning_circle_filled_color,
  spinner_warning_circle_empty_color,

  spinner_danger_background_color,
  spinner_danger_circle_filled_color,
  spinner_danger_circle_empty_color,

  spinner_control_background_color,
  spinner_control_circle_filled_color,
  spinner_control_circle_empty_color,

  spinner_height_tiny,
  spinner_height_small,
  spinner_height_medium,
  spinner_height_large,
  spinner_height_giant,

  stepper_step_text_color,
  stepper_step_text_font_family,
  stepper_step_text_font_size,
  stepper_step_text_font_weight,
  stepper_step_text_line_height,
  stepper_step_active_text_color,
  stepper_step_completed_text_color,

  stepper_step_index_border_color,
  stepper_step_index_border_style,
  stepper_step_index_border_width,
  stepper_step_index_border_radius,
  stepper_step_index_width,
  stepper_step_index_active_border_color,
  stepper_step_index_completed_background_color,
  stepper_step_index_completed_border_color,
  stepper_step_index_completed_text_color,

  stepper_connector_background_color,
  stepper_connector_completed_background_color,
  stepper_horizontal_connector_margin,
  stepper_vertical_connector_margin,

  stepper_step_content_padding,

  accordion_border_radius,
  accordion_padding,
  accordion_shadow,
  accordion_header_text_color,
  accordion_header_text_font_family,
  accordion_header_text_font_size,
  accordion_header_text_font_weight,
  accordion_header_text_line_height,
  accordion_header_disabled_text_color,
  accordion_header_border_color,
  accordion_header_border_style,
  accordion_header_border_width,
  accordion_item_background_color,
  accordion_item_text_color,
  accordion_item_text_font_family,
  accordion_item_text_font_size,
  accordion_item_text_font_weight,
  accordion_item_text_line_height,

  list_item_divider_color,
  list_item_divider_style,
  list_item_divider_width,
  list_item_padding,
  list_item_text_color,
  list_item_font_family,
  list_item_font_size,
  list_item_font_weight,
  list_item_line_height,

  calendar_width,
  calendar_background_color,
  calendar_border_color,
  calendar_border_style,
  calendar_border_width,
  calendar_border_radius,
  calendar_text_color,
  calendar_text_font_family,
  calendar_text_font_size,
  calendar_text_font_weight,
  calendar_text_line_height,

  calendar_picker_padding_top,
  calendar_picker_padding_bottom,
  calendar_picker_padding_start,
  calendar_picker_padding_end,

  calendar_navigation_text_color,
  calendar_navigation_text_font_family,
  calendar_navigation_title_text_font_size,
  calendar_navigation_title_text_font_weight,
  calendar_navigation_title_text_line_height,
  calendar_navigation_padding,

  calendar_cell_inactive_text_color,

  calendar_cell_disabled_text_color,

  calendar_cell_hover_background_color,
  calendar_cell_hover_border_color,
  calendar_cell_hover_text_color,
  calendar_cell_hover_text_font_size,
  calendar_cell_hover_text_font_weight,
  calendar_cell_hover_text_line_height,

  calendar_cell_active_background_color,
  calendar_cell_active_border_color,
  calendar_cell_active_text_color,
  calendar_cell_active_text_font_size,
  calendar_cell_active_text_font_weight,
  calendar_cell_active_text_line_height,

  calendar_cell_today_background_color,
  calendar_cell_today_border_color,
  calendar_cell_today_text_color,
  calendar_cell_today_text_font_size,
  calendar_cell_today_text_font_weight,
  calendar_cell_today_text_line_height,
  calendar_cell_today_hover_background_color,
  calendar_cell_today_hover_border_color,
  calendar_cell_today_active_background_color,
  calendar_cell_today_active_border_color,
  calendar_cell_today_disabled_border_color,

  calendar_cell_today_selected_background_color,
  calendar_cell_today_selected_border_color,
  calendar_cell_today_selected_text_color,
  calendar_cell_today_selected_hover_background_color,
  calendar_cell_today_selected_hover_border_color,
  calendar_cell_today_selected_active_background_color,
  calendar_cell_today_selected_active_border_color,

  calendar_cell_today_in_range_background_color,
  calendar_cell_today_in_range_border_color,
  calendar_cell_today_in_range_text_color,
  calendar_cell_today_in_range_hover_background_color,
  calendar_cell_today_in_range_hover_border_color,
  calendar_cell_today_in_range_active_background_color,
  calendar_cell_today_in_range_active_border_color,

  calendar_cell_selected_background_color,
  calendar_cell_selected_border_color,
  calendar_cell_selected_text_color,
  calendar_cell_selected_text_font_size,
  calendar_cell_selected_text_font_weight,
  calendar_cell_selected_text_line_height,
  calendar_cell_selected_hover_background_color,
  calendar_cell_selected_hover_border_color,
  calendar_cell_selected_active_background_color,
  calendar_cell_selected_active_border_color,

  calendar_day_cell_width,
  calendar_day_cell_height,
  calendar_month_cell_width,
  calendar_month_cell_height,
  calendar_year_cell_width,
  calendar_year_cell_height,

  calendar_weekday_background,
  calendar_weekday_divider_color,
  calendar_weekday_divider_width,
  calendar_weekday_text_color,
  calendar_weekday_text_font_size,
  calendar_weekday_text_font_weight,
  calendar_weekday_text_line_height,
  calendar_weekday_holiday_text_color,
  calendar_weekday_height,
  calendar_weekday_width,

  calendar_weeknumber_background,
  calendar_weeknumber_divider_color,
  calendar_weeknumber_divider_width,
  calendar_weeknumber_text_color,
  calendar_weeknumber_text_font_size,
  calendar_weeknumber_text_font_weight,
  calendar_weeknumber_text_line_height,
  calendar_weeknumber_height,
  calendar_weeknumber_width,

  calendar_large_width,
  calendar_day_cell_large_width,
  calendar_day_cell_large_height,
  calendar_weekday_large_height,
  calendar_weekday_large_width,
  calendar_weeknumber_large_height,
  calendar_weeknumber_large_width,
  calendar_month_cell_large_width,
  calendar_month_cell_large_height,
  calendar_year_cell_large_width,
  calendar_year_cell_large_height,

  overlay_backdrop_background_color,

  tooltip_background_color,
  tooltip_border_color,
  tooltip_border_style,
  tooltip_border_width,
  tooltip_border_radius,
  tooltip_padding,
  tooltip_text_color,
  tooltip_text_font_family,
  tooltip_text_font_size,
  tooltip_text_font_weight,
  tooltip_text_line_height,
  tooltip_icon_height,
  tooltip_icon_width,
  tooltip_max_width,

  tooltip_basic_background_color,
  tooltip_basic_border_color,
  tooltip_basic_text_color,
  tooltip_primary_background_color,
  tooltip_primary_border_color,
  tooltip_primary_text_color,
  tooltip_info_background_color,
  tooltip_info_border_color,
  tooltip_info_text_color,
  tooltip_success_background_color,
  tooltip_success_border_color,
  tooltip_success_text_color,
  tooltip_warning_background_color,
  tooltip_warning_border_color,
  tooltip_warning_text_color,
  tooltip_danger_background_color,
  tooltip_danger_border_color,
  tooltip_danger_text_color,
  tooltip_control_background_color,
  tooltip_control_border_color,
  tooltip_control_text_color,
  tooltip_shadow,

  option_list_max_height,
  option_list_shadow,
  option_list_background_color,
  option_list_border_style,
  option_list_border_width,
  option_list_border_color,
  option_list_border_radius,
  option_list_adjacent_border_color,
  option_list_adjacent_border_style,
  option_list_adjacent_border_width,

  option_group_text_color,
  option_group_tiny_start_padding,
  option_group_small_start_padding,
  option_group_medium_start_padding,
  option_group_large_start_padding,
  option_group_giant_start_padding,

  option_background_color,
  option_text_color,
  option_text_font_family,
  option_hover_background_color,
  option_hover_text_color,
  option_active_background_color,
  option_active_text_color,
  option_focus_background_color,
  option_focus_text_color,
  option_selected_background_color,
  option_selected_text_color,
  option_selected_hover_background_color,
  option_selected_hover_text_color,
  option_selected_active_background_color,
  option_selected_active_text_color,
  option_selected_focus_background_color,
  option_selected_focus_text_color,
  option_disabled_background_color,
  option_disabled_text_color,

  option_tiny_text_font_size,
  option_tiny_text_font_weight,
  option_tiny_text_line_height,
  option_tiny_padding,

  option_small_text_font_size,
  option_small_text_font_weight,
  option_small_text_line_height,
  option_small_padding,

  option_medium_text_font_size,
  option_medium_text_font_weight,
  option_medium_text_line_height,
  option_medium_padding,

  option_large_text_font_size,
  option_large_text_font_weight,
  option_large_text_line_height,
  option_large_padding,

  option_giant_text_font_size,
  option_giant_text_font_weight,
  option_giant_text_line_height,
  option_giant_padding,

  select_cursor,
  select_disabled_cursor,
  select_min_width,
  select_outline_width,
  select_outline_color,
  select_icon_offset,

  select_text_font_family,
  select_placeholder_text_font_family,

  select_tiny_text_font_size,
  select_tiny_text_font_weight,
  select_tiny_text_line_height,
  select_tiny_placeholder_text_font_size,
  select_tiny_placeholder_text_font_weight,
  select_tiny_max_width,

  select_small_text_font_size,
  select_small_text_font_weight,
  select_small_text_line_height,
  select_small_placeholder_text_font_size,
  select_small_placeholder_text_font_weight,
  select_small_max_width,

  select_medium_text_font_size,
  select_medium_text_font_weight,
  select_medium_text_line_height,
  select_medium_placeholder_text_font_size,
  select_medium_placeholder_text_font_weight,
  select_medium_max_width,

  select_large_text_font_size,
  select_large_text_font_weight,
  select_large_text_line_height,
  select_large_placeholder_text_font_size,
  select_large_placeholder_text_font_weight,
  select_large_max_width,

  select_giant_text_font_size,
  select_giant_text_font_weight,
  select_giant_text_line_height,
  select_giant_placeholder_text_font_size,
  select_giant_placeholder_text_font_weight,
  select_giant_max_width,

  select_rectangle_border_radius,
  select_semi_round_border_radius,
  select_round_border_radius,

  select_outline_border_style,
  select_outline_border_width,

  select_outline_tiny_padding,
  select_outline_small_padding,
  select_outline_medium_padding,
  select_outline_large_padding,
  select_outline_giant_padding,

  select_outline_basic_icon_color,
  select_outline_basic_text_color,
  select_outline_basic_placeholder_text_color,
  select_outline_basic_background_color,
  select_outline_basic_border_color,
  select_outline_basic_focus_background_color,
  select_outline_basic_focus_border_color,
  select_outline_basic_hover_background_color,
  select_outline_basic_hover_border_color,
  select_outline_basic_disabled_background_color,
  select_outline_basic_disabled_border_color,
  select_outline_basic_disabled_icon_color,
  select_outline_basic_disabled_text_color,

  select_outline_primary_icon_color,
  select_outline_primary_text_color,
  select_outline_primary_placeholder_text_color,
  select_outline_primary_background_color,
  select_outline_primary_border_color,
  select_outline_primary_focus_background_color,
  select_outline_primary_focus_border_color,
  select_outline_primary_hover_background_color,
  select_outline_primary_hover_border_color,
  select_outline_primary_disabled_background_color,
  select_outline_primary_disabled_border_color,
  select_outline_primary_disabled_icon_color,
  select_outline_primary_disabled_text_color,

  select_outline_success_icon_color,
  select_outline_success_text_color,
  select_outline_success_placeholder_text_color,
  select_outline_success_background_color,
  select_outline_success_border_color,
  select_outline_success_focus_background_color,
  select_outline_success_focus_border_color,
  select_outline_success_hover_background_color,
  select_outline_success_hover_border_color,
  select_outline_success_disabled_background_color,
  select_outline_success_disabled_border_color,
  select_outline_success_disabled_icon_color,
  select_outline_success_disabled_text_color,

  select_outline_info_icon_color,
  select_outline_info_text_color,
  select_outline_info_placeholder_text_color,
  select_outline_info_background_color,
  select_outline_info_border_color,
  select_outline_info_focus_background_color,
  select_outline_info_focus_border_color,
  select_outline_info_hover_background_color,
  select_outline_info_hover_border_color,
  select_outline_info_disabled_background_color,
  select_outline_info_disabled_border_color,
  select_outline_info_disabled_icon_color,
  select_outline_info_disabled_text_color,

  select_outline_warning_icon_color,
  select_outline_warning_text_color,
  select_outline_warning_placeholder_text_color,
  select_outline_warning_background_color,
  select_outline_warning_border_color,
  select_outline_warning_focus_background_color,
  select_outline_warning_focus_border_color,
  select_outline_warning_hover_background_color,
  select_outline_warning_hover_border_color,
  select_outline_warning_disabled_background_color,
  select_outline_warning_disabled_border_color,
  select_outline_warning_disabled_icon_color,
  select_outline_warning_disabled_text_color,

  select_outline_danger_icon_color,
  select_outline_danger_text_color,
  select_outline_danger_placeholder_text_color,
  select_outline_danger_background_color,
  select_outline_danger_border_color,
  select_outline_danger_focus_background_color,
  select_outline_danger_focus_border_color,
  select_outline_danger_hover_background_color,
  select_outline_danger_hover_border_color,
  select_outline_danger_disabled_background_color,
  select_outline_danger_disabled_border_color,
  select_outline_danger_disabled_icon_color,
  select_outline_danger_disabled_text_color,

  select_outline_control_icon_color,
  select_outline_control_text_color,
  select_outline_control_placeholder_text_color,
  select_outline_control_background_color,
  select_outline_control_border_color,
  select_outline_control_focus_background_color,
  select_outline_control_focus_border_color,
  select_outline_control_hover_background_color,
  select_outline_control_hover_border_color,
  select_outline_control_disabled_background_color,
  select_outline_control_disabled_border_color,
  select_outline_control_disabled_icon_color,
  select_outline_control_disabled_text_color,

  select_outline_adjacent_border_style,
  select_outline_adjacent_border_width,
  select_outline_basic_open_border_color,
  select_outline_basic_adjacent_border_color,
  select_outline_primary_open_border_color,
  select_outline_primary_adjacent_border_color,
  select_outline_success_open_border_color,
  select_outline_success_adjacent_border_color,
  select_outline_info_open_border_color,
  select_outline_info_adjacent_border_color,
  select_outline_warning_open_border_color,
  select_outline_warning_adjacent_border_color,
  select_outline_danger_open_border_color,
  select_outline_danger_adjacent_border_color,
  select_outline_control_open_border_color,
  select_outline_control_adjacent_border_color,

  select_filled_border_style,
  select_filled_border_width,

  select_filled_tiny_padding,
  select_filled_small_padding,
  select_filled_medium_padding,
  select_filled_large_padding,
  select_filled_giant_padding,

  select_filled_basic_background_color,
  select_filled_basic_border_color,
  select_filled_basic_icon_color,
  select_filled_basic_text_color,
  select_filled_basic_placeholder_text_color,

  select_filled_basic_focus_background_color,
  select_filled_basic_focus_border_color,
  select_filled_basic_hover_background_color,
  select_filled_basic_hover_border_color,
  select_filled_basic_disabled_background_color,
  select_filled_basic_disabled_border_color,
  select_filled_basic_disabled_icon_color,
  select_filled_basic_disabled_text_color,

  select_filled_primary_background_color,
  select_filled_primary_border_color,
  select_filled_primary_icon_color,
  select_filled_primary_text_color,
  select_filled_primary_placeholder_text_color,

  select_filled_primary_focus_background_color,
  select_filled_primary_focus_border_color,
  select_filled_primary_hover_background_color,
  select_filled_primary_hover_border_color,
  select_filled_primary_disabled_background_color,
  select_filled_primary_disabled_border_color,
  select_filled_primary_disabled_icon_color,
  select_filled_primary_disabled_text_color,

  select_filled_success_background_color,
  select_filled_success_border_color,
  select_filled_success_icon_color,
  select_filled_success_text_color,
  select_filled_success_placeholder_text_color,

  select_filled_success_focus_background_color,
  select_filled_success_focus_border_color,
  select_filled_success_hover_background_color,
  select_filled_success_hover_border_color,
  select_filled_success_disabled_background_color,
  select_filled_success_disabled_border_color,
  select_filled_success_disabled_icon_color,
  select_filled_success_disabled_text_color,

  select_filled_info_background_color,
  select_filled_info_border_color,
  select_filled_info_icon_color,
  select_filled_info_text_color,
  select_filled_info_placeholder_text_color,

  select_filled_info_focus_background_color,
  select_filled_info_focus_border_color,
  select_filled_info_hover_background_color,
  select_filled_info_hover_border_color,
  select_filled_info_disabled_background_color,
  select_filled_info_disabled_border_color,
  select_filled_info_disabled_icon_color,
  select_filled_info_disabled_text_color,

  select_filled_warning_background_color,
  select_filled_warning_border_color,
  select_filled_warning_icon_color,
  select_filled_warning_text_color,
  select_filled_warning_placeholder_text_color,

  select_filled_warning_focus_background_color,
  select_filled_warning_focus_border_color,
  select_filled_warning_hover_background_color,
  select_filled_warning_hover_border_color,
  select_filled_warning_disabled_background_color,
  select_filled_warning_disabled_border_color,
  select_filled_warning_disabled_icon_color,
  select_filled_warning_disabled_text_color,

  select_filled_danger_background_color,
  select_filled_danger_border_color,
  select_filled_danger_icon_color,
  select_filled_danger_text_color,
  select_filled_danger_placeholder_text_color,

  select_filled_danger_focus_background_color,
  select_filled_danger_focus_border_color,
  select_filled_danger_hover_background_color,
  select_filled_danger_hover_border_color,
  select_filled_danger_disabled_background_color,
  select_filled_danger_disabled_border_color,
  select_filled_danger_disabled_icon_color,
  select_filled_danger_disabled_text_color,

  select_filled_control_background_color,
  select_filled_control_border_color,
  select_filled_control_icon_color,
  select_filled_control_text_color,
  select_filled_control_placeholder_text_color,

  select_filled_control_focus_background_color,
  select_filled_control_focus_border_color,
  select_filled_control_hover_background_color,
  select_filled_control_hover_border_color,
  select_filled_control_disabled_background_color,
  select_filled_control_disabled_border_color,
  select_filled_control_disabled_icon_color,
  select_filled_control_disabled_text_color,

  select_hero_tiny_padding,
  select_hero_small_padding,
  select_hero_medium_padding,
  select_hero_large_padding,
  select_hero_giant_padding,

  select_hero_basic_left_background_color,
  select_hero_basic_right_background_color,
  select_hero_basic_icon_color,
  select_hero_basic_text_color,
  select_hero_basic_placeholder_text_color,

  select_hero_basic_focus_left_background_color,
  select_hero_basic_focus_right_background_color,
  select_hero_basic_hover_left_background_color,
  select_hero_basic_hover_right_background_color,
  select_hero_basic_disabled_background_color,
  select_hero_basic_disabled_icon_color,
  select_hero_basic_disabled_text_color,

  select_hero_primary_left_background_color,
  select_hero_primary_right_background_color,
  select_hero_primary_icon_color,
  select_hero_primary_text_color,
  select_hero_primary_placeholder_text_color,

  select_hero_primary_focus_left_background_color,
  select_hero_primary_focus_right_background_color,
  select_hero_primary_hover_left_background_color,
  select_hero_primary_hover_right_background_color,
  select_hero_primary_disabled_background_color,
  select_hero_primary_disabled_icon_color,
  select_hero_primary_disabled_text_color,

  select_hero_success_left_background_color,
  select_hero_success_right_background_color,
  select_hero_success_icon_color,
  select_hero_success_text_color,
  select_hero_success_placeholder_text_color,

  select_hero_success_focus_left_background_color,
  select_hero_success_focus_right_background_color,
  select_hero_success_hover_left_background_color,
  select_hero_success_hover_right_background_color,
  select_hero_success_disabled_background_color,
  select_hero_success_disabled_icon_color,
  select_hero_success_disabled_text_color,

  select_hero_info_left_background_color,
  select_hero_info_right_background_color,
  select_hero_info_icon_color,
  select_hero_info_text_color,
  select_hero_info_placeholder_text_color,

  select_hero_info_focus_left_background_color,
  select_hero_info_focus_right_background_color,
  select_hero_info_hover_left_background_color,
  select_hero_info_hover_right_background_color,
  select_hero_info_disabled_background_color,
  select_hero_info_disabled_icon_color,
  select_hero_info_disabled_text_color,

  select_hero_warning_left_background_color,
  select_hero_warning_right_background_color,
  select_hero_warning_icon_color,
  select_hero_warning_text_color,
  select_hero_warning_placeholder_text_color,

  select_hero_warning_focus_left_background_color,
  select_hero_warning_focus_right_background_color,
  select_hero_warning_hover_left_background_color,
  select_hero_warning_hover_right_background_color,
  select_hero_warning_disabled_background_color,
  select_hero_warning_disabled_icon_color,
  select_hero_warning_disabled_text_color,

  select_hero_danger_left_background_color,
  select_hero_danger_right_background_color,
  select_hero_danger_icon_color,
  select_hero_danger_text_color,
  select_hero_danger_placeholder_text_color,

  select_hero_danger_focus_left_background_color,
  select_hero_danger_focus_right_background_color,
  select_hero_danger_hover_left_background_color,
  select_hero_danger_hover_right_background_color,
  select_hero_danger_disabled_background_color,
  select_hero_danger_disabled_icon_color,
  select_hero_danger_disabled_text_color,

  select_hero_control_left_background_color,
  select_hero_control_right_background_color,
  select_hero_control_icon_color,
  select_hero_control_text_color,
  select_hero_control_placeholder_text_color,

  select_hero_control_focus_left_background_color,
  select_hero_control_focus_right_background_color,
  select_hero_control_hover_left_background_color,
  select_hero_control_hover_right_background_color,
  select_hero_control_disabled_background_color,
  select_hero_control_disabled_icon_color,
  select_hero_control_disabled_text_color,

  datepicker_background_color,
  datepicker_border_color,
  datepicker_border_style,
  datepicker_border_width,
  datepicker_border_radius,
  datepicker_shadow,

  timepicker_cell_text_color,
  timepicker_cell_hover_background_color,
  timepicker_cell_hover_text_color,
  timepicker_cell_focus_background_color,
  timepicker_cell_focus_text_color,
  timepicker_cell_active_background_color,
  timepicker_cell_active_text_color,
  timepicker_cell_text_font_size,
  timepicker_cell_text_font_family,
  timepicker_cell_text_line_height,
  timepicker_cell_text_font_weight,
  timepicker_cell_height,
  timepicker_header_cell_text_color,
  timepicker_header_cell_text_font_size,
  timepicker_header_cell_text_font_family,
  timepicker_header_cell_height,
  timepicker_header_cell_text_line_height,
  timepicker_header_cell_text_font_weight,
  timepicker_border_color,
  timepicker_border_style,
  timepicker_border_width,
  timepicker_scrollbar_color,
  timepicker_scrollbar_background_color,
  timepicker_scrollbar_width,
  timepicker_single_column_width,
  timepicker_multiple_column_width,
  timepicker_title_height,
  timepicker_title_padding,
  timepicker_container_width,
  timepicker_container_height,

  radio_width,
  radio_height,
  radio_border_style,
  radio_border_width,
  radio_text_font_family,
  radio_text_font_size,
  radio_text_font_weight,
  radio_text_line_height,
  radio_outline_color,
  radio_outline_width,

  radio_basic_text_color,
  radio_basic_border_color,
  radio_basic_background_color,
  radio_basic_checked_background_color,
  radio_basic_checked_border_color,
  radio_basic_inner_circle_color,
  radio_basic_focus_border_color,
  radio_basic_focus_background_color,
  radio_basic_focus_checked_background_color,
  radio_basic_focus_checked_border_color,
  radio_basic_focus_inner_circle_color,
  radio_basic_hover_background_color,
  radio_basic_hover_border_color,
  radio_basic_hover_inner_circle_color,
  radio_basic_hover_checked_background_color,
  radio_basic_hover_checked_border_color,
  radio_basic_active_background_color,
  radio_basic_active_border_color,
  radio_basic_active_inner_circle_color,
  radio_basic_active_checked_background_color,
  radio_basic_active_checked_border_color,
  radio_basic_disabled_background_color,
  radio_basic_disabled_border_color,
  radio_basic_disabled_text_color,
  radio_basic_disabled_checked_background_color,
  radio_basic_disabled_checked_border_color,
  radio_basic_disabled_checked_inner_circle_color,

  radio_primary_text_color,
  radio_primary_border_color,
  radio_primary_background_color,
  radio_primary_checked_background_color,
  radio_primary_checked_border_color,
  radio_primary_inner_circle_color,
  radio_primary_focus_border_color,
  radio_primary_focus_background_color,
  radio_primary_focus_checked_background_color,
  radio_primary_focus_checked_border_color,
  radio_primary_focus_inner_circle_color,
  radio_primary_hover_background_color,
  radio_primary_hover_border_color,
  radio_primary_hover_inner_circle_color,
  radio_primary_hover_checked_background_color,
  radio_primary_hover_checked_border_color,
  radio_primary_active_border_color,
  radio_primary_active_background_color,
  radio_primary_active_checked_background_color,
  radio_primary_active_checked_border_color,
  radio_primary_active_inner_circle_color,
  radio_primary_disabled_background_color,
  radio_primary_disabled_border_color,
  radio_primary_disabled_text_color,
  radio_primary_disabled_checked_background_color,
  radio_primary_disabled_checked_border_color,
  radio_primary_disabled_checked_inner_circle_color,

  radio_success_text_color,
  radio_success_border_color,
  radio_success_background_color,
  radio_success_checked_background_color,
  radio_success_checked_border_color,
  radio_success_inner_circle_color,
  radio_success_focus_border_color,
  radio_success_focus_background_color,
  radio_success_focus_checked_background_color,
  radio_success_focus_checked_border_color,
  radio_success_focus_inner_circle_color,
  radio_success_hover_background_color,
  radio_success_hover_border_color,
  radio_success_hover_inner_circle_color,
  radio_success_hover_checked_background_color,
  radio_success_hover_checked_border_color,
  radio_success_active_background_color,
  radio_success_active_border_color,
  radio_success_active_checked_background_color,
  radio_success_active_checked_border_color,
  radio_success_active_inner_circle_color,
  radio_success_disabled_background_color,
  radio_success_disabled_border_color,
  radio_success_disabled_text_color,
  radio_success_disabled_checked_background_color,
  radio_success_disabled_checked_border_color,
  radio_success_disabled_checked_inner_circle_color,

  radio_info_text_color,
  radio_info_border_color,
  radio_info_background_color,
  radio_info_checked_background_color,
  radio_info_checked_border_color,
  radio_info_inner_circle_color,
  radio_info_focus_background_color,
  radio_info_focus_border_color,
  radio_info_focus_checked_background_color,
  radio_info_focus_checked_border_color,
  radio_info_focus_inner_circle_color,
  radio_info_hover_background_color,
  radio_info_hover_border_color,
  radio_info_hover_inner_circle_color,
  radio_info_hover_checked_background_color,
  radio_info_hover_checked_border_color,
  radio_info_active_background_color,
  radio_info_active_border_color,
  radio_info_active_checked_background_color,
  radio_info_active_checked_border_color,
  radio_info_active_inner_circle_color,
  radio_info_disabled_background_color,
  radio_info_disabled_border_color,
  radio_info_disabled_text_color,
  radio_info_disabled_checked_background_color,
  radio_info_disabled_checked_border_color,
  radio_info_disabled_checked_inner_circle_color,

  radio_warning_text_color,
  radio_warning_border_color,
  radio_warning_background_color,
  radio_warning_checked_background_color,
  radio_warning_checked_border_color,
  radio_warning_inner_circle_color,
  radio_warning_focus_background_color,
  radio_warning_focus_border_color,
  radio_warning_focus_checked_background_color,
  radio_warning_focus_checked_border_color,
  radio_warning_focus_inner_circle_color,
  radio_warning_hover_background_color,
  radio_warning_hover_border_color,
  radio_warning_hover_inner_circle_color,
  radio_warning_hover_checked_background_color,
  radio_warning_hover_checked_border_color,
  radio_warning_active_background_color,
  radio_warning_active_border_color,
  radio_warning_active_checked_background_color,
  radio_warning_active_checked_border_color,
  radio_warning_active_inner_circle_color,
  radio_warning_disabled_background_color,
  radio_warning_disabled_border_color,
  radio_warning_disabled_text_color,
  radio_warning_disabled_checked_background_color,
  radio_warning_disabled_checked_border_color,
  radio_warning_disabled_checked_inner_circle_color,

  radio_danger_text_color,
  radio_danger_border_color,
  radio_danger_background_color,
  radio_danger_checked_background_color,
  radio_danger_checked_border_color,
  radio_danger_inner_circle_color,
  radio_danger_focus_background_color,
  radio_danger_focus_border_color,
  radio_danger_focus_checked_background_color,
  radio_danger_focus_checked_border_color,
  radio_danger_focus_inner_circle_color,
  radio_danger_hover_background_color,
  radio_danger_hover_border_color,
  radio_danger_hover_inner_circle_color,
  radio_danger_hover_checked_background_color,
  radio_danger_hover_checked_border_color,
  radio_danger_active_background_color,
  radio_danger_active_border_color,
  radio_danger_active_checked_background_color,
  radio_danger_active_checked_border_color,
  radio_danger_active_inner_circle_color,
  radio_danger_disabled_background_color,
  radio_danger_disabled_border_color,
  radio_danger_disabled_text_color,
  radio_danger_disabled_checked_background_color,
  radio_danger_disabled_checked_border_color,
  radio_danger_disabled_checked_inner_circle_color,

  radio_control_text_color,
  radio_control_background_color,
  radio_control_border_color,
  radio_control_checked_background_color,
  radio_control_checked_border_color,
  radio_control_inner_circle_color,
  radio_control_focus_background_color,
  radio_control_focus_border_color,
  radio_control_focus_checked_background_color,
  radio_control_focus_checked_border_color,
  radio_control_focus_inner_circle_color,
  radio_control_hover_background_color,
  radio_control_hover_border_color,
  radio_control_hover_inner_circle_color,
  radio_control_hover_checked_background_color,
  radio_control_hover_checked_border_color,
  radio_control_active_background_color,
  radio_control_active_border_color,
  radio_control_active_checked_background_color,
  radio_control_active_checked_border_color,
  radio_control_active_inner_circle_color,
  radio_control_disabled_background_color,
  radio_control_disabled_border_color,
  radio_control_disabled_text_color,
  radio_control_disabled_checked_background_color,
  radio_control_disabled_checked_border_color,
  radio_control_disabled_checked_inner_circle_color,

  tree_grid_cell_border_width,
  tree_grid_cell_border_style,
  tree_grid_cell_border_color,
  tree_grid_row_min_height,
  tree_grid_cell_padding,

  tree_grid_header_background_color,
  tree_grid_header_text_color,
  tree_grid_header_text_font_family,
  tree_grid_header_text_font_size,
  tree_grid_header_text_font_weight,
  tree_grid_header_text_line_height,

  tree_grid_footer_background_color,
  tree_grid_footer_text_color,
  tree_grid_footer_text_font_family,
  tree_grid_footer_text_font_size,
  tree_grid_footer_text_font_weight,
  tree_grid_footer_text_line_height,

  tree_grid_row_background_color,
  tree_grid_row_even_background_color,
  tree_grid_row_hover_background_color,
  tree_grid_row_text_color,
  tree_grid_row_text_font_family,
  tree_grid_row_text_font_size,
  tree_grid_row_text_font_weight,
  tree_grid_row_text_line_height,

  tree_grid_sort_header_button_background_color,
  tree_grid_sort_header_button_border,
  tree_grid_sort_header_button_padding,

  icon_font_size,
  icon_line_height,
  icon_width,
  icon_height,
  icon_svg_vertical_align,
  icon_basic_color,
  icon_primary_color,
  icon_info_color,
  icon_success_color,
  icon_warning_color,
  icon_danger_color,
  icon_control_color,

  tag_text_font_family,
  tag_text_transform,
  tag_border_width,
  tag_border_style,
  tag_border_radius,

  tag_tiny_text_font_size,
  tag_tiny_text_font_weight,
  tag_tiny_text_line_height,
  tag_tiny_padding,
  tag_tiny_close_offset,

  tag_small_text_font_size,
  tag_small_text_font_weight,
  tag_small_text_line_height,
  tag_small_padding,
  tag_small_close_offset,

  tag_medium_text_font_size,
  tag_medium_text_font_weight,
  tag_medium_text_line_height,
  tag_medium_padding,
  tag_medium_close_offset,

  tag_large_text_font_size,
  tag_large_text_font_weight,
  tag_large_text_line_height,
  tag_large_padding,
  tag_large_close_offset,

  tag_giant_text_font_size,
  tag_giant_text_font_weight,
  tag_giant_text_line_height,
  tag_giant_padding,
  tag_giant_close_offset,

  tag_filled_basic_background_color,
  tag_filled_basic_border_color,
  tag_filled_basic_text_color,
  tag_filled_basic_active_background_color,
  tag_filled_basic_active_border_color,
  tag_filled_basic_hover_background_color,
  tag_filled_basic_hover_border_color,
  tag_filled_basic_selected_background_color,
  tag_filled_basic_selected_border_color,

  tag_filled_primary_background_color,
  tag_filled_primary_border_color,
  tag_filled_primary_text_color,
  tag_filled_primary_active_background_color,
  tag_filled_primary_active_border_color,
  tag_filled_primary_hover_background_color,
  tag_filled_primary_hover_border_color,
  tag_filled_primary_selected_background_color,
  tag_filled_primary_selected_border_color,

  tag_filled_success_background_color,
  tag_filled_success_border_color,
  tag_filled_success_text_color,
  tag_filled_success_active_background_color,
  tag_filled_success_active_border_color,
  tag_filled_success_hover_background_color,
  tag_filled_success_hover_border_color,
  tag_filled_success_selected_background_color,
  tag_filled_success_selected_border_color,

  tag_filled_info_background_color,
  tag_filled_info_border_color,
  tag_filled_info_text_color,
  tag_filled_info_active_background_color,
  tag_filled_info_active_border_color,
  tag_filled_info_hover_background_color,
  tag_filled_info_hover_border_color,
  tag_filled_info_selected_background_color,
  tag_filled_info_selected_border_color,

  tag_filled_warning_background_color,
  tag_filled_warning_border_color,
  tag_filled_warning_text_color,
  tag_filled_warning_active_background_color,
  tag_filled_warning_active_border_color,
  tag_filled_warning_hover_background_color,
  tag_filled_warning_hover_border_color,
  tag_filled_warning_selected_background_color,
  tag_filled_warning_selected_border_color,

  tag_filled_danger_background_color,
  tag_filled_danger_border_color,
  tag_filled_danger_text_color,
  tag_filled_danger_active_background_color,
  tag_filled_danger_active_border_color,
  tag_filled_danger_hover_background_color,
  tag_filled_danger_hover_border_color,
  tag_filled_danger_selected_background_color,
  tag_filled_danger_selected_border_color,

  tag_filled_control_background_color,
  tag_filled_control_border_color,
  tag_filled_control_text_color,
  tag_filled_control_active_background_color,
  tag_filled_control_active_border_color,
  tag_filled_control_hover_background_color,
  tag_filled_control_hover_border_color,
  tag_filled_control_selected_background_color,
  tag_filled_control_selected_border_color,

  tag_outline_basic_background_color,
  tag_outline_basic_border_color,
  tag_outline_basic_text_color,
  tag_outline_basic_active_background_color,
  tag_outline_basic_active_border_color,
  tag_outline_basic_active_text_color,
  tag_outline_basic_hover_background_color,
  tag_outline_basic_hover_border_color,
  tag_outline_basic_hover_text_color,
  tag_outline_basic_selected_background_color,
  tag_outline_basic_selected_border_color,
  tag_outline_basic_selected_text_color,

  tag_outline_primary_background_color,
  tag_outline_primary_border_color,
  tag_outline_primary_text_color,
  tag_outline_primary_active_background_color,
  tag_outline_primary_active_border_color,
  tag_outline_primary_active_text_color,
  tag_outline_primary_hover_background_color,
  tag_outline_primary_hover_border_color,
  tag_outline_primary_hover_text_color,
  tag_outline_primary_selected_background_color,
  tag_outline_primary_selected_border_color,
  tag_outline_primary_selected_text_color,

  tag_outline_success_background_color,
  tag_outline_success_border_color,
  tag_outline_success_text_color,
  tag_outline_success_active_background_color,
  tag_outline_success_active_border_color,
  tag_outline_success_active_text_color,
  tag_outline_success_hover_background_color,
  tag_outline_success_hover_border_color,
  tag_outline_success_hover_text_color,
  tag_outline_success_selected_background_color,
  tag_outline_success_selected_border_color,
  tag_outline_success_selected_text_color,

  tag_outline_info_background_color,
  tag_outline_info_border_color,
  tag_outline_info_text_color,
  tag_outline_info_active_background_color,
  tag_outline_info_active_border_color,
  tag_outline_info_active_text_color,
  tag_outline_info_hover_background_color,
  tag_outline_info_hover_border_color,
  tag_outline_info_hover_text_color,
  tag_outline_info_selected_background_color,
  tag_outline_info_selected_border_color,
  tag_outline_info_selected_text_color,

  tag_outline_warning_background_color,
  tag_outline_warning_border_color,
  tag_outline_warning_text_color,
  tag_outline_warning_active_background_color,
  tag_outline_warning_active_border_color,
  tag_outline_warning_active_text_color,
  tag_outline_warning_hover_background_color,
  tag_outline_warning_hover_border_color,
  tag_outline_warning_hover_text_color,
  tag_outline_warning_selected_background_color,
  tag_outline_warning_selected_border_color,
  tag_outline_warning_selected_text_color,

  tag_outline_danger_background_color,
  tag_outline_danger_border_color,
  tag_outline_danger_text_color,
  tag_outline_danger_active_background_color,
  tag_outline_danger_active_border_color,
  tag_outline_danger_active_text_color,
  tag_outline_danger_hover_background_color,
  tag_outline_danger_hover_border_color,
  tag_outline_danger_hover_text_color,
  tag_outline_danger_selected_background_color,
  tag_outline_danger_selected_border_color,
  tag_outline_danger_selected_text_color,

  tag_outline_control_background_color,
  tag_outline_control_border_color,
  tag_outline_control_text_color,
  tag_outline_control_active_background_color,
  tag_outline_control_active_border_color,
  tag_outline_control_active_text_color,
  tag_outline_control_hover_background_color,
  tag_outline_control_hover_border_color,
  tag_outline_control_hover_text_color,
  tag_outline_control_selected_background_color,
  tag_outline_control_selected_border_color,
  tag_outline_control_selected_text_color,

  tag_list_tiny_tag_offset,
  tag_list_small_tag_offset,
  tag_list_medium_tag_offset,
  tag_list_large_tag_offset,
  tag_list_giant_tag_offset,

  tag_list_with_input_tiny_padding,
  tag_list_with_input_small_padding,
  tag_list_with_input_medium_padding,
  tag_list_with_input_large_padding,
  tag_list_with_input_giant_padding,

  tag_list_with_input_rectangle_border_radius,
  tag_list_with_input_semi_round_border_radius,
  tag_list_with_input_round_border_radius,

  tag_input_min_width,
  tag_input_text_font_family,
  tag_input_placeholder_text_font_family,

  tag_input_basic_background_color,
  tag_input_basic_border_color,
  tag_input_basic_text_color,
  tag_input_basic_placeholder_text_color,
  tag_input_basic_focus_background_color,
  tag_input_basic_focus_border_color,
  tag_input_basic_disabled_text_color,
  tag_input_basic_disabled_placeholder_text_color,

  tag_input_primary_background_color,
  tag_input_primary_border_color,
  tag_input_primary_text_color,
  tag_input_primary_placeholder_text_color,
  tag_input_primary_focus_background_color,
  tag_input_primary_focus_border_color,
  tag_input_primary_disabled_text_color,
  tag_input_primary_disabled_placeholder_text_color,

  tag_input_success_background_color,
  tag_input_success_border_color,
  tag_input_success_text_color,
  tag_input_success_placeholder_text_color,
  tag_input_success_focus_background_color,
  tag_input_success_focus_border_color,
  tag_input_success_disabled_text_color,
  tag_input_success_disabled_placeholder_text_color,

  tag_input_info_background_color,
  tag_input_info_border_color,
  tag_input_info_text_color,
  tag_input_info_placeholder_text_color,
  tag_input_info_focus_background_color,
  tag_input_info_focus_border_color,
  tag_input_info_disabled_text_color,
  tag_input_info_disabled_placeholder_text_color,

  tag_input_warning_background_color,
  tag_input_warning_border_color,
  tag_input_warning_text_color,
  tag_input_warning_placeholder_text_color,
  tag_input_warning_focus_background_color,
  tag_input_warning_focus_border_color,
  tag_input_warning_disabled_text_color,
  tag_input_warning_disabled_placeholder_text_color,

  tag_input_danger_background_color,
  tag_input_danger_border_color,
  tag_input_danger_text_color,
  tag_input_danger_placeholder_text_color,
  tag_input_danger_focus_background_color,
  tag_input_danger_focus_border_color,
  tag_input_danger_disabled_text_color,
  tag_input_danger_disabled_placeholder_text_color,

  tag_input_control_background_color,
  tag_input_control_border_color,
  tag_input_control_text_color,
  tag_input_control_placeholder_text_color,
  tag_input_control_focus_background_color,
  tag_input_control_focus_border_color,
  tag_input_control_disabled_text_color,
  tag_input_control_disabled_placeholder_text_color,

  tag_input_tiny_text_font_size,
  tag_input_tiny_text_font_weight,
  tag_input_tiny_text_line_height,
  tag_input_tiny_placeholder_text_font_size,
  tag_input_tiny_placeholder_text_font_weight,
  tag_input_tiny_placeholder_text_line_height,
  tag_input_tiny_padding,

  tag_input_small_text_font_size,
  tag_input_small_text_font_weight,
  tag_input_small_text_line_height,
  tag_input_small_placeholder_text_font_size,
  tag_input_small_placeholder_text_font_weight,
  tag_input_small_placeholder_text_line_height,
  tag_input_small_padding,

  tag_input_medium_text_font_size,
  tag_input_medium_text_font_weight,
  tag_input_medium_text_line_height,
  tag_input_medium_placeholder_text_font_size,
  tag_input_medium_placeholder_text_font_weight,
  tag_input_medium_placeholder_text_line_height,
  tag_input_medium_padding,

  tag_input_large_text_font_size,
  tag_input_large_text_font_weight,
  tag_input_large_text_line_height,
  tag_input_large_placeholder_text_font_size,
  tag_input_large_placeholder_text_font_weight,
  tag_input_large_placeholder_text_line_height,
  tag_input_large_padding,

  tag_input_giant_text_font_size,
  tag_input_giant_text_font_weight,
  tag_input_giant_text_line_height,
  tag_input_giant_placeholder_text_font_size,
  tag_input_giant_placeholder_text_font_weight,
  tag_input_giant_placeholder_text_line_height,
  tag_input_giant_padding,

  toggle_height,
  toggle_width,
  toggle_border_width,
  toggle_border_radius,
  toggle_outline_width,
  toggle_outline_color,
  toggle_switcher_size,
  toggle_switcher_icon_size,
  toggle_text_font_family,
  toggle_text_font_size,
  toggle_text_font_weight,
  toggle_text_line_height,
  toggle_cursor,
  toggle_disabled_cursor,

  toggle_basic_text_color,
  toggle_basic_background_color,
  toggle_basic_border_color,
  toggle_basic_checked_background_color,
  toggle_basic_checked_border_color,
  toggle_basic_checked_switcher_background_color,
  toggle_basic_checked_switcher_checkmark_color,
  toggle_basic_focus_background_color,
  toggle_basic_focus_border_color,
  toggle_basic_focus_checked_background_color,
  toggle_basic_focus_checked_border_color,
  toggle_basic_hover_background_color,
  toggle_basic_hover_border_color,
  toggle_basic_hover_checked_background_color,
  toggle_basic_hover_checked_border_color,
  toggle_basic_active_background_color,
  toggle_basic_active_border_color,
  toggle_basic_active_checked_background_color,
  toggle_basic_active_checked_border_color,
  toggle_basic_disabled_background_color,
  toggle_basic_disabled_border_color,
  toggle_basic_disabled_switcher_background_color,
  toggle_basic_disabled_checked_switcher_checkmark_color,
  toggle_basic_disabled_text_color,

  toggle_primary_text_color,
  toggle_primary_background_color,
  toggle_primary_border_color,
  toggle_primary_checked_background_color,
  toggle_primary_checked_border_color,
  toggle_primary_checked_switcher_background_color,
  toggle_primary_checked_switcher_checkmark_color,
  toggle_primary_focus_background_color,
  toggle_primary_focus_border_color,
  toggle_primary_focus_checked_background_color,
  toggle_primary_focus_checked_border_color,
  toggle_primary_hover_background_color,
  toggle_primary_hover_border_color,
  toggle_primary_hover_checked_background_color,
  toggle_primary_hover_checked_border_color,
  toggle_primary_active_background_color,
  toggle_primary_active_border_color,
  toggle_primary_active_checked_background_color,
  toggle_primary_active_checked_border_color,
  toggle_primary_disabled_background_color,
  toggle_primary_disabled_border_color,
  toggle_primary_disabled_switcher_background_color,
  toggle_primary_disabled_checked_switcher_checkmark_color,
  toggle_primary_disabled_text_color,

  toggle_success_text_color,
  toggle_success_background_color,
  toggle_success_border_color,
  toggle_success_checked_background_color,
  toggle_success_checked_border_color,
  toggle_success_checked_switcher_background_color,
  toggle_success_checked_switcher_checkmark_color,
  toggle_success_focus_background_color,
  toggle_success_focus_border_color,
  toggle_success_focus_checked_background_color,
  toggle_success_focus_checked_border_color,
  toggle_success_hover_background_color,
  toggle_success_hover_border_color,
  toggle_success_hover_checked_background_color,
  toggle_success_hover_checked_border_color,
  toggle_success_active_background_color,
  toggle_success_active_border_color,
  toggle_success_active_checked_background_color,
  toggle_success_active_checked_border_color,
  toggle_success_disabled_background_color,
  toggle_success_disabled_border_color,
  toggle_success_disabled_switcher_background_color,
  toggle_success_disabled_checked_switcher_checkmark_color,
  toggle_success_disabled_text_color,

  toggle_info_text_color,
  toggle_info_background_color,
  toggle_info_border_color,
  toggle_info_checked_background_color,
  toggle_info_checked_border_color,
  toggle_info_checked_switcher_background_color,
  toggle_info_checked_switcher_checkmark_color,
  toggle_info_focus_background_color,
  toggle_info_focus_border_color,
  toggle_info_focus_checked_background_color,
  toggle_info_focus_checked_border_color,
  toggle_info_hover_background_color,
  toggle_info_hover_border_color,
  toggle_info_hover_checked_background_color,
  toggle_info_hover_checked_border_color,
  toggle_info_active_background_color,
  toggle_info_active_border_color,
  toggle_info_active_checked_background_color,
  toggle_info_active_checked_border_color,
  toggle_info_disabled_background_color,
  toggle_info_disabled_border_color,
  toggle_info_disabled_switcher_background_color,
  toggle_info_disabled_checked_switcher_checkmark_color,
  toggle_info_disabled_text_color,

  toggle_warning_text_color,
  toggle_warning_background_color,
  toggle_warning_border_color,
  toggle_warning_checked_background_color,
  toggle_warning_checked_border_color,
  toggle_warning_checked_switcher_background_color,
  toggle_warning_checked_switcher_checkmark_color,
  toggle_warning_focus_background_color,
  toggle_warning_focus_border_color,
  toggle_warning_focus_checked_background_color,
  toggle_warning_focus_checked_border_color,
  toggle_warning_hover_background_color,
  toggle_warning_hover_border_color,
  toggle_warning_hover_checked_background_color,
  toggle_warning_hover_checked_border_color,
  toggle_warning_active_background_color,
  toggle_warning_active_border_color,
  toggle_warning_active_checked_background_color,
  toggle_warning_active_checked_border_color,
  toggle_warning_disabled_background_color,
  toggle_warning_disabled_border_color,
  toggle_warning_disabled_switcher_background_color,
  toggle_warning_disabled_checked_switcher_checkmark_color,
  toggle_warning_disabled_text_color,

  toggle_danger_text_color,
  toggle_danger_background_color,
  toggle_danger_border_color,
  toggle_danger_checked_background_color,
  toggle_danger_checked_border_color,
  toggle_danger_checked_switcher_background_color,
  toggle_danger_checked_switcher_checkmark_color,
  toggle_danger_focus_background_color,
  toggle_danger_focus_border_color,
  toggle_danger_focus_checked_background_color,
  toggle_danger_focus_checked_border_color,
  toggle_danger_hover_background_color,
  toggle_danger_hover_border_color,
  toggle_danger_hover_checked_background_color,
  toggle_danger_hover_checked_border_color,
  toggle_danger_active_background_color,
  toggle_danger_active_border_color,
  toggle_danger_active_checked_background_color,
  toggle_danger_active_checked_border_color,
  toggle_danger_disabled_background_color,
  toggle_danger_disabled_border_color,
  toggle_danger_disabled_switcher_background_color,
  toggle_danger_disabled_checked_switcher_checkmark_color,
  toggle_danger_disabled_text_color,

  toggle_control_text_color,
  toggle_control_background_color,
  toggle_control_border_color,
  toggle_control_checked_background_color,
  toggle_control_checked_border_color,
  toggle_control_checked_switcher_background_color,
  toggle_control_checked_switcher_checkmark_color,
  toggle_control_focus_background_color,
  toggle_control_focus_border_color,
  toggle_control_focus_checked_background_color,
  toggle_control_focus_checked_border_color,
  toggle_control_hover_background_color,
  toggle_control_hover_border_color,
  toggle_control_hover_checked_background_color,
  toggle_control_hover_checked_border_color,
  toggle_control_active_background_color,
  toggle_control_active_border_color,
  toggle_control_active_checked_background_color,
  toggle_control_active_checked_border_color,
  toggle_control_disabled_background_color,
  toggle_control_disabled_border_color,
  toggle_control_disabled_switcher_background_color,
  toggle_control_disabled_checked_switcher_checkmark_color,
  toggle_control_disabled_text_color,

  form_field_tiny_max_width,
  form_field_small_max_width,
  form_field_medium_max_width,
  form_field_large_max_width,
  form_field_giant_max_width,

  form_field_addon_basic_text_color,
  form_field_addon_basic_highlight_text_color,
  form_field_addon_primary_text_color,
  form_field_addon_primary_highlight_text_color,
  form_field_addon_success_text_color,
  form_field_addon_success_highlight_text_color,
  form_field_addon_info_text_color,
  form_field_addon_info_highlight_text_color,
  form_field_addon_warning_text_color,
  form_field_addon_warning_highlight_text_color,
  form_field_addon_danger_text_color,
  form_field_addon_danger_highlight_text_color,
  form_field_addon_control_text_color,
  form_field_addon_control_highlight_text_color,
  form_field_addon_disabled_text_color,

  form_field_addon_tiny_height,
  form_field_addon_tiny_width,
  form_field_addon_tiny_icon_size,
  form_field_addon_tiny_font_size,
  form_field_addon_tiny_line_height,
  form_field_addon_tiny_font_weight,
  form_field_addon_small_height,
  form_field_addon_small_width,
  form_field_addon_small_icon_size,
  form_field_addon_small_font_size,
  form_field_addon_small_line_height,
  form_field_addon_small_font_weight,
  form_field_addon_medium_height,
  form_field_addon_medium_width,
  form_field_addon_medium_icon_size,
  form_field_addon_medium_font_size,
  form_field_addon_medium_line_height,
  form_field_addon_medium_font_weight,
  form_field_addon_large_height,
  form_field_addon_large_width,
  form_field_addon_large_icon_size,
  form_field_addon_large_font_size,
  form_field_addon_large_line_height,
  form_field_addon_large_font_weight,
  form_field_addon_giant_height,
  form_field_addon_giant_width,
  form_field_addon_giant_icon_size,
  form_field_addon_giant_font_size,
  form_field_addon_giant_line_height,
  form_field_addon_giant_font_weight,
}
