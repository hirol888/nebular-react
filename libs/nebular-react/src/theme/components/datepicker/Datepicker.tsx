import classNames from 'classnames';
import {
  getContainerPositionClasses,
  NbAdjustment,
  NbPosition,
  NbTrigger,
  Portal
} from 'libs/nebular-react/src/core/cdk';
import {
  useOverlay,
  usePositionStrategy,
  useRepositionScrollStrategy,
  useTriggerStrategy
} from 'libs/nebular-react/src/core/cdk/hooks';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import { Moment } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  NbDateTypes,
  NbCalendarDayCell,
  NbCalendarMonthCell,
  NbCalendarYearCell,
  useDateService
} from '../calendar-kit';
import { NbInput, NbInputProps } from '../input';
import * as _ from 'lodash';
import { NbCalendar } from '../calendar';
import { DEFAULT_LOCALE } from '../calendar-kit/hooks/date-moment';
import { NbDatepickerProps } from './picker-model';

declare module 'react' {
  function forwardRef<T, P = unknown>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

function NbDatepickerInner<D extends Date | Moment>(
  {
    locale = DEFAULT_LOCALE,
    format,
    boundingMonth = true,
    startView = 'date',
    min,
    max,
    date,
    filter,
    calendarSize = 'medium',
    visibleDate,
    hideOnSelect = true,
    showNavigation = true,
    weekNumberSymbol = '#',
    showWeekNumber = false,
    overlayOffset = 8,
    adjustment = NbAdjustment.COUNTERCLOCKWISE,
    dayCellType,
    monthCellType,
    yearCellType,
    dateType = NbDateTypes.Date,
    className,
    ...otherProps
  }: NbDatepickerProps<D> & NbInputProps & React.HTMLAttributes<HTMLElement>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rendered, setRendered] = useState<boolean>(false);
  const [paneId] = useState<string>(_.uniqueId('cdk-overlay-'));
  const [inputValue, setInputValue] = useState<string>('');
  const [dateValue, setDateValue] = useState<D | undefined>(date);
  const [visibleDateValue, setVisibleDateValue] = useState<D | undefined>(visibleDate);

  const dateService = useDateService(locale, dateType);

  const componentRef = useRef<HTMLInputElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRendered(true);
  }, []);

  const show = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const hide = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const { positionStrategy, overlayPosition } = usePositionStrategy(
    rendered,
    componentRef,
    overlayOffset,
    NbPosition.BOTTOM,
    adjustment
  );
  const scrollStrategy = useRepositionScrollStrategy();
  const overlayRef = useOverlay(rendered, undefined, positionStrategy, scrollStrategy);
  useTriggerStrategy(rendered, isOpen, paneId, componentRef, componentRef, NbTrigger.FOCUS, show, hide);

  const handleDateChange = (date: D) => {
    setInputValue(dateService.format(date, format));
    setDateValue(date);
    if (hideOnSelect) {
      hide();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let dateValue: D | undefined;
    if (dateService.isValidDateString(event.target.value, format)) {
      dateValue = dateService.parse(event.target.value, format) as D;
    }

    setDateValue(dateValue);
    setVisibleDateValue(dateValue);
    setInputValue(event.target.value);
  };

  return (
    <>
      <NbInput
        ref={mergedRefs<HTMLInputElement>(ref, componentRef)}
        className={classNames('nb-datepicker', className, getContainerPositionClasses(overlayPosition))}
        value={inputValue}
        onChange={(event) => handleInputChange(event)}
        {...otherProps}
      />
      <Portal overlayRef={overlayRef} isOpen={isOpen} paneRef={paneRef}>
        <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
          <div className="nb-datepicker-container">
            <NbCalendar<D>
              boundingMonth={boundingMonth}
              startView={startView}
              min={min}
              max={max}
              date={dateValue}
              filter={filter}
              dayCellType={dayCellType ?? NbCalendarDayCell}
              monthCellType={monthCellType ?? NbCalendarMonthCell}
              yearCellType={yearCellType ?? NbCalendarYearCell}
              dateChange={handleDateChange}
              size={calendarSize}
              showNavigation={showNavigation}
              visibleDate={visibleDateValue}
              showWeekNumber={showWeekNumber}
              weekNumberSymbol={weekNumberSymbol}
              dateType={dateType}
            />
          </div>
        </div>
      </Portal>
    </>
  );
}

const NbDatepicker = React.forwardRef(NbDatepickerInner);

export { NbDatepicker };
