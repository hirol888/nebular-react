import React, { useRef, useState } from 'react';
import { Moment } from 'moment';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  DEFAULT_LOCALE,
  useDateFns,
  useFlexibleConnectedPositionStrategy,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { BasePickerProps } from './types';
import { Input, InputProps } from '../Input';
import { CalendarRange, DateRange } from '../Calendar';
import { OptionalPortal } from '../OptionalPortal';
import useStyles from './Datepicker.style';

export type RangepickerStylesNames = Selectors<typeof useStyles>;

export interface RangepickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<RangepickerStylesNames>,
    BasePickerProps<TDate> {
  range?: DateRange<TDate>;
  onRangeChange?: (range: DateRange<TDate>) => void;
  inputProps?: Partial<Omit<InputProps, 'placeholder' | 'onChange'>>;
  placeholder?: string;
}

const defaultProps: Partial<RangepickerProps> = {
  locale: DEFAULT_LOCALE,
  boundingMonth: true,
  startView: 'date',
  calendarSize: 'medium',
  hideOnSelect: true,
  showNavigation: true,
  weekNumberSymbol: '#',
  showWeekNumber: false,
  dropdownOffset: 8,
  position: 'bottom',
  adjustment: 'counterclockwise',
  dateType: 'native'
};

function Rangepicker<TDate extends Date | Moment = Date>(props: RangepickerProps<TDate>) {
  const {
    locale,
    format,
    boundingMonth,
    startView,
    min,
    max,
    range,
    filter,
    calendarSize,
    visibleDate,
    hideOnSelect,
    placeholder,
    showNavigation,
    showWeekNumber,
    weekNumberSymbol,
    dropdownOffset,
    position,
    adjustment,
    onDropdownOpen,
    onDropdownClose,
    onRangeChange,
    dropdownClass,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    inputProps,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps as RangepickerProps<TDate>, props);
  const { classes, cx } = useStyles(null, { name: 'rangepicker', classNames, styles, unstyled });
  const [opened, setOpened] = useState<boolean>(false);
  const dateFns = useDateFns<TDate>(locale);
  const [visibleDateValue, setVisibleDateValue] = useState<TDate>(visibleDate);

  const triggerRef = useRef<HTMLInputElement>(null);

  const dir = useNebularDir();

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setOpened(true);
      typeof onDropdownOpen === 'function' && onDropdownOpen();
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setOpened(false);
      typeof onDropdownClose === 'function' && onDropdownClose();
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    position,
    adjustment,
    triggerRef.current,
    dir,
    dropdownOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened,
    panelClass: dropdownClass,
    scrollStrategy: 'repositon'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'focus', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  const handleRangeChange = (_range: DateRange<TDate>) => {
    if (_range.start) {
      setVisibleDateValue(_range.start);
      triggerRef.current.value = dateFns.format(_range.start, format);
      typeof onRangeChange === 'function' && onRangeChange(_range);
    }

    if (_range.end) {
      triggerRef.current.value = `${dateFns.format(_range.start, format)} - ${dateFns.format(
        _range.end,
        format
      )}`;
      typeof onRangeChange === 'function' && onRangeChange(_range);
      if (hideOnSelect) {
        hide();
      }
    }
  };

  return (
    <>
      <Input
        ref={triggerRef}
        className={cx(classes.input, className)}
        placeholder={placeholder}
        {...inputProps}
      />
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <div className={cx(classes.calendarContainer)}>
              <CalendarRange<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={min}
                max={max}
                range={range}
                filter={filter}
                dayCellComponent={dayCellComponent}
                monthCellComponent={monthCellComponent}
                yearCellComponent={yearCellComponent}
                onRangeChange={handleRangeChange}
                size={calendarSize}
                showNavigation={showNavigation}
                visibleDate={visibleDateValue}
                showWeekNumber={showWeekNumber}
                weekNumberSymbol={weekNumberSymbol}
                dateType={dateType}
              />
            </div>
          </div>
        </div>
      </OptionalPortal>
    </>
  );
}

Rangepicker.displayName = '@nebular-react/core/Rangepicker';

export { Rangepicker };
