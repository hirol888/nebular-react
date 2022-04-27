import {
  NbCalendarRange,
  NbCalendarRangeDayCell,
  NbCalendarRangeMonthCell,
  NbCalendarRangeYearCell,
  NbCalRange,
  NbCard,
  NbCardBody,
  NbCardHeader,
  useDateService
} from '@nebular-react';
import React, { useState } from 'react';

const CalendarRangeShowcase: React.FC = () => {
  const dateService = useDateService('en-US');
  const range = {
    start: dateService.addDays(dateService.getMonthStart(new Date()), 3),
    end: dateService.addDays(dateService.getMonthEnd(new Date()), -3)
  };
  const [selectedRange, setSelectedRange] = useState<NbCalRange>({ start: null, end: null });

  const handleRangeChange = (range: NbCalRange) => {
    setSelectedRange(range);
  };

  return (
    <NbCard>
      <NbCardHeader>
        <h1 className="h5">
          Selected range: {selectedRange.start?.toLocaleDateString()} - {selectedRange.end?.toLocaleDateString()}
        </h1>
      </NbCardHeader>
      <NbCardBody>
        <NbCalendarRange
          range={range}
          rangeChange={handleRangeChange}
          dayCellType={NbCalendarRangeDayCell}
          monthCellType={NbCalendarRangeMonthCell}
          yearCellType={NbCalendarRangeYearCell}
        />
      </NbCardBody>
    </NbCard>
  );
};

export { CalendarRangeShowcase };
