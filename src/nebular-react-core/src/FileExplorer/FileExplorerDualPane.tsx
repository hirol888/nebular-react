import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import { useComponentDefaultProps, useNebularLocale } from '@nebular-react/styles';
import { FileExplorer } from './FileExplorer';
import { useStyles } from './FileExplorerDualPane.styles';
import type {
  FileExplorerDualPaneLabels,
  FileExplorerDualPaneProps
} from './FileExplorerDualPane.types';

const defaultProps: Partial<FileExplorerDualPaneProps> = {
  defaultPrimaryPath: '/',
  defaultSecondaryPath: '/',
  defaultView: 'list',
  ariaLabel: 'Dual-pane file explorer',
  initialSplit: 50,
  minPaneWidth: '12rem'
};

const DEFAULT_ROOT_FONT_SIZE = 16;
const SPLIT_STEP = 5;
const SEPARATOR_SIZE_REM = 0.5;
const FALLBACK_MIN_SPLIT = 10;

function resolveRootFontSize(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return DEFAULT_ROOT_FONT_SIZE;
  }

  const fontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : DEFAULT_ROOT_FONT_SIZE;
}

function toPixels(value: number | string, rootFontSize: number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  const match = /^\s*([\d.]+)\s*(px|rem|em)?\s*$/.exec(value);

  if (!match) {
    return 0;
  }

  const amount = Number.parseFloat(match[1]);
  const unit = match[2] ?? 'px';

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.max(0, unit === 'px' ? amount : amount * rootFontSize);
}

