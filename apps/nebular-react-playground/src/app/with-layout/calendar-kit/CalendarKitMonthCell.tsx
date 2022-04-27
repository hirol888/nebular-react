/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CalendarPickerContext, NbCalendarCellProps, NbCalendarDayPicker, useDateService } from '@nebular-react';
import React, { useContext } from 'react';

const CalendarKitMonthCell: React.FC<NbCalendarCellProps> = ({ date }) => {
  const dateService = useDateService('en-US');
  const { selectedValue, dateChange } = useContext(CalendarPickerContext);

  const getTitle = (): string => {
    return dateService.getMonthName(date!, 'long');
  };

  return (
    <div style={{ padding: '1rem', flex: '1 0 auto' }}>
      <h4>{getTitle()}</h4>
      <CalendarPickerContext.Provider value={{ selectedValue, visibleDate: date!, dateChange }}>
        <NbCalendarDayPicker boundingMonths={false} />
      </CalendarPickerContext.Provider>
    </div>
  );
};

export { CalendarKitMonthCell };
