import React from 'react';
import { NbCalendarViewModeValues } from '../../model';
import { NbButton } from '../../../button';
import { NbIcon } from '../../../icon';
import { DEFAULT_LOCALE, useCalendarModel, useDateService } from '../../hooks';

export type NbCalendarViewModeProps = {
  locale?: string;
  date?: Date;
  viewMode?: NbCalendarViewModeValues;
  changeMode?: () => void;
};

const NbCalendarViewMode: React.FC<NbCalendarViewModeProps> = ({
  locale = DEFAULT_LOCALE,
  date,
  viewMode = 'date',
  changeMode
}) => {
  const calendarModel = useCalendarModel(locale);
  const dateService = useDateService(locale);

  const getText = (): string => {
    if (!date) {
      return '';
    }

    switch (viewMode) {
      case 'date': {
        const month = dateService.getMonthName(date, 'long');
        const year = dateService.getYear(date);
        return `${month} ${year}`;
      }
      case 'month':
        return `${dateService.getYear(date)}`;
      case 'year':
        return `${getFirstYear()} - ${getLastYear()}`;
    }
  };

  const getIcon = (): string => {
    if (viewMode === 'date') {
      return 'chevron-down-outline';
    }

    return 'chevron-up-outline';
  };

  const getFirstYear = (): string => {
    const years = calendarModel.getViewYears(date!);
    return dateService.getYear(years[0][0]).toString();
  };

  const getLastYear = (): string => {
    const years = calendarModel.getViewYears(date!);
    const lastRow = years[years.length - 1];
    const lastYear = lastRow[lastRow.length - 1];

    return dateService.getYear(lastYear).toString();
  };

  return (
    <div className="nb-calendar-view-mode">
      <NbButton appearance="ghost" status="basic" onClick={() => changeMode && changeMode()}>
        {getText()}
        <NbIcon icon={getIcon()} pack="nebular-essentials" />
      </NbButton>
    </div>
  );
};

export { NbCalendarViewMode };
