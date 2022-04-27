import React from 'react';
import { NbCalendarCellProps } from '../calendar-day-picker';
import * as _ from 'lodash';
import './calendar-picker-row.scss';

export type NbCalendarPickerRowProps = {
  row: (Date | null)[];
  cellType: React.FC<NbCalendarCellProps>;
  onSelect?: (date: Date) => void;
};

const NbCalendarPickerRow: React.FC<NbCalendarPickerRowProps> = ({ row, cellType, onSelect }) => {
  const cells = row.map((date) => {
    return React.createElement(cellType, {
      key: _.uniqueId('calendar-cell-'),
      date: date!,
      onSelect
    });
  });

  return <div className="nb-calendar-picker-row">{cells}</div>;
};

export { NbCalendarPickerRow };
