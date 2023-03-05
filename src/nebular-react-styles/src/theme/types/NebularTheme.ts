import { Property } from 'csstype';
import { CSSInterpolation, CSSObject } from '../../tss/types';
import {
  NebularThemeAccordin,
  NebularThemeActions,
  NebularThemeAlert,
  NebularThemeBadge,
  NebularThemeButton,
  NebularThemeCalendar,
  NebularThemeCard,
  NebularThemeChat,
  NebularThemeCheckbox,
  NebularThemeContextMenu,
  NebularThemeDateTimePicker,
  NebularThemeFormField,
  NebularThemeIcon,
  NebularThemeInput,
  NebularThemeLayout,
  NebularThemeListItem,
  NebularThemeMenu,
  NebularThemeOption,
  NebularThemePopover,
  NebularThemeProgressBar,
  NebularThemeRadio,
  NebularThemeSearch,
  NebularThemeSelect,
  NebularThemeSidebar,
  NebularThemeLoader,
  NebularThemeStepper,
  NebularThemeTabset,
  NebularThemeTag,
  NebularThemeToastr,
  NebularThemeToggle,
  NebularThemeTooltip,
  NebularThemeUser,
  NebularThemeVariables
} from './nebular-theme';

export type BreakpointName = 'xs' | 'is' | 'sm' | 'md' | 'lg' | 'xl' | 'macpro' | 'xxl' | 'xxxl';
export const DEFAULT_MEDIA_BREAKPOINTNAMES: BreakpointName[] = [
  'xs',
  'is',
  'sm',
  'md',
  'lg',
  'xl',
  'macpro',
  'xxl',
  'xxxl'
];

export const DEFAULT_MEDIA_BREAKPOINTS: Record<BreakpointName, number> = {
  xs: 0,
  is: 400,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  macpro: 1280,
  xxl: 1400,
  xxxl: 1600
};

interface NebularThemeFunctions {
  ltr(propValuePairs: CSSInterpolation): CSSObject;
  rtl(propValuePairs: CSSInterpolation): CSSObject;
  outline(
    outlineWidth: Property.OutlineWidth,
    outlineColor: Property.OutlineColor,
    insetShadowLength?: Property.Inset
  ): CSSObject;
  transition(properties: string[]): CSSObject;
  scrollbars(color: any, backgroundColor: any, width: any): CSSObject;
  hidden(): CSSObject;
  mediaBreakpointDown(breakpointName: BreakpointName, propValuePairs: CSSInterpolation): CSSObject;
  mediaBreakpointUp(breakpointName: BreakpointName, propValuePairs: CSSInterpolation): CSSObject;
  mediaBreakpointBetween(
    lowerBreakpoint?: BreakpointName,
    upperBreakpoint?: BreakpointName,
    propValuePairs?: CSSInterpolation
  ): CSSObject;
  thumb(propValuePairs: CSSInterpolation): CSSObject;
  track(propValuePairs: CSSInterpolation): CSSObject;
}

export interface NebularThemeCore {
  theme_name: string;
  isDarkTheme: boolean;
  color_primary_100: Property.Color;
  color_primary_200: Property.Color;
  color_primary_300: Property.Color;
  color_primary_400: Property.Color;
  color_primary_500: Property.Color;
  color_primary_600: Property.Color;
  color_primary_700: Property.Color;
  color_primary_800: Property.Color;
  color_primary_900: Property.Color;

  color_primary_transparent_100: Property.Color;
  color_primary_transparent_200: Property.Color;
  color_primary_transparent_300: Property.Color;
  color_primary_transparent_400: Property.Color;
  color_primary_transparent_500: Property.Color;
  color_primary_transparent_600: Property.Color;

  color_success_100: Property.Color;
  color_success_200: Property.Color;
  color_success_300: Property.Color;
  color_success_400: Property.Color;
  color_success_500: Property.Color;
  color_success_600: Property.Color;
  color_success_700: Property.Color;
  color_success_800: Property.Color;
  color_success_900: Property.Color;

  color_success_transparent_100: Property.Color;
  color_success_transparent_200: Property.Color;
  color_success_transparent_300: Property.Color;
  color_success_transparent_400: Property.Color;
  color_success_transparent_500: Property.Color;
  color_success_transparent_600: Property.Color;

