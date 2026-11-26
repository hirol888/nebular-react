import React, { useMemo, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Icon } from '../Icon';
import type { DesktopLayoutScope } from '../Desktop/Desktop.types';

export type { DesktopLayoutScope } from '../Desktop/Desktop.types';

export type DesktopLayoutConflictChoice = 'local' | 'remote';

export interface DesktopLayoutConflict {
  /** ISO timestamp of the layout saved by this device. */
  localSavedAt?: string;
  /** ISO timestamp of the layout stored on the server. */
  remoteSavedAt?: string;
}

export interface DesktopLayoutSettingsLabels {
  title: string;
  description: string;
  device: string;
  deviceDescription(deviceId: string): string;
  shared: string;
  sharedDescription: string;
  save: string;
  saving: string;
  saved: string;
  deviceFallback: string;
  group: string;
  conflictTitle: string;
  conflictDescription: string;
  conflictRemoteSavedAt(date: string): string;
  conflictLocalSavedAt(date: string): string;
  keepLocal: string;
  useRemote: string;
}

export interface DesktopLayoutSettingsProps extends DefaultProps<DesktopLayoutSettingsStylesNames> {
  scope?: DesktopLayoutScope;
  defaultScope?: DesktopLayoutScope;
  onScopeChange?(scope: DesktopLayoutScope): void;
  deviceId?: string;
  onSave?(): void;
  saving?: boolean;
  saved?: boolean;
  conflict?: DesktopLayoutConflict;
  onResolveConflict?(choice: DesktopLayoutConflictChoice): void;
  disabled?: boolean;
  labels?: Partial<DesktopLayoutSettingsLabels>;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
    color: 'var(--desktop-layout-settings-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--desktop-layout-settings-font-family, inherit)'
  },

  title: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600
  },

  description: {
    margin: 0,
    color: 'var(--desktop-layout-settings-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8rem',
    lineHeight: 1.4
  },

  group: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
    gap: '0.5rem'
  },

  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    width: '100%',
    minHeight: '4.5rem',
    padding: '0.65rem',
    border:
      '1px solid var(--desktop-layout-settings-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-layout-settings-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-layout-settings-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      borderColor: 'var(--color-primary-500, #3366ff)'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    },

    '&:disabled': {
      opacity: 0.55,
      cursor: 'default'
    }
  },

  optionSelected: {
    borderColor: 'var(--color-primary-500, #3366ff)',
    backgroundColor:
      'var(--desktop-layout-settings-selected-background-color, rgba(51, 102, 255, 0.08))'
  },

  radio: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1rem',
    height: '1rem',
    marginTop: '0.1rem',
    border: '2px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: '50%'
  },

  radioSelected: {
    borderColor: 'var(--color-primary-500, #3366ff)'
  },

  radioDot: {
    width: '0.45rem',
    height: '0.45rem',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-500, #3366ff)'
  },

  optionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    minWidth: 0
  },

  optionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: 600,
    fontSize: '0.82rem'
  },

  optionHint: {
    color: 'var(--desktop-layout-settings-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.74rem',
    lineHeight: 1.35
  },

  conflict: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    padding: '0.6rem',
    border:
      '1px solid var(--desktop-layout-settings-conflict-border-color, var(--color-warning-500, #ffaa00))',
    borderRadius: 'var(--desktop-layout-settings-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-layout-settings-conflict-background-color, rgba(255, 170, 0, 0.08))',
    fontSize: '0.78rem',
    lineHeight: 1.4
  },

  conflictTitle: {
    fontWeight: 600
  },

  conflictDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    color: 'var(--desktop-layout-settings-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.72rem'
  },

  conflictActions: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginTop: '0.15rem'
  },

  conflictAction: {
    minHeight: '1.8rem',
    padding: '0.2rem 0.6rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--desktop-layout-settings-radius, 0.35rem)',
    backgroundColor:
      'var(--desktop-layout-settings-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.76rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:disabled': {
      opacity: 0.55,
      cursor: 'default'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },

  save: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '1.9rem',
    padding: '0.25rem 0.7rem',
    border: 0,
    borderRadius: 'var(--desktop-layout-settings-radius, 0.35rem)',
    backgroundColor: 'var(--color-primary-500, #3366ff)',
    color: '#ffffff',
    font: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:disabled': {
      opacity: 0.55,
      cursor: 'default'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },

  status: {
    color: 'var(--color-success-500, #00d68f)',
    fontSize: '0.75rem'
  }
}));

export type DesktopLayoutSettingsStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DesktopLayoutSettingsProps> = {
  defaultScope: 'device',
  ariaLabel: 'Desktop layout storage'
};

