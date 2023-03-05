import React from 'react';
import { Moment } from 'moment';
import { useCalendar, useDateFns } from '@nebular-react/hooks';
import { DefaultProps, useComponentDefaultProps, Selectors } from '@nebular-react/styles';
import { CalendarViewModeType } from '../types';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { Button } from '../../../Button';
import { Icon } from '../../../Icon';
import useStyles from './CalendarNavigation.style';

export type CalendarViewModeStylesNames = Selectors<typeof useStyles>;

export interface CalendarViewModeProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarViewModeStylesNames> {
  date?: TDate;
  viewMode?: CalendarViewModeType;
  onChangeMode?: () => void;
}

const defaultProps: Partial<CalendarViewModeProps> = {
  viewMode: 'date'
};

function CalendarViewMode<TDate extends Date | Moment = Date>(props: CalendarViewModeProps<TDate>) {
  const { date, viewMode, onChangeMode, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps<CalendarViewModeProps<TDate>>(
      defaultProps as CalendarViewModeProps<TDate>,
      props
    );
  const { classes, cx } = useStyles(null, {
    name: 'calendar-view-mode',
    classNames,
    styles,
    unstyled
  });

  const { locale } = useCalendarPickerContext<TDate>();

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);

  const getText = (): string => {
    if (!date) {
      return '';
    }

    switch (viewMode) {
      case 'date': {
        const month = dateFns.getMonthName(date, 'long');
        const year = dateFns.getYear(date);
        return `${month} ${year}`;
      }
      case 'month':
        return `${dateFns.getYear(date)}`;
      case 'year':
        return `${getFirstYear()} - ${getLastYear()}`;
    }
  };

  const getIcon = (): string => {
    if (viewMode === 'date') {
      return 'chevron-down-outline';
    }

    return 'chevron-up-outline';
  };

  const getFirstYear = (): string => {
    const years = calendarFns.getViewYears(date!);
    return dateFns.getYear(years[0][0]).toString();
  };

  const getLastYear = (): string => {
    const years = calendarFns.getViewYears(date!);
    const lastRow = years[years.length - 1];
    const lastYear = lastRow[lastRow.length - 1];

    return dateFns.getYear(lastYear).toString();
  };

  return (
    <div className={cx(classes.root, className)} {...others}>
      <Button
        appearance="ghost"
        status="basic"
        suffixIcon={<Icon icon={getIcon()} pack="nebular-essentials" />}
        onClick={() => typeof onChangeMode === 'function' && onChangeMode()}
        {...others}
      >
        {getText()}
      </Button>
    </div>
  );
}

CalendarViewMode.displayName = '@nebular-react/core/CalendarViewMode';

export { CalendarViewMode };
