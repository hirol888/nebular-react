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
  onClose?: () => void;
  onSearch?: (term: string) => void;
  onInputChange?: (value: string) => void;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>((props, ref) => {
  const {
    type,
    placeholder,
    hint,
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

  const escapeClose = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      typeof onClose === 'function' && onClose();
    }
  };

  const handleKeyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      typeof onSearch === 'function' && onSearch(inputRef.current.value);
    }
  };

  const handleInputChange = () => {
    typeof onInputChange === 'function' && onInputChange(inputRef.current?.value);
  };

  useEffect(() => {
    inputRef.current?.focus();
    document.body.addEventListener('keyup', escapeClose);
    setShow(true);

    return () => {
      document.body.removeEventListener('keyup', escapeClose);
    };
  }, []);

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
                onInput={handleInputChange}
              />
            </div>
            <span className={cx(classes.info)}>{hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

SearchField.displayName = '@nebular-react/core/SearchField';

export { SearchField };
