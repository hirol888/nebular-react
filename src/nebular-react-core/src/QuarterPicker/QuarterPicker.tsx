import React, { useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  useFlexibleConnectedPositionStrategy,
  useId,
  useOverlay,
  useOverlayClickOutside,
  useOverlayTrigger
} from '@nebular-react/hooks';
import { FormControl } from '../FormControl';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';

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
    color: 'var(--quarter-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--quarter-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--quarter-picker-min-width, 14rem)',
    backgroundColor:
      'var(--quarter-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--quarter-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--quarter-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--quarter-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--quarter-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.25rem',
    padding: '0.5rem'
  },

  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--quarter-picker-nav-hover-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--quarter-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  yearLabel: {
    flex: '1 1 auto',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 600
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.25rem',
    padding: '0 0.5rem 0.5rem'
  },

  quarterButton: {
    padding: '0.5rem 0.25rem',
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    cursor: 'pointer',

    '&[data-selected="true"]': {
      backgroundColor:
        'var(--quarter-picker-selected-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--quarter-picker-selected-color, #fff)'
    },

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--quarter-picker-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--quarter-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      color: 'var(--quarter-picker-disabled-color, var(--text-disabled-color, #c5cee0))',
      cursor: 'not-allowed',
      opacity: 0.6
    }
  }
}));

export type QuarterPickerStylesNames = Selectors<typeof useStyles>;

export type QuarterNumber = 1 | 2 | 3 | 4;

export interface QuarterValue {
  year: number;
  quarter: QuarterNumber;
}

export interface QuarterPickerProps extends DefaultProps<QuarterPickerStylesNames> {
  value?: QuarterValue | null;
  defaultValue?: QuarterValue | null;
  onChange?(value: QuarterValue | null): void;
  min?: QuarterValue;
  max?: QuarterValue;
  visibleYear?: number;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  dropdownOffset?: number;
}

const QUARTERS: QuarterNumber[] = [1, 2, 3, 4];

const defaultProps: Partial<QuarterPickerProps> = {
  clearable: false,
  disabled: false,
  dropdownOffset: 8
};

function quarterIndex(value: QuarterValue | null | undefined): number {
  return value ? value.year * 4 + (value.quarter - 1) : Number.NaN;
}

function QuarterPicker(props: QuarterPickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    min,
    max,
    visibleYear,
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
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'quarter-picker',
    classNames,
    styles,
    unstyled
  });

  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<QuarterValue | null | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [displayYear, setDisplayYear] = useState<number>(
    () => currentValue?.year ?? visibleYear ?? new Date().getFullYear()
  );
  const [focusedQuarter, setFocusedQuarter] = useState<number>(0);
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const commit = (next: QuarterValue | null) => {
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
      const year = currentValue?.year ?? visibleYear ?? new Date().getFullYear();

      setDisplayYear(year);
      setFocusedQuarter(currentValue ? currentValue.quarter - 1 : 0);
      shouldFocusRef.current = true;
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

  useEffect(() => {
    if (!opened || !shouldFocusRef.current) {
      return;
    }

    const focusedButton = panelRef.current?.querySelector<HTMLButtonElement>(
      '[data-quarter-focused="true"]'
    );
    focusedButton?.focus();
    shouldFocusRef.current = false;
  }, [displayYear, focusedQuarter, opened]);

  const minIndex = quarterIndex(min);
  const maxIndex = quarterIndex(max);

  const isQuarterDisabled = (quarter: QuarterNumber): boolean => {
    const index = displayYear * 4 + (quarter - 1);

    return (
      (!Number.isNaN(minIndex) && index < minIndex) || (!Number.isNaN(maxIndex) && index > maxIndex)
    );
  };

  const selectQuarter = (quarter: QuarterNumber) => {
    if (isQuarterDisabled(quarter)) {
      return;
    }

    commit({ year: displayYear, quarter });
    hide();
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    commit(null);
    hide();
    triggerRef.current?.focus();
  };

  const changeYear = (delta: number) => {
    setDisplayYear((previous) => previous + delta);
  };

  const focusQuarter = (index: number) => {
    const clamped = Math.min(QUARTERS.length - 1, Math.max(0, index));

    setFocusedQuarter(clamped);
    shouldFocusRef.current = true;
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
      return;
    }

    const target = event.target as HTMLElement;
    const isQuarterTarget = target.dataset.quarter === 'true' || target === panelRef.current;

    if (!isQuarterTarget) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        focusQuarter(focusedQuarter - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusQuarter(focusedQuarter + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusQuarter(focusedQuarter - 2);
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusQuarter(focusedQuarter + 2);
        break;
      case 'Home':
        event.preventDefault();
        focusQuarter(0);
        break;
      case 'End':
        event.preventDefault();
        focusQuarter(QUARTERS.length - 1);
        break;
      case 'PageUp':
        event.preventDefault();
        setDisplayYear((previous) => previous - 1);
        shouldFocusRef.current = true;
        break;
      case 'PageDown':
        event.preventDefault();
        setDisplayYear((previous) => previous + 1);
        shouldFocusRef.current = true;
        break;
      default:
        break;
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Quarter');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Quarter picker');
  const inputValue = currentValue ? `Q${currentValue.quarter} ${currentValue.year}` : '';

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
          value={inputValue}
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
                ref={panelRef}
                role="dialog"
                aria-label={dialogLabel}
                className={cx(classes.panel)}
                tabIndex={-1}
                onKeyDown={handlePanelKeyDown}
              >
                <div className={cx(classes.header)}>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label="Previous year"
                    onClick={() => changeYear(-1)}
                  >
                    <Icon
                      icon="chevron-left-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                  <div className={cx(classes.yearLabel)} aria-live="polite">
                    {displayYear}
                  </div>
                  <button
                    type="button"
                    className={cx(classes.navButton)}
                    aria-label="Next year"
                    onClick={() => changeYear(1)}
                  >
                    <Icon
                      icon="chevron-right-outline"
                      pack="nebular-essentials"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div role="group" aria-label="Quarters" className={cx(classes.grid)}>
                  {QUARTERS.map((quarter, index) => {
                    const quarterDisabled = isQuarterDisabled(quarter);
                    const isSelected =
                      !!currentValue &&
                      currentValue.year === displayYear &&
                      currentValue.quarter === quarter;
                    const isFocused = focusedQuarter === index;

                    return (
                      <button
                        key={quarter}
                        type="button"
                        className={cx(classes.quarterButton, 'quarter-cell')}
                        aria-label={`Q${quarter} ${displayYear}`}
                        aria-pressed={isSelected}
                        data-quarter="true"
                        data-quarter-focused={isFocused ? 'true' : undefined}
                        data-selected={isSelected ? 'true' : undefined}
                        disabled={quarterDisabled}
                        tabIndex={isFocused ? 0 : -1}
                        onFocus={() => setFocusedQuarter(index)}
                        onClick={() => selectQuarter(quarter)}
                      >
                        Q{quarter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
}

QuarterPicker.displayName = 'QuarterPicker';

export { QuarterPicker };
