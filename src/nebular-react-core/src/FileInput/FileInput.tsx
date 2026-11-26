import React, { forwardRef, useId, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface FileInputStylesParams {
  disabled: boolean;
}

const useStyles = createStyles((_theme, { disabled }: FileInputStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontFamily: 'inherit'
  },

  label: {
    color: 'var(--file-input-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--file-input-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  input: {
    display: 'none'
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--file-input-gap, 0.5rem)',
    minWidth: 0
  },

  button: {
    flex: '0 0 auto',
    padding: 'var(--file-input-button-padding, 0.375rem 0.75rem)',
    border: '1px solid var(--file-input-button-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-input-border-radius, 0.25rem)',
    backgroundColor:
      'var(--file-input-button-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--file-input-button-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'var(--file-input-font-size, 0.8125rem)',
    lineHeight: 1.4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 120ms ease, border-color 120ms ease',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--file-input-button-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },

  fileName: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--file-input-file-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--file-input-font-size, 0.8125rem)'
  },

  placeholder: {
    color: 'var(--file-input-placeholder-color, var(--text-hint-color, #8f9bb3))'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-input-list-gap, 0.25rem)',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--file-input-gap, 0.5rem)',
    minWidth: 0
  },

  clear: {
    flex: '0 0 auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--file-input-clear-size, 1.5rem)',
    height: 'var(--file-input-clear-size, 1.5rem)',
    padding: 0,
    border: 0,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: 'var(--file-input-clear-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    fontSize: 'var(--file-input-font-size, 1rem)',
    lineHeight: 1,
    cursor: 'pointer',

    '&:hover': {
      color: 'var(--file-input-clear-hover-color, var(--color-danger-500, #ff3d71))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  error: {
    color: 'var(--file-input-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--file-input-error-font-size, 0.75rem)'
  }
}));

export type FileInputStylesNames = Selectors<typeof useStyles>;

export type FileInputValue = File | File[] | null;

export interface FileInputProps
  extends
    DefaultProps<FileInputStylesNames, FileInputStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  value?: FileInputValue;
  defaultValue?: FileInputValue;
  onChange?(value: FileInputValue): void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  clearable?: boolean;
  ariaLabel?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
}

const defaultProps: Partial<FileInputProps> = {
  placeholder: 'No file selected',
  buttonLabel: 'Select file',
  clearable: true,
  disabled: false,
  multiple: false
};

const isSameFileList = (first: File[], second: File[]) =>
  first.length === second.length && first.every((file, index) => file === second[index]);

const _FileInput = forwardRef<HTMLDivElement, FileInputProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    multiple,
    maxFiles,
    accept,
    disabled,
    placeholder,
    buttonLabel,
    clearable,
    ariaLabel,
    label,
    error,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { disabled },
    { name: 'file-input', classNames, styles, unstyled }
  );
  const [selection, setSelection] = useUncontrolled<FileInputValue>({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const files: File[] = Array.isArray(selection) ? selection : selection ? [selection] : [];
  const file = files[0] ?? null;
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const clear = () => {
    setSelection(multiple ? [] : null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelection(files.filter((_item, fileIndex) => fileIndex !== index));
  };

  const handleSelection = (selected: File[]) => {
    if (selected.length === 0) {
      return;
    }

    if (!multiple) {
      setSelection(selected[0]);
      return;
    }

    const limit =
      typeof maxFiles === 'number' && maxFiles > 0 ? maxFiles : Number.POSITIVE_INFINITY;
    const next = [...files, ...selected].slice(0, limit);

    if (isSameFileList(next, files)) {
      return;
    }

    setSelection(next);
  };

  const groupLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={groupLabel}
      className={cx(classes.root, className)}
    >
      {label && (
        <label className={cx(classes.label)} htmlFor={inputId}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className={cx(classes.input)}
        accept={accept}
        multiple={multiple || undefined}
        disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          // Reset the native input so selecting the same file fires change again
          event.target.value = '';
          handleSelection(selected);
        }}
      />

      <div className={cx(classes.controls)}>
        <button
          type="button"
          className={cx(classes.button)}
          disabled={disabled}
          onClick={openFileDialog}
        >
          {buttonLabel}
        </button>

        {multiple ? (
          files.length === 0 && (
            <span className={cx(classes.fileName, classes.placeholder)}>{placeholder}</span>
          )
        ) : (
          <span className={cx(classes.fileName, { [classes.placeholder]: !file })}>
            {file ? file.name : placeholder}
          </span>
        )}

        {clearable && !disabled && (multiple ? files.length > 0 : !!file) && (
          <button
            type="button"
            className={cx(classes.clear)}
            onClick={clear}
            aria-label={multiple ? 'Clear files' : 'Clear file'}
          >
            &times;
          </button>
        )}
      </div>

      {multiple && files.length > 0 && (
        <ul className={cx(classes.list)}>
          {files.map((selectedFile, index) => (
            <li
              key={`${selectedFile.name}-${selectedFile.lastModified}-${index}`}
              className={cx(classes.listItem)}
            >
              <span className={cx(classes.fileName)}>{selectedFile.name}</span>
              {!disabled && (
                <button
                  type="button"
                  className={cx(classes.clear)}
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${selectedFile.name}`}
                >
                  &times;
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div id={errorId} className={cx(classes.error)} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

_FileInput.displayName = 'FileInput';

export { _FileInput as FileInput };
