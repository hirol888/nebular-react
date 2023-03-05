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
import { Calendar } from '../Calendar';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import useStyles from './Datepicker.style';
import { BasePickerProps } from './types';

export type DatepickerStylesNames = Selectors<typeof useStyles>;

export interface DatepickerProps<TDate extends Date | Moment = Date>
  extends DefaultProps<DatepickerStylesNames>,
    BasePickerProps<TDate> {
  date?: TDate;
  onDateChange?: (date: TDate) => void;
  inputProps?: Partial<Omit<InputProps, 'placeholder' | 'onChange'>>;
  placeholder?: string;
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
  dateType: 'native'
};

function Datepicker<TDate extends Date | Moment = Date>(props: DatepickerProps<TDate>) {
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
    placeholder,
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
    inputProps,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps as DatepickerProps<TDate>, props);
  const { classes, cx } = useStyles(null, { name: 'datepicker', classNames, styles, unstyled });
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

  const handleDateChange = (_date: TDate) => {
    triggerRef.current.value = dateFns.format(_date, format);
    typeof onDateChange === 'function' && onDateChange(_date);
    setVisibleDateValue(_date);
    if (hideOnSelect) {
      hide();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _date: TDate | undefined;
    if (dateFns.isValidDateString(event.target.value, format)) {
      _date = dateFns.parse(event.target.value, format, dateType);
    }

    typeof onDateChange === 'function' && onDateChange(_date);
    setVisibleDateValue(_date);
  };

  return (
    <>
      <Input
        ref={triggerRef}
        className={cx(classes.input, className)}
        placeholder={placeholder}
        onChange={handleInputChange}
        {...inputProps}
      />
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <div className={cx(classes.calendarContainer)}>
              <Calendar<TDate>
                locale={locale}
                boundingMonth={boundingMonth}
                startView={startView}
                min={min}
                max={max}
                date={date}
                filter={filter}
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

Datepicker.displayName = '@nebular-react/core/Datepicker';

export { Datepicker };
