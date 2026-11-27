import React, { useMemo, useState } from 'react';
import {
  type DefaultProps,
  type Selectors,
  createStyles,
  useNebularLocale
} from '@nebular-react/styles';
import { DesktopLayoutSettings } from '../DesktopLayoutSettings';
import type { DesktopLayoutScope, DesktopLayoutSnapshot } from '../Desktop/Desktop.types';
import type { VersionedLayoutTransport } from '../Desktop/Desktop.persistence';
import {
  useDesktopLayoutPreferences,
  type DesktopLayoutPreferencesConflictChoice
} from './useDesktopLayoutPreferences';

export interface DesktopLayoutPreferencesLabels {
  title: string;
  loading: string;
  loadError: string;
  saveError: string;
  noLayout: string;
  retry: string;
  windows(count: number): string;
  lastSaved(date: string): string;
}

type DesktopLayoutPreferencesBaseProps = DefaultProps<DesktopLayoutPreferencesStylesNames>;

export interface DesktopLayoutPreferencesProps extends DesktopLayoutPreferencesBaseProps {
  transport: VersionedLayoutTransport;
  /** Layout snapshot currently owned by the host (saved by `saveNow`). */
  snapshot?: DesktopLayoutSnapshot;
  scope?: DesktopLayoutScope;
  deviceId?: string;
  enabled?: boolean;
  onLoaded?(snapshot: DesktopLayoutSnapshot): void;
  onApplySnapshot?(snapshot: DesktopLayoutSnapshot): void;
  onError?(error: unknown): void;
  title?: string;
  labels?: Partial<DesktopLayoutPreferencesLabels>;
  showSummary?: boolean;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    color: 'var(--desktop-layout-preferences-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--desktop-layout-preferences-font-family, inherit)'
  },

  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap',
    minHeight: '1.2rem'
  },

  status: {
    color: 'var(--desktop-layout-preferences-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.78rem',
    lineHeight: 1.4
  },

  error: {
    color: 'var(--color-danger-500, #ff3d71)'
  },

  detail: {
    marginInlineStart: '0.3rem',
    fontStyle: 'italic',
    overflowWrap: 'anywhere'
  },

  retry: {
    minHeight: '1.6rem',
    padding: '0.1rem 0.55rem',
    border:
      '1px solid var(--desktop-layout-preferences-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-layout-preferences-radius, 0.35rem)',
    backgroundColor:
      'var(--desktop-layout-preferences-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap',
    margin: 0,
    color: 'var(--desktop-layout-preferences-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem'
  },

  separator: {
    opacity: 0.6
  }
}));

export type DesktopLayoutPreferencesStylesNames = Selectors<typeof useStyles>;

function errorDetail(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.length > 0) {
    return error;
  }

  return undefined;
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const DesktopLayoutPreferences = React.forwardRef<
  HTMLDivElement,
  DesktopLayoutPreferencesProps
>((props, ref) => {
  const {
    transport,
    snapshot,
    scope: controlledScope,
    deviceId,
    enabled,
    onLoaded,
    onApplySnapshot,
    onError,
    title,
    labels: labelsProp,
    showSummary = true,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-layout-preferences',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const labels = useMemo<DesktopLayoutPreferencesLabels>(
    () => ({
      title: t('desktopLayoutPreferences.title', 'Desktop layout preferences'),
      loading: t('desktopLayoutPreferences.loading', 'Loading desktop layout…'),
      loadError: t('desktopLayoutPreferences.loadError', 'Could not load the desktop layout.'),
      saveError: t('desktopLayoutPreferences.saveError', 'Could not save the desktop layout.'),
      noLayout: t('desktopLayoutPreferences.noLayout', 'No layout saved yet.'),
      retry: t('desktop.retryConnection', 'Retry'),
      windows: (count) =>
        t('desktopLayoutPreferences.windows', '{count} windows', {
          count
        }),
      lastSaved: (date) =>
        t('desktopLayoutPreferences.lastSaved', 'Last saved at {date}', {
          date
        }),
      ...labelsProp
    }),
    [labelsProp, t]
  );
  const [internalScope, setInternalScope] = useState<DesktopLayoutScope>(
    controlledScope ?? 'device'
  );
  const scope = controlledScope ?? internalScope;
  const {
    status,
    conflict,
    loadError,
    saveError,
    lastSavedAt,
    remoteSnapshot,
    noLayout,
    saveNow,
    refresh,
    resolveConflict
  } = useDesktopLayoutPreferences({
    transport,
    snapshot,
    scope,
    deviceId,
    enabled,
    onLoaded,
    onApplySnapshot,
    onError
  });

  const handleScopeChange = (next: DesktopLayoutScope) => {
    if (controlledScope === undefined) {
      setInternalScope(next);
    }
  };
  const handleSave = () => {
    saveNow();
  };
  const handleResolveConflict = (choice: DesktopLayoutPreferencesConflictChoice) => {
    resolveConflict(choice);
  };
  const handleRetry = () => {
    refresh();
  };

  let statusMessage: string | undefined;

  if (status === 'loading') {
    statusMessage = labels.loading;
  } else if (status === 'error') {
    statusMessage = loadError !== undefined ? labels.loadError : labels.saveError;
  } else if (noLayout) {
    statusMessage = labels.noLayout;
  }

  const detail = status === 'error' ? errorDetail(loadError ?? saveError) : undefined;
  const retryVisible = status === 'error' && loadError !== undefined;
  const summarySnapshot = remoteSnapshot ?? snapshot ?? null;
  const windows = summarySnapshot?.windows.length ?? 0;
  const savedAt = lastSavedAt ?? summarySnapshot?.savedAt;

  return (
    <div ref={ref} className={cx(classes.root, className)} style={style}>
      <div className={cx(classes.statusRow)}>
        <div className={cx(classes.status)} role="status" aria-live="polite" aria-atomic="true">
          {statusMessage && (
            <span className={cx({ [classes.error]: status === 'error' })}>
              {statusMessage}
              {detail && <span className={cx(classes.detail)}>{detail}</span>}
            </span>
          )}
        </div>
        {retryVisible && (
          <button type="button" className={cx(classes.retry)} onClick={handleRetry}>
            {labels.retry}
          </button>
        )}
      </div>
      <DesktopLayoutSettings
        labels={{ title: title ?? labels.title }}
        scope={scope}
        onScopeChange={handleScopeChange}
        deviceId={deviceId}
        onSave={handleSave}
        saving={status === 'saving'}
        saved={status === 'ready' && lastSavedAt !== undefined}
        conflict={conflict}
        onResolveConflict={handleResolveConflict}
      />
      {showSummary && (
        <p className={cx(classes.summary)}>
          <span>{labels.windows(windows)}</span>
          {savedAt && (
            <>
              <span className={cx(classes.separator)} aria-hidden="true">
                ·
              </span>
              <span>{labels.lastSaved(formatDate(savedAt))}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
});

DesktopLayoutPreferences.displayName = 'DesktopLayoutPreferences';
