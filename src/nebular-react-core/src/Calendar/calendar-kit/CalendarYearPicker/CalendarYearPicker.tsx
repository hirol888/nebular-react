import React, { useState } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { useCalendar, useIsomorphicEffect } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { CalendarPicker } from '../CalendarPicker';
import useStyles from './CalendarYearPicker.style';
import { CalendarYearCell } from './CalendarYearCell';

export type CalendarYearPickerStylesNames = Selectors<typeof useStyles>;

export interface CalendarYearPickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarYearPickerStylesNames> {
  year: TDate;
}

function CalendarYearPicker<TDate extends Date | Moment = Date>(
  props: CalendarYearPickerProps<TDate>
) {
  const { year, className, classNames, styles, unstyled, ...others } = props;
  const { locale, size, onYearChange, yearCellComponent } = useCalendarPickerContext<TDate>();
  const calendarFns = useCalendar<TDate>(locale);
  const { classes, cx } = useStyles(null, {
    name: 'calendar-year-picker',
    classNames,
    styles,
    unstyled
  });

  const [years, setYears] = useState<TDate[][]>();

  useIsomorphicEffect(() => {
    const _years = calendarFns.getViewYears(year);
    setYears(_years as TDate[][]);
  }, [year]);

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      <CalendarPicker<TDate>
        cellComponent={yearCellComponent ?? CalendarYearCell}
        data={years}
        onSelect={onYearChange}
        classNames={classNames}
        styles={styles}
        unstyled={unstyled}
      />
    </div>
  );
}

CalendarYearPicker.displayName = '@nebular-react/core/CalendarYearPicker';

export { CalendarYearPicker };
