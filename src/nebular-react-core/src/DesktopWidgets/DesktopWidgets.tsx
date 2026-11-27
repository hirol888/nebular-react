import React, { useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export interface DesktopWidgetPosition {
  x: number;
  y: number;
}

export interface DesktopWidgetSize {
  width: number;
  height: number;
}

export interface DesktopWidgetsBounds {
  width: number;
  height: number;
}

export interface DesktopWidget {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  defaultCollapsed?: boolean;
}

export interface DesktopWidgetsLabels {
  title: string;
  count(count: number): string;
  toggle: string;
  close: string;
  empty: string;
  drag: string;
}

type DesktopWidgetsBaseProps = DefaultProps<DesktopWidgetsStylesNames>;

export interface DesktopWidgetsProps extends DesktopWidgetsBaseProps {
  widgets: DesktopWidget[];
  title?: string;
  collapsed?: boolean;
  onCollapsedChange?(collapsed: boolean): void;
  onClose?(): void;
  labels?: Partial<DesktopWidgetsLabels>;
  ariaLabel?: string;
  /** Controlled panel position, relative to the bounds (or portal container). */
  position?: DesktopWidgetPosition;
  /** Initial panel position when `position` is not controlled. */
  defaultPosition?: DesktopWidgetPosition;
  /** Called whenever a pointer or keyboard interaction moves the panel. */
  onPositionChange?(position: DesktopWidgetPosition): void;
  /** Enables the bottom-right resize handle. */
  resizable?: boolean;
  /** Controlled panel size. */
  size?: DesktopWidgetSize;
  /** Initial panel size when `size` is not controlled. */
  defaultSize?: DesktopWidgetSize;
  /** Called whenever a pointer interaction resizes the panel. */
  onSizeChange?(size: DesktopWidgetSize): void;
  /** Area the panel is clamped to while dragging and resizing. */
  bounds?: DesktopWidgetsBounds;
  /** Renders the panel through a portal into this element. */
  container?: HTMLElement | null;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'absolute',
    top: 'var(--desktop-widgets-top, auto)',
    right: 'var(--desktop-widgets-right, 0.75rem)',
    bottom: 'var(--desktop-widgets-bottom, 3.5rem)',
    left: 'var(--desktop-widgets-left, auto)',
    zIndex: 'var(--desktop-widgets-z-index, 1100000000)' as unknown as number,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: 'var(--desktop-widgets-width, 18rem)',
    maxWidth: 'calc(100vw - 1.5rem)',
    maxHeight: 'var(--desktop-widgets-max-height, min(26rem, 70vh))',
    overflow: 'hidden',
    border: '1px solid var(--desktop-widgets-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-radius, 0.5rem)',
    backgroundColor:
      'var(--desktop-widgets-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--desktop-widgets-color, var(--text-basic-color, #222b45))',
    boxShadow: 'var(--desktop-widgets-shadow, 0 12px 32px rgba(0, 0, 0, 0.18))',
    fontFamily: 'var(--desktop-widgets-font-family, inherit)'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '0 0 auto',
    padding: 'var(--desktop-widgets-header-padding, 0.6rem 0.7rem)',
    borderBottom:
      '1px solid var(--desktop-widgets-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--desktop-widgets-header-background-color, var(--background-basic-color-2, #f7f9fc))',
    cursor: 'var(--desktop-widgets-drag-cursor, grab)',
    touchAction: 'none',
    userSelect: 'none',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  grip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.1rem',
    height: '1.1rem',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-widgets-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'grab',
    touchAction: 'none',

    '&:hover': {
      backgroundColor:
        'var(--desktop-widgets-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  heading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
    minWidth: 0
  },

  title: {
    margin: 0,
    overflow: 'hidden',
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  count: {
    flex: '0 0 auto',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.72rem',
    fontWeight: 500
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.15rem',
    marginInlineStart: 'auto'
  },

  action: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--desktop-widgets-action-size, 1.75rem)',
    height: 'var(--desktop-widgets-action-size, 1.75rem)',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-widgets-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-widgets-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--desktop-widgets-body-padding, 0.55rem)',

    '&[hidden]': {
      display: 'none'
    }
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--desktop-widgets-gap, 0.5rem)',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    minWidth: 0,
    padding: 'var(--desktop-widgets-card-padding, 0.6rem)',
    border:
      '1px solid var(--desktop-widgets-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-card-radius, 0.4rem)',
    backgroundColor:
      'var(--desktop-widgets-card-background-color, var(--background-basic-color-1, #ffffff))'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: 0
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'var(--desktop-widgets-icon-color, var(--color-primary-500, #3366ff))'
  },

  cardTitle: {
    margin: 0,
    overflow: 'hidden',
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  cardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    marginInlineStart: 'auto',
    padding: 0,
    border: 0,
    borderRadius: 'var(--desktop-widgets-action-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-widgets-action-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  description: {
    margin: 0,
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.73rem',
    lineHeight: 1.35
  },

  content: {
    minWidth: 0,
    fontSize: '0.78rem',
    lineHeight: 1.4,

    '&[hidden]': {
      display: 'none'
    }
  },

  empty: {
    margin: 0,
    padding: '0.75rem',
    border:
      '1px dashed var(--desktop-widgets-card-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-widgets-card-radius, 0.4rem)',
    color: 'var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.78rem',
    textAlign: 'center'
  },

  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '1rem',
    height: '1rem',
    cursor: 'nwse-resize',
    touchAction: 'none',

    '&::after': {
      content: '""',
      position: 'absolute',
      right: '0.2rem',
      bottom: '0.2rem',
      width: '0.45rem',
      height: '0.45rem',
      borderRight: '2px solid var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))',
      borderBottom: '2px solid var(--desktop-widgets-hint-color, var(--text-hint-color, #8f9bb3))'
    }
  }
}));