  color_info_100: Property.Color;
  color_info_200: Property.Color;
  color_info_300: Property.Color;
  color_info_400: Property.Color;
  color_info_500: Property.Color;
  color_info_600: Property.Color;
  color_info_700: Property.Color;
  color_info_800: Property.Color;
  color_info_900: Property.Color;

  color_info_transparent_100: Property.Color;
  color_info_transparent_200: Property.Color;
  color_info_transparent_300: Property.Color;
  color_info_transparent_400: Property.Color;
  color_info_transparent_500: Property.Color;
  color_info_transparent_600: Property.Color;

  color_warning_100: Property.Color;
  color_warning_200: Property.Color;
  color_warning_300: Property.Color;
  color_warning_400: Property.Color;
  color_warning_500: Property.Color;
  color_warning_600: Property.Color;
  color_warning_700: Property.Color;
  color_warning_800: Property.Color;
  color_warning_900: Property.Color;

  color_warning_transparent_100: Property.Color;
  color_warning_transparent_200: Property.Color;
  color_warning_transparent_300: Property.Color;
  color_warning_transparent_400: Property.Color;
  color_warning_transparent_500: Property.Color;
  color_warning_transparent_600: Property.Color;

  color_danger_100: Property.Color;
  color_danger_200: Property.Color;
  color_danger_300: Property.Color;
  color_danger_400: Property.Color;
  color_danger_500: Property.Color;
  color_danger_600: Property.Color;
  color_danger_700: Property.Color;
  color_danger_800: Property.Color;
  color_danger_900: Property.Color;

  color_danger_transparent_100: Property.Color;
  color_danger_transparent_200: Property.Color;
  color_danger_transparent_300: Property.Color;
  color_danger_transparent_400: Property.Color;
  color_danger_transparent_500: Property.Color;
  color_danger_transparent_600: Property.Color;

  color_basic_100: Property.Color;
  color_basic_200: Property.Color;
  color_basic_300: Property.Color;
  color_basic_400: Property.Color;
  color_basic_500: Property.Color;
  color_basic_600: Property.Color;
  color_basic_700: Property.Color;
  color_basic_800: Property.Color;
  color_basic_900: Property.Color;
  color_basic_1000: Property.Color;
  color_basic_1100: Property.Color;

  color_basic_transparent_100: Property.Color;
  color_basic_transparent_200: Property.Color;
  color_basic_transparent_300: Property.Color;
  color_basic_transparent_400: Property.Color;
  color_basic_transparent_500: Property.Color;
  color_basic_transparent_600: Property.Color;

  color_basic_control_transparent_100: Property.Color;
  color_basic_control_transparent_200: Property.Color;
  color_basic_control_transparent_300: Property.Color;
  color_basic_control_transparent_400: Property.Color;
  color_basic_control_transparent_500: Property.Color;
  color_basic_control_transparent_600: Property.Color;

  color_basic_focus: Property.Color;
  color_basic_hover: Property.Color;
  color_basic_default: Property.Color;
  color_basic_active: Property.Color;
  color_basic_disabled: Property.Color;
  color_basic_focus_border: Property.Color;
  color_basic_hover_border: Property.Color;
  color_basic_default_border: Property.Color;
  color_basic_active_border: Property.Color;
  color_basic_disabled_border: Property.Color;

  color_basic_transparent_focus: Property.Color;
  color_basic_transparent_hover: Property.Color;
  color_basic_transparent_default: Property.Color;
  color_basic_transparent_active: Property.Color;
  color_basic_transparent_disabled: Property.Color;
  color_basic_transparent_focus_border: Property.Color;
  color_basic_transparent_hover_border: Property.Color;
  color_basic_transparent_default_border: Property.Color;
  color_basic_transparent_active_border: Property.Color;
  color_basic_transparent_disabled_border: Property.Color;

  color_primary_focus: Property.Color;
  color_primary_hover: Property.Color;
  color_primary_default: Property.Color;
  color_primary_active: Property.Color;
  color_primary_disabled: Property.Color;
  color_primary_focus_border: Property.Color;
  color_primary_hover_border: Property.Color;
  color_primary_default_border: Property.Color;
  color_primary_active_border: Property.Color;
  color_primary_disabled_border: Property.Color;

