import React, { forwardRef, useId } from 'react';
import {
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface PermissionMatrixResource {
  /** Stable resource identifier. It must be unique within the matrix. */
  id: string;
  /** Name displayed in the resource row. */
  label: string;
  /** Prevents edits to the entire row. */
  disabled?: boolean;
}

export interface PermissionMatrixAction {
  /** Stable action identifier. It must be unique within the matrix. */
  id: string;
  /** Name displayed in the action column. */
  label: string;
  /** Prevents edits to the entire column. */
  disabled?: boolean;
}

/** An allowed or denied decision, or a mixed decision for an aggregate cell. */
export type PermissionMatrixCell = (
  { source: 'explicit' | 'inherited'; allowed: boolean } | { source: 'partial' }
) & { disabled?: boolean };

/** Sparse lookup indexed first by resource ID and then by action ID. */
export type PermissionMatrixValue = Readonly<
  Record<string, Readonly<Record<string, PermissionMatrixCell | undefined>> | undefined>
>;

export interface PermissionMatrixChange {
  resourceId: string;
  actionId: string;
  /** Requested explicit decision for this cell. */
  allowed: boolean;
}

export interface PermissionMatrixLabels {
  resource: string;
  empty: string;
  notSet: string;
  allowed: string;
  denied: string;
  inheritedAllowed: string;
  inheritedDenied: string;
  partial: string;
}

const useStyles = createStyles(() => ({
  root: {
    boxSizing: 'border-box',
    minWidth: 0,
    maxWidth: '100%',
    color: 'var(--permission-matrix-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--permission-matrix-font-family, inherit)'
  },
  viewport: {
    maxWidth: '100%',
    overflowX: 'auto',
    border: '1px solid var(--permission-matrix-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.375rem',
    '&:focus-visible': {
      outline: '2px solid var(--permission-matrix-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'start',
    backgroundColor: 'var(--permission-matrix-background, var(--background-basic-color-1, #fff))',
    fontSize: '0.875rem'
  },
  caption: {
    padding: '0.625rem 0.75rem',
    textAlign: 'start',
    overflowWrap: 'anywhere',
    fontWeight: 600
  },
  header: {
    backgroundColor:
      'var(--permission-matrix-header-background, var(--background-basic-color-2, #f7f9fc))'
  },
  cell: {
    minWidth: '7rem',
    padding: '0.5rem 0.75rem',
    borderTop:
      '1px solid var(--permission-matrix-border-color, var(--border-basic-color-3, #e4e9f2))',
    verticalAlign: 'middle',
    overflowWrap: 'anywhere'
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '1.75rem',
    fontSize: '0.8125rem',
    lineHeight: 1.4
  },
  input: {
    width: '1.125rem',
    height: '1.125rem',
    flexShrink: 0,
    margin: 0,
    accentColor: 'var(--permission-matrix-accent, var(--color-primary-500, #3366ff))',
    '&:focus-visible': {
      outline: '2px solid var(--permission-matrix-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },
  empty: {
    margin: 0,
    padding: '0.75rem 0',
    fontSize: '0.875rem'
  }
}));

export type PermissionMatrixStylesNames = Selectors<typeof useStyles>;

export interface PermissionMatrixProps
  extends
    DefaultProps<PermissionMatrixStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** Ordered resources shown as rows. */
  resources: readonly PermissionMatrixResource[];
  /** Ordered actions shown as columns. */
  actions: readonly PermissionMatrixAction[];
  /** Current decisions. Changes are applied only when the caller updates this value. */
  value: PermissionMatrixValue;
  /** Requests an explicit decision for an editable cell. */
  onChange?: (change: PermissionMatrixChange) => void;
  /** Visible table caption and name of the scrollable region. Defaults to "Permissions". */
  caption?: string;
  /** Disables all edits, including when an onChange callback is supplied. */
  readOnly?: boolean;
  /** Overrides the accessible and visible state strings. */
  labels?: Partial<PermissionMatrixLabels>;
}

const defaultLabels: PermissionMatrixLabels = {
  resource: 'Resource',
  empty: 'No permissions to display.',
  notSet: 'Not set',
  allowed: 'Allowed',
  denied: 'Denied',
  inheritedAllowed: 'Inherited: allowed',
  inheritedDenied: 'Inherited: denied',
  partial: 'Partial'
};

function getStateLabel(
  permission: PermissionMatrixCell | undefined,
  labels: PermissionMatrixLabels
) {
  if (!permission) return labels.notSet;
  if (permission.source === 'partial') return labels.partial;
  if (permission.source === 'inherited') {
    return permission.allowed ? labels.inheritedAllowed : labels.inheritedDenied;
  }
  return permission.allowed ? labels.allowed : labels.denied;
}

const _PermissionMatrix = forwardRef<HTMLDivElement, PermissionMatrixProps>((props, ref) => {
  const {
    resources,
    actions,
    value,
    onChange,
    caption = 'Permissions',
    readOnly,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps({}, props);
  const { classes, cx } = useStyles(null, {
    name: 'permission-matrix',
    classNames,
    styles,
    unstyled
  });
  const labelId = useId();
  const copy = { ...defaultLabels, ...labels };
  const empty = resources.length === 0 || actions.length === 0;

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {empty ? (
        <p className={classes.empty}>{copy.empty}</p>
      ) : (
        <div
          role="region"
          aria-labelledby={labelId}
          // The viewport must support keyboard scrolling when the matrix is read-only.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={classes.viewport}
        >
          <table className={classes.table}>
            <caption id={labelId} className={classes.caption}>
              {caption}
            </caption>
            <thead className={classes.header}>
              <tr>
                <th scope="col" className={classes.cell}>
                  {copy.resource}
                </th>
                {actions.map((action) => (
                  <th key={action.id} scope="col" className={classes.cell}>
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, resourceIndex) => {
                const row = Object.hasOwn(value, resource.id) ? value[resource.id] : undefined;
                return (
                  <tr key={resource.id}>
                    <th scope="row" className={classes.cell}>
                      {resource.label}
                    </th>
                    {actions.map((action, actionIndex) => {
                      const permission =
                        row && Object.hasOwn(row, action.id) ? row[action.id] : undefined;
                      const partial = permission?.source === 'partial';
                      const allowed =
                        permission && permission.source !== 'partial' ? permission.allowed : false;
                      const stateId = `${labelId}-${resourceIndex}-${actionIndex}`;
                      const disabled =
                        readOnly ||
                        !onChange ||
                        resource.disabled ||
                        action.disabled ||
                        permission?.disabled;
                      return (
                        <td key={action.id} className={classes.cell}>
                          <label className={classes.control}>
                            <input
                              type="checkbox"
                              className={classes.input}
                              ref={(input) => {
                                if (input) input.indeterminate = partial;
                              }}
                              aria-label={`${action.label} — ${resource.label}`}
                              aria-describedby={stateId}
                              checked={allowed}
                              disabled={disabled}
                              onChange={(event) => {
                                const input = event.currentTarget;
                                input.indeterminate = partial;
                                onChange?.({
                                  resourceId: resource.id,
                                  actionId: action.id,
                                  allowed: input.checked
                                });
                              }}
                            />
                            <span id={stateId}>{getStateLabel(permission, copy)}</span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

_PermissionMatrix.displayName = 'PermissionMatrix';

export { _PermissionMatrix as PermissionMatrix };
