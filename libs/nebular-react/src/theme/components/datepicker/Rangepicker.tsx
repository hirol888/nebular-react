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
import { NbDateTypes, useDateService, NbCalRange } from '../calendar-kit';
import { NbInput, NbInputProps } from '../input';
import * as _ from 'lodash';
import {
  NbCalendarRange,
  NbCalendarRangeDayCell,
  NbCalendarRangeMonthCell,
  NbCalendarRangeYearCell
} from '../calendar';
import { DEFAULT_LOCALE } from '../calendar-kit/hooks/date-moment';
import { NbRangepickerProps } from './picker-model';

declare module 'react' {
  function forwardRef<T, P = unknown>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

function NbRangepickerInner<D extends Date | Moment>(
  {
    locale = DEFAULT_LOCALE,
    format,
    boundingMonth = true,
    startView = 'date',
    min,
    max,
    range,
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
  }: NbRangepickerProps<D> & NbInputProps & React.HTMLAttributes<HTMLElement>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rendered, setRendered] = useState<boolean>(false);
  const [paneId] = useState<string>(_.uniqueId('cdk-overlay-'));
  const [inputValue, setInputValue] = useState<string>('');
  const [rangeValue, setRangeValue] = useState<NbCalRange<D> | undefined>(range);
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

  const handleRangeChange = (range: NbCalRange<D>) => {
    if (range.start) {
      setVisibleDateValue(range.start);
      setInputValue(dateService.format(range.start, format));
      setRangeValue(range);
    }
    if (range.end) {
      setVisibleDateValue(range.start!);
      setInputValue(`${dateService.format(range.start, format)} - ${dateService.format(range.end, format)}`);
      setRangeValue(range);
      if (hideOnSelect) {
        hide();
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            <NbCalendarRange<D>
              boundingMonth={boundingMonth}
              startView={startView}
              min={min}
              max={max}
              range={rangeValue}
              filter={filter}
              dayCellType={dayCellType ?? NbCalendarRangeDayCell}
              monthCellType={monthCellType ?? NbCalendarRangeMonthCell}
              yearCellType={yearCellType ?? NbCalendarRangeYearCell}
              rangeChange={handleRangeChange}
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

const NbRangepicker = React.forwardRef(NbRangepickerInner);

export { NbRangepicker };
