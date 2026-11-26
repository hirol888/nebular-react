import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';

export interface TextareaStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
  fullWidth: boolean;
  resize: 'none' | 'vertical' | 'horizontal' | 'both';
}

const useStyles = createStyles(
  (_theme, { size, status, fullWidth, resize }: TextareaStylesParams) => ({
    root: {
      display: 'block',
      width: fullWidth ? '100%' : 'auto',
      minHeight: `var(--textarea-${size}-min-height, 4rem)`,
      padding: `var(--textarea-${size}-padding, 0.5rem 0.75rem)`,
      border: `1px solid var(--textarea-${status}-border-color, var(--border-basic-color-3, #e4e9f2))`,
      borderRadius: 'var(--textarea-border-radius, 0.25rem)',
      backgroundColor: 'var(--textarea-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--textarea-text-color, var(--text-basic-color, #222b45))',
      fontFamily: 'var(--textarea-text-font-family, inherit)',
      fontSize: `var(--textarea-${size}-text-font-size, 0.875rem)`,
      lineHeight: 'var(--textarea-text-line-height, 1.5)',
      outline: 'none',
      resize,
      boxSizing: 'border-box',

      '&::placeholder': {
        color: 'var(--textarea-placeholder-text-color, var(--text-hint-color, #8f9bb3))'
      },

      '&:focus': {
        borderColor: `var(--textarea-${status}-focus-border-color, var(--color-primary-500, #3366ff))`
      },

      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.6
      }
    }
  })
);

export type TextareaStylesNames = Selectors<typeof useStyles>;

export interface TextareaProps
  extends
    DefaultProps<TextareaStylesNames, TextareaStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'textarea'>, 'size'> {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const defaultProps: Partial<TextareaProps> = {
  size: 'medium',
  status: 'basic',
  fullWidth: false,
  resize: 'vertical',
  autosize: false,
  minRows: 2
};

const _Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    size,
    status,
    fullWidth,
    resize,
    autosize,
    minRows,
    maxRows,
    rows,
    value,
    defaultValue,
    className,
    classNames,
    styles,
    unstyled,
    style,
    onChange,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, status, fullWidth, resize },
    { name: 'textarea', classNames, styles, unstyled }
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const element = textareaRef.current;

    if (!autosize || !element) {
      return;
    }

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [autosize]);

  useEffect(resizeTextarea, [resizeTextarea, value, defaultValue]);

  return (
    <textarea
      {...others}
      ref={useMergedRef(ref, textareaRef)}
      rows={rows ?? minRows}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        resizeTextarea();
        typeof onChange === 'function' && onChange(event);
      }}
      className={cx(classes.root, className)}
      style={{ maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined, ...style }}
    />
  );
});

_Textarea.displayName = 'Textarea';

export { _Textarea as Textarea };
