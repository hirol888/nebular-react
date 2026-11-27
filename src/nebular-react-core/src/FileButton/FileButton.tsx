import React, { forwardRef, useRef } from 'react';
import { useMergedRef } from '@nebular-react/hooks';

type FileButtonTriggerProps = {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  ref?: React.Ref<HTMLElement>;
};

export interface FileButtonProps {
  children: React.ReactElement<FileButtonTriggerProps>;
  onChange(files: File[] | null): void;
  multiple?: boolean;
  accept?: string;
  capture?: boolean | 'user' | 'environment';
  disabled?: boolean;
  reset?: boolean;
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'multiple' | 'accept' | 'capture'
  >;
  ariaLabel?: string;
}

const _FileButton = forwardRef<HTMLElement, FileButtonProps>((props, ref) => {
  const {
    children,
    onChange,
    multiple = false,
    accept,
    capture,
    disabled = false,
    reset = false,
    inputProps,
    ariaLabel
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const childElement = children as React.ReactElement<FileButtonTriggerProps>;
  const childRef = childElement.props.ref;
  const mergedRef = useMergedRef(ref, childRef);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    childElement.props.onClick?.(event);
    if (event.defaultPrevented || disabled || childElement.props.disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files;
    const files = fileList && fileList.length > 0 ? Array.from(fileList) : null;
    onChange(files);

    if (reset) {
      event.currentTarget.value = '';
    }
  };

  return (
    <>
      {React.cloneElement(childElement, {
        onClick: handleClick,
        ref: mergedRef
      })}
      <input
        {...inputProps}
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        capture={capture}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: 'none', ...inputProps?.style }}
        onChange={handleChange}
      />
    </>
  );
});

_FileButton.displayName = 'FileButton';

export { _FileButton as FileButton };
