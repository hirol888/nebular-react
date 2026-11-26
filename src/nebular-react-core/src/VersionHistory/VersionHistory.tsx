import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { DiffViewer } from '../DiffViewer';
import { NativeSelect } from '../NativeSelect';
import { Timeline } from '../Timeline';

export interface VersionHistoryRevision {
  id: string;
  label: string;
  author?: string;
  createdAt?: string | Date;
  description?: React.ReactNode;
  /** Text compared by DiffViewer. Custom comparison can use revisions without text. */
  content?: string;
}

export interface VersionHistorySelection {
  beforeId: string;
  afterId: string;
}

export interface VersionHistoryLabels {
  history: string;
  revisions: string;
  before: string;
  after: string;
  current: string;
  placeholder: string;
  empty: string;
  chooseDifferent: string;
  unavailable: string;
  comparison: string;
  restore: string;
  restoring: string;
  restored: string;
  restoreError: string;
}

const defaultLabels: VersionHistoryLabels = {
  history: 'Version history',
  revisions: 'Revisions',
  before: 'Before',
  after: 'After',
  current: 'Current',
  placeholder: 'Choose a revision',
  empty: 'No revisions available.',
  chooseDifferent: 'Choose two different revisions to compare.',
  unavailable: 'Comparison content is unavailable.',
  comparison: 'Revision comparison',
  restore: 'Restore selected revision',
  restoring: 'Restoring…',
  restored: 'Revision restored.',
  restoreError: 'Could not restore the revision. Try again.'
};

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'minmax(0, 1fr)',
    color: 'var(--text-basic-color, #222b45)'
  },
  revisions: { maxHeight: '16rem', overflow: 'auto' },
  comparison: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  selectors: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    gap: '0.75rem'
  },
  active: {
    marginInlineStart: '0.375rem',
    color: 'var(--text-primary-color, #3366ff)',
    fontWeight: 600
  },
  metadata: { display: 'grid', gap: '0.25rem', color: 'var(--text-basic-color, #222b45)' },
  actions: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' },
  feedback: { margin: 0 },
  error: { color: 'var(--text-danger-color, #b41939)' }
}));

export type VersionHistoryStylesNames = Selectors<typeof useStyles>;

export interface VersionHistoryProps extends DefaultProps<VersionHistoryStylesNames> {
  /** Present revisions in display order, newest first for the initial comparison. */
  revisions: readonly VersionHistoryRevision[];
  currentId?: string;
  value?: VersionHistorySelection;
  defaultValue?: VersionHistorySelection;
  onChange?(value: VersionHistorySelection): void;
  renderComparison?(before: VersionHistoryRevision, after: VersionHistoryRevision): React.ReactNode;
  /** Restores the selected "After" revision. Reject to present a retryable error. */
  onRestore?(revision: VersionHistoryRevision): void | Promise<void>;
  locale?: string;
  timeZone?: string;
  labels?: Partial<VersionHistoryLabels>;
  disabled?: boolean;
}

function renderDate(date: string | Date | undefined, formatter: Intl.DateTimeFormat) {
  if (!date) return null;
  const parsed = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(parsed.getTime())) return null;
  return <time dateTime={parsed.toISOString()}>{formatter.format(parsed)}</time>;
}

const VersionHistory = forwardRef<HTMLDivElement, VersionHistoryProps>((props, ref) => {
  const {
    revisions,
    currentId,
    value,
    defaultValue,
    onChange,
    onRestore,
    renderComparison,
    labels,
    disabled,
    locale = 'en-US',
    timeZone = 'UTC',
    className,
    classNames,
    styles,
    unstyled
  } = props;
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'version-history',
    classNames,
    styles,
    unstyled
  });
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone }),
    [locale, timeZone]
  );
  const [internal, setInternal] = useState(defaultValue);
  const [restoration, setRestoration] = useState<{
    id: string;
    status: 'loading' | 'error' | 'success';
  }>();
  const pending = useRef(false);
  const compare = value ??
    internal ?? {
      beforeId: revisions[1]?.id ?? '',
      afterId: revisions[0]?.id ?? ''
    };
  const before = revisions.find((revision) => revision.id === compare.beforeId);
  const after = revisions.find((revision) => revision.id === compare.afterId);
  const busy = restoration?.status === 'loading';
  const restoreStatus = restoration?.id === after?.id ? restoration?.status : undefined;
  const options = revisions.map((revision) => ({ value: revision.id, label: revision.label }));
  const timeline = revisions.map((revision) => ({
    id: revision.id,
    title: (
      <>
        {revision.label}
        {currentId === revision.id && <span className={classes.active}>{text.current}</span>}
      </>
    ),
    time: renderDate(revision.createdAt, formatter),
    description: (revision.author || revision.description) && (
      <div className={classes.metadata}>
        {revision.author && <span>{revision.author}</span>}
        {revision.description}
      </div>
    )
  }));

  const updateSelection = (side: keyof VersionHistorySelection, revisionId: string) => {
    const next = { ...compare, [side]: revisionId };
    if (value === undefined) setInternal(next);
    setRestoration(undefined);
    onChange?.(next);
  };

  const restore = async () => {
    if (!after || !onRestore || disabled || pending.current || after.id === currentId) return;
    pending.current = true;
    const { id } = after;
    setRestoration({ id, status: 'loading' });
    try {
      await onRestore(after);
      setRestoration({ id, status: 'success' });
    } catch {
      setRestoration({ id, status: 'error' });
    } finally {
      pending.current = false;
    }
  };

  const comparison = () => {
    if (!before || !after || before.id === after.id) {
      return (
        <p role="status" className={classes.feedback}>
          {text.chooseDifferent}
        </p>
      );
    }
    if (renderComparison) return renderComparison(before, after);
    if (before.content === undefined || after.content === undefined) {
      return (
        <p role="status" className={classes.feedback}>
          {text.unavailable}
        </p>
      );
    }
    return (
      <DiffViewer
        before={before.content}
        after={after.content}
        title={text.comparison}
        ariaLabel={text.comparison}
      />
    );
  };

  return (
    <div ref={ref} role="region" aria-label={text.history} className={cx(classes.root, className)}>
      {revisions.length ? (
        <>
          <div className={classes.revisions}>
            <Timeline items={timeline} aria-label={text.revisions} />
          </div>
          <div className={classes.comparison}>
            <div className={classes.selectors}>
              <NativeSelect
                data={options}
                label={text.before}
                placeholder={text.placeholder}
                value={before?.id ?? ''}
                disabled={disabled || busy}
                onChange={(id) => updateSelection('beforeId', id)}
              />
              <NativeSelect
                data={options}
                label={text.after}
                placeholder={text.placeholder}
                value={after?.id ?? ''}
                disabled={disabled || busy}
                onChange={(id) => updateSelection('afterId', id)}
              />
            </div>
            {comparison()}
          </div>
          {onRestore && (
            <div className={classes.actions}>
              <Button
                type="button"
                appearance="outline"
                onClick={restore}
                disabled={disabled || !after || after.id === currentId || busy}
              >
                {busy ? text.restoring : text.restore}
              </Button>
              {restoreStatus === 'success' && (
                <p role="status" className={classes.feedback}>
                  {text.restored}
                </p>
              )}
              {restoreStatus === 'error' && (
                <p role="alert" className={cx(classes.feedback, classes.error)}>
                  {text.restoreError}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p role="status" className={classes.feedback}>
          {text.empty}
        </p>
      )}
    </div>
  );
});

VersionHistory.displayName = 'VersionHistory';

export { VersionHistory };
