import React from 'react';
import { Global } from '@emotion/react';
import { ComponentStatusValues, NebularTheme } from './types';

const getCaptionStatusStyles = (theme: NebularTheme) => {
  let statusesStyles = {};
  ComponentStatusValues.forEach((status) => {
    const statusStyle = {};
    statusStyle[`&.${status}`] = {
      color: theme[`text_${status}_color`]
    };

    statusesStyles = {
      ...statusesStyles,
      ...statusStyle
    };
  });

  return statusesStyles;
};

const getTextStatusStyles = (theme: NebularTheme) => {
  let statusesStyles = {};
  ComponentStatusValues.forEach((status) => {
    const statusStyle = {};
    statusStyle[`.text-${status}`] = {
      color: theme[`text_${status}_color`]
    };

    statusesStyles = {
      ...statusesStyles,
      ...statusStyle
    };
  });

  return statusesStyles;
};

const getTypographyStyles = (theme: NebularTheme) => {
  const styles = {
    body: {
      color: theme.text_basic_color,
      fontFamily: theme.text_paragraph_font_family,
      fontSize: theme.text_paragraph_font_size,
      fontWeight: theme.text_paragraph_font_weight,
      lineHeight: theme.text_paragraph_line_height
    },

    'h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6': {
      color: theme.text_basic_color
    },

    'h1, .h1': {
      fontSize: theme.text_heading_1_font_size,
      fontFamily: theme.text_heading_1_font_family,
      fontWeight: theme.text_heading_1_font_weight,
      lineHeight: theme.text_heading_1_line_height
    },
    'h2, .h2': {
      fontSize: theme.text_heading_2_font_size,
      fontFamily: theme.text_heading_2_font_family,
      fontWeight: theme.text_heading_2_font_weight,
      lineHeight: theme.text_heading_2_line_height
    },
    'h3, .h3': {
      fontSize: theme.text_heading_3_font_size,
      fontFamily: theme.text_heading_3_font_family,
      fontWeight: theme.text_heading_3_font_weight,
      lineHeight: theme.text_heading_3_line_height
    },
    'h4, .h4': {
      fontSize: theme.text_heading_4_font_size,
      fontFamily: theme.text_heading_4_font_family,
      fontWeight: theme.text_heading_4_font_weight,
      lineHeight: theme.text_heading_4_line_height
    },
    'h5, .h5': {
      fontSize: theme.text_heading_5_font_size,
      fontFamily: theme.text_heading_5_font_family,
      fontWeight: theme.text_heading_5_font_weight,
      lineHeight: theme.text_heading_5_line_height
    },
    'h6, .h6': {
      fontSize: theme.text_heading_6_font_size,
      fontFamily: theme.text_heading_6_font_family,
      fontWeight: theme.text_heading_6_font_weight,
      lineHeight: theme.text_heading_6_line_height
    },

    '.subtitle, .subtitle-2': {
      color: theme.text_basic_color
    },

    '.subtitle': {
      fontFamily: theme.text_subtitle_font_family,
      fontSize: theme.text_subtitle_font_size,
      fontWeight: theme.text_subtitle_font_weight,
      lineHeight: theme.text_subtitle_line_height
    },

    '.subtitle-2': {
      fontFamily: theme.text_subtitle_2_font_family,
      fontSize: theme.text_subtitle_2_font_size,
      fontWeight: theme.text_subtitle_2_font_weight,
      lineHeight: theme.text_subtitle_2_line_height
    },

    'p, .paragraph': {
      color: theme.text_basic_color,
      fontFamily: theme.text_paragraph_font_family,
      fontSize: theme.text_paragraph_font_size,
      fontWeight: theme.text_paragraph_font_weight,
      lineHeight: theme.text_paragraph_line_height
    },

    '.paragraph-2': {
      color: theme.text_basic_color,
      fontFamily: theme.text_paragraph_2_font_family,
      fontSize: theme.text_paragraph_2_font_size,
      fontWeight: theme.text_paragraph_2_font_weight,
      lineHeight: theme.text_paragraph_2_line_height
    },

    a: {
      color: theme.link_text_color,
      textDecoration: theme.link_text_decoration,
      fontSize: 'inherit',
      fontStyle: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',

      '&:focus': {
        color: theme.link_text_focus_color
      },

      '&:hover': {
        color: theme.link_text_hover_color
      },

      '&.link-control, &.link-control:hover': {
        color: theme.text_control_color
      },

      '&.link-alternate, &.link-alternate:hover': {
        color: theme.text_alternate_color
      }
    },

    '.label': {
      color: theme.text_hint_color,
      fontFamily: theme.text_label_font_family,
      fontSize: theme.text_label_font_size,
      fontWeight: theme.text_label_font_weight,
      lineHeight: theme.text_label_line_height
    },

    '.caption': {
      fontFamily: theme.text_caption_font_family,
      fontSize: theme.text_caption_font_size,
      fontWeight: theme.text_caption_font_weight,
      lineHeight: theme.text_caption_line_height
    },

    '.caption-2': {
      fontFamily: theme.text_caption_2_font_family,
      fontSize: theme.text_caption_2_font_size,
      fontWeight: theme.text_caption_2_font_weight,
      lineHeight: theme.text_caption_2_line_height
    },

    '.caption, .caption-2': {
      color: theme.text_hint_color,

      ...getCaptionStatusStyles(theme)
    },

    li: {
      color: theme.list_item_text_color,
      fontFamily: theme.list_item_font_family,
      fontSize: theme.list_item_font_size,
      fontWeight: theme.list_item_font_weight,
      lineHeight: theme.list_item_line_height
    },

    '.text-alternate': {
      color: theme.text_alternate_color
    },

    '.text-disabled': {
      color: theme.text_disabled_color
    },

    '.text-hint': {
      color: theme.text_hint_color
    },

    '.visually-hidden': {
      /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
      position: 'absolute !important',
      height: '1px',
      width: '1px',
      overflow: 'hidden',
      clip: 'rect(1px, 1px, 1px, 1px)'
    },

    '.loader-container': {
      position: 'relative'
    },

    '.toastr-overlay-container': {
      zIndex: 1041
    },

    ...getTextStatusStyles(theme)
  };

  return styles;
};

export const GlobalStyles = React.memo(({ theme }: { theme: NebularTheme }) => (
  <Global styles={{ ...(getTypographyStyles(theme) as any) }} />
));
