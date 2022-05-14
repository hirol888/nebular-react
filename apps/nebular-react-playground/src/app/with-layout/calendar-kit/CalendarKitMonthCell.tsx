/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CalendarPickerContext,
  NbDateTypes,
  NbCalendarCellProps,
  NbCalendarDayPicker,
  useCalendarPickerContext
} from '@nebular-react';
import { useDateService } from 'libs/nebular-react/src/theme/components/calendar-kit/hooks';
import { Moment } from 'moment';

function CalendarKitMonthCell<D extends Date | Moment>({ date }: NbCalendarCellProps<D>) {
  const dateService = useDateService('en-US', NbDateTypes.Date);
  const { selectedValue, dateChange } = useCalendarPickerContext<D>();

  const getTitle = (): string => {
    return dateService.getMonthName(date!, 'long');
  };

  return (
    <div style={{ padding: '1rem', flex: '1 0 auto' }}>
      <h4>{getTitle()}</h4>
      <CalendarPickerContext.Provider value={{ locale: 'en-US', selectedValue, visibleDate: date!, dateChange }}>
        <NbCalendarDayPicker<Date> boundingMonths={false} />
      </CalendarPickerContext.Provider>
    </div>
  );
}

export { CalendarKitMonthCell };
