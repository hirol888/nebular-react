import { ENTER } from 'libs/nebular-react/src/core/cdk';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import React, { KeyboardEvent, useLayoutEffect, useRef } from 'react';
import { NbInput, NbInputProps } from '../input';

export type NbTagInputProps = {
  separatorKeys?: number[];
  useAutocomplete?: boolean;
  onTagAdd?: (tagText: string) => void;
  onInputChange?: (value: string) => void;
} & NbInputProps;

const NbTagInput = React.forwardRef<HTMLInputElement, NbTagInputProps>(
  (
    {
      separatorKeys = [ENTER],
      useAutocomplete = false,
      onTagAdd,
      onInputChange,
      fieldSize = 'medium',
      status = 'basic',
      shape = 'rectangle',
      fullWidth = false,
      disabled = false,
      onSizeChange,
      onFullWidthChange,
      onStatusChange,
      onDisableChange,
      onFocusChange
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
      inputRef.current?.classList.remove('nb-input');
    }, []);

    const isSeparatorKey = (keyCode: number) => {
      return separatorKeys.includes(keyCode);
    };

    const keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (!useAutocomplete) {
        if (isSeparatorKey(event.keyCode) && inputRef.current?.value) {
          onTagAdd && onTagAdd(inputRef.current.value);
          inputRef.current.value = '';
        }
      }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange && onInputChange(event.target.value);
    };

    return (
      <NbInput
        ref={mergedRefs(ref, inputRef)}
        fieldSize={fieldSize}
        status={status}
        shape={shape}
        fullWidth={fullWidth}
        disabled={disabled}
        onSizeChange={onSizeChange}
        onFullWidthChange={onFullWidthChange}
        onStatusChange={onStatusChange}
        onDisableChange={onDisableChange}
        onFocusChange={onFocusChange}
        onKeyDown={keyDownHandler}
        onChange={(event) => handleInputChange(event)}
        className="nb-tag-input"
      />
    );
  }
);

export { NbTagInput };
