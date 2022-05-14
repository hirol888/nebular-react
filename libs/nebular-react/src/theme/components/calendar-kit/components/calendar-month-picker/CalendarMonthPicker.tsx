import classNames from 'classnames';
import { Moment } from 'moment';
import { useLayoutEffect, useState } from 'react';
import { batch } from '../../helpers';
import { MONTHS_IN_VIEW, MONTHS_IN_COLUMN, useDateService } from '../../hooks';
import { useCalendarPickerContext } from '../../model';
import { NbCalendarPicker } from '../calendar-picker';
import { NbCalendarMonthCell } from './CalendarMonthCell';

export type NbCalendarMonthPickerProps<D> = {
  month: D;
};

function NbCalendarMonthPicker<D extends Date | Moment>({ month }: NbCalendarMonthPickerProps<D>) {
  const { locale, size, monthChange, monthCellType, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);
  const [monthsValue, setMonthsValue] = useState<D[][]>();

  useLayoutEffect(() => {
    const _date = dateService.getDate(month);
    const _year = dateService.getYear(month);
    const _firstMonth = dateService.createDate(_year, 0, _date);
    const months = [_firstMonth];

    for (let monthIndex = 1; monthIndex < MONTHS_IN_VIEW; monthIndex++) {
      months.push(dateService.addMonths(_firstMonth, monthIndex));
    }

    const _months = batch(months, MONTHS_IN_COLUMN);
    setMonthsValue(_months as D[][]);
  }, [month]);

  return (
    <div
      className={classNames('nb-calendar-month-picker', {
        'size-large': size === 'large'
      })}
    >
      <NbCalendarPicker cellType={monthCellType ?? NbCalendarMonthCell} data={monthsValue} onSelect={monthChange} />
    </div>
  );
}

export { NbCalendarMonthPicker };
