/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NbCalendarCellProps, useCalendarPickerContext } from '@nebular-react';
import classNames from 'classnames';
import { useDateService } from 'libs/nebular-react/src/theme/components/calendar-kit/hooks';
import { Moment } from 'moment';

function CalendarCustomDayCell<D extends Date | Moment>({ date, onSelect }: NbCalendarCellProps<D>) {
  const { locale, selectedValue, visibleDate, min, max, size, filter, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);
  const day = date && dateService.getDate(date);

  const smallerThanMin = (): boolean => {
    return !!(date && min && dateService.compareDates(date, min) < 0);
  };

  const greaterThanMax = (): boolean => {
    return !!(date && max && dateService.compareDates(date, max) > 0);
  };

  const dontFitFilter = (): boolean => {
    return !!(date && filter && !filter(date));
  };

  const isDisabled = (): boolean => {
    return smallerThanMin() || greaterThanMax() || dontFitFilter();
  };

  const handleClick = () => {
    if (isDisabled() || !date) {
      return;
    }

    onSelect && onSelect(date);
  };

  return (
    <div
      className={classNames('nb-calendar-day-cell', 'day-cell', {
        today: dateService.isSameDaySafe(date, dateService.today()),
        'bounding-month': !dateService.isSameMonthSafe(date, visibleDate),
        selected: dateService.isSameDaySafe(date, selectedValue as D),
        empty: !date,
        disabled: isDisabled(),
        'size-large': size === 'large'
      })}
      onClick={handleClick}
    >
      <div className="cell-content" style={{ flexDirection: 'column' }}>
        <div>{day}</div>
        <span
          className={classNames('caption', { 'text-control': dateService.isSameDaySafe(date, selectedValue as D) })}
        >
          {(day! + 100) * day!}$
        </span>
      </div>
    </div>
  );
}

export { CalendarCustomDayCell };
