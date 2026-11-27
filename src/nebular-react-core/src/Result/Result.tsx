import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

const statusColors: Record<ResultStatus, string> = {
  success: 'var(--color-success-500, #00d68f)',
  error: 'var(--color-danger-500, #ff3d71)',
  info: 'var(--color-info-500, #0095ff)',
  warning: 'var(--color-warning-500, #ffaa00)',
  404: 'var(--color-primary-500, #3366ff)',
  403: 'var(--color-warning-500, #ffaa00)',
  500: 'var(--color-danger-500, #ff3d71)'
};

export interface ResultStylesParams {
  status: ResultStatus;
}

const useStyles = createStyles((_theme, { status }: ResultStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: 'var(--result-padding, 2rem 1.5rem)',
    textAlign: 'center',
    color: 'var(--result-text-color, var(--text-basic-color, #222b45))'
  },

  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--result-icon-size, 4rem)',
    height: 'var(--result-icon-size, 4rem)',
    color: `var(--result-icon-color, ${statusColors[status]})`
  },

  code: {
    fontFamily: 'var(--result-code-font-family, var(--font-family-secondary, inherit))',
    fontSize: 'var(--result-code-font-size, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1
  },

  title: {
    margin: 0,
    fontFamily: 'var(--result-title-font-family, var(--font-family-secondary, inherit))',
    fontSize: 'var(--result-title-font-size, 1.5rem)',
    fontWeight: 600,
    lineHeight: 1.4,
    color: 'var(--result-title-color, var(--text-basic-color, #222b45))'
  },

  subTitle: {
    margin: 0,
    maxWidth: '34rem',
    fontSize: 'var(--result-subtitle-font-size, 0.9375rem)',
    lineHeight: 1.5,
    color: 'var(--result-subtitle-color, var(--text-hint-color, #8f9bb3))'
  },

  content: {
    width: '100%'
  },

  extra: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem'
  }
}));

export type ResultStylesNames = Selectors<typeof useStyles>;

function DefaultIcon({ status, codeClassName }: { status: ResultStatus; codeClassName: string }) {
  if (status === '404' || status === '403' || status === '500') {
    return (
      <span className={codeClassName} aria-hidden="true">
        {status}
      </span>
    );
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {status === 'success' && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}
      {status === 'error' && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </>
      )}
      {status === 'info' && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 11v5M12 8h.01" />
        </>
      )}
      {status === 'warning' && (
        <>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 9v5M12 17h.01" />
        </>
      )}
    </svg>
  );
}

export interface ResultProps
  extends
    DefaultProps<ResultStylesNames, ResultStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  status?: ResultStatus;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const defaultProps: Partial<ResultProps> = {
  status: 'info'
};

const _Result = forwardRef<HTMLDivElement, ResultProps>((props, ref) => {
  const {
    status,
    title,
    subTitle,
    extra,
    icon,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'result', classNames, styles, unstyled });

  const isAlert = status === 'error';
  const iconContent =
    icon !== undefined ? icon : <DefaultIcon status={status} codeClassName={cx(classes.code)} />;

  return (
    <div
      {...others}
      ref={ref}
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      data-status={status}
      className={cx(classes.root, className)}
    >
      {iconContent != null && (
        <div className={cx(classes.icon)} data-result-icon={status}>
          {iconContent}
        </div>
      )}
      {title != null && <h3 className={cx(classes.title)}>{title}</h3>}
      {subTitle != null && <p className={cx(classes.subTitle)}>{subTitle}</p>}
      {children != null && <div className={cx(classes.content)}>{children}</div>}
      {extra != null && <div className={cx(classes.extra)}>{extra}</div>}
    </div>
  );
});

_Result.displayName = 'Result';

export { _Result as Result };
