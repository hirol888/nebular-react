import React, { forwardRef, useId, useState } from 'react';
import {
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { DiffViewer } from '../DiffViewer';
import { Timeline } from '../Timeline';

export interface AuditTrailChange {
  /** Stable identifier unique within the entry. */
  id: string;
  /** Field or value being compared. */
  label: string;
  /** Text representation of the previous value. */
  before: string;
  /** Text representation of the new value. */
  after: string;
}

export interface AuditTrailEntry {
  /** Stable identifier unique within the group. */
  id: string;
  /** Event summary. */
  title: string;
  /** Display name of the person or system that performed the event. */
  actor: string;
  /** Machine-readable timestamp for the time element, such as an ISO 8601 value. */
  dateTime: string;
  /** Optional localized timestamp shown to the user. Defaults to dateTime. */
  timeLabel?: string;
  /** Optional text or rich content about the event. */
  description?: React.ReactNode;
  /** Field comparisons, revealed through the entry's disclosure button. */
  changes?: readonly AuditTrailChange[];
}

export interface AuditTrailGroup {
  /** Stable identifier unique within the trail. */
  id: string;
  /** Group heading, such as a localized date. */
  label: string;
  /** Events shown in the supplied order. */
  entries: readonly AuditTrailEntry[];
}

export interface AuditTrailLabels {
  trail: string;
  empty: string;
  showChanges: string;
  hideChanges: string;
  before: string;
  after: string;
}

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: '1.25rem',
    minWidth: 0,
    color: 'var(--audit-trail-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--audit-trail-font-family, inherit)'
  },
  group: {
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0
  },
  heading: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },
  actor: {
    fontWeight: 600
  },
  description: {
    margin: '0.25rem 0',
    overflowWrap: 'anywhere'
  },
  trigger: {
    marginBlockStart: '0.375rem',
    minHeight: '1.75rem',
    padding: '0.1875rem 0.5rem',
    border: '1px solid var(--audit-trail-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.375rem',
    background: 'var(--audit-trail-button-background, var(--background-basic-color-1, #fff))',
    color: 'inherit',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': {
      background: 'var(--audit-trail-button-hover, var(--background-basic-color-2, #f7f9fc))'
    },
    '&:focus-visible': {
      outline: '2px solid var(--audit-trail-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },
  comparisons: {
    display: 'grid',
    gap: '0.75rem',
    marginBlockStart: '0.5rem',
    minWidth: 0,
    '&[hidden]': { display: 'none' }
  },
  comparison: {
    minWidth: 0,
    margin: 0
  },
  comparisonTitle: {
    marginBlockEnd: '0.25rem',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.5rem',
    marginBlockStart: '0.125rem',
    fontWeight: 400,
    overflowWrap: 'anywhere'
  },
  empty: {
    margin: 0,
    fontSize: '0.875rem'
  }
}));

export type AuditTrailStylesNames = Selectors<typeof useStyles>;

export interface AuditTrailProps
  extends DefaultProps<AuditTrailStylesNames>, React.ComponentPropsWithoutRef<'section'> {
  /** Groups in display order. Groups without entries are omitted. */
  groups: readonly AuditTrailGroup[];
  /** Level of each group heading. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Overrides the trail name, disclosure button, comparison and empty-state text. */
  labels?: Partial<AuditTrailLabels>;
}

const defaultLabels: AuditTrailLabels = {
  trail: 'Audit trail',
  empty: 'No activity to display.',
  showChanges: 'Show changes',
  hideChanges: 'Hide changes',
  before: 'Before',
  after: 'After'
};

interface AuditTrailDetailsProps {
  entry: AuditTrailEntry;
  copy: AuditTrailLabels;
  classes: Record<AuditTrailStylesNames, string>;
}

function AuditTrailDetails({ entry, copy, classes }: AuditTrailDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const changesId = useId();
  const label = expanded ? copy.hideChanges : copy.showChanges;
  const { actor, description, changes, title } = entry;

  return (
    <>
      <div className={classes.actor}>
        <bdi>{actor}</bdi>
      </div>
      {description != null && <div className={classes.description}>{description}</div>}
      {Boolean(changes?.length) && (
        <>
          <button
            type="button"
            className={classes.trigger}
            aria-expanded={expanded}
            aria-controls={changesId}
            aria-label={`${label}: ${title}`}
            onClick={() => setExpanded((open) => !open)}
          >
            {label}
          </button>
          <div id={changesId} className={classes.comparisons} hidden={!expanded}>
            {expanded &&
              changes?.map((change) => (
                <figure key={change.id} className={classes.comparison}>
                  <figcaption className={classes.comparisonTitle}>
                    {change.label}
                    <span className={classes.columns}>
                      <span>{copy.before}</span>
                      <span>{copy.after}</span>
                    </span>
                  </figcaption>
                  <DiffViewer
                    before={change.before}
                    after={change.after}
                    ariaLabel={`${change.label}: ${copy.before} / ${copy.after}`}
                    mode="split"
                    showLineNumbers={false}
                    styles={{
                      counts: { direction: 'ltr' },
                      addedCount: { color: 'inherit' },
                      removedCount: { color: 'inherit' }
                    }}
                  />
                </figure>
              ))}
          </div>
        </>
      )}
    </>
  );
}

const _AuditTrail = forwardRef<HTMLElement, AuditTrailProps>((props, ref) => {
  const {
    groups,
    headingLevel = 3,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabel,
    ...others
  } = useComponentDefaultProps({}, props);
  const { classes, cx } = useStyles(null, {
    name: 'audit-trail',
    classNames,
    styles,
    unstyled
  });
  const copy = { ...defaultLabels, ...labels };
  const populatedGroups = groups.filter((group) => group.entries.length > 0);
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      {...others}
      aria-label={ariaLabel ?? copy.trail}
      ref={ref}
      className={cx(classes.root, className)}
    >
      {populatedGroups.length === 0 ? (
        <p className={classes.empty}>{copy.empty}</p>
      ) : (
        populatedGroups.map((group) => (
          <div key={group.id} className={classes.group}>
            <Heading className={classes.heading}>
              <bdi>{group.label}</bdi>
            </Heading>
            <Timeline
              role="list"
              aria-label={group.label}
              bulletSize={16}
              unstyled={unstyled}
              styles={
                unstyled
                  ? undefined
                  : {
                      item: { minWidth: 0, overflowWrap: 'anywhere' },
                      titleRow: { gap: '0.125rem 0.75rem' },
                      time: { whiteSpace: 'normal', color: 'inherit' },
                      description: { color: 'inherit' },
                      bullet: {
                        backgroundColor:
                          'var(--audit-trail-marker-color, var(--color-primary-500, #3366ff))'
                      }
                    }
              }
              items={group.entries.map((entry) => ({
                id: entry.id,
                title: <bdi>{entry.title}</bdi>,
                time: (
                  <time dateTime={entry.dateTime} dir="auto">
                    {entry.timeLabel ?? entry.dateTime}
                  </time>
                ),
                description: <AuditTrailDetails entry={entry} copy={copy} classes={classes} />
              }))}
            />
          </div>
        ))
      )}
    </section>
  );
});

_AuditTrail.displayName = 'AuditTrail';

export { _AuditTrail as AuditTrail };
