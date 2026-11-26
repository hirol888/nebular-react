import { Moment } from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import {
  range,
  rangeFromTo,
  DayPeriod,
  DEFAULT_LOCALE,
  HOURS_IN_DAY_PERIOD,
  createCalendar,
  useDateAdapter,
  usePlatform,
  DateType,
  useId
} from '@nebular-react/hooks';
import { buildTimeFormat } from './utils';
import { Card } from '../Card';
import { List } from '../List';
import { TimepickerCell } from './TimepickerCell';
import { CalendarActions } from '../Calendar/calendar-kit/CalendarActions';
import useStyles from './TimeList.style';
import { BaseTimeListProps } from './types';
import { useDefaultLocale } from '../Shared/hooks';

export type TimeListStylesNames = Selectors<typeof useStyles>;
type CellType = 'full-time' | 'hour' | 'minute' | 'second' | 'day-period';

export interface TimeListProps<TDate extends Date | Moment = Date>
  extends DefaultProps<TimeListStylesNames>, BaseTimeListProps {
  locale?: string;
  date?: TDate;
  /** Minimum selectable wall-clock value. */
  min?: TDate;
  /** Maximum selectable wall-clock value. */
  max?: TDate;
  dateType?: DateType;
  opened?: boolean;
  onSelectTime?: (value: { time: TDate; save?: boolean }) => void;
}

interface TimePartOption {
  value: number;
  text: string;
}

interface TimeListState<TDate extends Date | Moment = Date> {
  timeFormat: string;
  fullTimeOptions: TDate[];
  hoursColumnOptions: TimePartOption[];
  minutesColumnOptions: TimePartOption[];
  secondsColumnOptions: TimePartOption[];
}

const defaultProps: Partial<TimeListProps> = {
  locale: DEFAULT_LOCALE,
  twelveHoursFormat: false,
  showFooter: true,
  hoursText: 'Hr',
  minutesText: 'Min',
  secondsText: 'Sec',
  ampmText: 'Am/Pm',
  dateType: 'native',
  calendarActionsProps: {},
  opened: false
};

