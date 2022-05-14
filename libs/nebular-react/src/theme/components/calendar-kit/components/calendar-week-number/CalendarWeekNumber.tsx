import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useCalendarPickerContext } from '../../model';
import * as _ from 'lodash';
import './calendar-week-number.scss';
import { Moment } from 'moment';
import { useDateService } from '../../hooks';

export type NbCalendarWeekNumberProps<D extends Date | Moment> = {
  data: (D | null)[][];
  weekNumberSymbol?: string;
};

function NbCalendarWeekNumber<D extends Date | Moment>({ data, weekNumberSymbol }: NbCalendarWeekNumberProps<D>) {
  const [weekNumbers, setWeekNumbers] = useState<number[]>([]);
  const { locale, size, dateType } = useCalendarPickerContext<D>();
  const dateService = useDateService(locale, dateType);

  useEffect(() => {
    const _weekNumbers = data.map((week: (D | null)[]) => {
      const lastDay = [...week].reverse().find((day: D | null) => !!day);
      return dateService.getWeekNumber(lastDay!);
    });

    _weekNumbers && setWeekNumbers(_weekNumbers);
  }, [data]);

  return (
    <div
      className={classNames('nb-calendar-week-numbers', {
        'size-large': size === 'large'
      })}
    >
      <div className="sign-container">
        <div className="sign">{weekNumberSymbol}</div>
      </div>
      {weekNumbers.map((weekNumber) => {
        return (
          <div key={_.uniqueId('week-number-')} className="week-number">
            {weekNumber}
          </div>
        );
      })}
    </div>
  );
}

export { NbCalendarWeekNumber };
