import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useId } from '@nebular-react/hooks';

export interface SpoilerProps
  extends
    DefaultProps<SpoilerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  maxHeight?: number;
  showLabel?: React.ReactNode;
  hideLabel?: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?(expanded: boolean): void;
  transitionDuration?: number;
  children?: React.ReactNode;
}

const useStyles = createStyles(
  (_theme, { transitionDuration }: { transitionDuration: number }) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontFamily: 'inherit'
    },

    content: {
      overflow: 'hidden',
      transition: `max-height ${transitionDuration}ms ease`
    },

    control: {
      alignSelf: 'flex-start',
      padding: 0,
      border: 0,
      background: 'transparent',
      color: 'var(--spoiler-control-color, var(--color-primary-500, #3366ff))',
      font: 'inherit',
      fontSize: 'var(--spoiler-control-font-size, 0.8125rem)',
      fontWeight: 600,
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px',
        borderRadius: '2px'
      }
    }
  })
);

export type SpoilerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<SpoilerProps> = {
  maxHeight: 100,
  showLabel: 'Show more',
  hideLabel: 'Show less',
  defaultExpanded: false,
  transitionDuration: 200
};

const _Spoiler = forwardRef<HTMLDivElement, SpoilerProps>((props, ref) => {
  const {
    maxHeight,
    showLabel,
    hideLabel,
    expanded,
    defaultExpanded,
    onChange,
    transitionDuration,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { transitionDuration },
    { name: 'spoiler', classNames, styles, unstyled }
  );
  const [isExpanded, setExpanded] = useUncontrolled<boolean>({
    value: expanded,
    defaultValue: defaultExpanded,
    finalValue: false,
    onChange
  });
  const contentId = `nebular-spoiler-${useId()}`;

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      <div
        id={contentId}
        className={cx(classes.content)}
        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
      >
        {children}
      </div>
      <button
        type="button"
        className={cx(classes.control)}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!isExpanded)}
      >
        {isExpanded ? hideLabel : showLabel}
      </button>
    </div>
  );
});

_Spoiler.displayName = 'Spoiler';

export { _Spoiler as Spoiler };