export type DesktopWidgetsStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DesktopWidgetsProps> = {};

const KEYBOARD_STEP = 1;
const KEYBOARD_SHIFT_STEP = 10;
const MIN_WIDGET_WIDTH = 160;
const MIN_WIDGET_HEIGHT = 120;

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface WidgetDragState {
  pointerId: number | undefined;
  startX: number;
  startY: number;
  origin: DesktopWidgetPosition;
}

interface WidgetResizeState {
  pointerId: number | undefined;
  startX: number;
  startY: number;
  origin: DesktopWidgetSize;
}

function isSamePosition(a: DesktopWidgetPosition | null, b: DesktopWidgetPosition): boolean {
  return a !== null && a.x === b.x && a.y === b.y;
}

function isSameSize(a: DesktopWidgetSize | null, b: DesktopWidgetSize): boolean {
  return a !== null && a.width === b.width && a.height === b.height;
}

export const DesktopWidgets = React.forwardRef<HTMLElement, DesktopWidgetsProps>((props, ref) => {
  const {
    widgets,
    title,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    onClose,
    labels: labelsProp,
    ariaLabel,
    position,
    defaultPosition,
    onPositionChange,
    resizable = false,
    size,
    defaultSize,
    onSizeChange,
    bounds,
    container,
    className,
    style,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-widgets',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const labels = useMemo<DesktopWidgetsLabels>(
    () => ({
      title: t('desktop.widgets', 'Widgets'),
      count: (count) => String(count),
      toggle: t('desktop.toggleWidgets', 'Toggle widgets'),
      close: t('common.close', 'Close'),
      empty: t('desktop.noWidgets', 'No widgets'),
      drag: t('desktop.dragWidgets', 'Move widgets'),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const bodyId = useId();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [widgetExpanded, setWidgetExpanded] = useState<Record<string, boolean>>({});
  const [internalPosition, setInternalPosition] = useState<DesktopWidgetPosition | null>(
    defaultPosition ?? null
  );
  const [internalSize, setInternalSize] = useState<DesktopWidgetSize | null>(defaultSize ?? null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<WidgetDragState | null>(null);
  const resizeRef = useRef<WidgetResizeState | null>(null);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const heading = title ?? labels.title;
  const isPositionControlled = position !== undefined;
  const isSizeControlled = size !== undefined;
  const effectivePosition = position ?? internalPosition;
  const effectiveSize = size ?? internalSize;
  const positionRef = useRef<DesktopWidgetPosition | null>(effectivePosition);
  const sizeRef = useRef<DesktopWidgetSize | null>(effectiveSize);
  positionRef.current = effectivePosition;
  sizeRef.current = effectiveSize;

  const togglePanel = () => {
    const next = !isCollapsed;

    if (controlledCollapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const toggleWidget = (widget: DesktopWidget) => {
    const expanded = widgetExpanded[widget.id] ?? !widget.defaultCollapsed;

    setWidgetExpanded((current) => ({ ...current, [widget.id]: !expanded }));
  };

  const getMeasuredSize = (): DesktopWidgetSize => {
    if (sizeRef.current) {
      return sizeRef.current;
    }

    return {
      width: rootRef.current?.offsetWidth ?? 0,
      height: rootRef.current?.offsetHeight ?? 0
    };
  };

  const clampPosition = (next: DesktopWidgetPosition): DesktopWidgetPosition => {
    if (!bounds) {
      return next;
    }

    const currentSize = getMeasuredSize();

    return {
      x: clampValue(next.x, 0, Math.max(0, bounds.width - currentSize.width)),
      y: clampValue(next.y, 0, Math.max(0, bounds.height - currentSize.height))
    };
  };

  const commitPosition = (next: DesktopWidgetPosition) => {
    if (isSamePosition(positionRef.current, next)) {
      return;
    }

    if (!isPositionControlled) {
      positionRef.current = next;
      setInternalPosition(next);
    }
    onPositionChange?.(next);
  };

  const commitSize = (next: DesktopWidgetSize) => {
    if (isSameSize(sizeRef.current, next)) {
      return;
    }

    if (!isSizeControlled) {
      sizeRef.current = next;
      setInternalSize(next);
    }
    onSizeChange?.(next);
  };

  const getDragOrigin = (): DesktopWidgetPosition =>
    positionRef.current ?? {
      x: rootRef.current?.offsetLeft ?? 0,
      y: rootRef.current?.offsetTop ?? 0
    };

  const handleHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const { target } = event;

    if (target instanceof Element) {
      const button = target.closest('button');

      if (button && !button.hasAttribute('data-desktop-widgets-drag')) {
        return;
      }
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: getDragOrigin()
    };
    setDragging(true);
  };

  const handleHeaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (
      !drag ||
      (drag.pointerId !== undefined &&
        event.pointerId !== undefined &&
        drag.pointerId !== event.pointerId)
    ) {
      return;
    }

    event.preventDefault();
    commitPosition(
      clampPosition({
        x: drag.origin.x + (event.clientX - drag.startX),
        y: drag.origin.y + (event.clientY - drag.startY)
      })
    );
  };

  const endDrag = () => {
    if (!dragRef.current) {
      return;
    }

    dragRef.current = null;
    setDragging(false);
  };

  const handleDragKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? KEYBOARD_SHIFT_STEP : KEYBOARD_STEP;
    let { x, y } = getDragOrigin();

    switch (event.key) {
      case 'ArrowLeft':
        x -= step;
        break;
      case 'ArrowRight':
        x += step;
        break;
      case 'ArrowUp':
        y -= step;
        break;
      case 'ArrowDown':
        y += step;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    commitPosition(clampPosition({ x, y }));
  };

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    handleDragKeyDown(event);
  };

  const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizable || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    resizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: getMeasuredSize()
    };
    setResizing(true);
  };

  const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;

    if (
      !resize ||
      (resize.pointerId !== undefined &&
        event.pointerId !== undefined &&
        resize.pointerId !== event.pointerId)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let width = Math.max(MIN_WIDGET_WIDTH, resize.origin.width + (event.clientX - resize.startX));
    let height = Math.max(
      MIN_WIDGET_HEIGHT,
      resize.origin.height + (event.clientY - resize.startY)
    );

    if (bounds) {
      const originPosition = positionRef.current ?? { x: 0, y: 0 };

      width = Math.min(width, Math.max(MIN_WIDGET_WIDTH, bounds.width - originPosition.x));
      height = Math.min(height, Math.max(MIN_WIDGET_HEIGHT, bounds.height - originPosition.y));
    }

    commitSize({ width, height });
  };

  const endResize = () => {
    if (!resizeRef.current) {
      return;
    }

    resizeRef.current = null;
    setResizing(false);
  };

  const rootStyle: React.CSSProperties = { ...style };

  if (effectivePosition) {
    rootStyle.left = effectivePosition.x;
    rootStyle.top = effectivePosition.y;
    rootStyle.right = 'auto';
    rootStyle.bottom = 'auto';
  }
  if (effectiveSize) {
    rootStyle.width = effectiveSize.width;
    rootStyle.height = effectiveSize.height;
    rootStyle.maxHeight = 'none';
  }

  const panel = (
    <section
      {...others}
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cx(classes.root, className)}
      style={rootStyle}
      aria-label={ariaLabel ?? heading}
      data-desktop-widgets=""
      data-desktop-widgets-dragging={dragging ? '' : undefined}
      data-desktop-widgets-resizing={resizing ? '' : undefined}
      data-desktop-widgets-resizable={resizable ? '' : undefined}
    >
      <div
        className={cx(classes.header)}
        role="group"
        aria-label={heading}
        data-desktop-widgets-header=""
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleHeaderKeyDown}
      >
        <button
          type="button"
          className={cx(classes.grip)}
          aria-label={labels.drag}
          title={labels.drag}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          data-desktop-widgets-drag=""
          onKeyDown={handleDragKeyDown}
        >
          <Icon icon="more-horizontal-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
        <div className={cx(classes.heading)}>
          <h2 className={cx(classes.title)}>{heading}</h2>
          <span className={cx(classes.count)}>{labels.count(widgets.length)}</span>
        </div>
        <div className={cx(classes.actions)}>
          <button
            type="button"
            className={cx(classes.action)}
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            aria-label={labels.toggle}
            title={labels.toggle}
            onClick={togglePanel}
          >
            <Icon
              icon={isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline'}
              pack="nebular-essentials"
              aria-hidden="true"
            />
          </button>
          {onClose && (
            <button
              type="button"
              className={cx(classes.action)}
              aria-label={labels.close}
              title={labels.close}
              onClick={onClose}
            >
              <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div id={bodyId} className={cx(classes.body)} hidden={isCollapsed}>
        {widgets.length === 0 ? (
          <p className={cx(classes.empty)}>{labels.empty}</p>
        ) : (
          <ul className={cx(classes.list)}>
            {widgets.map((widget) => {
              const expanded = widgetExpanded[widget.id] ?? !widget.defaultCollapsed;
              const contentId = `${bodyId}-${widget.id}`;

              return (
                <li key={widget.id} className={cx(classes.card)}>
                  <div className={cx(classes.cardHeader)}>
                    {widget.icon && (
                      <span className={cx(classes.icon)} aria-hidden="true">
                        {widget.icon}
                      </span>
                    )}
                    <h3 className={cx(classes.cardTitle)}>{widget.title}</h3>
                    <button
                      type="button"
                      className={cx(classes.cardAction)}
                      aria-expanded={expanded}
                      aria-controls={contentId}
                      aria-label={`${labels.toggle}: ${widget.title}`}
                      onClick={() => toggleWidget(widget)}
                    >
                      <Icon
                        icon={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                        pack="nebular-essentials"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {widget.description && (
                    <p className={cx(classes.description)}>{widget.description}</p>
                  )}
                  <div id={contentId} className={cx(classes.content)} hidden={!expanded}>
                    {widget.content}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {resizable && (
        <div
          className={cx(classes.resizeHandle)}
          aria-hidden="true"
          data-desktop-widgets-resize=""
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        />
      )}
    </section>
  );

  return container ? createPortal(panel, container) : panel;
});

DesktopWidgets.displayName = 'DesktopWidgets';
