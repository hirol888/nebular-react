import { NebularThemeOption } from '../types/nebular-theme';

const option_list_border_color = 'var(--border-basic-color-4)';

export const DefaultThemeOption: NebularThemeOption = {
  option_list_max_height: '20rem',
  option_list_shadow: 'none',
  option_list_background_color: 'var(--background-basic-color-1)',
  option_list_border_style: 'solid',
  option_list_border_width: '0.0625rem',
  option_list_border_color,
  option_list_border_radius: 'var(--border-radius)',
  option_list_adjacent_border_color: 'var(--option-list-border-color)',
  option_list_adjacent_border_style: 'var(--option-list-border-style)',
  option_list_adjacent_border_width: 'var(--option-list-border-width)',

  option_group_text_color: 'var(--text-hint-color)',
  option_group_tiny_start_padding: '1.25rem',
  option_group_small_start_padding: '1.75rem',
  option_group_medium_start_padding: '2.25rem',
  option_group_large_start_padding: '2.25rem',
  option_group_giant_start_padding: '2.75rem',

  option_background_color: 'var(--background-basic-color-1)',
  option_text_color: 'var(--text-basic-color)',
  option_text_font_family: 'var(--text-subtitle-font-family)',
  option_hover_background_color: 'var(--color-basic-transparent-hover)',
  option_hover_text_color: 'var(--text-basic-color)',
  option_active_background_color: 'var(--color-basic-transparent-active)',
  option_active_text_color: 'var(--text-basic-color)',
  option_focus_background_color: 'var(--color-basic-transparent-focus)',
  option_focus_text_color: 'var(--text-basic-color)',
  option_selected_background_color: 'var(--color-primary-default)',
  option_selected_text_color: 'var(--text-control-color)',
  option_selected_hover_background_color: 'var(--color-primary-hover)',
  option_selected_hover_text_color: 'var(--text-control-color)',
  option_selected_active_background_color: 'var(--color-primary-active)',
  option_selected_active_text_color: 'var(--text-control-color)',
  option_selected_focus_background_color: 'var(--color-primary-focus)',
  option_selected_focus_text_color: 'var(--text-control-color)',
  option_disabled_background_color: 'var(--background-basic-color-1)',
  option_disabled_text_color: 'var(--text-disabled-color)',

  option_list_scrollbar_color: 'var(--card-scrollbar-color)',
  option_list_scrollbar_background_color: 'var(--card-scrollbar-background-color)',
  option_list_scrollbar_width: 'var(--card-scrollbar-width)'
};