  color_primary_transparent_focus: Property.Color;
  color_primary_transparent_hover: Property.Color;
  color_primary_transparent_default: Property.Color;
  color_primary_transparent_active: Property.Color;
  color_primary_transparent_disabled: Property.Color;
  color_primary_transparent_focus_border: Property.Color;
  color_primary_transparent_hover_border: Property.Color;
  color_primary_transparent_default_border: Property.Color;
  color_primary_transparent_active_border: Property.Color;
  color_primary_transparent_disabled_border: Property.Color;

  color_success_focus: Property.Color;
  color_success_hover: Property.Color;
  color_success_default: Property.Color;
  color_success_active: Property.Color;
  color_success_disabled: Property.Color;
  color_success_focus_border: Property.Color;
  color_success_hover_border: Property.Color;
  color_success_default_border: Property.Color;
  color_success_active_border: Property.Color;
  color_success_disabled_border: Property.Color;

  color_success_transparent_focus: Property.Color;
  color_success_transparent_focus_border: Property.Color;
  color_success_transparent_hover: Property.Color;
  color_success_transparent_hover_border: Property.Color;
  color_success_transparent_default: Property.Color;
  color_success_transparent_default_border: Property.Color;
  color_success_transparent_active: Property.Color;
  color_success_transparent_active_border: Property.Color;
  color_success_transparent_disabled: Property.Color;
  color_success_transparent_disabled_border: Property.Color;

  color_info_focus: Property.Color;
  color_info_hover: Property.Color;
  color_info_default: Property.Color;
  color_info_active: Property.Color;
  color_info_disabled: Property.Color;
  color_info_focus_border: Property.Color;
  color_info_hover_border: Property.Color;
  color_info_default_border: Property.Color;
  color_info_active_border: Property.Color;
  color_info_disabled_border: Property.Color;

  color_info_transparent_focus: Property.Color;
  color_info_transparent_hover: Property.Color;
  color_info_transparent_default: Property.Color;
  color_info_transparent_active: Property.Color;
  color_info_transparent_disabled: Property.Color;
  color_info_transparent_focus_border: Property.Color;
  color_info_transparent_hover_border: Property.Color;
  color_info_transparent_default_border: Property.Color;
  color_info_transparent_active_border: Property.Color;
  color_info_transparent_disabled_border: Property.Color;

  color_warning_focus: Property.Color;
  color_warning_hover: Property.Color;
  color_warning_default: Property.Color;
  color_warning_active: Property.Color;
  color_warning_disabled: Property.Color;
  color_warning_focus_border: Property.Color;
  color_warning_hover_border: Property.Color;
  color_warning_default_border: Property.Color;
  color_warning_active_border: Property.Color;
  color_warning_disabled_border: Property.Color;

  color_warning_transparent_focus: Property.Color;
  color_warning_transparent_hover: Property.Color;
  color_warning_transparent_default: Property.Color;
  color_warning_transparent_active: Property.Color;
  color_warning_transparent_disabled: Property.Color;
  color_warning_transparent_focus_border: Property.Color;
  color_warning_transparent_hover_border: Property.Color;
  color_warning_transparent_default_border: Property.Color;
  color_warning_transparent_active_border: Property.Color;
  color_warning_transparent_disabled_border: Property.Color;

  color_danger_focus: Property.Color;
  color_danger_hover: Property.Color;
  color_danger_default: Property.Color;
  color_danger_active: Property.Color;
  color_danger_disabled: Property.Color;
  color_danger_focus_border: Property.Color;
  color_danger_hover_border: Property.Color;
  color_danger_default_border: Property.Color;
  color_danger_active_border: Property.Color;
  color_danger_disabled_border: Property.Color;

  color_danger_transparent_focus: Property.Color;
  color_danger_transparent_hover: Property.Color;
  color_danger_transparent_default: Property.Color;
  color_danger_transparent_active: Property.Color;
  color_danger_transparent_disabled: Property.Color;
  color_danger_transparent_focus_border: Property.Color;
  color_danger_transparent_hover_border: Property.Color;
  color_danger_transparent_default_border: Property.Color;
  color_danger_transparent_active_border: Property.Color;
  color_danger_transparent_disabled_border: Property.Color;

  color_control_focus: Property.Color;
  color_control_hover: Property.Color;
  color_control_default: Property.Color;
  color_control_active: Property.Color;
  color_control_disabled: Property.Color;
  color_control_focus_border: Property.Color;
  color_control_hover_border: Property.Color;
  color_control_default_border: Property.Color;
  color_control_active_border: Property.Color;
  color_control_disabled_border: Property.Color;

