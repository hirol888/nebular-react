import classNames from 'classnames';
import React, { useContext } from 'react';
import { CalendarPickerContext } from '../../model';
import { NbCalendarCellProps } from '../calendar-day-picker';
import { NbCalendarPickerRow } from './CalendarPickerRow';
import * as _ from 'lodash';

export type NbCalendarPickerProps = {
  data: (Date | null)[][] | undefined;
  cellType: React.FC<NbCalendarCellProps>;
  onSelect?: (date: Date) => void;
};

const NbCalendarPicker: React.FC<NbCalendarPickerProps> = ({ data, cellType, onSelect }) => {
  const { size } = useContext(CalendarPickerContext);

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
};

export { NbCalendarPicker };
