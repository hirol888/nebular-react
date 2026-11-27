import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  useComponentDefaultProps,
  useNebularDir,
  Selectors
} from '@nebular-react/styles';
import { Moment } from 'moment';
import {
  DateType,
  DEFAULT_LOCALE,
  Position,
  PositionAdjustment,
  isValidTimeZone,
  useCalendar,
  useDateFns,
  useFlexibleConnectedPositionStrategy,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { TimeList } from './TimeList';
import { buildTimeFormat } from './utils';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { BaseTimeListProps } from './types';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import {
  adjustDateInputValue,
  applyDateInputMask,
  buildDateInputMask,
  getMaskedCaret
} from '../Shared/date-input';
import { useDefaultLocale } from '../Shared/hooks';
import useStyles from './TimeList.style';

export type TimepickerStylesNames = Selectors<typeof useStyles>;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface TimepickerProps<TDate extends Date | Moment = Date> extends DefaultProps {
  locale?: string;
  dateType?: DateType;
  /** Absolute instant shown by the picker. */
  date?: TDate;
  /** Minimum selectable instant (absolute). */
  min?: TDate;
  /** Maximum selectable instant (absolute). */
  max?: TDate;
  /**
   * IANA time zone used to display and parse the value (wall clock).
   *
   * `date`, `min` and `max` remain absolute instants: they are converted to the
   * zone wall clock before reaching the time list, and selections are converted
   * back to absolute instants in `onDateChange`. Invalid or missing values keep
   * the local behavior.
   */
  timeZone?: string;
  placeholder?: string;
  position?: Position;
  adjustment?: PositionAdjustment;
  showCurrentTimeButton?: boolean;
  dropdownOffset?: number;
  dropdownClass?: string;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  /** Called with the selected absolute instant. */
  onDateChange?: (date: TDate) => void;
  inputProps?: Partial<Omit<InputProps, 'placeholder'>>;
  timeListProps?: Partial<BaseTimeListProps>;
  withInputMask?: boolean;
  withKeyboardEdit?: boolean;
}

const defaultProps: Partial<TimepickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  position: 'bottom',
  adjustment: 'vertical',
  dropdownOffset: 8,
  withInputMask: false,
  withKeyboardEdit: true
};