  color_control_transparent_focus: Property.Color;
  color_control_transparent_hover: Property.Color;
  color_control_transparent_default: Property.Color;
  color_control_transparent_active: Property.Color;
  color_control_transparent_disabled: Property.Color;
  color_control_transparent_focus_border: Property.Color;
  color_control_transparent_hover_border: Property.Color;
  color_control_transparent_default_border: Property.Color;
  color_control_transparent_active_border: Property.Color;
  color_control_transparent_disabled_border: Property.Color;

  background_basic_color_1: Property.Color;
  background_basic_color_2: Property.Color;
  background_basic_color_3: Property.Color;
  background_basic_color_4: Property.Color;

  border_basic_color_1: Property.Color;
  border_basic_color_2: Property.Color;
  border_basic_color_3: Property.Color;
  border_basic_color_4: Property.Color;
  border_basic_color_5: Property.Color;

  background_alternative_color_1: Property.Color;
  background_alternative_color_2: Property.Color;
  background_alternative_color_3: Property.Color;
  background_alternative_color_4: Property.Color;

  border_alternative_color_1: Property.Color;
  border_alternative_color_2: Property.Color;
  border_alternative_color_3: Property.Color;
  border_alternative_color_4: Property.Color;
  border_alternative_color_5: Property.Color;

  background_primary_color_1: Property.Color;
  background_primary_color_2: Property.Color;
  background_primary_color_3: Property.Color;
  background_primary_color_4: Property.Color;

  border_primary_color_1: Property.Color;
  border_primary_color_2: Property.Color;
  border_primary_color_3: Property.Color;
  border_primary_color_4: Property.Color;
  border_primary_color_5: Property.Color;

  text_basic_color: Property.Color;
  text_alternate_color: Property.Color;
  text_control_color: Property.Color;
  text_disabled_color: Property.Color;
  text_hint_color: Property.Color;

  text_primary_color: Property.Color;
  text_primary_focus_color: Property.Color;
  text_primary_hover_color: Property.Color;
  text_primary_active_color: Property.Color;
  text_primary_disabled_color: Property.Color;

  text_success_color: Property.Color;
  text_success_focus_color: Property.Color;
  text_success_hover_color: Property.Color;
  text_success_active_color: Property.Color;
  text_success_disabled_color: Property.Color;

  text_info_color: Property.Color;
  text_info_focus_color: Property.Color;
  text_info_hover_color: Property.Color;
  text_info_active_color: Property.Color;
  text_info_disabled_color: Property.Color;

  text_warning_color: Property.Color;
  text_warning_focus_color: Property.Color;
  text_warning_hover_color: Property.Color;
  text_warning_active_color: Property.Color;
  text_warning_disabled_color: Property.Color;

  text_danger_color: Property.Color;
  text_danger_focus_color: Property.Color;
  text_danger_hover_color: Property.Color;
  text_danger_active_color: Property.Color;
  text_danger_disabled_color: Property.Color;

  font_family_primary: Property.FontFamily;
  font_family_secondary: Property.FontFamily;

  text_heading_1_font_family: Property.FontFamily;
  text_heading_1_font_size: Property.FontSize;
  text_heading_1_font_weight: Property.FontWeight;
  text_heading_1_line_height: Property.LineHeight;

  text_heading_2_font_family: Property.FontFamily;
  text_heading_2_font_size: Property.FontSize;
  text_heading_2_font_weight: Property.FontWeight;
  text_heading_2_line_height: Property.LineHeight;

  text_heading_3_font_family: Property.FontFamily;
  text_heading_3_font_size: Property.FontSize;
  text_heading_3_font_weight: Property.FontWeight;
  text_heading_3_line_height: Property.LineHeight;

  text_heading_4_font_family: Property.FontFamily;
  text_heading_4_font_size: Property.FontSize;
  text_heading_4_font_weight: Property.FontWeight;
  text_heading_4_line_height: Property.LineHeight;

  text_heading_5_font_family: Property.FontFamily;
  text_heading_5_font_size: Property.FontSize;
  text_heading_5_font_weight: Property.FontWeight;
  text_heading_5_line_height: Property.LineHeight;

  text_heading_6_font_family: Property.FontFamily;
  text_heading_6_font_size: Property.FontSize;
  text_heading_6_font_weight: Property.FontWeight;
  text_heading_6_line_height: Property.LineHeight;

