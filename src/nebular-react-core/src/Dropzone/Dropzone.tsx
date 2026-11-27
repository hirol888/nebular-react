import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface DropzoneProps
  extends DefaultProps<DropzoneStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onDrop'> {
  onDrop(files: File[]): void;
  onReject?(files: File[]): void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  ariaLabel?: string;
}

const useStyles = createStyles(
  (_theme, { active, disabled }: { active: boolean; disabled: boolean }) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.35rem',
      minHeight: 'var(--dropzone-min-height, 8rem)',
      padding: '1rem',
      border: `2px dashed ${
        active
          ? 'var(--dropzone-active-border-color, var(--color-primary-500, #3366ff))'
          : 'var(--dropzone-border-color, var(--border-basic-color-3, #e4e9f2))'
      }`,
      borderRadius: 'var(--dropzone-border-radius, 0.5rem)',
      backgroundColor: active
        ? 'var(--dropzone-active-background-color, var(--background-basic-color-2, #f7f9fc))'
        : 'var(--dropzone-background-color, transparent)',
      color: 'var(--dropzone-text-color, var(--text-hint-color, #8f9bb3))',
      fontFamily: 'inherit',
      fontSize: 'var(--dropzone-font-size, 0.8125rem)',
      textAlign: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'border-color 120ms ease, background-color 120ms ease',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    input: {
      display: 'none'
    },

    title: {
      color: 'var(--dropzone-title-color, var(--text-basic-color, #222b45))',
      fontWeight: 600,
      fontSize: 'var(--dropzone-title-font-size, 0.875rem)'
    }
  })
);

export type DropzoneStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DropzoneProps> = {
  multiple: true,
  disabled: false,
  ariaLabel: 'Drop files here or click to select'
};

const matchesAccept = (file: File, accept?: string): boolean => {
  if (!accept) {
    return true;
  }

  return accept.split(',').some((rule) => {
    const value = rule.trim().toLowerCase();

    if (!value) {
      return true;
    }

    if (value.startsWith('.')) {
      return file.name.toLowerCase().endsWith(value);
    }

    if (value.endsWith('/*')) {
      return file.type.toLowerCase().startsWith(value.slice(0, -1));
    }

    return file.type.toLowerCase() === value;
  });
};

const _Dropzone = forwardRef<HTMLDivElement, DropzoneProps>((props, ref) => {
  const {
    onDrop,
    onReject,
    accept,
    multiple,
    maxSize,
    disabled,
    children,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { classes, cx } = useStyles(
    { active, disabled },
    { name: 'dropzone', classNames, styles, unstyled }
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const accepted: File[] = [];
    const rejected: File[] = [];

    Array.from(files).forEach((file) => {
      const fitsType = matchesAccept(file, accept);
      const fitsSize = maxSize === undefined || file.size <= maxSize;

      if (fitsType && fitsSize) {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    });

    if (accepted.length > 0) {
      onDrop(multiple ? accepted : accepted.slice(0, 1));
    }

    if (rejected.length > 0 && typeof onReject === 'function') {
      onReject(rejected);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      {...others}
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cx(classes.root, className)}
      onClick={openFileDialog}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFileDialog();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setActive(true);
        }
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        if (!disabled) {
          handleFiles(event.dataTransfer.files);
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className={cx(classes.input)}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {children ?? (
        <>
          <span className={cx(classes.title)}>Drop files here</span>
          <span>or click to select</span>
        </>
      )}
    </div>
  );
});

_Dropzone.displayName = 'Dropzone';

export { _Dropzone as Dropzone };
