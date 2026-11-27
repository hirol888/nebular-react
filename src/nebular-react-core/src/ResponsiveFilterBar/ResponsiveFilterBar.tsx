import React, { forwardRef, useId, useRef, useState } from 'react';
import { useFocusTrap, useMediaQuery } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import { Drawer } from '../Drawer';
import { NativeSelect } from '../NativeSelect';

export type ResponsiveFilterBarLayout = 'auto' | 'inline' | 'drawer';

export interface ResponsiveFilterBarFilter {
  /** Stable identifier passed to onRemoveFilter. */
  id: string;
  /** Readable description of an applied filter. */
  label: string;
}

export interface ResponsiveFilterBarView {
  /** Non-empty identifier passed to onSelectView. */
  id: string;
  /** Name shown in the saved views selector. */
  label: string;
}

export interface ResponsiveFilterBarProps
  extends
    DefaultProps<ResponsiveFilterBarStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Editor or render function receiving a close action. Keep editor values controlled. */
  editor: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Applied filters displayed as chips. */
  filters?: readonly ResponsiveFilterBarFilter[];
  /** Makes chips removable and reports which filter the user removed. */
  onRemoveFilter?(id: string): void;
  /** Shows a clear action when filters are applied. */
  onClearFilters?(): void;
  /** Views managed by the application. */
  savedViews?: readonly ResponsiveFilterBarView[];
  /** Identifier of the currently selected view. */
  selectedViewId?: string;
  /** Reports selection. Applications can use it to load a view's filters. */
  onSelectView?(id: string): void;
  /** Auto opens a bottom drawer at the mobile breakpoint and expands inline otherwise. */
  layout?: ResponsiveFilterBarLayout;
  /** Maximum viewport width in pixels for the drawer in auto layout. */
  mobileBreakpoint?: number;
  /** Accessible name of the overall group. */
  ariaLabel?: string;
  /** Label of the editor button, inline region and drawer. */
  editorLabel?: string;
  /** Accessible name of the list of applied filters. */
  activeFiltersLabel?: string;
  /** Label of the clear action. */
  clearLabel?: string;
  /** Label of the saved view selector. */
  savedViewsLabel?: string;
  /** Placeholder shown when a saved view is not selected. */
  savedViewsPlaceholder?: string;
  /** Accessible name for a chip's remove button. */
  getRemoveLabel?(filter: ResponsiveFilterBarFilter): string;
}

