import classNames from 'classnames';
import { Moment } from 'moment';
import { useLayoutEffect, useState } from 'react';
import { useCalendarModelService } from '../../hooks';
import { useCalendarPickerContext } from '../../model';
import { NbCalendarPicker } from '../calendar-picker';
import { NbCalendarYearCell } from './CalendarYearCell';

export type NbCalendarYearPickerProps<D extends Date | Moment> = {
  year: D;
};

function NbCalendarYearPicker<D extends Date | Moment>({ year }: NbCalendarYearPickerProps<D>) {
  const { locale, size, yearChange, yearCellType, dateType } = useCalendarPickerContext<D>();
  const calendarModelService = useCalendarModelService(locale, dateType);
  const [years, setYears] = useState<D[][]>();

  useLayoutEffect(() => {
    const _years = calendarModelService.getViewYears(year);
    setYears(_years as D[][]);
  }, [year]);

  return (
    <div
      className={classNames('nb-calendar-year-picker', {
        'size-large': size === 'large'
      })}
    >
      <NbCalendarPicker cellType={yearCellType ?? NbCalendarYearCell} data={years} onSelect={yearChange} />
    </div>
  );
}

export { NbCalendarYearPicker };
