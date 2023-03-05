import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { SearchType } from './types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { OptionalPortal } from '../OptionalPortal';
import { SearchField } from './SearchField';
import useStyles from './Search.style';

export type SearchStylesNames = Selectors<typeof useStyles>;

export interface SearchProps
  extends DefaultProps<SearchStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  placeholder?: string;
  hint?: string;
  type?: SearchType;
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
  const layoutNodeRef = useRef<HTMLElement>();

  useEffect(() => {
    layoutNodeRef.current = document.querySelector<HTMLElement>('.nebular-layout-root');
  }, []);

  const openSearch = () => {
    setMounted(true);
    layoutNodeRef.current.classList.add(type);
    setTimeout(() => {
      layoutNodeRef.current.classList.add('with-search');
    });
  };

  const hideSearch = () => {
    setMounted(false);
    layoutNodeRef.current.classList.remove('with-search');
    setTimeout(() => {
      layoutNodeRef.current.classList.remove(type);
    }, 300);
  };

  const handleSearch = (term: string) => {
    typeof onSearch === 'function' && onSearch(term);
    hideSearch();
  };

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      <Button
        appearance="ghost"
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
                onSearch={(term) => handleSearch(term)}
                onClose={hideSearch}
                onInputChange={(value) =>
                  typeof onInputChange === 'function' && onInputChange(value)
                }
              />
            </div>
          </div>
        ) : null}
      </OptionalPortal>
    </div>
  );
});

_Search.displayName = '@nebular-react/core/Search';

export const Search = createPolymorphicComponent<'div', SearchProps>(_Search);
