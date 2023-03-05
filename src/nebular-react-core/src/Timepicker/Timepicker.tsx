import React, { useMemo, useRef, useState } from 'react';
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
import useStyles from './TimeList.style';

export type TimepickerStylesNames = Selectors<typeof useStyles>;

export interface TimepickerProps extends DefaultProps {
  locale?: string;
  dateType?: DateType;
  placeholder?: string;
  position?: Position;
  adjustment?: PositionAdjustment;
  showCurrentTimeButton?: boolean;
  dropdownOffset?: number;
  dropdownClass?: string;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  inputProps?: Partial<Omit<InputProps, 'placeholder' | 'onChange'>>;
  timeListProps?: Partial<BaseTimeListProps>;
}

const defaultProps: Partial<TimepickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  position: 'bottom',
  adjustment: 'vertical',
  dropdownOffset: 8
};

function Timepicker<TDate extends Date | Moment = Date>(props: TimepickerProps) {
  const {
    locale,
    dateType,
    placeholder,
    position,
    adjustment,
    dropdownOffset,
    dropdownClass,
    onDropdownOpen,
    onDropdownClose,
    inputProps,
    timeListProps
  } = useComponentDefaultProps<TimepickerProps>(defaultProps as TimepickerProps, props);

  const dateFns = useDateFns<TDate>(locale);
  const calendarFns = useCalendar<TDate>(locale);
  const dir = useNebularDir();

  const triggerRef = useRef<HTMLInputElement>(null);

  const timeFormat = useMemo(
    () =>
      timeListProps?.timeFormat ||
      buildTimeFormat(
        timeListProps?.twelveHoursFormat,
        timeListProps?.withSeconds,
        timeListProps?.singleColumn,
        dateFns
      ),
    [timeListProps?.twelveHoursFormat, timeListProps?.withSeconds, timeListProps?.singleColumn]
  );

  const getPlaceholder = () => {
    if (!placeholder) {
      return timeFormat;
    }
    return placeholder;
  };
  const placeholderValue = getPlaceholder();

  const [opened, setOpened] = useState<boolean>(false);
  const [dateValue, setDateValue] = useState<TDate>(calendarFns.getResetTime(dateType) as TDate);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    if (dateType === 'native') {
      /**
       * Native date service dont parse only time string value,
       * and we adding year mouth and day to convert string to valid date format
       **/
      value = parseNativeDateString(event.target.value);
    }

    const isValidDate: boolean = dateFns.isValidDateString(value, timeFormat);
    if (isValidDate) {
      const date = dateFns.parse(value, timeFormat, dateType);
      setDateValue(date as TDate);
    }
  };

  const onSelectTime = (value: { time: TDate; save?: boolean }) => {
    const time = dateFns.format(value.time, timeFormat).toUpperCase();
    triggerRef.current.value = time;
    if (value.save) {
      setDateValue(value.time);
      hide();
    }
  };

  const parseNativeDateString = (value: string): string => {
    const date = dateFns.today(dateType) as TDate;
    const year = dateFns.getYear(date);
    const month = calendarFns.paddToTwoSymbols(dateFns.getMonth(date));
    const day = calendarFns.paddToTwoSymbols(dateFns.getDate(date));

    return `${year}-${month}-${day} ${value}`;
  };

  return (
    <>
      <Input
        ref={triggerRef}
        placeholder={placeholderValue}
        onChange={(event) => handleInputChange(event)}
        {...inputProps}
      />
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <TimeList
              date={dateValue}
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

Timepicker.displayName = '@nebular-react/core/Timepicker';

export { Timepicker };