function Timepicker<TDate extends Date | Moment = Date>(props: TimepickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    locale,
    dateType,
    date,
    min,
    max,
    timeZone,
    placeholder,
    position,
    adjustment,
    dropdownOffset,
    dropdownClass,
    onDropdownOpen,
    onDropdownClose,
    onDateChange,
    inputProps,
    timeListProps,
    withInputMask,
    withKeyboardEdit
  } = useComponentDefaultProps<TimepickerProps<TDate>>(
    { ...(defaultProps as TimepickerProps<TDate>), locale: defaultLocale },
    props
  );

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);
  const dir = useNebularDir();

  const triggerRef = useRef<HTMLInputElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;

  const displayDate = useMemo(
    () => (shiftToTimeZone<TDate>(date, activeTimeZone) as TDate | undefined) ?? undefined,
    [date, activeTimeZone]
  );
  const displayMin = useMemo(
    () => (shiftToTimeZone<TDate>(min, activeTimeZone) as TDate | undefined) ?? undefined,
    [min, activeTimeZone]
  );
  const displayMax = useMemo(
    () => (shiftToTimeZone<TDate>(max, activeTimeZone) as TDate | undefined) ?? undefined,
    [max, activeTimeZone]
  );

  const timeFormat = useMemo(
    () =>
      timeListProps?.timeFormat ||
      buildTimeFormat(
        timeListProps?.twelveHoursFormat,
        timeListProps?.withSeconds,
        timeListProps?.singleColumn,
        dateFns
      ),
    [
      timeListProps?.twelveHoursFormat,
      timeListProps?.withSeconds,
      timeListProps?.singleColumn,
      timeListProps?.timeFormat,
      dateFns
    ]
  );

  const getPlaceholder = () => {
    if (!placeholder) {
      return timeFormat;
    }
    return placeholder;
  };
  const placeholderValue = getPlaceholder();

  const formatTime = (value: TDate): string => dateFns.format(value, timeFormat).toUpperCase();

  const getTimeZoneResetTime = (): TDate => {
    const now = dateFns.today(dateType) as TDate;
    const wallNow = (shiftToTimeZone<TDate>(now, activeTimeZone) as TDate | undefined) ?? now;
    let reset = dateFns.setHours(wallNow, 0);
    reset = dateFns.setMinutes(reset, 0);
    reset = dateFns.setSeconds(reset, 0);
    reset = dateFns.setMilliseconds(reset, 0);

    return reset;
  };

  const getInitialDate = (): TDate => {
    if (displayDate) {
      return dateFns.clone(displayDate) as TDate;
    }

    return activeTimeZone ? getTimeZoneResetTime() : (calendarFns.getResetTime(dateType) as TDate);
  };

  const [opened, setOpened] = useState<boolean>(false);
  const [dateValue, setDateValue] = useState<TDate>(getInitialDate);
  const [inputValue, setInputValue] = useState<string>(() =>
    displayDate ? formatTime(displayDate) : ''
  );

  const dateStamp = date ? dateFns.valueOf(date) : undefined;

  useEffect(() => {
    if (!displayDate) {
      return;
    }

    setDateValue(dateFns.clone(displayDate) as TDate);
    setInputValue(dateFns.format(displayDate, timeFormat).toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStamp, activeTimeZone, timeFormat]);

  const timeMask = useMemo(() => buildDateInputMask(timeFormat), [timeFormat]);
  const pendingCaretRef = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const caret = pendingCaretRef.current;

    if (caret === null) {
      return;
    }

    pendingCaretRef.current = null;
    triggerRef.current?.setSelectionRange(caret, caret);
  }, [inputValue]);

  const toInstant = (value: TDate): TDate =>
    (shiftFromTimeZone<TDate>(value, activeTimeZone) as TDate | undefined) ?? value;

  const toWallClock = (value: TDate): TDate =>
    (shiftToTimeZone<TDate>(value, activeTimeZone) as TDate | undefined) ?? value;

  const clampToBounds = (value: TDate): TDate => {
    const stamp = dateFns.valueOf(value);

    if (min && stamp < dateFns.valueOf(min)) {
      return dateFns.clone(min) as TDate;
    }

    if (max && stamp > dateFns.valueOf(max)) {
      return dateFns.clone(max) as TDate;
    }

    return value;
  };

  const applyWallDay = (time: TDate): TDate => {
    const base = dateValue ?? getInitialDate();

    let result = dateFns.createDate(
      dateFns.getYear(base),
      dateFns.getMonth(base),
      dateFns.getDate(base),
      dateType
    ) as TDate;

    result = dateFns.setHours(result, dateFns.getHours(time));
    result = dateFns.setMinutes(result, dateFns.getMinutes(time));
    result = dateFns.setSeconds(result, dateFns.getSeconds(time));
    result = dateFns.setMilliseconds(result, dateFns.getMilliseconds(time));

    return result;
  };

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

  const commitInputValue = (value: string, caret?: number) => {
    if (caret !== undefined) {
      if (value === inputValue) {
        // React does not re-render when the value is unchanged, so the DOM is
        // synchronized here to keep the caret at the masked position.
        if (triggerRef.current) {
          triggerRef.current.value = value;
          triggerRef.current.setSelectionRange(caret, caret);
        }
      } else {
        pendingCaretRef.current = caret;
      }
    }

    setInputValue(value);

    if (!dateFns.isValidDateString(value, timeFormat)) {
      return;
    }

    const parsed = dateFns.parse(value, timeFormat, dateType);
    const instant = clampToBounds(toInstant(applyWallDay(parsed)));

    setDateValue(toWallClock(instant));
    typeof onDateChange === 'function' && onDateChange(instant);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (!withInputMask || !timeMask) {
      commitInputValue(value);
      return;
    }

    const caret = event.target.selectionStart ?? value.length;
    const digitsBefore = value.slice(0, caret).replace(/\D/g, '').length;
    const masked = applyDateInputMask(value, timeFormat);

    commitInputValue(masked, getMaskedCaret(masked, digitsBefore));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!withKeyboardEdit || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }

    const caret = event.currentTarget.selectionStart ?? inputValue.length;
    const adjusted = adjustDateInputValue(
      inputValue,
      timeFormat,
      caret,
      event.key === 'ArrowUp' ? 1 : -1
    );

    if (!adjusted) {
      return;
    }

    event.preventDefault();

    commitInputValue(adjusted.value, adjusted.caret);
  };

  const onSelectTime = (value: { time: TDate; save?: boolean }) => {
    const instant = clampToBounds(toInstant(value.time));
    const wallClock = toWallClock(instant);

    setDateValue(wallClock);
    setInputValue(formatTime(wallClock));
    typeof onDateChange === 'function' && onDateChange(instant);

    if (value.save) {
      hide();
    }
  };

  return (
    <>
      <Input
        ref={triggerRef}
        placeholder={placeholderValue}
        {...inputProps}
        value={inputValue}
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
            <TimeList
              date={dateValue}
              min={displayMin}
              max={displayMax}
              locale={locale}
              dateType={dateType}
              {...timeListProps}
              onSelectTime={onSelectTime}
            />
          </div>
        </div>
      </OptionalPortal>
    </>
  );
}

Timepicker.displayName = 'Timepicker';

export { Timepicker };
