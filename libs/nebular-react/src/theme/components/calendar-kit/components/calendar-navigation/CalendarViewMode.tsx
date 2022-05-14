import { useCalendarPickerContext, NbCalendarViewModeValues } from '../../model';
import { NbButton } from '../../../button';
import { NbIcon } from '../../../icon';
import { useCalendarModelService, useDateService } from '../../hooks';
import { Moment } from 'moment';

export type NbCalendarViewModeProps<D> = {
  locale?: string;
  date?: D;
  viewMode?: NbCalendarViewModeValues;
  changeMode?: () => void;
};

function NbCalendarViewMode<D extends Date | Moment>({
  date,
  viewMode = 'date',
  changeMode
}: NbCalendarViewModeProps<D>) {
  const { locale, dateType } = useCalendarPickerContext<D>();
  const calendarModelService = useCalendarModelService(locale, dateType);
  const dateService = useDateService(locale, dateType);

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
    const years = calendarModelService.getViewYears(date!);
    return dateService.getYear(years[0][0]).toString();
  };

  const getLastYear = (): string => {
    const years = calendarModelService.getViewYears(date!);
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
}

export { NbCalendarViewMode };