function clamp(value: number, min: number, max: number): number {
  const safe = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, safe));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export const FileExplorerDualPane = forwardRef<HTMLDivElement, FileExplorerDualPaneProps>(
  (props, ref) => {
    const {
      provider,
      primaryPath,
      defaultPrimaryPath,
      onPrimaryPathChange,
      secondaryPath,
      defaultSecondaryPath,
      onSecondaryPathChange,
      view,
      defaultView,
      onViewChange,
      tabs,
      searchable,
      selectionMode,
      sidebar,
      labels: labelsProp,
      ariaLabel,
      readOnly,
      renderIcon,
      renderPreview,
      onPrimarySelectionChange,
      onSecondarySelectionChange,
      initialSplit,
      split,
      onSplitChange,
      minPaneWidth,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    } = useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(undefined, {
      name: 'file-explorer-dual-pane',
      classNames,
      styles,
      unstyled
    });
    const { t } = useNebularLocale();
    const labels = useMemo<FileExplorerDualPaneLabels>(
      () => ({
        primary: t('fileExplorerDualPane.primary', 'Primary pane'),
        secondary: t('fileExplorerDualPane.secondary', 'Secondary pane'),
        resize: t('fileExplorerDualPane.resize', 'Resize panes'),
        ...labelsProp
      }),
      [labelsProp, t]
    );
    const primaryExplorerLabels = useMemo(
      () => ({
        breadcrumb: t('fileExplorerDualPane.breadcrumb', '{pane} breadcrumb', {
          pane: labels.primary
        })
      }),
      [labels.primary, t]
    );
    const secondaryExplorerLabels = useMemo(
      () => ({
        breadcrumb: t('fileExplorerDualPane.breadcrumb', '{pane} breadcrumb', {
          pane: labels.secondary
        })
      }),
      [labels.secondary, t]
    );
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRef(ref, rootRef);
    const paneIdBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const primaryPaneId = `${paneIdBase}-primary`;
    const secondaryPaneId = `${paneIdBase}-secondary`;
    const [internalPrimaryPath, setInternalPrimaryPath] = useState(defaultPrimaryPath);
    const [internalSecondaryPath, setInternalSecondaryPath] = useState(defaultSecondaryPath);
    const [internalSplit, setInternalSplit] = useState(initialSplit);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dragging, setDragging] = useState(false);
    const rootFontSize = useMemo(() => resolveRootFontSize(), []);
    const minPanePixels = useMemo(
      () => toPixels(minPaneWidth, rootFontSize),
      [minPaneWidth, rootFontSize]
    );
    const stacked =
      containerWidth > 0 && containerWidth < minPanePixels * 2 + SEPARATOR_SIZE_REM * rootFontSize;
    const widthConstrained = !stacked && containerWidth > 0 && minPanePixels > 0;
    const minSplit = widthConstrained
      ? Math.min(50, (minPanePixels / containerWidth) * 100)
      : FALLBACK_MIN_SPLIT;
    const maxSplit = 100 - minSplit;
    const splitValue = round(clamp(split ?? internalSplit, minSplit, maxSplit));

    const commitSplit = useCallback(
      (nextSplit: number) => {
        const next = round(clamp(nextSplit, minSplit, maxSplit));

        if (next === splitValue) {
          return;
        }

        if (split === undefined) {
          setInternalSplit(next);
        }

        onSplitChange?.(next);
      },
      [maxSplit, minSplit, onSplitChange, split, splitValue]
    );

    const updateFromClientPosition = useCallback(
      (clientX: number, clientY: number) => {
        const element = rootRef.current;

        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const total = stacked ? rect.height : rect.width;

        if (!total) {
          return;
        }

        const offset = stacked ? clientY - rect.top : clientX - rect.left;
        commitSplit((offset / total) * 100);
      },
      [commitSplit, stacked]
    );

    useIsomorphicEffect(() => {
      const element = rootRef.current;

      if (!element) {
        return undefined;
      }

      const measure = () => {
        const next = element.getBoundingClientRect().width;
        setContainerWidth((current) => (Math.abs(current - next) < 1 ? current : next));
      };

      measure();

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', measure);
      }

      const observer =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : undefined;
      observer?.observe(element);

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', measure);
        }

        observer?.disconnect();
      };
    }, []);

    useEffect(() => {
      if (!dragging || typeof document === 'undefined') {
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
      document.body.style.cursor = stacked ? 'row-resize' : 'col-resize';
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
    }, [dragging, stacked, updateFromClientPosition]);

    const handleSeparatorPointerDown = (
      event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
    ) => {
      if (event.button !== undefined && event.button !== 0) {
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

    const handleSeparatorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      let nextSplit: number | null = null;

      if (event.key === 'ArrowRight' || (stacked && event.key === 'ArrowDown')) {
        nextSplit = splitValue + SPLIT_STEP;
      } else if (event.key === 'ArrowLeft' || (stacked && event.key === 'ArrowUp')) {
        nextSplit = splitValue - SPLIT_STEP;
      } else if (event.key === 'Home') {
        nextSplit = minSplit;
      } else if (event.key === 'End') {
        nextSplit = maxSplit;
      }

      if (nextSplit === null) {
        return;
      }

      event.preventDefault();
      commitSplit(nextSplit);
    };

    const handlePrimaryPathChange = useCallback(
      (nextPath: string) => {
        if (primaryPath === undefined) {
          setInternalPrimaryPath(nextPath);
        }

        onPrimaryPathChange?.(nextPath);
      },
      [onPrimaryPathChange, primaryPath]
    );

    const handleSecondaryPathChange = useCallback(
      (nextPath: string) => {
        if (secondaryPath === undefined) {
          setInternalSecondaryPath(nextPath);
        }

        onSecondaryPathChange?.(nextPath);
      },
      [onSecondaryPathChange, secondaryPath]
    );

    return (
      <div
        {...others}
        ref={mergedRef}
        role="group"
        aria-label={ariaLabel}
        className={cx(classes.root, className, { [classes.rootStacked]: stacked })}
        data-layout={stacked ? 'stacked' : 'side-by-side'}
      >
        <div
          id={primaryPaneId}
          role="group"
          aria-label={labels.primary}
          className={cx(classes.pane, classes.panePrimary)}
          style={{ flexBasis: `${splitValue}%` }}
          data-pane="primary"
        >
          <FileExplorer
            provider={provider}
            path={primaryPath ?? internalPrimaryPath}
            onPathChange={handlePrimaryPathChange}
            view={view}
            defaultView={defaultView}
            onViewChange={onViewChange}
            tabs={tabs}
            searchable={searchable}
            selectionMode={selectionMode}
            sidebar={sidebar}
            labels={primaryExplorerLabels}
            ariaLabel={labels.primary}
            readOnly={readOnly}
            renderIcon={renderIcon}
            renderPreview={renderPreview}
            onSelectionChange={onPrimarySelectionChange}
          />
        </div>

        <div
          role="separator"
          aria-label={labels.resize}
          aria-orientation={stacked ? 'horizontal' : 'vertical'}
          aria-valuenow={splitValue}
          aria-valuemin={round(minSplit)}
          aria-valuemax={round(maxSplit)}
          aria-controls={`${primaryPaneId} ${secondaryPaneId}`}
          // A focusable separator is the ARIA pattern for a resizable splitter.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={cx(classes.separator, {
            [classes.separatorStacked]: stacked,
            [classes.separatorDragging]: dragging
          })}
          onPointerDown={handleSeparatorPointerDown}
          onMouseDown={handleSeparatorPointerDown}
          onKeyDown={handleSeparatorKeyDown}
          data-dragging={dragging ? 'true' : 'false'}
        >
          <span
            className={cx(classes.grip, { [classes.gripStacked]: stacked })}
            aria-hidden="true"
          />
        </div>

        <div
          id={secondaryPaneId}
          role="group"
          aria-label={labels.secondary}
          className={cx(classes.pane, classes.paneSecondary)}
          data-pane="secondary"
        >
          <FileExplorer
            provider={provider}
            path={secondaryPath ?? internalSecondaryPath}
            onPathChange={handleSecondaryPathChange}
            view={view}
            defaultView={defaultView}
            onViewChange={onViewChange}
            tabs={tabs}
            searchable={searchable}
            selectionMode={selectionMode}
            sidebar={sidebar}
            labels={secondaryExplorerLabels}
            ariaLabel={labels.secondary}
            readOnly={readOnly}
            renderIcon={renderIcon}
            renderPreview={renderPreview}
            onSelectionChange={onSecondarySelectionChange}
          />
        </div>
      </div>
    );
  }
);

FileExplorerDualPane.displayName = 'FileExplorerDualPane';
