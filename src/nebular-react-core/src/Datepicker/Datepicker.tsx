import React, { useRef, useState } from 'react';
import { Moment } from 'moment';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir,
  useNebularLocale
} from '@nebular-react/styles';
import {
  DEFAULT_LOCALE,
  isValidTimeZone,
  useDateFns,
  useFlexibleConnectedPositionStrategy,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { Calendar } from '../Calendar';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import useStyles from './Datepicker.style';
import { BasePickerProps, DatePreset } from './types';
import { createDatePresets } from './presets';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { adjustDateInputValue, applyDateInputMask, getMaskedCaret } from '../Shared/date-input';
import { useDefaultLocale } from '../Shared/hooks';

export type DatepickerStylesNames = Selectors<typeof useStyles>;

export interface DatepickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<DatepickerStylesNames>, BasePickerProps<TDate> {
  date?: TDate;
  onDateChange?: (date: TDate) => void;
  inputProps?: Partial<Omit<InputProps, 'placeholder'>>;
  placeholder?: string;
  presets?: boolean | DatePreset<TDate>[];
}

const defaultProps: Partial<DatepickerProps> = {
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
  withKeyboardEdit: true
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

function Datepicker<TDate extends Date | Moment = Date>(props: DatepickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const { t } = useNebularLocale();
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
    placeholder,
    presets,
    hideOnSelect,
    showNavigation,
    showWeekNumber,
    weekNumberSymbol,
    dropdownOffset,
    position,
    adjustment,
    onDropdownOpen,
    onDropdownClose,
    onDateChange,
    dropdownClass,
    dayCellComponent,
    monthCellComponent,
    yearCellComponent,
    dateType,
    withInputMask,
    withKeyboardEdit,
    inputProps,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(
    { ...(defaultProps as DatepickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, { name: 'datepicker', classNames, styles, unstyled });
  const {
    onChange: inputOnChange,
    onKeyDown: inputOnKeyDown,
    ...restInputProps
  } = inputProps ?? {};
  const [opened, setOpened] = useState<boolean>(false);
  const dateFns = useDateFns<TDate>(locale);
  const activePresets =
    presets === true
      ? createDatePresets(dateFns, dateType, { today: t('datePicker.today', 'Today') })
      : presets || [];
  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const displayDate = shiftToTimeZone(date, activeTimeZone) ?? undefined;
  const displayMin = shiftToTimeZone(min, activeTimeZone) ?? undefined;
  const displayMax = shiftToTimeZone(max, activeTimeZone) ?? undefined;
  const [visibleDateValue, setVisibleDateValue] = useState<TDate>(
    () => shiftToTimeZone(visibleDate, activeTimeZone) as TDate
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

  const handleDateChange = (_date: TDate) => {
    if (triggerRef.current) {
      triggerRef.current.value = dateFns.format(_date, format);
    }

    const nextDate = shiftFromTimeZone(_date, activeTimeZone) as TDate | undefined;
    typeof onDateChange === 'function' && nextDate && onDateChange(nextDate);
    setVisibleDateValue(_date);
    if (hideOnSelect) {
      hide();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const rawValue = input.value;
    let value = rawValue;

    if (withInputMask && format) {
      const selectionStart = input.selectionStart ?? rawValue.length;
      const digitsBefore = rawValue.slice(0, selectionStart).replace(/\D/g, '').length;
      value = applyDateInputMask(rawValue, format);

      if (value !== rawValue) {
        input.value = value;
        setInputCaret(input, getMaskedCaret(value, digitsBefore));
      }
    }

    let _date: TDate | undefined;
    if (dateFns.isValidDateString(value, format)) {
      _date = dateFns.parse(value, format, dateType);
    }

    if (_date) {
      const nextDate = shiftFromTimeZone(_date, activeTimeZone) as TDate | undefined;
      typeof onDateChange === 'function' && nextDate && onDateChange(nextDate);
      setVisibleDateValue(_date);
    }

    typeof inputOnChange === 'function' && inputOnChange(event);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (withKeyboardEdit && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      const input = event.currentTarget;
      const caret = input.selectionStart ?? input.value.length;
      const adjusted = adjustDateInputValue(
        input.value,
        format,
        caret,
        event.key === 'ArrowUp' ? 1 : -1
      );

      if (adjusted) {
        event.preventDefault();
        input.value = adjusted.value;
        setInputCaret(input, adjusted.caret);

        if (dateFns.isValidDateString(adjusted.value, format)) {
          const _date = dateFns.parse(adjusted.value, format, dateType);
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
        className={cx(classes.input, className)}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
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
                          shiftToTimeZone(preset.getValue(), activeTimeZone) as TDate
                        )
                      }
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
              <Calendar<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={displayMin}
                max={displayMax}
                date={displayDate}
                filter={filter}
                disabledDates={disabledDates}
                dayCellComponent={dayCellComponent}
                monthCellComponent={monthCellComponent}
                yearCellComponent={yearCellComponent}
                onDateChange={handleDateChange}
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

Datepicker.displayName = 'Datepicker';

export { Datepicker };
