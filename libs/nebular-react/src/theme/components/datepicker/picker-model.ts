import { NbAdjustment } from 'libs/nebular-react/src/core/cdk';
import { Moment } from 'moment';
import React from 'react';
import {
  NbCalendarCellProps,
  NbCalendarSize,
  NbCalendarViewModeValues,
  NbCalRange,
  NbDateTypes
} from '../calendar-kit';

interface NbPickerProps<D extends Date | Moment> {
  locale?: string;
  format?: string;
  boundingMonth?: boolean;
  startView?: NbCalendarViewModeValues;
  min?: D;
  max?: D;
  date?: D;
  filter?: (date: D) => boolean;
  calendarSize?: NbCalendarSize;
  visibleDate?: D;
  hideOnSelect?: boolean;
  showNavigation?: boolean;
  weekNumberSymbol?: string;
  showWeekNumber?: boolean;
  overlayOffset?: number;
  adjustment?: NbAdjustment;
  dayCellType?: React.FC<NbCalendarCellProps<D>>;
  monthCellType?: React.FC<NbCalendarCellProps<D>>;
  yearCellType?: React.FC<NbCalendarCellProps<D>>;
  dateType?: NbDateTypes;
}

export interface NbPickerRef {
  elementRef: React.RefObject<HTMLInputElement>;
}

export interface NbDatepickerProps<D extends Date | Moment> extends NbPickerProps<D> {
  date?: D;
}

export interface NbRangepickerProps<D extends Date | Moment> extends NbPickerProps<D> {
  range?: NbCalRange<D>;
}
