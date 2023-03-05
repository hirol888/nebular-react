import { Moment } from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  DEFAULT_LOCALE,
  useCalendar,
  useDateFns,
  useFlexibleConnectedPositionStrategy,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { CalendarWithTime } from '../Calendar';
import useStyles from '../Datepicker/Datepicker.style';
import { BasePickerProps } from '../Datepicker/types';
import { buildDateFormat, buildTimeFormat } from '../Timepicker/utils';
import { BaseTimeListProps } from '../Timepicker/types';

export type DatetimePickerStylesNames = Selectors<typeof useStyles>;

export interface DatetimePickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<DatetimePickerStylesNames>,
    BasePickerProps<TDate> {
  date?: TDate;
  timeListProps?: Partial<BaseTimeListProps>;
  inputProps?: Partial<Omit<InputProps, 'onChange' | 'placeholder'>>;
  placeholder?: string;
  onDateChange?: (date: TDate) => void;
}

const defaultProps: Partial<DatetimePickerProps> = {
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
  dateType: 'native',
  timeListProps: {
    twelveHoursFormat: false
  }
};

function DatetimePicker<TDate extends Date | Moment = Date>(props: DatetimePickerProps<TDate>) {
  const {
    locale,
    format,
    boundingMonth,
    startView,
    min,
    max,
    date,
    filter,
    calendarSize,
    visibleDate,
    hideOnSelect,
    showNavigation,
    weekNumberSymbol,
    showWeekNumber,
    dropdownOffset,
    position,
    adjustment,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    dropdownClass,
    onDropdownOpen,
    onDropdownClose,
    onDateChange,
    timeListProps,
    inputProps,
    placeholder,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps<DatetimePickerProps<TDate>>(
    defaultProps as DatetimePickerProps<TDate>,
    props
  );
  const { classes, cx } = useStyles(null, {
    name: 'datetime-picker',
    classNames,
    styles,
    unstyled
  });

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);

  const _format = useMemo(
    () =>
      format ||
      buildDateFormat(
        timeListProps.twelveHoursFormat,
        timeListProps.withSeconds,
        timeListProps.singleColumn,
        calendarFns
      ),
    [timeListProps.twelveHoursFormat, timeListProps.withSeconds, timeListProps.singleColumn]
  );

  const _timeFormat = useMemo(
    () =>
      timeListProps.timeFormat ||
      buildTimeFormat(
        timeListProps.twelveHoursFormat,
        timeListProps.withSeconds,
        timeListProps.singleColumn,
        dateFns
      ),
    [timeListProps.twelveHoursFormat, timeListProps.withSeconds, timeListProps.singleColumn]
  );

  const [opened, setOpened] = useState<boolean>(false);
  const [visibleDateValue, setVisibleDateValue] = useState<TDate | undefined>(visibleDate);

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

  const handleDateChange = (_date: TDate, close: boolean) => {
    triggerRef.current.value = dateFns.format(_date, _format);
    typeof onDateChange === 'function' && onDateChange(_date);
    if (hideOnSelect && close) {
      hide();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _date: TDate | undefined;
    if (dateFns.isValidDateString(event.target.value, _format)) {
      _date = dateFns.parse(event.target.value, _format, dateType);
    }

    typeof onDateChange === 'function' && onDateChange(_date);
    setVisibleDateValue(_date);
    triggerRef.current.value = event.target.value;
  };

  return (
    <>
      <Input
        ref={triggerRef}
        className={cx(classes.input)}
        onChange={(event) => handleInputChange(event)}
        placeholder={placeholder}
        {...inputProps}
      />
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <div className={cx(classes.calendarContainer)}>
              <CalendarWithTime<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={min}
                max={max}
                date={date}
                filter={filter}
                size={calendarSize}
                visibleDate={visibleDateValue}
                showNavigation={showNavigation}
                weekNumberSymbol={weekNumberSymbol}
                showWeekNumber={showWeekNumber}
                dayCellComponent={dayCellComponent}
                monthCellComponent={monthCellComponent}
                yearCellComponent={yearCellComponent}
                dateType={dateType}
                timeListProps={{ ...timeListProps, timeFormat: _timeFormat }}
                onDateChange={handleDateChange}
                className={className}
                opened={opened}
              />
            </div>
          </div>
        </div>
      </OptionalPortal>
    </>
  );
}

DatetimePicker.displayName = '@nebular-react/core/DatetimePicker';

export { DatetimePicker };
