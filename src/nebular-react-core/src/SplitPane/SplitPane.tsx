import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type SplitPaneOrientation = 'horizontal' | 'vertical';

interface SplitPaneStylesParams {
  orientation: SplitPaneOrientation;
  dragging: boolean;
}

const useStyles = createStyles((_theme, { orientation, dragging }: SplitPaneStylesParams) => {
  const isHorizontal = orientation === 'horizontal';

  return {
    root: {
      display: 'flex',
      flexDirection: isHorizontal ? 'row' : 'column',
      width: '100%',
      height: '100%',
      minWidth: 0,
      minHeight: 0,
      userSelect: dragging ? 'none' : undefined
    },

    single: {
      display: 'flex',
      flexDirection: 'column'
    },

    panel: {
      minWidth: 0,
      minHeight: 0,
      overflow: 'auto'
    },

    first: {
      flexGrow: 0,
      flexShrink: 0
    },

    second: {
      flex: '1 1 0%',
      minWidth: 0,
      minHeight: 0
    },

    separator: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      padding: 0,
      border: 0,
      backgroundColor:
        'var(--split-pane-separator-background-color, var(--border-basic-color-3, #e4e9f2))',
      touchAction: 'none',
      transition: 'background-color 0.15s ease',
      ...(isHorizontal
        ? { width: 'var(--split-pane-separator-size, 6px)', cursor: 'col-resize' }
        : { height: 'var(--split-pane-separator-size, 6px)', cursor: 'row-resize' }),

      '&:hover': {
        backgroundColor:
          'var(--split-pane-separator-hover-background-color, var(--color-primary-500, #3366ff))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--split-pane-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    separatorDisabled: {
      cursor: 'default',
      opacity: 0.6,

      '&:hover': {
        backgroundColor:
          'var(--split-pane-separator-background-color, var(--border-basic-color-3, #e4e9f2))'
      }
    },

    grip: {
      width: isHorizontal ? '2px' : 'var(--split-pane-grip-length, 1.5rem)',
      height: isHorizontal ? 'var(--split-pane-grip-length, 1.5rem)' : '2px',
      borderRadius: '999px',
      backgroundColor: 'var(--split-pane-grip-color, var(--text-hint-color, #8f9bb3))',
      pointerEvents: 'none'
    }
  };
});

export type SplitPaneStylesNames = Selectors<typeof useStyles>;

export interface SplitPaneProps
  extends
    DefaultProps<SplitPaneStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  children: React.ReactNode;
  orientation?: SplitPaneOrientation;
  size?: number;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  onSizeChange?(size: number): void;
  separatorLabel?: string;
  disabled?: boolean;
}

const defaultProps: Partial<SplitPaneProps> = {
  orientation: 'horizontal',
  defaultSize: 50,
  minSize: 10,
  maxSize: 90,
  separatorLabel: 'Resize panels',
  disabled: false
};

function roundSize(value: number): number {
  return Math.round(value * 100) / 100;
}

const _SplitPane = forwardRef<HTMLDivElement, SplitPaneProps>((props, ref) => {
  const {
    children,
    orientation,
    size,
    defaultSize,
    minSize,
    maxSize,
    onSizeChange,
    separatorLabel,
    disabled,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const [dragging, setDragging] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, rootRef);
  const { classes, cx } = useStyles(
    { orientation, dragging },
    { name: 'split-pane', classNames, styles, unstyled }
  );
  const [splitSize, setSplitSize] = useUncontrolled<number>({
    value: size,
    defaultValue: defaultSize,
    finalValue: 50,
    onChange: onSizeChange
  });

  const normalizedSize = Math.min(maxSize, Math.max(minSize, splitSize));
  const isHorizontal = orientation === 'horizontal';

  const commitSize = useCallback(
    (value: number) => {
      const next = Math.min(maxSize, Math.max(minSize, value));

      if (next === normalizedSize) {
        return;
      }

      setSplitSize(next);
    },
    [maxSize, minSize, normalizedSize, setSplitSize]
  );

  const updateFromClientPosition = useCallback(
    (clientX: number, clientY: number) => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      const rect = root.getBoundingClientRect();
      const total = isHorizontal ? rect.width : rect.height;

      if (!total) {
        return;
      }

      const offset = isHorizontal ? clientX - rect.left : clientY - rect.top;

      commitSize((offset / total) * 100);
    },
    [commitSize, isHorizontal]
  );

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMove = (event: MouseEvent | PointerEvent) => {
      updateFromClientPosition(event.clientX, event.clientY);
    };
    const handleEnd = () => {
      setDragging(false);
    };
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('pointerup', handleEnd);
    document.addEventListener('mouseup', handleEnd);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('pointerup', handleEnd);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [dragging, isHorizontal, updateFromClientPosition]);

  const handleDragStart = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    if (disabled) {
      return;
    }

    event.preventDefault();

    const target = event.currentTarget;
    const pointerId = 'pointerId' in event ? event.pointerId : undefined;

    if (pointerId !== undefined && typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(pointerId);
      } catch {
        // Pointer capture is not available in every environment.
      }
    }

    setDragging(true);
    updateFromClientPosition(event.clientX, event.clientY);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    let nextSize: number | null = null;

    if (isHorizontal && event.key === 'ArrowRight') {
      nextSize = normalizedSize + 5;
    } else if (isHorizontal && event.key === 'ArrowLeft') {
      nextSize = normalizedSize - 5;
    } else if (!isHorizontal && event.key === 'ArrowDown') {
      nextSize = normalizedSize + 5;
    } else if (!isHorizontal && event.key === 'ArrowUp') {
      nextSize = normalizedSize - 5;
    } else if (event.key === 'Home') {
      nextSize = minSize;
    } else if (event.key === 'End') {
      nextSize = maxSize;
    }

    if (nextSize === null) {
      return;
    }

    event.preventDefault();
    commitSize(nextSize);
  };

  const panels = React.Children.toArray(children);

  if (panels.length < 2) {
    return (
      <div {...others} ref={mergedRef} className={cx(classes.root, classes.single, className)}>
        {children}
      </div>
    );
  }

  const [firstPanel, ...remainingPanels] = panels;

  return (
    <div
      {...others}
      ref={mergedRef}
      className={cx(classes.root, className)}
      data-orientation={orientation}
    >
      <div
        className={cx(classes.panel, classes.first)}
        style={{ flexBasis: `${normalizedSize}%` }}
        data-panel="first"
      >
        {firstPanel}
      </div>

      <div
        role="separator"
        aria-label={separatorLabel}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={roundSize(normalizedSize)}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(classes.separator, { [classes.separatorDisabled]: disabled })}
        onPointerDown={handleDragStart}
        onMouseDown={handleDragStart}
        onKeyDown={handleKeyDown}
        data-dragging={dragging ? 'true' : 'false'}
      >
        <span className={cx(classes.grip)} aria-hidden="true" />
      </div>

      <div className={cx(classes.panel, classes.second)} data-panel="second">
        {remainingPanels}
      </div>
    </div>
  );
});

_SplitPane.displayName = 'SplitPane';

export { _SplitPane as SplitPane };
