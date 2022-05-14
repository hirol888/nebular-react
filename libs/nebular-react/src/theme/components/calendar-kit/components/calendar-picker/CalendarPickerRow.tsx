import React from 'react';
import * as _ from 'lodash';
import './calendar-picker-row.scss';
import { NbCalendarCellProps } from '../../model';
import { Moment } from 'moment';

export type NbCalendarPickerRowProps<D extends Date | Moment> = {
  row: (D | null)[];
  cellType: React.FC<NbCalendarCellProps<D>>;
  onSelect?: (date: D) => void;
};

function NbCalendarPickerRow<D extends Date | Moment>({ row, cellType, onSelect }: NbCalendarPickerRowProps<D>) {
  const cells = row.map((date) => {
    return React.createElement(cellType, {
      key: _.uniqueId('calendar-cell-'),
      date: date!,
      onSelect
    });
  });

  return <div className="nb-calendar-picker-row">{cells}</div>;
}

export { NbCalendarPickerRow };