  text_subtitle_font_family: Property.FontFamily;
  text_subtitle_font_size: Property.FontSize;
  text_subtitle_font_weight: Property.FontWeight;
  text_subtitle_line_height: Property.LineHeight;

  text_subtitle_2_font_family: Property.FontFamily;
  text_subtitle_2_font_size: Property.FontSize;
  text_subtitle_2_font_weight: Property.FontWeight;
  text_subtitle_2_line_height: Property.LineHeight;

  text_paragraph_font_family: Property.FontFamily;
  text_paragraph_font_size: Property.FontSize;
  text_paragraph_font_weight: Property.FontWeight;
  text_paragraph_line_height: Property.LineHeight;

  text_paragraph_2_font_family: Property.FontFamily;
  text_paragraph_2_font_size: Property.FontSize;
  text_paragraph_2_font_weight: Property.FontWeight;
  text_paragraph_2_line_height: Property.LineHeight;

  text_label_font_family: Property.FontFamily;
  text_label_font_size: Property.FontSize;
  text_label_font_weight: Property.FontWeight;
  text_label_line_height: Property.LineHeight;

  text_caption_font_family: Property.FontFamily;
  text_caption_font_size: Property.FontSize;
  text_caption_font_weight: Property.FontWeight;
  text_caption_line_height: Property.LineHeight;

  text_caption_2_font_family: Property.FontFamily;
  text_caption_2_font_size: Property.FontSize;
  text_caption_2_font_weight: Property.FontWeight;
  text_caption_2_line_height: Property.LineHeight;

  text_button_font_family: Property.FontFamily;
  text_button_font_weight: Property.FontWeight;
  text_button_tiny_font_size: Property.FontSize;
  text_button_tiny_line_height: Property.LineHeight;
  text_button_small_font_size: Property.FontSize;
  text_button_small_line_height: Property.LineHeight;
  text_button_medium_font_size: Property.FontSize;
  text_button_medium_line_height: Property.LineHeight;
  text_button_large_font_size: Property.FontSize;
  text_button_large_line_height: Property.LineHeight;
  text_button_giant_font_size: Property.FontSize;
  text_button_giant_line_height: Property.LineHeight;

  border_radius: Property.BorderRadius;

  outline_width: Property.OutlineWidth;
  outline_color: Property.OutlineColor;

  scrollbar_color: Property.Color;
  scrollbar_background_color: Property.BackgroundColor;
  scrollbar_width: Property.Width;

  shadow: Property.BoxShadow;

  divider_color: Property.OutlineColor;
  divider_style: Property.OutlineStyle;
  divider_width: Property.OutlineWidth;

  link_text_color: Property.Color;
  link_text_decoration: Property.TextDecoration;
  link_text_focus_color: Property.Color;
  link_text_hover_color: Property.Color;

  overlay_backdrop_background_color: Property.BackgroundColor;
}

interface NebularFnsTheme {
  fns: NebularThemeFunctions;
}

export interface NebularTheme extends NebularThemeBase, NebularFnsTheme {}

export interface NebularThemeBase
  extends NebularThemeCore,
    NebularThemeAccordin,
    NebularThemeActions,
    NebularThemeAlert,
    NebularThemeBadge,
    NebularThemeButton,
    NebularThemeCalendar,
    NebularThemeCard,
    NebularThemeChat,
    NebularThemeCheckbox,
    NebularThemeContextMenu,
    NebularThemeDateTimePicker,
    NebularThemeFormField,
    NebularThemeIcon,
    NebularThemeInput,
    NebularThemeLayout,
    NebularThemeListItem,
    NebularThemeMenu,
    NebularThemeOption,
    NebularThemePopover,
    NebularThemeProgressBar,
    NebularThemeRadio,
    NebularThemeSearch,
    NebularThemeSelect,
    NebularThemeSidebar,
    NebularThemeLoader,
    NebularThemeStepper,
    NebularThemeTabset,
    NebularThemeTag,
    NebularThemeToastr,
    NebularThemeToggle,
    NebularThemeTooltip,
    NebularThemeUser,
    NebularThemeVariables {}

export type Direction = 'ltr' | 'rtl';

export interface LayoutDimensions {
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
}

export interface ScrollPosition {
  x: number;
  y: number;
}
