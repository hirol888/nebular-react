import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export type TypographyColor =
  'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'hint' | 'disabled';

export type TypographyVariant = 'title' | 'text' | 'paragraph' | 'link' | 'code' | 'blockquote';

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

const fontSizes: Record<TypographySize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '0.9375rem',
  lg: '1.125rem',
  xl: '1.375rem'
};

const headingFallbacks: Record<TitleOrder, string> = {
  1: '2.25rem',
  2: '2rem',
  3: '1.875rem',
  4: '1.625rem',
  5: '1.375rem',
  6: '1.125rem'
};

const fontWeights: Record<TypographyWeight, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

const colorTokens: Record<TypographyColor, string> = {
  default: 'var(--text-basic-color, #222b45)',
  primary: 'var(--color-primary-500, #3366ff)',
  success: 'var(--color-success-500, #00d68f)',
  info: 'var(--color-info-500, #0095ff)',
  warning: 'var(--color-warning-500, #ffaa00)',
  danger: 'var(--color-danger-500, #ff3d71)',
  hint: 'var(--text-hint-color, #8f9bb3)',
  disabled: 'var(--text-disabled-color, #c5cee0)'
};

export interface TypographyStylesParams {
  variant: TypographyVariant;
  size: TypographySize;
  color: TypographyColor;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  truncate?: boolean;
  lineClamp?: number;
  underline?: boolean;
  order?: TitleOrder;
}

const useStyles = createStyles(
  (
    _theme,
    {
      variant,
      size,
      color,
      weight,
      align,
      truncate,
      lineClamp,
      underline,
      order
    }: TypographyStylesParams
  ) => ({
    root: {
      margin: 0,
      fontFamily: `var(--typography-${variant}-font-family, var(--font-family-primary, inherit))`,
      fontSize:
        variant === 'title' && order
          ? `var(--typography-title-font-size, var(--text-heading-${order}-font-size, ${headingFallbacks[order]}))`
          : `var(--typography-${variant}-font-size, ${fontSizes[size]})`,
      fontWeight: weight ? fontWeights[weight] : undefined,
      color: `var(--typography-${variant}-color, ${colorTokens[color]})`,
      textAlign: align,
      ...(underline !== undefined ? { textDecoration: underline ? 'underline' : 'none' } : {}),
      ...(truncate
        ? {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        : {}),
      ...(lineClamp
        ? {
            display: '-webkit-box',
            WebkitLineClamp: lineClamp,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }
        : {}),

      ...(variant === 'blockquote'
        ? {
            paddingInlineStart: '1rem',
            borderInlineStart:
              '4px solid var(--typography-blockquote-border-color, var(--border-basic-color-4, #c5cee0))',
            color: 'var(--typography-blockquote-color, var(--text-hint-color, #8f9bb3))',
            fontStyle: 'italic'
          }
        : {}),

      ...(variant === 'code'
        ? {
            padding: '0.125rem 0.375rem',
            borderRadius: 'var(--typography-code-border-radius, 0.25rem)',
            backgroundColor:
              'var(--typography-code-background-color, var(--background-basic-color-2, #f7f9fc))',
            fontFamily:
              'var(--typography-code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)',
            fontSize: `var(--typography-code-font-size, ${fontSizes.sm})`
          }
        : {}),

      ...(variant === 'link'
        ? {
            cursor: 'pointer',
            '&:hover': {
              color: 'var(--typography-link-hover-color, var(--color-primary-600, #0043d9))'
            },
            '&:focus-visible': {
              outline:
                '2px solid var(--typography-link-focus-color, var(--color-primary-500, #3366ff))',
              outlineOffset: '2px',
              borderRadius: '2px'
            }
          }
        : {})
    }
  })
);

export type TypographyStylesNames = Selectors<typeof useStyles>;

export interface TitleProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'h1'>, 'color'> {
  order?: TitleOrder;
  color?: TypographyColor;
  align?: TypographyAlign;
  truncate?: boolean;
  lineClamp?: number;
}

const titleDefaultProps: Partial<TitleProps> = {
  order: 1,
  color: 'default'
};

const _Title = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  const {
    children,
    order,
    color,
    align,
    truncate,
    lineClamp,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(titleDefaultProps, props);
  const { classes, cx } = useStyles(
    { variant: 'title', size: 'md', color, align, truncate, lineClamp, order },
    { name: 'typography-title', classNames, styles, unstyled }
  );
  // The dynamic tag is cast so the heading keeps a stable element type for the ref.
  const Heading = `h${order}` as 'h1';

  return (
    <Heading {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </Heading>
  );
});

_Title.displayName = 'Typography.Title';

export interface TextProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  size?: TypographySize;
  weight?: TypographyWeight;
  color?: TypographyColor;
  align?: TypographyAlign;
  truncate?: boolean;
  lineClamp?: number;
  underline?: boolean;
}

