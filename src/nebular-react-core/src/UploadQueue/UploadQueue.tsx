import React, { forwardRef, useId } from 'react';
import {
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Dropzone } from '../Dropzone';
import { ProgressBar } from '../ProgressBar';

export type UploadQueueStatus = 'queued' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadQueueItem {
  /** Stable identifier supplied by the application, including across retries. */
  id: string;
  /** User-facing file name. */
  name: string;
  status: UploadQueueStatus;
  /** Upload progress as a percentage. Omit it when the total size is unknown. */
  progress?: number;
  /** Details shown when the upload fails. */
  error?: React.ReactNode;
}

export interface UploadQueueLabels {
  queue: string;
  empty: string;
  add: string;
  instructions: string;
  cancel: string;
  retry: string;
  status: Record<UploadQueueStatus, string>;
}

const defaultLabels: UploadQueueLabels = {
  queue: 'Upload queue',
  empty: 'No files in the queue',
  add: 'Add files',
  instructions: 'Drop files here or click to browse',
  cancel: 'Cancel',
  retry: 'Retry',
  status: {
    queued: 'Queued',
    uploading: 'Uploading',
    success: 'Uploaded',
    error: 'Upload failed',
    cancelled: 'Cancelled'
  }
};

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
    color: 'var(--text-basic-color, #222b45)',
    fontFamily: 'var(--text-paragraph-font-family, inherit)',
    fontSize: '0.875rem',
    lineHeight: 1.5
  },
  picker: {
    display: 'grid',
    gap: '0.25rem'
  },
  pickerTitle: {
    color: 'var(--text-basic-color, #222b45)'
  },
  instructions: { margin: 0 },
  empty: {
    margin: 0
  },
  list: {
    display: 'grid',
    gap: '0.5rem',
    padding: 0,
    margin: 0,
    listStyle: 'none'
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.5rem 0.75rem',
    minWidth: 0,
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--upload-queue-item-radius, 0.5rem)',
    backgroundColor: 'var(--background-basic-color-1, #fff)'
  },
  details: {
    flex: '1 1 12rem',
    minWidth: 0,
    overflowWrap: 'anywhere'
  },
  name: {
    fontWeight: 600
  },
  status: {
    fontSize: '0.8125rem'
  },
  progress: {
    marginBlockStart: '0.25rem'
  },
  error: {
    marginBlockStart: '0.25rem',
    fontSize: '0.8125rem'
  },
  action: {
    flex: '0 0 auto',
    maxWidth: '100%',
    minHeight: '2.5rem',
    padding: '0.25rem 0.625rem',
    border: '1px solid var(--border-basic-color-4, #c5cee0)',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    overflowWrap: 'anywhere',

    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--background-basic-color-3, #edf1f7)'
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }
}));

export type UploadQueueStylesNames = Selectors<typeof useStyles>;

export interface UploadQueueProps
  extends DefaultProps<UploadQueueStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  /** Current queue supplied by the application. */
  items: readonly UploadQueueItem[];
  /** Shows the dropzone and receives files accepted by its accept/maxSize rules. */
  onAddFiles?(files: File[]): void;
  /** Receives files rejected by the dropzone. */
  onRejectFiles?(files: File[]): void;
  /** Requests cancellation of a queued or uploading item. */
  onCancel?(id: string): void;
  /** Requests a retry for a failed or cancelled item. */
  onRetry?(id: string): void;
  /** File types or extensions to accept, using the native input format. */
  accept?: string;
  /** Maximum size of an individual file in bytes. */
  maxSize?: number;
  /** Allows selecting multiple files at once. Defaults to true. */
  multiple?: boolean;
  /** Disables file selection and queue actions. */
  disabled?: boolean;
  /** Labels for localization, including individual upload states. */
  labels?: Partial<Omit<UploadQueueLabels, 'status'>> & {
    status?: Partial<UploadQueueLabels['status']>;
  };
}

const defaultProps: Partial<UploadQueueProps> = { multiple: true, disabled: false };

export const UploadQueue = forwardRef<HTMLDivElement, UploadQueueProps>((props, ref) => {
  const {
    items,
    onAddFiles,
    onRejectFiles,
    onCancel,
    onRetry,
    accept,
    maxSize,
    multiple,
    disabled,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const instructionsId = useId();
  const { classes, cx } = useStyles(undefined, {
    name: 'upload-queue',
    classNames,
    styles,
    unstyled
  });
  const text = {
    ...defaultLabels,
    ...labels,
    status: { ...defaultLabels.status, ...labels?.status }
  };

  return (
    <div {...others} className={cx(classes.root, className)} ref={ref}>
      {onAddFiles && (
        <div className={cx(classes.picker)}>
          <Dropzone
            ariaLabel={text.add}
            aria-describedby={instructionsId}
            accept={accept}
            maxSize={maxSize}
            multiple={multiple}
            disabled={disabled}
            onDrop={onAddFiles}
            onReject={onRejectFiles}
          >
            <strong className={cx(classes.pickerTitle)}>{text.add}</strong>
          </Dropzone>
          <p className={cx(classes.instructions)} id={instructionsId}>
            {text.instructions}
          </p>
        </div>
      )}
      {items.length === 0 ? (
        <p className={cx(classes.empty)}>{text.empty}</p>
      ) : (
        // WebKit otherwise drops list semantics when list-style is none.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul className={cx(classes.list)} role="list" aria-label={text.queue}>
          {items.map(({ id, name, status, progress, error }) => {
            const uploading = status === 'uploading';
            const canCancel = uploading || status === 'queued';
            const canRetry = status === 'error' || status === 'cancelled';
            const action = canCancel ? onCancel : canRetry ? onRetry : undefined;
            const actionLabel = canCancel ? text.cancel : text.retry;
            const percent =
              progress !== undefined && Number.isFinite(progress)
                ? Math.round(Math.max(0, Math.min(100, progress)))
                : undefined;

            return (
              <li key={id} className={cx(classes.item)} data-status={status}>
                <div className={cx(classes.details)}>
                  <div className={cx(classes.name)}>{name}</div>
                  <div className={cx(classes.status)} role="status">
                    <span className="visually-hidden">{name}: </span>
                    {text.status[status]}
                    {status === 'error' && error && (
                      <div className={cx(classes.error)}>{error}</div>
                    )}
                  </div>
                  {uploading && (
                    <div className={cx(classes.progress)}>
                      {percent !== undefined && <span aria-hidden="true">{percent}%</span>}
                      <ProgressBar
                        value={percent}
                        size="tiny"
                        status="primary"
                        role="progressbar"
                        aria-label={name}
                        aria-valuenow={percent}
                      />
                    </div>
                  )}
                </div>
                {action && (
                  <button
                    type="button"
                    className={cx(classes.action)}
                    aria-label={`${actionLabel}: ${name}`}
                    disabled={disabled}
                    onClick={() => action(id)}
                  >
                    {actionLabel}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

UploadQueue.displayName = 'UploadQueue';
