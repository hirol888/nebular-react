import React, { useState } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import {
  batch,
  MONTHS_IN_COLUMN,
  MONTHS_IN_VIEW,
  useDateFns,
  useIsomorphicEffect
} from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { CalendarPicker } from '../CalendarPicker';
import useStyles from './CalendarMonthPicker.style';
import { CalendarMonthCell } from './CalendarMonthCell';

export type CalendarMonthPickerStylesNames = Selectors<typeof useStyles>;

export interface CalendarMonthPickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarMonthPickerStylesNames> {
  month: TDate;
}

function CalendarMonthPicker<TDate extends Date | Moment = Date>(
  props: CalendarMonthPickerProps<TDate>
) {
  const { month, className, classNames, styles, unstyled, ...others } = props;
  const { locale, size, onMonthChange, monthCellComponent, dateType } =
    useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(null, {
    name: 'calendar-month-picker',
    classNames,
    styles,
    unstyled
  });
  const dateFns = useDateFns<TDate>(locale);
  const [monthsValue, setMonthsValue] = useState<TDate[][]>();

  useIsomorphicEffect(() => {
    const _date = dateFns.getDate(month);
    const _year = dateFns.getYear(month);
    const _firstMonth = dateFns.createDate(_year, 0, _date, dateType);
    const months = [_firstMonth];

    for (let monthIndex = 1; monthIndex < MONTHS_IN_VIEW; monthIndex++) {
      months.push(dateFns.addMonths(_firstMonth, monthIndex));
    }

    const _months = batch(months, MONTHS_IN_COLUMN);
    setMonthsValue(_months as TDate[][]);
  }, [month]);

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      <CalendarPicker<TDate>
        cellComponent={monthCellComponent ?? CalendarMonthCell}
        data={monthsValue}
        onSelect={onMonthChange}
        classNames={classNames}
        styles={styles}
        unstyled={unstyled}
      />
    </div>
  );
}

CalendarMonthPicker.displayName = '@nebular-react/core/CalendarMonthPicker';

export { CalendarMonthPicker };
