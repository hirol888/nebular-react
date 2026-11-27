import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir,
  createPolymorphicComponent
} from '@nebular-react/styles';
import { SearchType } from './types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { OptionalPortal } from '../OptionalPortal';
import { SearchField } from './SearchField';
import useStyles from './Search.style';

export type SearchStylesNames = Selectors<typeof useStyles>;

export interface SearchProps
  extends DefaultProps<SearchStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  placeholder?: string;
  hint?: string;
  type?: SearchType;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (term: string) => void;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
  onInputChange?: (value: string) => void;
}

const defaultProps: Partial<SearchProps> = {
  placeholder: 'Search...',
  hint: 'Hit enter to search'
};

const _Search = forwardRef<HTMLDivElement, SearchProps>((props, ref) => {
  const {
    placeholder,
    hint,
    type,
    value,
    onChange,
    onSearch,
    onSearchOpen,
    onSearchClose,
    onInputChange,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const dir = useNebularDir();
  const [mounted, setMounted] = useState<boolean>(false);
  const { classes, cx } = useStyles(null, { name: 'search', classNames, styles, unstyled });
  const paneRef = useRef<HTMLDivElement>(null);
  const boundingBoxRef = useRef<HTMLDivElement>(null);
  const layoutNodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    layoutNodeRef.current = document.querySelector<HTMLElement>('.nebular-layout-root');
  }, []);

  const openSearch = () => {
    setMounted(true);
    if (type) {
      layoutNodeRef.current?.classList.add(type);
    }
    setTimeout(() => {
      layoutNodeRef.current?.classList.add('with-search');
    });
    typeof onSearchOpen === 'function' && onSearchOpen();
  };

  const hideSearch = () => {
    setMounted(false);
    layoutNodeRef.current?.classList.remove('with-search');
    setTimeout(() => {
      if (type) {
        layoutNodeRef.current?.classList.remove(type);
      }
    }, 300);
    typeof onSearchClose === 'function' && onSearchClose();
  };

  const handleSearch = (term: string) => {
    typeof onSearch === 'function' && onSearch(term);
    hideSearch();
  };

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      <Button
        appearance="ghost"
        aria-label="Open search"
        onClick={openSearch}
        prefixIcon={<Icon icon="search-outline" pack="nebular-essentials" />}
      />
      <OptionalPortal withinPortal>
        {mounted ? (
          <div ref={boundingBoxRef}>
            <div
              ref={paneRef}
              className="overlay-pane"
              style={{ visibility: mounted ? 'visible' : 'hidden' }}
              dir={dir}
            >
              <SearchField
                type={type}
                placeholder={placeholder}
                hint={hint}
                value={value}
                onSearch={(term) => handleSearch(term)}
                onClose={hideSearch}
                onInputChange={(inputValue) => {
                  typeof onChange === 'function' && onChange(inputValue);
                  typeof onInputChange === 'function' && onInputChange(inputValue);
                }}
              />
            </div>
          </div>
        ) : null}
      </OptionalPortal>
    </div>
  );
});

_Search.displayName = 'Search';

export const Search = createPolymorphicComponent<'div', SearchProps>(_Search);