export const DesktopLayoutSettings = React.forwardRef<HTMLDivElement, DesktopLayoutSettingsProps>(
  (props, ref) => {
    const {
      scope: controlledScope,
      defaultScope,
      onScopeChange,
      deviceId,
      onSave,
      saving,
      saved,
      conflict,
      onResolveConflict,
      disabled,
      labels: labelsProp,
      ariaLabel,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    } = useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(undefined, {
      name: 'desktop-layout-settings',
      classNames,
      styles,
      unstyled
    });
    const { t } = useNebularLocale();
    const [internalScope, setInternalScope] = useState<DesktopLayoutScope>(defaultScope);
    const scope = controlledScope ?? internalScope;
    const labels = useMemo<DesktopLayoutSettingsLabels>(
      () => ({
        title: t('desktopLayoutSettings.title', 'Desktop layout'),
        description: t(
          'desktopLayoutSettings.description',
          'Choose where this layout is stored. Device layouts follow this browser; shared layouts are reused by other devices of the same profile and application.'
        ),
        device: t('desktopLayoutSettings.device', 'This device'),
        deviceDescription: (device) =>
          t('desktopLayoutSettings.deviceDescription', 'Stored for device {device}', {
            device
          }),
        shared: t('desktopLayoutSettings.shared', 'Share with my devices'),
        sharedDescription: t(
          'desktopLayoutSettings.sharedDescription',
          'Other devices use this layout when they do not have a device-specific one.'
        ),
        save: t('desktopLayoutSettings.save', 'Save layout now'),
        saving: t('desktopLayoutSettings.saving', 'Saving…'),
        saved: t('desktopLayoutSettings.saved', 'Layout saved'),
        deviceFallback: t(
          'desktopLayoutSettings.deviceFallback',
          'Use the latest shared layout as fallback.'
        ),
        group: t('desktopLayoutSettings.group', 'Layout storage scope'),
        conflictTitle: t(
          'desktopLayoutSettings.conflictTitle',
          'This layout changed on another device'
        ),
        conflictDescription: t(
          'desktopLayoutSettings.conflictDescription',
          'The shared layout was updated after this device loaded it. Choose which version to keep.'
        ),
        conflictRemoteSavedAt: (date) =>
          t('desktopLayoutSettings.conflictRemoteSavedAt', 'Server layout saved at {date}', {
            date
          }),
        conflictLocalSavedAt: (date) =>
          t('desktopLayoutSettings.conflictLocalSavedAt', 'This device saved at {date}', {
            date
          }),
        keepLocal: t('desktopLayoutSettings.keepLocal', 'Keep this device layout'),
        useRemote: t('desktopLayoutSettings.useRemote', 'Use server layout'),
        ...labelsProp
      }),
      [t, labelsProp]
    );

    const select = (next: DesktopLayoutScope) => {
      if (disabled) {
        return;
      }

      if (controlledScope === undefined) {
        setInternalScope(next);
      }
      onScopeChange?.(next);
    };

    return (
      <div {...others} ref={ref} className={cx(classes.root, className)} aria-label={ariaLabel}>
        <h3 className={cx(classes.title)}>{labels.title}</h3>
        <p className={cx(classes.description)}>{labels.description}</p>
        <div className={cx(classes.group)} role="radiogroup" aria-label={labels.group}>
          {(
            [
              [
                'device',
                labels.device,
                labels.deviceDescription(deviceId ?? 'this device'),
                'monitor-outline'
              ],
              ['shared', labels.shared, labels.sharedDescription, 'cloud-upload-outline']
            ] as [DesktopLayoutScope, string, string, string][]
          ).map(([value, title, description, icon]) => {
            const selected = scope === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                className={cx(classes.option, {
                  [classes.optionSelected]: selected
                })}
                onClick={() => select(value)}
              >
                <span
                  className={cx(classes.radio, { [classes.radioSelected]: selected })}
                  aria-hidden="true"
                >
                  {selected && <span className={cx(classes.radioDot)} />}
                </span>
                <span className={cx(classes.optionBody)}>
                  <span className={cx(classes.optionTitle)}>
                    <Icon icon={icon} pack="nebular-essentials" aria-hidden="true" />
                    {title}
                  </span>
                  <span className={cx(classes.optionHint)}>{description}</span>
                  {value === 'device' && (
                    <span className={cx(classes.optionHint)}>{labels.deviceFallback}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {conflict && (
          <div className={cx(classes.conflict)} role="alert">
            <span className={cx(classes.conflictTitle)}>{labels.conflictTitle}</span>
            <span>{labels.conflictDescription}</span>
            {(conflict.localSavedAt || conflict.remoteSavedAt) && (
              <span className={cx(classes.conflictDates)}>
                {conflict.localSavedAt && (
                  <span>{labels.conflictLocalSavedAt(conflict.localSavedAt)}</span>
                )}
                {conflict.remoteSavedAt && (
                  <span>{labels.conflictRemoteSavedAt(conflict.remoteSavedAt)}</span>
                )}
              </span>
            )}
            <div className={cx(classes.conflictActions)}>
              <button
                type="button"
                className={cx(classes.conflictAction)}
                disabled={disabled || !onResolveConflict}
                onClick={() => onResolveConflict?.('local')}
              >
                {labels.keepLocal}
              </button>
              <button
                type="button"
                className={cx(classes.conflictAction)}
                disabled={disabled || !onResolveConflict}
                onClick={() => onResolveConflict?.('remote')}
              >
                {labels.useRemote}
              </button>
            </div>
          </div>
        )}
        {onSave && (
          <div className={cx(classes.footer)}>
            <button
              type="button"
              className={cx(classes.save)}
              disabled={disabled || saving}
              onClick={onSave}
            >
              {saving ? labels.saving : labels.save}
            </button>
            {saved && (
              <span className={cx(classes.status)} role="status">
                {labels.saved}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

DesktopLayoutSettings.displayName = 'DesktopLayoutSettings';