const useStyles = createStyles((_theme, _params, dir) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: 0,
    color: 'var(--text-basic-color, #222b45)'
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'end',
    gap: '0.5rem 0.75rem'
  },
  views: {
    flex: '0 1 13rem',
    minWidth: 0
  },
  action: {
    minHeight: '2.375rem',
    maxWidth: '100%',
    padding: '0.375rem 0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: '0.375rem',
    background: 'var(--background-basic-color-1, #ffffff)',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 600,
    overflowWrap: 'anywhere',
    cursor: 'pointer',

    '&:hover, &[aria-expanded="true"]': {
      background: 'var(--background-basic-color-3, #edf1f7)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0,
    maxWidth: '100%',
    padding: '0.125rem 0.5rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: '1rem',
    background: 'var(--background-basic-color-2, #f7f9fc)',
    fontSize: '0.8125rem',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  remove: {
    display: 'inline-flex',
    flex: '0 0 auto',
    justifyContent: 'center',
    alignItems: 'center',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: '1rem',
    cursor: 'pointer',

    '&:hover': {
      background: 'var(--background-basic-color-3, #edf1f7)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },
  editor: {
    minWidth: 0,
    padding: '1rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: '0.375rem',
    background: 'var(--background-basic-color-1, #ffffff)'
  },
  drawerPanel: {
    direction: dir,
    borderStartStartRadius: '0.75rem',
    borderStartEndRadius: '0.75rem'
  },
  drawerBody: {
    paddingBlockEnd: 'max(1rem, env(safe-area-inset-bottom))'
  }
}));

export type ResponsiveFilterBarStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ResponsiveFilterBarProps> = {
  filters: [],
  savedViews: [],
  selectedViewId: '',
  layout: 'auto',
  mobileBreakpoint: 767,
  ariaLabel: 'Filter controls',
  editorLabel: 'Filters',
  activeFiltersLabel: 'Active filters',
  clearLabel: 'Clear filters',
  savedViewsLabel: 'Saved views',
  savedViewsPlaceholder: 'Select a view',
  getRemoveLabel: ({ label }) => `Remove ${label}`
};

const ResponsiveFilterBar = forwardRef<HTMLDivElement, ResponsiveFilterBarProps>((props, ref) => {
  const {
    editor,
    filters,
    onRemoveFilter,
    onClearFilters,
    savedViews,
    selectedViewId,
    onSelectView,
    layout,
    mobileBreakpoint,
    ariaLabel,
    editorLabel,
    activeFiltersLabel,
    clearLabel,
    savedViewsLabel,
    savedViewsPlaceholder,
    getRemoveLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'responsive-filter-bar',
    classNames,
    styles,
    unstyled
  });
  const editorId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const mobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const useDrawer = layout === 'drawer' || (layout === 'auto' && mobile);
  const drawerRef = useFocusTrap(useDrawer && opened);
  const dir = useNebularDir();
  const closeEditor = () => {
    triggerRef.current?.focus();
    setOpened(false);
  };
  const renderedEditor = opened && (typeof editor === 'function' ? editor(closeEditor) : editor);

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      role="group"
      aria-label={ariaLabel}
    >
      <div className={classes.actions}>
        <button
          ref={triggerRef}
          type="button"
          className={classes.action}
          aria-expanded={opened}
          aria-controls={opened && !useDrawer ? editorId : undefined}
          aria-haspopup={useDrawer ? 'dialog' : undefined}
          onClick={() => setOpened((previous) => !previous)}
        >
          {editorLabel}
        </button>
        {savedViews.length > 0 && (
          <div className={classes.views}>
            <NativeSelect
              label={savedViewsLabel}
              placeholder={savedViewsPlaceholder}
              data={savedViews.map(({ id, label }) => ({ value: id, label }))}
              value={selectedViewId}
              disabled={!onSelectView}
              onChange={(id) => onSelectView?.(id)}
            />
          </div>
        )}
        {filters.length > 0 && onClearFilters && (
          <button
            type="button"
            className={classes.action}
            onClick={() => {
              triggerRef.current?.focus();
              onClearFilters();
            }}
          >
            {clearLabel}
          </button>
        )}
      </div>
      {filters.length > 0 && (
        // Safari can drop list semantics when list-style is none.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul className={classes.filters} role="list" aria-label={activeFiltersLabel}>
          {filters.map((filter) => (
            <li className={classes.chip} key={filter.id}>
              <span>{filter.label}</span>
              {onRemoveFilter && (
                <button
                  type="button"
                  className={classes.remove}
                  aria-label={getRemoveLabel(filter)}
                  onClick={(event) => {
                    const chip = event.currentTarget.parentElement;
                    const sibling = chip?.nextElementSibling ?? chip?.previousElementSibling;
                    (sibling?.querySelector('button') ?? triggerRef.current)?.focus();
                    onRemoveFilter(filter.id);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {useDrawer ? (
        <Drawer
          ref={drawerRef}
          opened={opened}
          onClose={closeEditor}
          title={editorLabel}
          position="bottom"
          size="min(85dvh, 36rem)"
          classNames={{ panel: classes.drawerPanel, body: classes.drawerBody }}
        >
          <div dir={dir}>{renderedEditor}</div>
        </Drawer>
      ) : (
        opened && (
          <div id={editorId} className={classes.editor} role="region" aria-label={editorLabel}>
            {renderedEditor}
          </div>
        )
      )}
    </div>
  );
});

ResponsiveFilterBar.displayName = 'ResponsiveFilterBar';

export { ResponsiveFilterBar };
