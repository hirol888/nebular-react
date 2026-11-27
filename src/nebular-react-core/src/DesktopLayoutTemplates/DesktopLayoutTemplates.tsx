import React, { useMemo } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import type { DesktopLayoutTemplate } from '../Desktop/Desktop.layouts';

export interface DesktopLayoutTemplatesLabels {
  title: string;
  description: string;
  empty: string;
  apply: string;
  applied: string;
  delete: string;
  create: string;
  windows(count: number): string;
  group: string;
}

type DesktopLayoutTemplatesBaseProps = DefaultProps<DesktopLayoutTemplatesStylesNames>;

export interface DesktopLayoutTemplatesProps extends DesktopLayoutTemplatesBaseProps {
  templates: DesktopLayoutTemplate[];
  activeTemplateId?: string;
  onApply?(template: DesktopLayoutTemplate): void;
  onDelete?(template: DesktopLayoutTemplate): void;
  onCreate?(): void;
  disabled?: boolean;
  labels?: Partial<DesktopLayoutTemplatesLabels>;
  ariaLabel?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
    color: 'var(--desktop-layout-templates-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--desktop-layout-templates-font-family, inherit)'
  },

  title: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600
  },

  description: {
    margin: 0,
    color: 'var(--desktop-layout-templates-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8rem',
    lineHeight: 1.4
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
    gap: '0.5rem',
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    minWidth: 0,
    padding: '0.65rem',
    border:
      '1px solid var(--desktop-layout-templates-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-layout-templates-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-layout-templates-background-color, var(--background-basic-color-1, #ffffff))'
  },

  cardActive: {
    borderColor: 'var(--color-primary-500, #3366ff)',
    backgroundColor:
      'var(--desktop-layout-templates-selected-background-color, rgba(51, 102, 255, 0.08))'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem'
  },

  cardTitle: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 600
  },

  badge: {
    flex: '0 0 auto',
    padding: '0.05rem 0.4rem',
    borderRadius: '999px',
    backgroundColor: 'var(--color-primary-500, #3366ff)',
    color: '#ffffff',
    fontSize: '0.68rem',
    fontWeight: 600
  },

  cardDescription: {
    margin: 0,
    color: 'var(--desktop-layout-templates-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    lineHeight: 1.35
  },

  meta: {
    color: 'var(--desktop-layout-templates-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.72rem'
  },

  actions: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingTop: '0.2rem'
  },

  action: {
    minHeight: '1.8rem',
    padding: '0.2rem 0.6rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--desktop-layout-templates-radius, 0.35rem)',
    backgroundColor:
      'var(--desktop-layout-templates-background-color, var(--background-basic-color-1, #ffffff))',
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

  primaryAction: {
    borderColor: 'var(--color-primary-500, #3366ff)',
    backgroundColor: 'var(--color-primary-500, #3366ff)',
    color: '#ffffff'
  },

  empty: {
    margin: 0,
    padding: '0.75rem',
    border:
      '1px dashed var(--desktop-layout-templates-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-layout-templates-radius, 0.45rem)',
    color: 'var(--desktop-layout-templates-hint-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.78rem',
    textAlign: 'center'
  }
}));

export type DesktopLayoutTemplatesStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DesktopLayoutTemplatesProps> = {
  ariaLabel: 'Desktop layout templates'
};

export const DesktopLayoutTemplates = React.forwardRef<HTMLElement, DesktopLayoutTemplatesProps>(
  (props, ref) => {
    const {
      templates,
      activeTemplateId,
      onApply,
      onDelete,
      onCreate,
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
      name: 'desktop-layout-templates',
      classNames,
      styles,
      unstyled
    });
    const { t } = useNebularLocale();
    const labels = useMemo<DesktopLayoutTemplatesLabels>(
      () => ({
        title: t('desktopLayoutTemplates.title', 'Layout templates'),
        description: t(
          'desktopLayoutTemplates.description',
          'Apply a saved arrangement of windows and workspaces to this desktop.'
        ),
        empty: t('desktopLayoutTemplates.empty', 'No templates yet.'),
        apply: t('desktopLayoutTemplates.apply', 'Apply template'),
        applied: t('desktopLayoutTemplates.applied', 'Applied'),
        delete: t('desktopLayoutTemplates.delete', 'Delete template'),
        create: t('desktopLayoutTemplates.create', 'Save current layout as template'),
        windows: (count) => t('desktopLayoutTemplates.windows', '{count} windows', { count }),
        group: t('desktopLayoutTemplates.group', 'Desktop layout templates'),
        ...labelsProp
      }),
      [t, labelsProp]
    );

    return (
      <section {...others} ref={ref} className={cx(classes.root, className)} aria-label={ariaLabel}>
        <h3 className={cx(classes.title)}>{labels.title}</h3>
        <p className={cx(classes.description)}>{labels.description}</p>
        {templates.length === 0 ? (
          <p className={cx(classes.empty)}>{labels.empty}</p>
        ) : (
          <ul className={cx(classes.grid)} aria-label={labels.group}>
            {templates.map((template) => {
              const active = template.id === activeTemplateId;
              const windows = template.snapshot.windows.length;

              return (
                <li
                  key={template.id}
                  className={cx(classes.card, { [classes.cardActive]: active })}
                >
                  <div className={cx(classes.cardHeader)}>
                    <h4 className={cx(classes.cardTitle)}>{template.name}</h4>
                    {active && <span className={cx(classes.badge)}>{labels.applied}</span>}
                  </div>
                  {template.description && (
                    <p className={cx(classes.cardDescription)}>{template.description}</p>
                  )}
                  <span className={cx(classes.meta)}>{labels.windows(windows)}</span>
                  <div className={cx(classes.actions)}>
                    <button
                      type="button"
                      className={cx(classes.action, classes.primaryAction)}
                      disabled={disabled || !onApply}
                      aria-label={`${labels.apply}: ${template.name}`}
                      onClick={() => onApply?.(template)}
                    >
                      {labels.apply}
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className={cx(classes.action)}
                        disabled={disabled}
                        aria-label={`${labels.delete}: ${template.name}`}
                        onClick={() => onDelete(template)}
                      >
                        {labels.delete}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {onCreate && (
          <div>
            <button
              type="button"
              className={cx(classes.action)}
              disabled={disabled}
              onClick={onCreate}
            >
              {labels.create}
            </button>
          </div>
        )}
      </section>
    );
  }
);

DesktopLayoutTemplates.displayName = 'DesktopLayoutTemplates';
