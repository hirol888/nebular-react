import React, { useMemo, useRef, useState } from 'react';
import { Moment } from 'moment';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  DateType,
  DEFAULT_LOCALE,
  isValidTimeZone,
  useDateFns,
  useFlexibleConnectedPositionStrategy,
  useId,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { Calendar, CalendarMonthCell, CalendarMonthCellProps } from '../Calendar';
import { FormControl } from '../FormControl';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { shiftFromTimeZone, shiftToTimeZone } from '../Shared/timezone';
import { useDefaultLocale } from '../Shared/hooks';

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
  },

  input: {
    cursor: 'pointer'
  },

  clearButton: {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.15rem',
    border: 0,
    background: 'transparent',
    color: 'var(--month-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--month-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

export type MonthPickerStylesNames = Selectors<typeof useStyles>;

export interface MonthPickerProps<
  TDate extends Date | Moment = Date
> extends DefaultProps<MonthPickerStylesNames> {
  value?: TDate | null;
  defaultValue?: TDate | null;
  onChange?(value: TDate | null): void;
  locale?: string;
  dateType?: DateType;
  timeZone?: string;
  format?: string;
  min?: TDate;
  max?: TDate;
  visibleDate?: TDate;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const defaultProps: Partial<MonthPickerProps> = {
  locale: DEFAULT_LOCALE,
  dateType: 'native',
  clearable: false,
  disabled: false,
  dropdownOffset: 8
};

function MonthPicker<TDate extends Date | Moment = Date>(props: MonthPickerProps<TDate>) {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    value,
    defaultValue,
    onChange,
    locale,
    dateType,
    timeZone,
    format,
    min,
    max,
    visibleDate,
    clearable,
    label,
    description,
    error,
    disabled,
    ariaLabel,
    placeholder,
    dropdownOffset,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps<MonthPickerProps<TDate>>(
    { ...(defaultProps as MonthPickerProps<TDate>), locale: defaultLocale },
    props
  );
  const { classes, cx } = useStyles(null, { name: 'month-picker', classNames, styles, unstyled });

  const dateFns = useDateFns<TDate>(locale);
  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<TDate | null | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const triggerRef = useRef<HTMLInputElement>(null);

  const activeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;

  const displayValue = shiftToTimeZone(currentValue, activeTimeZone) ?? null;
  const displayMin = shiftToTimeZone(min, activeTimeZone) ?? undefined;
  const displayMax = shiftToTimeZone(max, activeTimeZone) ?? undefined;
  const displayVisibleDate =
    (shiftToTimeZone(visibleDate, activeTimeZone) as TDate | undefined) ??
    displayValue ??
    undefined;

  const valueFormat = format || 'MMMM YYYY';

  const commit = (next: TDate | null) => {
    if (!isControlled) {
      setInternalValue(next);
    }

    typeof onChange === 'function' && onChange(next);
  };

  const show = () => {
    if (disabled) {
      return;
    }

    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setOpened(true);
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setOpened(false);
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    triggerRef.current,
    dir,
    dropdownOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened,
    scrollStrategy: 'reposition'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'click', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  const selectMonthRef = useRef<(date: TDate) => void>(() => {});
  selectMonthRef.current = (date: TDate) => {
    const monthStart = dateFns.getMonthStart(date);
    commit((shiftFromTimeZone(monthStart, activeTimeZone) as TDate | undefined) ?? monthStart);
    hide();
  };

  const MonthCell = useMemo(
    () =>
      function MonthPickerCell(cellProps: CalendarMonthCellProps<TDate>) {
        return (
          <CalendarMonthCell<TDate>
            {...cellProps}
            onSelect={(cellDate) => {
              typeof cellProps.onSelect === 'function' && cellProps.onSelect(cellDate);
              selectMonthRef.current(cellDate);
            }}
          />
        );
      },
    []
  );

  const clearValue = () => {
    commit(null);
    hide();
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Escape') {
      if (opened) {
        event.preventDefault();
        hide();
      }
      return;
    }

    if (['Enter', ' ', 'Spacebar', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      show();
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hide();
      triggerRef.current?.focus();
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Month');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Month picker');

  return (
    <FormControl
      label={label}
      description={description}
      error={error}
      htmlFor={uuid}
      className={className}
    >
      <div className={cx(classes.root)}>
        <Input
          id={uuid}
          ref={triggerRef}
          className={cx(classes.input)}
          value={displayValue ? dateFns.format(displayValue, valueFormat) : ''}
          placeholder={placeholder}
          readOnly
          fullWidth
          disabled={disabled}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={opened}
          aria-label={inputAriaLabel}
          onKeyDown={handleTriggerKeyDown}
        />
        {clearable && currentValue && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            aria-label="Clear selection"
            onClick={clearValue}
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        )}
      </div>
      <OptionalPortal>
        <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            {opened && (
              <div
                role="dialog"
                aria-label={dialogLabel}
                className={cx(classes.panel)}
                onKeyDown={handlePanelKeyDown}
              >
                <Calendar<TDate>
                  locale={locale}
                  startView="month"
                  date={displayValue ?? undefined}
                  visibleDate={displayVisibleDate}
                  min={displayMin}
                  max={displayMax}
                  monthCellComponent={MonthCell}
                  dateType={dateType}
                />
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
}

MonthPicker.displayName = 'MonthPicker';

export { MonthPicker };