function TimeList<TDate extends Date | Moment = Date>(props: TimeListProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const { t } = useNebularLocale();
  const {
    locale,
    timeFormat,
    twelveHoursFormat,
    withSeconds,
    singleColumn,
    step,
    showFooter,
    hoursText,
    minutesText,
    secondsText,
    ampmText,
    date,
    min,
    max,
    dateType,
    opened,
    onSelectTime,
    calendarActionsProps,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps<TimeListProps<TDate>>(
    {
      ...(defaultProps as TimeListProps<TDate>),
      locale: defaultLocale,
      hoursText: t('timepicker.hours', 'Hr'),
      minutesText: t('timepicker.minutes', 'Min'),
      secondsText: t('timepicker.seconds', 'Sec'),
      ampmText: t('timepicker.ampm', 'Am/Pm')
    },
    props
  );
  const { classes, cx } = useStyles(null, { name: 'time-list', classNames, styles, unstyled });

  const [dateValue, setDateValue] = useState<TDate>(date);

  useEffect(() => {
    setDateValue(date);
  }, [date]);

  const adapter = useDateAdapter();
  const dateFns = useMemo(() => adapter.createDateFns(locale), [adapter, locale]);
  const calendarFns = useMemo(() => createCalendar<TDate>(locale, adapter), [locale, adapter]);
  const { FIREFOX } = usePlatform();

  const timeListState = useMemo<TimeListState<TDate>>(() => {
    const isAM = dateFns.getDayPeriod(dateValue) === 'AM';

    const generateHours = (): TimePartOption[] => {
      if (!twelveHoursFormat) {
        return range(24, (v: number) => ({ value: v, text: calendarFns.paddToTwoSymbols(v) }));
      }

      if (isAM) {
        return range(12, (v: number) => {
          const text = v === 0 ? 12 : v;
          return { value: v, text: calendarFns.paddToTwoSymbols(text) };
        });
      }

      return rangeFromTo(12, 24, (v: number) => {
        const text = v === 12 ? 12 : v - 12;
        return { value: v, text: calendarFns.paddToTwoSymbols(text) };
      });
    };

    const generateMinutesOrSeconds = (): TimePartOption[] =>
      range(60, (v: number) => ({ value: v, text: calendarFns.paddToTwoSymbols(v) }));

    const applyBaseDay = (time: TDate): TDate => {
      const base = date ?? dateValue;

      if (!base) {
        return time;
      }

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

    return {
      timeFormat:
        timeFormat || buildTimeFormat(twelveHoursFormat, withSeconds, singleColumn, dateFns),
      fullTimeOptions: singleColumn
        ? calendarFns.getHoursRange(dateType, step).map((item) => applyBaseDay(item))
        : [],
      hoursColumnOptions: generateHours(),
      minutesColumnOptions: generateMinutesOrSeconds(),
      secondsColumnOptions: withSeconds ? generateMinutesOrSeconds() : []
    };
  }, [
    calendarFns,
    dateFns,
    date,
    dateValue,
    dateType,
    singleColumn,
    step,
    timeFormat,
    twelveHoursFormat,
    withSeconds
  ]);

  const updateValue = useCallback(
    (_date: TDate): void => {
      setDateValue(_date);
      typeof onSelectTime === 'function' && onSelectTime({ time: _date });
    },
    [onSelectTime]
  );

  const isSelected = useCallback(
    (value: TDate | number | DayPeriod, cellType: CellType) => {
      switch (cellType) {
        case 'full-time':
          return dateFns.isSameHourAndMinute(value as TDate, dateValue);
        case 'hour':
          return dateFns.getHours(dateValue) === value;
        case 'minute':
          return dateFns.getMinutes(dateValue) === value;
        case 'second':
          return dateFns.getSeconds(dateValue) === value;
        case 'day-period':
          return value === dateFns.getDayPeriod(dateValue);
        default:
          return false;
      }
    },
    [dateFns, dateValue]
  );

  const getFullTimeString = useCallback(
    (item: TDate): string => dateFns.format(item, timeListState?.timeFormat).toUpperCase(),
    [dateFns, timeListState?.timeFormat]
  );

  const isWithinBounds = useCallback(
    (candidate: TDate | undefined): boolean => {
      if (!candidate) {
        return true;
      }

      const value = dateFns.valueOf(candidate);

      if (min && value < dateFns.valueOf(min)) {
        return false;
      }

      if (max && value > dateFns.valueOf(max)) {
        return false;
      }

      return true;
    },
    [dateFns, min, max]
  );

  const isDisabled = useCallback(
    (value: TDate | number | DayPeriod, cellType: CellType): boolean => {
      if ((!min && !max) || !dateValue) {
        return false;
      }

      switch (cellType) {
        case 'full-time':
          return !isWithinBounds(value as TDate);
        case 'hour':
          return !isWithinBounds(dateFns.setHours(dateValue, value as number));
        case 'minute':
          return !isWithinBounds(dateFns.setMinutes(dateValue, value as number));
        case 'second':
          return !isWithinBounds(dateFns.setSeconds(dateValue, value as number));
        default:
          return false;
      }
    },
    [dateFns, dateValue, isWithinBounds, min, max]
  );

  const showSeconds = !!withSeconds && !singleColumn;

  const setTimeValue = useCallback(
    (value: TDate | number | string, cellType: CellType) => {
      switch (cellType) {
        case 'full-time':
          updateValue(value as TDate);
          break;
        case 'hour':
          updateValue(dateFns.setHours(dateValue, value as number));
          break;
        case 'minute':
          updateValue(dateFns.setMinutes(dateValue, value as number));
          break;
        case 'second':
          updateValue(dateFns.setSeconds(dateValue, value as number));
          break;
        case 'day-period':
          if (dateFns.getDayPeriod(dateValue) === (value as string)) {
            return;
          }

          updateValue(
            dateFns.addHours(dateValue, value === 'AM' ? -HOURS_IN_DAY_PERIOD : HOURS_IN_DAY_PERIOD)
          );
          break;
      }
    },
    [dateFns, dateValue, updateValue]
  );

  const saveValue = () => {
    typeof onSelectTime === 'function' && onSelectTime({ time: dateValue, save: true });
  };

  const setCurrentTime = () => {
    const _date = dateFns.today(dateType);
    setDateValue(_date);
    typeof onSelectTime === 'function' && onSelectTime({ time: _date, save: true });
  };

  const uuid = useId();

  const renderSingleColumnItem = useCallback(
    (item, index) => (
      <List.Item
        key={`${uuid}-fulltime-option-${index}`}
        className={cx(classes.listItem, {
          selected: isSelected(item, 'full-time'),
          disabled: isDisabled(item, 'full-time')
        })}
      >
        <TimepickerCell
          value={getFullTimeString(item)}
          selected={isSelected(item, 'full-time')}
          disabled={isDisabled(item, 'full-time')}
          onSelect={() => setTimeValue(item, 'full-time')}
          opened={opened}
        />
      </List.Item>
    ),
    [opened, classes.listItem, cx, getFullTimeString, isDisabled, isSelected, setTimeValue, uuid]
  );
  const singleColumnItems = useMemo(
    () => timeListState?.fullTimeOptions?.map(renderSingleColumnItem),
    [timeListState?.fullTimeOptions, renderSingleColumnItem]
  );

  const renderHourColumnItem = useCallback(
    (item, index) => (
      <List.Item
        key={`${uuid}-hours-column-option-${index}`}
        className={cx(classes.listItem, {
          selected: isSelected(item.value, 'hour'),
          disabled: isDisabled(item.value, 'hour')
        })}
      >
        <TimepickerCell
          value={item.text}
          selected={isSelected(item.value, 'hour')}
          disabled={isDisabled(item.value, 'hour')}
          onSelect={() => setTimeValue(item.value, 'hour')}
          opened={opened}
        />
      </List.Item>
    ),
    [opened, classes.listItem, cx, isDisabled, isSelected, setTimeValue, uuid]
  );
  const hourColumnItems = useMemo(
    () => timeListState?.hoursColumnOptions?.map(renderHourColumnItem),
    [timeListState?.hoursColumnOptions, renderHourColumnItem]
  );

  const minuteColumnItem = useCallback(
    (item, index) => (
      <List.Item
        key={`${uuid}-minutes-column-option-${index}`}
        className={cx(classes.listItem, {
          selected: isSelected(item.value, 'minute'),
          disabled: isDisabled(item.value, 'minute')
        })}
      >
        <TimepickerCell
          value={item.text}
          selected={isSelected(item.value, 'minute')}
          disabled={isDisabled(item.value, 'minute')}
          onSelect={() => setTimeValue(item.value, 'minute')}
          opened={opened}
        />
      </List.Item>
    ),
    [opened, classes.listItem, cx, isDisabled, isSelected, setTimeValue, uuid]
  );
  const minuteColumnItems = useMemo(
    () => timeListState?.minutesColumnOptions?.map(minuteColumnItem),
    [timeListState?.minutesColumnOptions, minuteColumnItem]
  );

  const secondColumnItem = useCallback(
    (item, index) => (
      <List.Item
        key={`${uuid}-seconds-column-option-${index}`}
        className={cx(classes.listItem, {
          selected: isSelected(item.value, 'second'),
          disabled: isDisabled(item.value, 'second')
        })}
      >
        <TimepickerCell
          value={item.text}
          selected={isSelected(item.value, 'second')}
          disabled={isDisabled(item.value, 'second')}
          onSelect={() => setTimeValue(item.value, 'second')}
          opened={opened}
        />
      </List.Item>
    ),
    [opened, classes.listItem, cx, isDisabled, isSelected, setTimeValue, uuid]
  );
  const secondColumnItems = useMemo(
    () => timeListState?.secondsColumnOptions?.map(secondColumnItem),
    [timeListState?.secondsColumnOptions, secondColumnItem]
  );

  return (
    <Card
      className={cx(classes.timeList, className, {
        [classes.supportsScrollbarTheming]: !FIREFOX
      })}
    >
      <Card.Header className={cx(classes.columnHeader)}>
        {singleColumn && <div className={cx(classes.headerCell)}>Time</div>}
        {!singleColumn && (
          <>
            <div className={cx(classes.headerCell)}>{hoursText}</div>
            <div className={cx(classes.headerCell)}>{minutesText}</div>
            {withSeconds && <div className={cx(classes.headerCell)}>{secondsText}</div>}
            {twelveHoursFormat && <div className={cx(classes.headerCell)}>{ampmText}</div>}
          </>
        )}
      </Card.Header>
      <div className={cx(classes.pickerBody)}>
        {singleColumn && <List className={cx(classes.valuesList)}>{singleColumnItems}</List>}
        {!singleColumn && (
          <>
            <List className={cx(classes.valuesList)}>{hourColumnItems}</List>
            <List className={cx(classes.valuesList)}>{minuteColumnItems}</List>
            {showSeconds && <List className={cx(classes.valuesList)}>{secondColumnItems}</List>}
            {twelveHoursFormat && (
              <List className={cx(classes.valuesList)}>
                {(['AM', 'PM'] as DayPeriod[]).map((dayPeriod, index) => (
                  <List.Item
                    key={`${uuid}-day-period-${index}`}
                    className={cx(classes.listItem, classes.ampmItem, {
                      selected: isSelected(dayPeriod, 'day-period')
                    })}
                  >
                    <TimepickerCell
                      value={dayPeriod}
                      selected={isSelected(dayPeriod, 'day-period')}
                      onSelect={() => setTimeValue(dayPeriod, 'day-period')}
                      opened={opened}
                    />
                  </List.Item>
                ))}
              </List>
            )}
          </>
        )}
      </div>
      {showFooter && (
        <Card.Footer className={cx(classes.actionsFooter)}>
          <CalendarActions
            applyButtonText={calendarActionsProps.applyButtonText}
            applyButtonAppearance={calendarActionsProps.applyButtonAppearance}
            applyButtonSize={calendarActionsProps.applyButtonSize}
            applyButtonStatus={calendarActionsProps.applyButtonStatus}
            currentTimeButtonText={calendarActionsProps.currentTimeButtonText}
            currentTimeButtonAppearance={calendarActionsProps.currentTimeButtonAppearance}
            currentTimeButtonSize={calendarActionsProps.currentTimeButtonSize}
            currentTimeButtonStatus={calendarActionsProps.currentTimeButtonStatus}
            showCurrentTimeButton={calendarActionsProps.showCurrentTimeButton}
            setCurrentTime={setCurrentTime}
            saveValue={saveValue}
          />
        </Card.Footer>
      )}
    </Card>
  );
}

TimeList.displayName = 'TimeList';

export { TimeList };
