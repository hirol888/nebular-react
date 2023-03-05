import React, { useState } from 'react';
import { Moment } from 'moment';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { useCalendar, useIsomorphicEffect } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { CalendarWeekNumber } from '../CalendarWeekNumber';
import { CalendarDaysNames } from '../CalendarDaysNames';
import { CalendarPicker } from '../CalendarPicker';
import useStyles from './CalendarDayPicker.style';
import { CalendarDayCell } from './CalendarDayCell';

export type CalendarDayPickerStylesNames = Selectors<typeof useStyles>;

export interface CalendarDayPickerProps extends DefaultProps<CalendarDayPickerStylesNames> {
  boundingMonths?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
}

const defaultProps: Partial<CalendarDayPickerProps> = {
  boundingMonths: true,
  showWeekNumber: false
};

function CalendarDayPicker<TDate extends Date | Moment = Date>(props: CalendarDayPickerProps) {
  const {
    boundingMonths,
    showWeekNumber,
    weekNumberSymbol,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'calendar-day-picker',
    classNames,
    styles,
    unstyled
  });

  const { locale, visibleDate, size, onDateChange, dayCellComponent } =
    useCalendarPickerContext<TDate>();
  const [weeks, setWeeks] = useState<(TDate | null)[][]>([]);

  const calendarFns = useCalendar<TDate>(locale);

  useIsomorphicEffect(() => {
    if (visibleDate || boundingMonths) {
      const _weeks = calendarFns.createDaysGrid(visibleDate!, boundingMonths);
      setWeeks(_weeks as TDate[][]);
    }
  }, [visibleDate, boundingMonths]);

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      {showWeekNumber && (
        <CalendarWeekNumber<TDate>
          weekNumberSymbol={weekNumberSymbol}
          data={weeks}
          classNames={classNames}
          styles={styles}
          unstyled={unstyled}
        />
      )}
      <div className={cx(classes.daysContainer)}>
        <CalendarDaysNames<TDate> classNames={classNames} styles={styles} unstyled={unstyled} />
        <CalendarPicker<TDate>
          cellComponent={dayCellComponent ?? CalendarDayCell}
          data={weeks}
          onSelect={onDateChange}
          classNames={classNames}
          styles={styles}
          unstyled={unstyled}
        />
      </div>
    </div>
  );
}

CalendarDayPicker.displayName = '@nebular-react/core/CalendarDayPicker';

export { CalendarDayPicker };