const textDefaultProps: Partial<TextProps> = {
  size: 'md',
  color: 'default'
};

const _Text = forwardRef<HTMLSpanElement, TextProps>((props, ref) => {
  const {
    children,
    size,
    weight,
    color,
    align,
    truncate,
    lineClamp,
    underline,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(textDefaultProps, props);
  const { classes, cx } = useStyles(
    {
      variant: 'text',
      size,
      weight,
      color,
      align,
      truncate,
      lineClamp,
      underline
    },
    { name: 'typography-text', classNames, styles, unstyled }
  );

  return (
    <span {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </span>
  );
});

_Text.displayName = 'Typography.Text';

export interface ParagraphProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'p'>, 'color'> {
  size?: TypographySize;
  weight?: TypographyWeight;
  color?: TypographyColor;
  align?: TypographyAlign;
  truncate?: boolean;
  lineClamp?: number;
  underline?: boolean;
}

const paragraphDefaultProps: Partial<ParagraphProps> = {
  size: 'md',
  color: 'default'
};

const _Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>((props, ref) => {
  const {
    children,
    size,
    weight,
    color,
    align,
    truncate,
    lineClamp,
    underline,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(paragraphDefaultProps, props);
  const { classes, cx } = useStyles(
    {
      variant: 'paragraph',
      size,
      weight,
      color,
      align,
      truncate,
      lineClamp,
      underline
    },
    { name: 'typography-paragraph', classNames, styles, unstyled }
  );

  return (
    <p {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </p>
  );
});

_Paragraph.displayName = 'Typography.Paragraph';

export interface LinkProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'a'>, 'color'> {
  size?: TypographySize;
  color?: TypographyColor;
  underline?: boolean;
  external?: boolean;
}

const linkDefaultProps: Partial<LinkProps> = {
  size: 'md',
  color: 'primary',
  underline: true,
  external: false
};

const _Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const {
    children,
    size,
    color,
    underline,
    external,
    href,
    target,
    rel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(linkDefaultProps, props);
  const { classes, cx } = useStyles(
    { variant: 'link', size, color, underline },
    { name: 'typography-link', classNames, styles, unstyled }
  );

  return (
    <a
      {...others}
      ref={ref}
      href={href}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      className={cx(classes.root, className)}
    >
      {children}
    </a>
  );
});

_Link.displayName = 'Typography.Link';

export interface CodeProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'code'>, 'color'> {
  size?: TypographySize;
  color?: TypographyColor;
}

const codeDefaultProps: Partial<CodeProps> = {
  size: 'sm',
  color: 'default'
};

const _Code = forwardRef<HTMLElement, CodeProps>((props, ref) => {
  const { children, size, color, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(codeDefaultProps, props);
  const { classes, cx } = useStyles(
    { variant: 'code', size, color },
    { name: 'typography-code', classNames, styles, unstyled }
  );

  return (
    <code {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </code>
  );
});

_Code.displayName = 'Typography.Code';

export interface BlockquoteProps
  extends
    DefaultProps<TypographyStylesNames, TypographyStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'blockquote'>, 'color'> {
  size?: TypographySize;
  color?: TypographyColor;
  align?: TypographyAlign;
}

const blockquoteDefaultProps: Partial<BlockquoteProps> = {
  size: 'md',
  color: 'default'
};

const _Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>((props, ref) => {
  const { children, size, color, align, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(blockquoteDefaultProps, props);
  const { classes, cx } = useStyles(
    { variant: 'blockquote', size, color, align },
    { name: 'typography-blockquote', classNames, styles, unstyled }
  );

  return (
    <blockquote {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </blockquote>
  );
});

_Blockquote.displayName = 'Typography.Blockquote';

export { _Blockquote as Blockquote, _Code as Code, _Link as Link };
export { _Paragraph as Paragraph, _Text as Text, _Title as Title };
