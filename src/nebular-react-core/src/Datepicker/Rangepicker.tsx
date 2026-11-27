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
import { BasePickerProps, DateRangePreset } from './types';
import { createRangePresets } from './presets';
import { Input, InputProps } from '../Input';
import { CalendarRange, DateRange } from '../Calendar';
import { OptionalPortal } from '../OptionalPortal';
import useStyles from './Datepicker.style';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { adjustDateInputValue, buildDateInputMask, getMaskedCaret } from '../Shared/date-input';
import { useDefaultLocale } from '../Shared/hooks';
import { formatMaskedValue } from '../MaskedInput';

export type RangepickerStylesNames = Selectors<typeof useStyles>;

export interface RangepickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<RangepickerStylesNames>, BasePickerProps<TDate> {
  range?: DateRange<TDate>;
  onRangeChange?: (range: DateRange<TDate>) => void;
  inputProps?: Partial<Omit<InputProps, 'placeholder'>>;
  placeholder?: string;
  presets?: boolean | DateRangePreset<TDate>[];
}

const RANGE_SEPARATOR = ' - ';

function getRangeMask(format?: string): string | null {
  const mask = buildDateInputMask(format);

  return mask ? `${mask}${RANGE_SEPARATOR}${mask}` : null;
}

function splitRangeInput(value: string): { start: string; end?: string; endOffset: number } {
  const index = value.indexOf(RANGE_SEPARATOR);

  if (index < 0) {
    return { start: value, end: undefined, endOffset: 0 };
  }

  return {
    start: value.slice(0, index),
    end: value.slice(index + RANGE_SEPARATOR.length),
    endOffset: index + RANGE_SEPARATOR.length
  };
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
  dateType: 'native',
  withInputMask: false,
  withKeyboardEdit: true
};

