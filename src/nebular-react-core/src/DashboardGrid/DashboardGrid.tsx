import React, { forwardRef, useMemo, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    width: '100%',
    alignItems: 'stretch',

    '@media (max-width: 719px)': {
      gridTemplateColumns: 'minmax(0, 1fr) !important'
    }
  },

  widget: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    border: '1px solid var(--dashboard-widget-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--dashboard-widget-border-radius, 0.5rem)',
    backgroundColor:
      'var(--dashboard-widget-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--dashboard-widget-shadow, 0 1px 2px rgba(0, 0, 0, 0.04))',

    '@media (max-width: 719px)': {
      gridColumn: 'span 1 !important',
      gridRow: 'span 1 !important'
    }
  },

  widgetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: 'var(--dashboard-widget-header-padding, 0.5rem 0.75rem)',
    borderBottom:
      '1px solid var(--dashboard-widget-header-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  widgetTitle: {
    flex: '1 1 auto',
    margin: 0,
    color: 'var(--dashboard-widget-title-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--dashboard-widget-title-font-size, 0.875rem)',
    fontWeight: 700,
    lineHeight: 1.3
  },

  widgetControls: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: '0.125rem'
  },

  controlButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--dashboard-widget-control-size, 1.5rem)',
    height: 'var(--dashboard-widget-control-size, 1.5rem)',
    padding: 0,
    border: 0,
    borderRadius: 'var(--dashboard-widget-control-border-radius, 0.25rem)',
    backgroundColor: 'transparent',
    color: 'var(--dashboard-widget-control-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    lineHeight: 1,
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--dashboard-widget-control-hover-background-color, rgba(51, 102, 255, 0.08))',
      color: 'var(--dashboard-widget-control-hover-color, var(--color-primary-500, #3366ff))'
    },

    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed'
    },

    '&:focus-visible': {
      outline: '2px solid var(--dashboard-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  widgetBody: {
    flex: '1 1 auto',
    minHeight: 0,
    padding: 'var(--dashboard-widget-body-padding, 0.75rem)',
    color: 'var(--dashboard-widget-body-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--dashboard-widget-body-font-size, 0.875rem)'
  }
}));

export type DashboardGridStylesNames = Selectors<typeof useStyles>;

export interface DashboardWidget {
  id: string;
  title?: React.ReactNode;
  content: React.ReactNode;
  columnSpan?: number;
  rowSpan?: number;
}

export interface DashboardLayoutItem {
  id: string;
  columnSpan: number;
  rowSpan: number;
}

export interface DashboardGridProps
  extends DefaultProps<DashboardGridStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  widgets: DashboardWidget[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  layout?: DashboardLayoutItem[];
  defaultLayout?: DashboardLayoutItem[];
  onLayoutChange?(layout: DashboardLayoutItem[]): void;
  editable?: boolean;
  ariaLabel?: string;
  renderWidget?(widget: DashboardWidget): React.ReactNode;
}

const defaultProps: Partial<DashboardGridProps> = {
  columns: 12,
  rowHeight: 120,
  gap: 16,
  editable: false,
  ariaLabel: 'Dashboard grid'
};

const getWidgetLabel = (widget: DashboardWidget): string =>
  typeof widget.title === 'string' ? widget.title : widget.id;

