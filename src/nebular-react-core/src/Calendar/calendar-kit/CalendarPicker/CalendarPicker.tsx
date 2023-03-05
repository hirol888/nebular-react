import React from 'react';
import { Moment } from 'moment';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { useId } from '@nebular-react/hooks';
import { useCalendarPickerContext } from '../CalendarPicker.context';
import { CalendarPickerRow } from './CalendarPickerRow';
import useStyles from './CalendarPicker.style';
import { CalendarDayCellProps } from '../CalendarDayPicker/CalendarDayCell.type';
import { CalendarMonthCellProps } from '../CalendarMonthPicker/CalendarMonthCell.type';
import { CalendarYearCellProps } from '../CalendarYearPicker/CalendarYearCell.type';

export type CalendarPickerStylesNames = Selectors<typeof useStyles>;

export interface CalendarPickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarPickerStylesNames> {
  data: (TDate | null)[][] | null;
  cellComponent:
    | React.FC<CalendarDayCellProps<TDate>>
    | React.FC<CalendarMonthCellProps<TDate>>
    | React.FC<CalendarYearCellProps<TDate>>;
  onSelect?: (date: TDate) => void;
}

function CalendarPicker<TDate extends Date | Moment = Date>(props: CalendarPickerProps<TDate>) {
  const { data, cellComponent, onSelect, className, classNames, styles, unstyled, ...others } =
    props;
  const { size } = useCalendarPickerContext<TDate>();
  const { classes, cx } = useStyles(null, {
    name: 'calendar-picker',
    classNames,
    styles,
    unstyled
  });

  const uuid = useId();

  return (
    <div className={cx(classes.root, className, size)} {...others}>
      {data?.map((rowDates, index) => (
        <CalendarPickerRow<TDate>
          key={`${uuid}-calendar-picker-row-${index}`}
          rowDates={rowDates}
          cellComponent={cellComponent}
          onSelect={onSelect}
          classNames={classNames}
          styles={styles}
          unstyled={unstyled}
        />
      ))}
    </div>
  );
}

CalendarPicker.displayName = '@nebular-react/core/CalendarPicker';

export { CalendarPicker };
