import classNames from 'classnames';
import React from 'react';
import { useCalendarPickerContext, NbCalendarCellProps } from '../../model';
import { NbCalendarPickerRow } from './CalendarPickerRow';
import * as _ from 'lodash';
import { Moment } from 'moment';

export type NbCalendarPickerProps<D extends Date | Moment> = {
  data: (D | null)[][] | undefined;
  cellType: React.FC<NbCalendarCellProps<D>>;
  onSelect?: (date: D) => void;
};

function NbCalendarPicker<D extends Date | Moment>({ data, cellType, onSelect }: NbCalendarPickerProps<D>) {
  const { size } = useCalendarPickerContext<D>();

  return (
    <div
      className={classNames('nb-calendar-picker', {
        'size-large': size === 'large'
      })}
    >
      {data?.map((row) => {
        return (
          <NbCalendarPickerRow
            key={_.uniqueId('calendar-picker-row-')}
            row={row}
            cellType={cellType}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

export { NbCalendarPicker };