const _DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>((props, ref) => {
  const {
    widgets,
    columns,
    rowHeight,
    gap,
    layout,
    defaultLayout,
    onLayoutChange,
    editable,
    ariaLabel,
    renderWidget,
    className,
    classNames,
    styles,
    unstyled,
    style,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'dashboard-grid',
    classNames,
    styles,
    unstyled
  });
  const [internalLayout, setInternalLayout] = useState<DashboardLayoutItem[]>(defaultLayout ?? []);
  const activeLayout = layout ?? internalLayout;

  const resolvedLayout = useMemo(() => {
    const widgetById = new Map(widgets.map((widget) => [widget.id, widget]));
    const itemById = new Map(activeLayout.map((item) => [item.id, item]));
    const orderedIds: string[] = [];

    activeLayout.forEach((item) => {
      if (widgetById.has(item.id) && !orderedIds.includes(item.id)) {
        orderedIds.push(item.id);
      }
    });

    widgets.forEach((widget) => {
      if (!orderedIds.includes(widget.id)) {
        orderedIds.push(widget.id);
      }
    });

    return orderedIds.map((id) => {
      const widget = widgetById.get(id) as DashboardWidget;
      const item = itemById.get(id);

      return {
        id,
        columnSpan: Math.max(1, Math.min(item?.columnSpan ?? widget.columnSpan ?? 1, columns)),
        rowSpan: Math.max(1, item?.rowSpan ?? widget.rowSpan ?? 1)
      };
    });
  }, [widgets, activeLayout, columns]);

  const applyLayout = (nextLayout: DashboardLayoutItem[]) => {
    if (layout === undefined) {
      setInternalLayout(nextLayout);
    }

    if (typeof onLayoutChange === 'function') {
      onLayoutChange(nextLayout);
    }
  };

  const updateSpan = (
    id: string,
    patch: Partial<Pick<DashboardLayoutItem, 'columnSpan' | 'rowSpan'>>
  ) => {
    applyLayout(
      resolvedLayout.map((item) => (item.id === id ? { ...item, ...patch } : { ...item }))
    );
  };

  const moveWidget = (id: string, direction: -1 | 1) => {
    const index = resolvedLayout.findIndex((item) => item.id === id);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= resolvedLayout.length) {
      return;
    }

    const nextLayout = [...resolvedLayout];
    [nextLayout[index], nextLayout[targetIndex]] = [nextLayout[targetIndex], nextLayout[index]];
    applyLayout(nextLayout);
  };

  const renderControls = (item: DashboardLayoutItem, index: number, label: string) => (
    <div className={cx(classes.widgetControls)}>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Move ${label} left`}
        disabled={index === 0}
        onClick={() => moveWidget(item.id, -1)}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Move ${label} right`}
        disabled={index === resolvedLayout.length - 1}
        onClick={() => moveWidget(item.id, 1)}
      >
        <span aria-hidden="true">→</span>
      </button>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Decrease width of ${label}`}
        disabled={item.columnSpan <= 1}
        onClick={() => updateSpan(item.id, { columnSpan: item.columnSpan - 1 })}
      >
        <span aria-hidden="true">−</span>
      </button>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Increase width of ${label}`}
        disabled={item.columnSpan >= columns}
        onClick={() => updateSpan(item.id, { columnSpan: item.columnSpan + 1 })}
      >
        <span aria-hidden="true">+</span>
      </button>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Decrease height of ${label}`}
        disabled={item.rowSpan <= 1}
        onClick={() => updateSpan(item.id, { rowSpan: item.rowSpan - 1 })}
      >
        <span aria-hidden="true">▾</span>
      </button>
      <button
        type="button"
        className={cx(classes.controlButton)}
        aria-label={`Increase height of ${label}`}
        onClick={() => updateSpan(item.id, { rowSpan: item.rowSpan + 1 })}
      >
        <span aria-hidden="true">▴</span>
      </button>
    </div>
  );

  return (
    <div
      {...others}
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: `${rowHeight}px`,
        gap: `${gap}px`,
        ...style
      }}
    >
      {resolvedLayout.map((item, index) => {
        const widget = widgets.find((entry) => entry.id === item.id) as DashboardWidget;
        const label = getWidgetLabel(widget);

        return (
          <section
            key={item.id}
            aria-label={label}
            className={cx(classes.widget)}
            style={{
              gridColumn: `span ${item.columnSpan}`,
              gridRow: `span ${item.rowSpan}`
            }}
          >
            {(widget.title !== undefined || editable) && (
              <header className={cx(classes.widgetHeader)}>
                {widget.title !== undefined && (
                  <h3 className={cx(classes.widgetTitle)}>{widget.title}</h3>
                )}
                {editable && renderControls(item, index, label)}
              </header>
            )}
            <div className={cx(classes.widgetBody)}>
              {typeof renderWidget === 'function' ? renderWidget(widget) : widget.content}
            </div>
          </section>
        );
      })}
    </div>
  );
});

_DashboardGrid.displayName = 'DashboardGrid';

export const DashboardGrid = _DashboardGrid;
