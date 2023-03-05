import React, { useRef } from 'react';
import { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles from './CalendarDayCell.style';
import { useCellTransition } from '../utils/use-cell-transition';
import { CalendarDayCellProps } from './CalendarDayCell.type';

function CalendarDayCell<TDate extends Date | Moment = Date>(props: CalendarDayCellProps<TDate>) {
  const { date, onSelect, className, classNames, styles, unstyled, ...others } = props;
  const { locale, selectedValue, visibleDate, min, max, size, filter, dateType } =
    useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(
    { size },
    {
      name: 'calendar-day-cell',
      classNames,
      styles,
      unstyled
    }
  );
  const dateFns = useDateFns<TDate>(locale);
  const day = date && dateFns.getDate(date);

  const smallerThanMin = (): boolean => !!(date && min && dateFns.compareDates(date, min) < 0);

  const greaterThanMax = (): boolean => !!(date && max && dateFns.compareDates(date, max) > 0);

  const dontFitFilter = (): boolean => !!(date && filter && !filter(date));

  const isDisabled = (): boolean => smallerThanMin() || greaterThanMax() || dontFitFilter();

  const handleClick = () => {
    if (isDisabled() || !date) {
      return;
    }

    onSelect && onSelect(date);
  };

  const cellRef = useRef<HTMLDivElement>(null);
  useCellTransition(date, cellRef);

  return (
    <div
      className={cx(classes.root, className, size, 'day-cell', {
        today: dateFns.isSameDay(date, dateFns.today(dateType)),
        'bounding-month': !dateFns.isSameMonth(date, visibleDate),
        selected: dateFns.isSameDay(date, selectedValue as TDate),
        empty: !date,
        disabled: isDisabled()
      })}
      onClick={handleClick}
      {...others}
    >
      <div className="cell-content" ref={cellRef}>
        {day}
      </div>
    </div>
  );
}

CalendarDayCell.displayName = '@nebular-react/core/CalendarDayCell';

export { CalendarDayCell };
