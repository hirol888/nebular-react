import { useDateService } from '../../hooks';
import { NbCalendarDay } from '../../model';
import classNames from 'classnames';
import * as _ from 'lodash';
import './calendar-days-names.scss';
import { useCalendarPickerContext } from '../../model';
import { Moment } from 'moment';

function NbCalendarDaysNames<D extends Date | Moment>() {
  const { locale, size, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

  const days: NbCalendarDay[] = dateService.getDayOfWeekNames().map((name, index) => {
    return { name: name, isHoliday: index % 6 === 0 };
  });

  return (
    <div
      className={classNames('nb-calendar-days-names', {
        'size-large': size === 'large'
      })}
    >
      {days.map((day) => {
        return (
          <div key={_.uniqueId('day-name-')} className={classNames('day', { holiday: day.isHoliday })}>
            {day.name}
          </div>
        );
      })}
    </div>
  );
}

export { NbCalendarDaysNames };
