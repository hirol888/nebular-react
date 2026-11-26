import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface FormErrorSummaryItem {
  /** ID of the field, or of a group containing its focusable controls. */
  fieldId: string;
  /** Text of the link to the field. */
  message: string;
}

export interface FormErrorSummaryProps
  extends
    DefaultProps<FormErrorSummaryStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Errors shown by the application after validation. An empty list hides the summary. */
  errors: readonly FormErrorSummaryItem[];
  /** Heading and accessible name of the summary. */
  title?: string;
  /** Focus the summary when errors first appear. Subsequent edits preserve field focus. */
  focusOnMount?: boolean;
}

const useStyles = createStyles(() => ({
  root: {
    minWidth: 0,
    padding: '1rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderInlineStart: '0.25rem solid var(--color-danger-500, #ff3d71)',
    borderRadius: 'var(--form-error-summary-border-radius, 0.375rem)',
    background: 'var(--form-error-summary-background, var(--background-basic-color-1, #ffffff))',
    color: 'var(--form-error-summary-color, var(--text-basic-color, #222b45))',
    overflowWrap: 'anywhere',

    '&:focus': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.4
  },
  list: {
    marginBlock: '0.5rem 0',
    paddingInlineStart: '1.25rem',
    lineHeight: 1.5
  },
  link: {
    color: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: '0.15em',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  }
}));

export type FormErrorSummaryStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<FormErrorSummaryProps> = {
  title: 'Review the following fields',
  focusOnMount: true
};

const fieldControlSelector = [
  'input:not([type="hidden"]):not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'button:not(:disabled)',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"]):not(:disabled)'
].join(', ');

function focusField(event: React.MouseEvent<HTMLAnchorElement>, fieldId: string) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  const { ownerDocument } = event.currentTarget;
  const target = ownerDocument.getElementById(fieldId);
  if (!target) return;

  target.focus();
  if (ownerDocument.activeElement !== target) {
    const controls = target.querySelectorAll<HTMLElement>(fieldControlSelector);
    for (const control of controls) {
      control.focus();
      if (ownerDocument.activeElement === control) break;
    }
  }

  if (target.contains(ownerDocument.activeElement)) event.preventDefault();
}

const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>((props, ref) => {
  const { errors, title, focusOnMount, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'form-error-summary',
    classNames,
    styles,
    unstyled
  });
  const titleId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(summaryRef, ref);
  const hasErrors = errors.length > 0;

  useEffect(() => {
    if (hasErrors && focusOnMount) summaryRef.current?.focus();
  }, [hasErrors, focusOnMount]);

  if (!hasErrors) return null;

  return (
    <div
      {...others}
      ref={mergedRef}
      className={cx(classes.root, className)}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <h2 id={titleId} className={classes.title}>
        {title}
      </h2>
      <ul className={classes.list}>
        {errors.map(({ fieldId, message }) => (
          <li key={JSON.stringify([fieldId, message])}>
            <a
              className={classes.link}
              href={`#${encodeURIComponent(fieldId)}`}
              onClick={(event) => focusField(event, fieldId)}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});

FormErrorSummary.displayName = 'FormErrorSummary';

export { FormErrorSummary };
