import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useStyles } from './Desktop.styles';
import type {
  DesktopApp,
  DesktopLabels,
  DesktopOpenWindowOptions,
  DesktopSnapPosition,
  DesktopStyleProps,
  DesktopWindowBounds,
  DesktopWindowContextValue,
  DesktopWindowState
} from './Desktop.types';
import { DesktopWindowContext } from './Desktop.context';
import { DesktopWindowErrorBoundary } from './DesktopWindowErrorBoundary';
import {
  clamp,
  focusWindowElement,
  getAreaRect,
  getFocusableElements,
  getSnapPosition,
  resolveSnapBounds,
  windowIconNode,
  windowTitleNode,
  windowTitleText
} from './Desktop.utils';
import { Icon } from '../Icon';

export interface DesktopWindowFrameProps extends DesktopStyleProps {
  windowState: DesktopWindowState;
  app?: DesktopApp;
  labels: DesktopLabels;
  areaRef: React.RefObject<HTMLDivElement | null>;
  minWidth: number;
  minHeight: number;
  hasModalChild: boolean;
  active: boolean;
  hidden: boolean;
  zIndex: number;
  displayBounds?: DesktopWindowBounds;
  maximizedBounds?: DesktopWindowBounds;
  snapThreshold: number;
  keepInBounds: boolean;
  onPromote(id: string): void;
  onUpdate(id: string, patch: Partial<DesktopWindowState>): void;
  onClose(id: string): void;
  onMinimize(id: string): void;
  onMaximize(id: string): void;
  onRestore(id: string): void;
  onSnap(id: string, position: DesktopSnapPosition): void;
  onSnapPreview(bounds: DesktopWindowBounds | null): void;
  onContextMenu(id: string, event: React.MouseEvent | React.KeyboardEvent): void;
  onSetWindowState(id: string, state: unknown): void;
  openWindow(options: DesktopOpenWindowOptions): string;
}

interface InteractionState {
  mode: 'drag' | 'resize';
  direction?: string;
  startX: number;
  startY: number;
  bounds: DesktopWindowBounds;
  area: ReturnType<typeof getAreaRect>;
}

const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;

