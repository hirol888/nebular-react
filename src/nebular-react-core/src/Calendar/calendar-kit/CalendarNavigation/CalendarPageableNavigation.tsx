import React from 'react';
import { DefaultProps, Selectors, useNebularDir } from '@nebular-react/styles';
import { Button } from '../../../Button';
import { Icon } from '../../../Icon';
import useStyles from './CalendarNavigation.style';

export type CalendarPageableNavigationStylesNames = Selectors<typeof useStyles>;

export interface CalendarPageableNavigationProps
  extends DefaultProps<CalendarPageableNavigationStylesNames> {
  next?: () => void;
  prev?: () => void;
}

function CalendarPageableNavigation(props: CalendarPageableNavigationProps) {
  const { next, prev, className, classNames, styles, unstyled, ...others } = props;
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

CalendarPageableNavigation.displayName = '@nebular-react/core/CalendarPageableNavigation';

export { CalendarPageableNavigation };
