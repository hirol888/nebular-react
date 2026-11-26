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
  useOverlayTrigger,
  isValidTimeZone
} from '@nebular-react/hooks';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { CalendarWithTime } from '../Calendar';
import useStyles from '../Datepicker/Datepicker.style';
import { BasePickerProps, DatePreset } from '../Datepicker/types';
import { createDatePresets } from '../Datepicker/presets';
import { buildDateFormat, buildTimeFormat } from '../Timepicker/utils';
import { BaseTimeListProps } from '../Timepicker/types';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { adjustDateInputValue, applyDateInputMask, getMaskedCaret } from '../Shared/date-input';
import { useDefaultLocale } from '../Shared/hooks';

export type DatetimePickerStylesNames = Selectors<typeof useStyles>;

export interface DatetimePickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<DatetimePickerStylesNames>, BasePickerProps<TDate> {
  date?: TDate;
  timeListProps?: Partial<BaseTimeListProps>;
  inputProps?: Partial<Omit<InputProps, 'placeholder'>>;
  placeholder?: string;
  presets?: boolean | DatePreset<TDate>[];
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
  withInputMask: false,
  withKeyboardEdit: true,
  timeListProps: {
    twelveHoursFormat: false
  }
};

function setInputCaret(input: HTMLInputElement, caret: number) {
  if (typeof input.setSelectionRange !== 'function') {
    return;
  }

  try {
    input.setSelectionRange(caret, caret);
  } catch {
    // Input types such as number and date do not support selection ranges.
  }
}

function DatetimePicker<TDate extends Date | Moment = Date>(props: DatetimePickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    locale,
    timeZone,
    format,
    boundingMonth,
    startView,
    min,
    max,
    date,
    filter,
    disabledDates,
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
    withInputMask,
    withKeyboardEdit,
    dropdownClass,
    onDropdownOpen,
    onDropdownClose,
    onDateChange,
    timeListProps,
    inputProps,
    placeholder,
    presets,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps<DatetimePickerProps<TDate>>(
    { ...(defaultProps as DatetimePickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, {
    name: 'datetime-picker',
    classNames,
    styles,
    unstyled
  });
  const {
    onChange: inputOnChange,
    onKeyDown: inputOnKeyDown,
    ...restInputProps
  } = inputProps ?? {};

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);
  const activePresets = presets === true ? createDatePresets(dateFns, dateType) : presets || [];
  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const displayDate = shiftToTimeZone(date, activeTimeZone) ?? undefined;
  const displayMin = shiftToTimeZone(min, activeTimeZone) ?? undefined;
  const displayMax = shiftToTimeZone(max, activeTimeZone) ?? undefined;

  const _format = useMemo(
    () =>
      format ||
      buildDateFormat(
        timeListProps.twelveHoursFormat,
        timeListProps.withSeconds,
        timeListProps.singleColumn,
        calendarFns
      ),
    [
      timeListProps.twelveHoursFormat,
      timeListProps.withSeconds,
      timeListProps.singleColumn,
      format,
      calendarFns
    ]
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
    [
      timeListProps.twelveHoursFormat,
      timeListProps.withSeconds,
      timeListProps.singleColumn,
      timeListProps.timeFormat,
      dateFns
    ]
  );

  const [opened, setOpened] = useState<boolean>(false);
  const [visibleDateValue, setVisibleDateValue] = useState<TDate | undefined>(
    () => shiftToTimeZone(visibleDate, activeTimeZone) ?? undefined
  );

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
    scrollStrategy: 'reposition'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'focus', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  const handleDateChange = (_date: TDate, close: boolean) => {
    if (triggerRef.current) {
      triggerRef.current.value = dateFns.format(_date, _format);
    }

    const nextDate = shiftFromTimeZone(_date, activeTimeZone) as TDate | undefined;
    typeof onDateChange === 'function' && nextDate && onDateChange(nextDate);
    setVisibleDateValue(_date);

    if (hideOnSelect && close) {
      hide();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const rawValue = input.value;
    let value = rawValue;

    if (withInputMask) {
      const selectionStart = input.selectionStart ?? rawValue.length;
      const digitsBefore = rawValue.slice(0, selectionStart).replace(/\D/g, '').length;
      value = applyDateInputMask(rawValue, _format);

      if (value !== rawValue) {
        input.value = value;
        setInputCaret(input, getMaskedCaret(value, digitsBefore));
      }
    }

    let _date: TDate | undefined;
    if (dateFns.isValidDateString(value, _format)) {
      _date = dateFns.parse(value, _format, dateType);
    }

    if (_date) {
      const nextDate = shiftFromTimeZone(_date, activeTimeZone) as TDate | undefined;
      typeof onDateChange === 'function' && nextDate && onDateChange(nextDate);
      setVisibleDateValue(_date);
    }

    if (triggerRef.current) {
      triggerRef.current.value = value;
    }

    typeof inputOnChange === 'function' && inputOnChange(event);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (withKeyboardEdit && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      const input = event.currentTarget;
      const caret = input.selectionStart ?? input.value.length;
      const adjusted = adjustDateInputValue(
        input.value,
        _format,
        caret,
        event.key === 'ArrowUp' ? 1 : -1
      );

      if (adjusted) {
        event.preventDefault();
        input.value = adjusted.value;
        setInputCaret(input, adjusted.caret);

        if (dateFns.isValidDateString(adjusted.value, _format)) {
          const _date = dateFns.parse(adjusted.value, _format, dateType);
          const nextDate = shiftFromTimeZone(_date, activeTimeZone) as TDate | undefined;
          typeof onDateChange === 'function' && nextDate && onDateChange(nextDate);
          setVisibleDateValue(_date);
        }
      }
    }

    typeof inputOnKeyDown === 'function' && inputOnKeyDown(event);
  };

  return (
    <>
      <Input
        ref={triggerRef}
        className={cx(classes.input)}
        onChange={(event) => handleInputChange(event)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        {...restInputProps}
      />
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <div className={cx(classes.calendarContainer)}>
              {activePresets.length > 0 && (
                <div className={cx(classes.presets)}>
                  {activePresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      className={cx(classes.presetButton)}
                      onClick={() =>
                        handleDateChange(
                          shiftToTimeZone(preset.getValue(), activeTimeZone) as TDate,
                          true
                        )
                      }
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
              <CalendarWithTime<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={displayMin}
                max={displayMax}
                date={displayDate}
                filter={filter}
                disabledDates={disabledDates}
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

DatetimePicker.displayName = 'DatetimePicker';

export { DatetimePicker };
