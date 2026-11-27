import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles
} from '@nebular-react/styles';
import { Button } from '../Button';

export interface BulkActionBarSelection {
  count: number;
  scope: 'explicit' | 'allMatching';
}

export interface BulkActionBarPage {
  /** Number of selectable items on the current page. */
  count: number;
  selectedCount: number;
}

export interface BulkActionBarAction {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  status?: ComponentOrCustomStatus;
}

export interface BulkActionBarLabels {
  region: string;
  selection(selection: BulkActionBarSelection): string;
  selectPage: string;
  selectAllMatching(count?: number): string;
  clearSelection: string;
}

const defaultLabels: BulkActionBarLabels = {
  region: 'Bulk actions',
  selection: ({ count, scope }) =>
    scope === 'allMatching' ? `All ${count} results selected` : `${count} selected`,
  selectPage: 'Select this page',
  selectAllMatching: (count) =>
    count === undefined ? 'Select all matching results' : `Select all ${count} results`,
  clearSelection: 'Clear selection'
};

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--bulk-action-bar-gap, 0.75rem)',
    padding: 'var(--bulk-action-bar-padding, 0.75rem)',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--bulk-action-bar-border-radius, 0.375rem)',
    background: 'var(--bulk-action-bar-background, var(--background-basic-color-1, #ffffff))',
    color: 'var(--text-basic-color, #222b45)'
  },
  count: {
    fontSize: 'var(--bulk-action-bar-count-size, 0.875rem)',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },
  selection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem'
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginInlineStart: 'auto'
  }
}));

export type BulkActionBarStylesNames = Selectors<typeof useStyles>;

export interface BulkActionBarProps
  extends
    DefaultProps<BulkActionBarStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  selection: BulkActionBarSelection;
  page?: BulkActionBarPage;
  matchingCount?: number;
  actions?: readonly BulkActionBarAction[];
  labels?: Partial<BulkActionBarLabels>;
  disabled?: boolean;
  onSelectPage?(): void;
  onSelectAllMatching?(): void;
  onClearSelection?(): void;
  onAction?(actionId: string): void;
}

const buttonStyles = { disabled: { pointerEvents: 'auto' } } as const;

const BulkActionBar = forwardRef<HTMLDivElement, BulkActionBarProps>((props, ref) => {
  const {
    selection,
    page,
    matchingCount,
    actions = [],
    labels,
    disabled = false,
    onSelectPage,
    onSelectAllMatching,
    onClearSelection,
    onAction,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabel,
    ...others
  } = props;
  const { classes, cx } = useStyles(undefined, {
    name: 'bulk-action-bar',
    classNames,
    styles,
    unstyled
  });
  const text = { ...defaultLabels, ...labels };
  const allMatching = selection.scope === 'allMatching';
  const hasSelection = selection.count > 0 || allMatching;

  return (
    <div
      {...others}
      ref={ref}
      role="region"
      aria-label={ariaLabel ?? text.region}
      className={cx(classes.root, className)}
    >
      <span className={classes.count} role="status">
        {text.selection(selection)}
      </span>
      {((page && onSelectPage) || onSelectAllMatching || onClearSelection) && (
        <div className={classes.selection}>
          {page && onSelectPage && (
            <Button
              type="button"
              appearance="ghost"
              size="small"
              styles={buttonStyles}
              disabled={disabled || allMatching || page.selectedCount >= page.count}
              onClick={onSelectPage}
            >
              {text.selectPage}
            </Button>
          )}
          {onSelectAllMatching && (
            <Button
              type="button"
              appearance="ghost"
              size="small"
              styles={buttonStyles}
              disabled={disabled || allMatching || matchingCount === 0}
              onClick={onSelectAllMatching}
            >
              {text.selectAllMatching(matchingCount)}
            </Button>
          )}
          {onClearSelection && (
            <Button
              type="button"
              appearance="ghost"
              size="small"
              styles={buttonStyles}
              disabled={disabled || !hasSelection}
              onClick={onClearSelection}
            >
              {text.clearSelection}
            </Button>
          )}
        </div>
      )}
      {actions.length > 0 && (
        <div className={classes.actions}>
          {actions.map((action) => (
            <Button
              key={action.id}
              type="button"
              status={action.status}
              size="small"
              styles={buttonStyles}
              disabled={disabled || action.disabled || selection.count <= 0 || !onAction}
              onClick={() => onAction?.(action.id)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});

BulkActionBar.displayName = 'BulkActionBar';

export { BulkActionBar };
