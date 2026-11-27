import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { useId } from '@nebular-react/hooks';
import { BaseCalendarCellProps } from '../types';
import useStyles from './CalendarPickerRow.style';

export type CalendarPickerRowStylesNames = Selectors<typeof useStyles>;

export interface CalendarPickerRowProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<CalendarPickerRowStylesNames> {
  rowDates: (TDate | null)[];
  cellComponent: React.FC<BaseCalendarCellProps<TDate>>;
  onSelect?: (date: TDate) => void;
}

function CalendarPickerRow<TDate extends Date | Moment = Date>(
  props: CalendarPickerRowProps<TDate>
) {
  const { rowDates, cellComponent, onSelect, className, classNames, styles, unstyled, ...others } =
    props;
  const { classes, cx } = useStyles(null, {
    name: 'calendar-picker-row',
    classNames,
    styles,
    unstyled
  });

  const uuid = useId();
  const CellComponent = cellComponent;

  return (
    <div className={cx(classes.root, className)} {...others}>
      {rowDates.map((date, index) => (
        <React.Fragment key={`${uuid}-cell-${index}`}>
          {date && (
            <CellComponent
              date={date}
              onSelect={onSelect}
              classNames={classNames}
              styles={styles}
              unstyled={unstyled}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

CalendarPickerRow.displayName = 'CalendarPickerRow';

export { CalendarPickerRow };