function DesktopWindowFrameComponent({
  windowState,
  app,
  labels,
  areaRef,
  minWidth,
  minHeight,
  hasModalChild,
  active,
  hidden,
  zIndex,
  displayBounds,
  maximizedBounds,
  snapThreshold,
  keepInBounds,
  onPromote,
  onUpdate,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  onSnap,
  onSnapPreview,
  onContextMenu,
  onSetWindowState,
  openWindow,
  classNames,
  styles,
  unstyled
}: DesktopWindowFrameProps) {
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-window',
    classNames,
    styles,
    unstyled
  });
  const frameRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<InteractionState | null>(null);
  const snapRef = useRef<DesktopSnapPosition | null>(null);
  const title = windowTitleText(windowState, app, labels.window);
  const titleContent = windowTitleNode(windowState, app, labels.window);
  const icon = windowIconNode(windowState, app);
  const isMaximized = windowState.maximized;
  const isDraggable = windowState.draggable !== false && app?.draggable !== false;
  const isResizable = windowState.resizable !== false && app?.resizable !== false;
  const canMinimize =
    !windowState.modal && windowState.minimizable !== false && app?.minimizable !== false;
  const canMaximize =
    !windowState.modal && windowState.maximizable !== false && app?.maximizable !== false;
  const minWindowWidth = Math.max(minWidth, app?.minWidth ?? 0);
  const minWindowHeight = Math.max(minHeight, app?.minHeight ?? 0);
  const resizeClassNames: Record<string, string> = {
    n: classes.resizeN,
    s: classes.resizeS,
    e: classes.resizeE,
    w: classes.resizeW,
    ne: classes.resizeNe,
    nw: classes.resizeNw,
    se: classes.resizeSe,
    sw: classes.resizeSw
  };

  const windowContext = useMemo<DesktopWindowContextValue>(
    () => ({
      window: windowState,
      openWindow: (options) => openWindow({ parentId: windowState.id, ...options }),
      closeWindow: () => onClose(windowState.id),
      minimizeWindow: () => onMinimize(windowState.id),
      maximizeWindow: () => onMaximize(windowState.id),
      restoreWindow: () => onRestore(windowState.id),
      setWindowState: (state) => onSetWindowState(windowState.id, state)
    }),
    [windowState, openWindow, onClose, onMinimize, onMaximize, onRestore, onSetWindowState]
  );

  useLayoutEffect(() => {
    if (hidden || !windowState.modal || !frameRef.current) {
      return;
    }

    if (!frameRef.current.contains(document.activeElement)) {
      focusWindowElement(frameRef.current, { modal: true });
    }
  }, [windowState.id, windowState.modal, hidden]);

  useEffect(() => () => onSnapPreview(null), [onSnapPreview]);

  const applyInteraction = (clientX: number, clientY: number) => {
    const interaction = interactionRef.current;

    if (!interaction) {
      return;
    }

    const start = interaction.bounds;
    const dx = clientX - interaction.startX;
    const dy = clientY - interaction.startY;
    const { area } = interaction;

    if (interaction.mode === 'drag') {
      const snapArea = displayBounds ?? {
        x: 0,
        y: 0,
        width: area.width,
        height: area.height
      };
      const position = getSnapPosition(
        clientX - area.left - snapArea.x,
        clientY - area.top - snapArea.y,
        snapArea,
        snapThreshold
      );

      if (position) {
        snapRef.current = position;
        const preview = resolveSnapBounds(position, snapArea);

        if (preview) {
          onSnapPreview({
            ...preview,
            x: preview.x + snapArea.x,
            y: preview.y + snapArea.y
          });
        }
        return;
      }

      if (snapRef.current) {
        snapRef.current = null;
        onSnapPreview(null);
      }

      let x = start.x + dx;
      let y = start.y + dy;

      if (keepInBounds && area.width > 0) {
        x = clamp(x, 0, Math.max(0, area.width - start.width));
      }
      if (keepInBounds && area.height > 0) {
        y = clamp(y, 0, Math.max(0, area.height - start.height));
      }

      onUpdate(windowState.id, { x, y });
      return;
    }

    const direction = interaction.direction ?? '';
    let { x, y, width, height } = start;

    if (direction.includes('e')) {
      width = start.width + dx;
    }
    if (direction.includes('s')) {
      height = start.height + dy;
    }
    if (direction.includes('w')) {
      x = start.x + dx;
      width = start.width - dx;
    }
    if (direction.includes('n')) {
      y = start.y + dy;
      height = start.height - dy;
    }

    width = Math.max(minWindowWidth, width);
    height = Math.max(minWindowHeight, height);

    if (direction.includes('w')) {
      x = start.x + start.width - width;
    }
    if (direction.includes('n')) {
      y = start.y + start.height - height;
    }

    if (keepInBounds && x < 0) {
      width += x;
      x = 0;
    }
    if (keepInBounds && y < 0) {
      height += y;
      y = 0;
    }

    if (keepInBounds && area.width > 0) {
      width = Math.min(width, area.width - x);
    }
    if (keepInBounds && area.height > 0) {
      height = Math.min(height, area.height - y);
    }

    onUpdate(windowState.id, {
      x,
      y,
      width: Math.max(minWindowWidth, width),
      height: Math.max(minWindowHeight, height)
    });
  };

  const beginInteraction = (
    event: React.PointerEvent<HTMLElement>,
    mode: 'drag' | 'resize',
    direction?: string
  ) => {
    if (event.button !== 0 || windowState.minimized || isMaximized) {
      return;
    }
    if (mode === 'drag' && !isDraggable) {
      return;
    }
    if (mode === 'resize' && !isResizable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    interactionRef.current = {
      mode,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      bounds: {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height
      },
      area: getAreaRect(areaRef.current)
    };
    onPromote(windowState.id);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!interactionRef.current) {
      return;
    }

    event.preventDefault();
    applyInteraction(event.clientX, event.clientY);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    if (!interactionRef.current) {
      return;
    }

    interactionRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const snap = snapRef.current;
    snapRef.current = null;

    if (snap) {
      onSnapPreview(null);
      if (snap === 'maximize') {
        onMaximize(windowState.id);
      } else {
        const area = getAreaRect(areaRef.current);
        const snapArea = displayBounds ?? {
          x: 0,
          y: 0,
          width: area.width,
          height: area.height
        };
        const bounds = resolveSnapBounds(snap, snapArea);

        if (bounds) {
          onUpdate(windowState.id, {
            ...bounds,
            x: bounds.x + snapArea.x,
            y: bounds.y + snapArea.y,
            maximized: false
          });
        }
      }
      onSnap(windowState.id, snap);
      return;
    }

    onSnapPreview(null);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    interactionRef.current = null;
    snapRef.current = null;
    onSnapPreview(null);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const toggleMaximize = () => {
    if (!canMaximize) {
      return;
    }

    if (isMaximized) {
      onRestore(windowState.id);
    } else {
      onMaximize(windowState.id);
    }
  };

  const snapWindow = (position: DesktopSnapPosition) => {
    if (position === 'maximize' && !canMaximize) {
      return;
    }

    if (position === 'maximize') {
      onMaximize(windowState.id);
    } else {
      const area = getAreaRect(areaRef.current);
      const snapArea = displayBounds ?? {
        x: 0,
        y: 0,
        width: area.width,
        height: area.height
      };
      const bounds = resolveSnapBounds(position, snapArea);

      if (bounds) {
        onUpdate(windowState.id, {
          ...bounds,
          x: bounds.x + snapArea.x,
          y: bounds.y + snapArea.y,
          maximized: false
        });
      }
    }
    onSnap(windowState.id, position);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isMaximized) {
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        onRestore(windowState.id);
      }
      return;
    }

    if (event.altKey && event.shiftKey && isResizable) {
      const step = event.ctrlKey ? 1 : 10;
      const area = getAreaRect(areaRef.current);
      let width = Math.max(minWindowWidth, windowState.width);
      let height = Math.max(minWindowHeight, windowState.height);

      if (event.key === 'ArrowRight') width += step;
      else if (event.key === 'ArrowLeft') width -= step;
      else if (event.key === 'ArrowDown') height += step;
      else if (event.key === 'ArrowUp') height -= step;
      else return;

      event.preventDefault();
      width = Math.max(minWindowWidth, width);
      height = Math.max(minWindowHeight, height);
      if (keepInBounds && area.width > 0) {
        width = Math.min(width, area.width - windowState.x);
      }
      if (keepInBounds && area.height > 0) {
        height = Math.min(height, area.height - windowState.y);
      }
      onUpdate(windowState.id, { width, height });
      return;
    }

    if (event.altKey && isDraggable) {
      const snapByArrow: Record<string, DesktopSnapPosition> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'maximize'
      };
      const position = snapByArrow[event.key];

      if (position) {
        event.preventDefault();
        snapWindow(position);
        return;
      }
    }

    if (!isDraggable) {
      return;
    }

    const step = event.shiftKey ? 1 : 10;
    let dx = 0;
    let dy = 0;

    if (event.key === 'ArrowLeft') dx = -step;
    else if (event.key === 'ArrowRight') dx = step;
    else if (event.key === 'ArrowUp') dy = -step;
    else if (event.key === 'ArrowDown') dy = step;
    else return;

    event.preventDefault();
    const area = getAreaRect(areaRef.current);
    let x = windowState.x + dx;
    let y = windowState.y + dy;

    if (keepInBounds && area.width > 0) {
      x = clamp(x, 0, Math.max(0, area.width - windowState.width));
    }
    if (keepInBounds && area.height > 0) {
      y = clamp(y, 0, Math.max(0, area.height - windowState.height));
    }

    onUpdate(windowState.id, { x, y });
  };

  const handleFrameKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab' && windowState.modal) {
      const focusable = getFocusableElements(frameRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (focusable.length === 0) {
        event.preventDefault();
        frameRef.current?.focus();
        return;
      }

      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === frameRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (event.key === 'F10' && event.shiftKey) {
      event.preventDefault();
      onContextMenu(windowState.id, event);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onPromote(windowState.id);
    onContextMenu(windowState.id, event);
  };

  const resolvedContent = windowState.content ?? app?.content;
  const content =
    typeof resolvedContent === 'function' ? resolvedContent(windowContext) : resolvedContent;
  const style: React.CSSProperties = isMaximized
    ? maximizedBounds
      ? {
          left: maximizedBounds.x,
          top: maximizedBounds.y,
          width: maximizedBounds.width,
          height: maximizedBounds.height,
          zIndex
        }
      : { zIndex }
    : {
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex
      };

  return (
    <DesktopWindowContext.Provider value={windowContext}>
      <div
        ref={frameRef}
        className={cx(classes.window, {
          [classes.windowMaximized]: isMaximized,
          [classes.windowBlocked]: hasModalChild,
          [classes.windowInactive]: !active && !hasModalChild
        })}
        style={style}
        role="dialog"
        aria-label={title}
        aria-modal={windowState.modal || undefined}
        aria-hidden={hasModalChild || hidden || undefined}
        inert={hasModalChild || hidden || undefined}
        hidden={hidden || undefined}
        tabIndex={-1}
        data-desktop-window-id={windowState.id}
        onPointerDown={() => onPromote(windowState.id)}
        onKeyDown={handleFrameKeyDown}
        onContextMenu={handleContextMenu}
      >
        <div
          className={cx(classes.titleBar, {
            [classes.titleBarStatic]: !isDraggable || isMaximized,
            [classes.titleBarInactive]: !active && !hasModalChild
          })}
          role="toolbar"
          aria-label={labels.window}
          tabIndex={0}
          onPointerDown={(event) => beginInteraction(event, 'drag')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
          onDoubleClick={toggleMaximize}
          onKeyDown={handleTitleKeyDown}
        >
          {icon && (
            <span className={cx(classes.windowIcon)} aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={cx(classes.windowTitle)}>{titleContent}</span>
          <div
            className={cx(classes.windowControls)}
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            {canMinimize && (
              <button
                type="button"
                className={cx(classes.windowControl)}
                aria-label={labels.minimize(title)}
                onClick={() => onMinimize(windowState.id)}
              >
                <Icon icon="minus-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
            {canMaximize && (
              <button
                type="button"
                className={cx(classes.windowControl)}
                aria-label={isMaximized ? labels.restore(title) : labels.maximize(title)}
                onClick={toggleMaximize}
              >
                <Icon
                  icon={isMaximized ? 'collapse-outline' : 'expand-outline'}
                  pack="nebular-essentials"
                  aria-hidden="true"
                />
              </button>
            )}
            {windowState.closable !== false && app?.closable !== false && (
              <button
                type="button"
                className={cx(classes.windowControl, classes.windowControlClose)}
                aria-label={labels.close(title)}
                onClick={() => onClose(windowState.id)}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className={cx(classes.windowBody)} data-desktop-window-body="true">
          <DesktopWindowErrorBoundary
            resetKey={windowState.id}
            message={labels.windowError}
            reloadLabel={labels.reloadWindow}
            className={cx(classes.windowError)}
            actionClassName={cx(classes.windowErrorAction)}
          >
            {content}
          </DesktopWindowErrorBoundary>
        </div>
        {isResizable && !isMaximized && (
          <>
            {RESIZE_DIRECTIONS.map((direction) => (
              <span
                key={direction}
                className={cx(classes.resizeHandle, resizeClassNames[direction])}
                aria-hidden="true"
                onPointerDown={(event) => beginInteraction(event, 'resize', direction)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerCancel}
              />
            ))}
          </>
        )}
      </div>
    </DesktopWindowContext.Provider>
  );
}

export const DesktopWindowFrame = React.memo(DesktopWindowFrameComponent);
DesktopWindowFrame.displayName = 'DesktopWindowFrame';