function Rangepicker<TDate extends Date | Moment = Date>(props: RangepickerProps<TDate>) {
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
    range,
    filter,
    disabledDates,
    calendarSize,
    visibleDate,
    hideOnSelect,
    placeholder,
    presets,
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
    withInputMask,
    withKeyboardEdit,
    inputProps,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(
    { ...(defaultProps as RangepickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, { name: 'rangepicker', classNames, styles, unstyled });
  const [opened, setOpened] = useState<boolean>(false);
  const dateFns = useDateFns<TDate>(locale);
  const activePresets =
    presets === true
      ? createRangePresets(dateFns, dateType, {
          today: t('datePicker.today', 'Today'),
          last7Days: t('datePicker.last7Days', 'Last 7 days'),
          thisMonth: t('datePicker.thisMonth', 'This month')
        })
      : presets || [];
  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const displayMin = shiftToTimeZone(min, activeTimeZone) ?? undefined;
  const displayMax = shiftToTimeZone(max, activeTimeZone) ?? undefined;

  const toDisplayRange = (_range?: DateRange<TDate> | null): DateRange<TDate> | undefined =>
    _range
      ? {
          start: shiftToTimeZone(_range.start, activeTimeZone) ?? undefined,
          end: shiftToTimeZone(_range.end, activeTimeZone) ?? undefined
        }
      : undefined;

  const toAbsoluteRange = (_range: DateRange<TDate>): DateRange<TDate> => ({
    start: shiftFromTimeZone(_range.start, activeTimeZone) ?? undefined,
    end: shiftFromTimeZone(_range.end, activeTimeZone) ?? undefined
  });

  const displayRange = toDisplayRange(range);
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

  const rangeMask = getRangeMask(format);

  const emitRangeFromInput = (value: string) => {
    const { start, end } = splitRangeInput(value);
    const parsePart = (part?: string) =>
      part && dateFns.isValidDateString(part, format)
        ? dateFns.parse(part, format, dateType)
        : undefined;

    const displayStart = parsePart(start);

    if (!displayStart) {
      return;
    }

    const displayEnd = parsePart(end);

    if (displayEnd) {
      setVisibleDateValue(displayStart);
    }

    typeof onRangeChange === 'function' &&
      onRangeChange(toAbsoluteRange({ start: displayStart, end: displayEnd }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (!withInputMask || !rangeMask) {
      emitRangeFromInput(value);
      return;
    }

    const caret = event.target.selectionStart ?? value.length;
    const digitsBefore = value.slice(0, caret).replace(/\D/g, '').length;
    const masked = formatMaskedValue(value, rangeMask);
    const nextCaret = getMaskedCaret(masked, digitsBefore);

    event.target.value = masked;
    event.target.setSelectionRange(nextCaret, nextCaret);

    emitRangeFromInput(masked);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!withKeyboardEdit || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }

    if (!format) {
      return;
    }

    const input = event.currentTarget;
    const caret = input.selectionStart ?? input.value.length;
    const delta = event.key === 'ArrowUp' ? 1 : -1;
    const { start, end, endOffset } = splitRangeInput(input.value);

    let nextValue: string;
    let nextCaret: number;

    if (end !== undefined && caret >= endOffset) {
      const adjustedEnd = adjustDateInputValue(end, format, caret - endOffset, delta);

      if (!adjustedEnd) {
        return;
      }

      nextValue = `${start}${RANGE_SEPARATOR}${adjustedEnd.value}`;
      nextCaret = endOffset + adjustedEnd.caret;
    } else {
      const adjustedStart = adjustDateInputValue(start, format, caret, delta);

      if (!adjustedStart) {
        return;
      }

      nextValue =
        end !== undefined ? `${adjustedStart.value}${RANGE_SEPARATOR}${end}` : adjustedStart.value;
      nextCaret = adjustedStart.caret;
    }

    event.preventDefault();

    input.value = nextValue;
    input.setSelectionRange(nextCaret, nextCaret);

    emitRangeFromInput(nextValue);
  };

  const applyPreset = (preset: DateRangePreset<TDate>) => {
    const presetRange = preset.getValue();
    const nextRange = toDisplayRange(presetRange) as DateRange<TDate>;

    if (nextRange.start) {
      setVisibleDateValue(nextRange.start);
    }

    if (triggerRef.current) {
      if (nextRange.start && nextRange.end) {
        triggerRef.current.value = `${dateFns.format(nextRange.start, format)} - ${dateFns.format(
          nextRange.end,
          format
        )}`;
      } else if (nextRange.start) {
        triggerRef.current.value = dateFns.format(nextRange.start, format);
      }
    }

    typeof onRangeChange === 'function' && onRangeChange(presetRange);
    if (hideOnSelect) {
      hide();
    }
  };

  const handleRangeChange = (_range: DateRange<TDate>) => {
    const nextRange = toAbsoluteRange(_range);

    if (_range.start) {
      setVisibleDateValue(_range.start);
      if (triggerRef.current) {
        triggerRef.current.value = dateFns.format(_range.start, format);
      }
      typeof onRangeChange === 'function' && onRangeChange(nextRange);
    }

    if (_range.start && _range.end) {
      if (triggerRef.current) {
        triggerRef.current.value = `${dateFns.format(_range.start, format)} - ${dateFns.format(
          _range.end,
          format
        )}`;
      }
      typeof onRangeChange === 'function' && onRangeChange(nextRange);
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
        onChange={(event) => {
          handleInputChange(event);
          typeof inputProps?.onChange === 'function' && inputProps.onChange(event);
        }}
        onKeyDown={(event) => {
          handleKeyDown(event);
          typeof inputProps?.onKeyDown === 'function' && inputProps.onKeyDown(event);
        }}
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
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
              <CalendarRange<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={displayMin}
                max={displayMax}
                range={displayRange}
                filter={filter}
                disabledDates={disabledDates}
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

Rangepicker.displayName = 'Rangepicker';

export { Rangepicker };
