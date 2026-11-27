import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Icon } from '../Icon';
import useStyles from './Pagination.style';

export type PaginationStylesNames = Selectors<typeof useStyles>;

export type PaginationRangeItem = number | 'dots';

export interface PaginationProps
  extends
    DefaultProps<PaginationStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  total: number;
  page?: number;
  defaultPage?: number;
  onChange?(page: number): void;
  siblings?: number;
  boundaries?: number;
  withControls?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  getItemA11yLabel?(page: number): string;
}

const defaultProps: Partial<PaginationProps> = {
  defaultPage: 1,
  siblings: 1,
  boundaries: 1,
  withControls: true,
  disabled: false
};

export function getPaginationRange(
  total: number,
  page: number,
  siblings: number,
  boundaries: number
): PaginationRangeItem[] {
  const totalPages = Math.max(1, total);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pages = new Set<number>();

  for (let index = 1; index <= boundaries && index <= totalPages; index += 1) {
    pages.add(index);
    pages.add(totalPages - index + 1);
  }

  for (let index = currentPage - siblings; index <= currentPage + siblings; index += 1) {
    if (index >= 1 && index <= totalPages) {
      pages.add(index);
    }
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const range: PaginationRangeItem[] = [];

  sortedPages.forEach((value, index) => {
    if (index > 0 && value - sortedPages[index - 1] > 1) {
      range.push('dots');
    }
    range.push(value);
  });

  return range;
}

const _Pagination = forwardRef<HTMLElement, PaginationProps>((props, ref) => {
  const {
    total,
    page,
    defaultPage,
    onChange,
    siblings,
    boundaries,
    withControls,
    disabled,
    ariaLabel,
    getItemA11yLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'pagination', classNames, styles, unstyled });
  const { t } = useNebularLocale();
  const resolvedAriaLabel = ariaLabel ?? t('pagination.label', 'Pagination');
  const previousLabel = t('pagination.previous', 'Previous page');
  const nextLabel = t('pagination.next', 'Next page');

  const [currentPage, setCurrentPage] = useUncontrolled<number>({
    value: page,
    defaultValue: defaultPage,
    finalValue: 1,
    onChange
  });

  const totalPages = Math.max(1, total);
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const range = getPaginationRange(totalPages, activePage, siblings, boundaries);

  const goToPage = (nextPage: number) => {
    if (disabled) {
      return;
    }

    const normalizedPage = Math.min(Math.max(1, nextPage), totalPages);

    if (normalizedPage !== activePage) {
      setCurrentPage(normalizedPage);
    }
  };

  return (
    <nav
      {...others}
      ref={ref}
      aria-label={resolvedAriaLabel}
      className={cx(classes.root, className)}
    >
      {withControls && (
        <button
          type="button"
          className={cx(classes.item, classes.control)}
          onClick={() => goToPage(activePage - 1)}
          disabled={disabled || activePage <= 1}
          aria-label={previousLabel}
        >
          <Icon icon="chevron-left-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
      )}

      {range.map((item, index) =>
        item === 'dots' ? (
          <span key={`dots-${index}`} className={cx(classes.dots)} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cx(classes.item, { [classes.active]: item === activePage })}
            onClick={() => goToPage(item)}
            disabled={disabled}
            aria-label={
              getItemA11yLabel
                ? getItemA11yLabel(item)
                : t('pagination.page', 'Page {page}', { page: item })
            }
            aria-current={item === activePage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      {withControls && (
        <button
          type="button"
          className={cx(classes.item, classes.control)}
          onClick={() => goToPage(activePage + 1)}
          disabled={disabled || activePage >= totalPages}
          aria-label={nextLabel}
        >
          <Icon icon="chevron-right-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
});

_Pagination.displayName = 'Pagination';

export { _Pagination as Pagination };
