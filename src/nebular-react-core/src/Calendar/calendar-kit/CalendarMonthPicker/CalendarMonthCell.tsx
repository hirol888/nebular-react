import React, { useRef } from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { useCellTransition } from '../utils/use-cell-transition';
import { CalendarMonthCellProps } from './CalendarMonthCell.type';
import useStyles from './CalendarMonthCell.style';

function CalendarMonthCell<TDate extends Date | Moment = Date>(
  props: CalendarMonthCellProps<TDate>
) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const { locale, selectedValue, min, max, size, dateType } = useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(
    { size },
    {
      name: 'calendar-month-cell',
      classNames,
      styles,
      unstyled
    }
  );
  const dateFns = useDateFns<TDate>(locale);

  const month = dateFns.getMonthName(date!);

  const smallerThanMin = (): boolean | undefined =>
    date && min && dateFns.compareDates(dateFns.getMonthEnd(date), min) < 0;

  const greaterThanMax = (): boolean | undefined =>
    date && max && dateFns.compareDates(dateFns.getMonthStart(date), max) > 0;

  const isDisabled = (): boolean | undefined => smallerThanMin() || greaterThanMax();

  const handleClick = () => {
    if (isDisabled()) {
      return;
    }

    onSelect && onSelect(date!);
  };

  const cellRef = useRef<HTMLDivElement>(null);
  useCellTransition(date, cellRef);

  return (
    <div
      className={cx(classes.root, className, size, 'month-cell', {
        selected: dateFns.isSameMonth(date, selectedValue as TDate),
        today: dateFns.isSameMonth(date, dateFns.today(dateType)),
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content" ref={cellRef}>
        {month}
      </div>
    </div>
  );
}

CalendarMonthCell.displayName = '@nebular-react/core/CalendarMonthCell';

export { CalendarMonthCell };
