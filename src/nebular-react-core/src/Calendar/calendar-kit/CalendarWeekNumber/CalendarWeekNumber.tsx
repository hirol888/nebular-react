import React, { useEffect, useState } from 'react';
import { Moment } from 'moment';
import { useDateFns, useId } from '@nebular-react/hooks';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import useStyles, { CalendarWeekNumberStylesParams } from './CalendarWeekNumber.style';

export type CalendarWeekNumberStylesNames = Selectors<typeof useStyles>;

export interface CalendarWeekNumberProps<TDate extends Date | Moment>
  extends DefaultProps<CalendarWeekNumberStylesNames, CalendarWeekNumberStylesParams> {
  data: (TDate | null)[][];
  weekNumberSymbol?: string;
}

function CalendarWeekNumber<TDate extends Date | Moment>(props: CalendarWeekNumberProps<TDate>) {
  const { data, weekNumberSymbol, className, classNames, styles, unstyled, ...others } = props;
  const { locale, size } = useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(
    { size },
    { name: 'calendar-week-number', classNames, styles, unstyled }
  );

  const [weekNumbers, setWeekNumbers] = useState<number[]>([]);

  const dateFns = useDateFns<TDate>(locale);

  useEffect(() => {
    const _weekNumbers = data.map((week: (TDate | null)[]) => {
      const lastDay = [...week].reverse().find((day: TDate | null) => !!day);
      return dateFns.getWeekNumber(lastDay);
    });

    _weekNumbers && setWeekNumbers(_weekNumbers);
  }, [data]);

  const uuid = useId();

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      <div className={cx(classes.signContainer)}>
        <div className={cx(classes.sign)}>{weekNumberSymbol}</div>
      </div>
      {weekNumbers.map((weekNumber, index) => (
        <div key={`${uuid}-week-number-${index}`} className={classes.weekNumber}>
          {weekNumber}
        </div>
      ))}
    </div>
  );
}

CalendarWeekNumber.displayName = '@nebular-react/core/CalendarWeekNumber';

export { CalendarWeekNumber };
