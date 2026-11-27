import React, { forwardRef, useId, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { Tour } from '../Tour';
import type { TourProps, TourStep } from '../Tour';

export type OnboardingChecklistStatus = 'pending' | 'in-progress' | 'completed';

export type OnboardingChecklistAction =
  | { type: 'link'; label: string; href: string; newTab?: boolean }
  | { type: 'callback'; label: string; onAction(task: OnboardingChecklistTask): void }
  | {
      type: 'tour';
      label: string;
      steps: readonly TourStep[];
      completeOnFinish?: boolean;
      tourProps?: Pick<
        TourProps,
        | 'nextLabel'
        | 'prevLabel'
        | 'finishLabel'
        | 'skipLabel'
        | 'closeOnEsc'
        | 'closeOnOverlayClick'
      >;
    };

export interface OnboardingChecklistTask {
  id: string;
  title: string;
  description?: React.ReactNode;
  status?: OnboardingChecklistStatus;
  action?: OnboardingChecklistAction;
  disabled?: boolean;
}

export interface OnboardingChecklistLabels {
  title: string;
  progressLabel: string;
  progress(completed: number, total: number): string;
  pending: string;
  inProgress: string;
  completed: string;
  markComplete: string;
  markIncomplete: string;
  empty: React.ReactNode;
}

const defaultLabels: OnboardingChecklistLabels = {
  title: 'Onboarding checklist',
  progressLabel: 'Onboarding progress',
  progress: (completed, total) => `${completed} of ${total} complete`,
  pending: 'Pending',
  inProgress: 'In progress',
  completed: 'Completed',
  markComplete: 'Mark complete',
  markIncomplete: 'Mark incomplete',
  empty: 'No onboarding tasks.'
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  title: { margin: 0 },
  progress: { display: 'grid', gap: '0.25rem' },
  list: { display: 'grid', gap: '0.5rem', margin: 0, padding: 0 },
  task: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem 1rem',
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    background: 'var(--background-basic-color-1, #fff)'
  },
  taskBody: { flex: '1 1 13rem', minWidth: 0, overflowWrap: 'anywhere' },
  taskTitle: { display: 'block', marginBlockEnd: '0.125rem' },
  description: { color: 'var(--text-basic-color, #222b45)' },
  status: { display: 'block', fontSize: '0.875rem', marginBlockStart: '0.25rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }
}));

export type OnboardingChecklistStylesNames = Selectors<typeof useStyles>;

export interface OnboardingChecklistProps extends DefaultProps<OnboardingChecklistStylesNames> {
  /** The application owns task state and can persist it across sessions. */
  tasks: readonly OnboardingChecklistTask[];
  onTaskStatusChange?(id: string, status: OnboardingChecklistStatus): void;
  labels?: Partial<OnboardingChecklistLabels>;
}

export const OnboardingChecklist = forwardRef<HTMLDivElement, OnboardingChecklistProps>(
  (props, ref) => {
    const { tasks, onTaskStatusChange, labels, classNames, styles, unstyled, className, style } =
      props;
    const text = { ...defaultLabels, ...labels };
    const id = useId();
    const { classes, cx } = useStyles(null, {
      name: 'onboarding-checklist',
      classNames,
      styles,
      unstyled
    });
    const [tourId, setTourId] = useState<string>();
    const activeTask = tasks.find((task) => task.id === tourId);
    const activeTour = activeTask?.action?.type === 'tour' ? activeTask.action : undefined;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const progress = text.progress(completed, tasks.length);
    const captions = {
      pending: text.pending,
      'in-progress': text.inProgress,
      completed: text.completed
    };

    return (
      <div
        ref={ref}
        className={cx(classes.root, className)}
        style={style}
        role="region"
        aria-labelledby={`${id}-title`}
      >
        <h2 id={`${id}-title`} className={classes.title}>
          {text.title}
        </h2>
        {tasks.length ? (
          <>
            <div className={classes.progress}>
              <ProgressBar
                role="progressbar"
                aria-label={text.progressLabel}
                aria-valuemin={0}
                aria-valuemax={tasks.length}
                aria-valuenow={completed}
                aria-valuetext={progress}
                value={(completed / tasks.length) * 100}
                status={completed === tasks.length ? 'success' : 'primary'}
                size="small"
              />
              <span role="status">{progress}</span>
            </div>
            <ul className={classes.list}>
              {tasks.map((task, index) => {
                const { action, disabled, status = 'pending' } = task;
                const titleId = `${id}-task-${index}`;
                const done = status === 'completed';

                const activate = () => {
                  if (action?.type === 'callback') action.onAction(task);
                  if (action?.type === 'tour') setTourId(task.id);
                };

                return (
                  <li key={task.id} className={classes.task}>
                    <div className={classes.taskBody}>
                      <strong id={titleId} className={classes.taskTitle}>
                        {task.title}
                      </strong>
                      {task.description && (
                        <div className={classes.description}>{task.description}</div>
                      )}
                      <span className={classes.status}>{captions[status]}</span>
                    </div>
                    {(action || onTaskStatusChange) && (
                      <div className={classes.actions}>
                        {action?.type === 'link' && !disabled ? (
                          <Button
                            component="a"
                            href={action.href}
                            target={action.newTab ? '_blank' : undefined}
                            rel={action.newTab ? 'noopener noreferrer' : undefined}
                            size="small"
                            aria-describedby={titleId}
                          >
                            {action.label}
                          </Button>
                        ) : (
                          action && (
                            <Button
                              type="button"
                              size="small"
                              disabled={
                                disabled || (action.type === 'tour' && !action.steps.length)
                              }
                              aria-describedby={titleId}
                              onClick={activate}
                            >
                              {action.label}
                            </Button>
                          )
                        )}
                        {onTaskStatusChange && (
                          <Button
                            type="button"
                            appearance="outline"
                            size="small"
                            disabled={disabled}
                            aria-describedby={titleId}
                            onClick={() =>
                              onTaskStatusChange(task.id, done ? 'pending' : 'completed')
                            }
                          >
                            {done ? text.markIncomplete : text.markComplete}
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div role="status">{text.empty}</div>
        )}
        {activeTask && !activeTask.disabled && activeTour && (
          <Tour
            {...activeTour.tourProps}
            key={activeTask.id}
            steps={[...activeTour.steps]}
            opened
            ariaLabel={activeTask.title}
            onOpenChange={(opened) => {
              if (!opened) setTourId(undefined);
            }}
            onFinish={() => {
              if (activeTour.completeOnFinish && activeTask.status !== 'completed') {
                onTaskStatusChange?.(activeTask.id, 'completed');
              }
            }}
          />
        )}
      </div>
    );
  }
);

OnboardingChecklist.displayName = 'OnboardingChecklist';
