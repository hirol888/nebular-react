import React from 'react';
import { DefaultProps, Selectors, useNebularDir } from '@nebular-react/styles';
import { Button } from '../../../Button';
import { Icon } from '../../../Icon';
import useStyles from './CalendarNavigation.style';

export type CalendarPageableNavigationStylesNames = Selectors<typeof useStyles>;

type NavigationDefaultProps = DefaultProps<CalendarPageableNavigationStylesNames>;

export interface CalendarPageableNavigationProps extends NavigationDefaultProps {
  next?: () => void;
  prev?: () => void;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}

function CalendarPageableNavigation(props: CalendarPageableNavigationProps) {
  const {
    next,
    prev,
    prevAriaLabel = 'Previous',
    nextAriaLabel = 'Next',
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const { classes, cx } = useStyles(null, {
    name: 'calendar-pageable-navigation',
    classNames,
    styles,
    unstyled
  });

  const dir = useNebularDir();

  return (
    <div className={cx(classes.root, classes.pageableNavigation, className)} {...others}>
      <Button
        onClick={() => typeof prev === 'function' && prev()}
        appearance="ghost"
        status="basic"
        aria-label={prevAriaLabel}
        prefixIcon={
          <Icon
            icon={dir === 'ltr' ? 'chevron-left-outline' : 'chevron-right-outline'}
            pack="nebular-essentials"
          />
        }
      />
      <Button
        onClick={() => typeof next === 'function' && next()}
        appearance="ghost"
        status="basic"
        aria-label={nextAriaLabel}
        prefixIcon={
          <Icon
            icon={dir === 'ltr' ? 'chevron-right-outline' : 'chevron-left-outline'}
            pack="nebular-essentials"
          />
        }
      />
    </div>
  );
}

CalendarPageableNavigation.displayName = 'CalendarPageableNavigation';

export { CalendarPageableNavigation };
