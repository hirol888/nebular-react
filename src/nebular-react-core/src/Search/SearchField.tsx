import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { SearchType } from './types';
import useStyles from './Search.style';
import { Button } from '../Button';
import { Icon } from '../Icon';

export type SearchFieldStylesNames = Selectors<typeof useStyles>;

export interface SearchFieldProps extends DefaultProps<SearchFieldStylesNames> {
  type?: SearchType;
  placeholder?: string;
  hint?: string;
  value?: string;
  onClose?: () => void;
  onSearch?: (term: string) => void;
  onInputChange?: (value: string) => void;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>((props, ref) => {
  const {
    type,
    placeholder,
    hint,
    value,
    onClose,
    onSearch,
    onInputChange,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const { classes, cx } = useStyles(null, { name: 'search', classNames, styles, unstyled });
  const inputRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string>('');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleKeyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      typeof onSearch === 'function' && onSearch(currentValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }
    typeof onInputChange === 'function' && onInputChange(nextValue);
  };

  useEffect(() => {
    inputRef.current?.focus();
    setShow(true);
  }, []);

  useEffect(() => {
    const escapeClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        typeof onClose === 'function' && onClose();
      }
    };

    document.body.addEventListener('keyup', escapeClose);

    return () => {
      document.body.removeEventListener('keyup', escapeClose);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cx(classes.searchField, className, {
        show,
        'modal-zoomin': type === 'modal-zoomin',
        'rotate-layout': type === 'rotate-layout',
        'modal-move': type === 'modal-move',
        curtain: type === 'curtain',
        'column-curtain': type === 'column-curtain',
        'modal-drop': type === 'modal-drop',
        'modal-half': type === 'modal-half'
      })}
      {...others}
    >
      <div className={cx(classes.search)} onKeyUp={handleKeyup}>
        <Button
          appearance="ghost"
          aria-label="Close search"
          className={cx(classes.closeButton)}
          prefixIcon={<Icon icon="close-outline" pack="nebular-essentials" />}
          onClick={() => typeof onClose === 'function' && onClose()}
        />
        <div className="outer-wrapper">
          <div className="inner-wrapper">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                autoComplete="off"
                placeholder={placeholder}
                tabIndex={-1}
                value={currentValue}
                onChange={handleInputChange}
              />
            </div>
            <span className={cx(classes.info)}>{hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

SearchField.displayName = 'SearchField';

export { SearchField };
