import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    color: 'var(--time-zone-picker-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--time-zone-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--time-zone-picker-min-width, 20rem)',
    backgroundColor:
      'var(--time-zone-picker-background-color, var(--background-basic-color-1, #fff))',
    border: '1px solid var(--time-zone-picker-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--time-zone-picker-border-radius, 0.25rem)',
    boxShadow: 'var(--time-zone-picker-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))',
    overflow: 'hidden',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--time-zone-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  searchContainer: {
    padding: '0.5rem',
    borderBottom:
      '1px solid var(--time-zone-picker-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.35rem 0.5rem',
    border:
      '1px solid var(--time-zone-picker-search-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--time-zone-picker-search-border-radius, 0.25rem)',
    backgroundColor:
      'var(--time-zone-picker-search-background-color, var(--background-basic-color-1, #fff))',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',

    '&:focus-visible': {
      outline: '2px solid var(--time-zone-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  listbox: {
    maxHeight: 'var(--time-zone-picker-list-max-height, 18rem)',
    overflowY: 'auto',

    '&:focus': {
      outline: 'none'
    },

    '&:focus-visible': {
      outline: '2px solid var(--time-zone-picker-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  groupLabel: {
    padding: '0.35rem 0.5rem 0.15rem',
    color: 'var(--time-zone-picker-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },

  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '0.375rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8125rem',

    '&[data-active="true"]': {
      backgroundColor:
        'var(--time-zone-picker-option-active-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&[aria-selected="true"]': {
      color: 'var(--time-zone-picker-selected-color, var(--color-primary-500, #3366ff))',
      fontWeight: 600
    }
  },

  offset: {
    color: 'var(--time-zone-picker-offset-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap'
  },

  empty: {
    padding: '0.75rem 0.5rem',
    color: 'var(--time-zone-picker-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  }
}));

export type TimeZonePickerStylesNames = Selectors<typeof useStyles>;

export interface TimeZonePickerProps extends DefaultProps<TimeZonePickerStylesNames> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?(value: string | null): void;
  data?: string[];
  searchable?: boolean;
  clearable?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  nothingFoundMessage?: string;
  dropdownOffset?: number;
}

interface TimeZoneGroup {
  region: string;
  zones: string[];
}

const FALLBACK_TIME_ZONES = [
  'UTC',
  'Africa/Cairo',
  'America/Chicago',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Paris',
  'Pacific/Auckland'
];

const defaultProps: Partial<TimeZonePickerProps> = {
  searchable: true,
  clearable: false,
  disabled: false,
  searchPlaceholder: 'Search time zones',
  nothingFoundMessage: 'No time zones found',
  dropdownOffset: 8
};

const offsetFormatterCache = new Map<string, Intl.DateTimeFormat>();
const offsetLabelCache = new Map<string, string>();

function getSupportedTimeZones(): string[] {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[];
  };

  if (typeof intl.supportedValuesOf === 'function') {
    try {
      return intl.supportedValuesOf('timeZone');
    } catch {
      return FALLBACK_TIME_ZONES;
    }
  }

  return FALLBACK_TIME_ZONES;
}

function getUtcOffsetLabel(timeZone: string): string {
  const cached = offsetLabelCache.get(timeZone);

  if (cached) {
    return cached;
  }

  let label = 'UTC+00:00';

  try {
    let formatter = offsetFormatterCache.get(timeZone);

    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset'
      });
      offsetFormatterCache.set(timeZone, formatter);
    }

    const timeZoneName = formatter
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;

    if (timeZoneName && timeZoneName !== 'GMT') {
      const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(timeZoneName);

      if (match) {
        const hours = match[2].padStart(2, '0');
        const minutes = match[3] ?? '00';
        label = `UTC${match[1]}${hours}:${minutes}`;
      }
    }
  } catch {
    label = 'UTC+00:00';
  }

  offsetLabelCache.set(timeZone, label);
  return label;
}

function getRegion(timeZone: string): string {
  return timeZone.includes('/') ? timeZone.split('/')[0] : 'Other';
}

function createGroups(timeZones: string[]): TimeZoneGroup[] {
  const regions = new Map<string, string[]>();

  timeZones.forEach((timeZone) => {
    if (!timeZone) {
      return;
    }

    const region = getRegion(timeZone);
    const group = regions.get(region) ?? [];

    if (!group.includes(timeZone)) {
      group.push(timeZone);
      regions.set(region, group);
    }
  });

  const groups: TimeZoneGroup[] = [];
  regions.forEach((zones, region) => groups.push({ region, zones }));

  return groups;
}

function TimeZonePicker(props: TimeZonePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    data,
    searchable,
    clearable,
    label,
    description,
    error,
    disabled,
    ariaLabel,
    placeholder,
    searchPlaceholder,
    nothingFoundMessage,
    dropdownOffset,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'time-zone-picker',
    classNames,
    styles,
    unstyled
  });

  const dir = useNebularDir();
  const uuid = useId();

  const [internalValue, setInternalValue] = useState<string | null | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const allTimeZones = useMemo(() => data ?? getSupportedTimeZones(), [data]);

  const filteredTimeZones = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return allTimeZones;
    }

    return allTimeZones.filter((timeZone) => timeZone.toLowerCase().includes(query));
  }, [allTimeZones, searchValue]);

  const groups = useMemo(() => createGroups(filteredTimeZones), [filteredTimeZones]);
  const options = useMemo(() => groups.flatMap((group) => group.zones), [groups]);

  const listboxId = `${uuid}-listbox`;
  const getOptionId = (index: number): string => `${uuid}-option-${index}`;

  const commit = (next: string | null) => {
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
      setSearchValue('');
      setActiveIndex(-1);
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
    if (!opened) {
      return;
    }

    if (searchable) {
      searchInputRef.current?.focus();
    } else {
      listboxRef.current?.focus();
    }
  }, [opened, searchable]);

  const selectTimeZone = (timeZone: string) => {
    commit(timeZone);
    hide();
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    commit(null);
    hide();
    triggerRef.current?.focus();
  };

  const moveActive = (nextIndex: number) => {
    if (options.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(Math.min(options.length - 1, Math.max(0, nextIndex)));
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setActiveIndex(-1);
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
    const fromKeyboardTarget = target === searchInputRef.current || target === listboxRef.current;

    if (!fromKeyboardTarget) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveActive(0);
        break;
      case 'End':
        event.preventDefault();
        moveActive(options.length - 1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && options[activeIndex]) {
          event.preventDefault();
          selectTimeZone(options[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : 'Time zone');
  const dialogLabel = ariaLabel || (typeof label === 'string' ? label : 'Time zone picker');

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
          value={currentValue ?? ''}
          placeholder={placeholder}
          readOnly
          fullWidth
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={opened}
          aria-controls={listboxId}
          aria-label={inputAriaLabel}
          onKeyDown={handleTriggerKeyDown}
        />
        {clearable && !!currentValue && !disabled && (
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
                {searchable && (
                  <div className={cx(classes.searchContainer)}>
                    <input
                      ref={searchInputRef}
                      type="search"
                      className={cx(classes.searchInput)}
                      value={searchValue}
                      onChange={handleSearchChange}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder || 'Search time zones'}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={opened}
                      aria-controls={listboxId}
                      aria-activedescendant={
                        activeIndex >= 0 ? getOptionId(activeIndex) : undefined
                      }
                    />
                  </div>
                )}
                <div
                  ref={listboxRef}
                  id={listboxId}
                  role="listbox"
                  aria-label="Time zones"
                  className={cx(classes.listbox)}
                  tabIndex={searchable ? -1 : 0}
                  aria-activedescendant={activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
                >
                  {options.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.region} role="group" aria-label={group.region}>
                        <div className={cx(classes.groupLabel)}>{group.region}</div>
                        {group.zones.map((timeZone) => {
                          const index = options.indexOf(timeZone);
                          const isActive = activeIndex === index;

                          return (
                            <div
                              key={timeZone}
                              id={getOptionId(index)}
                              role="option"
                              aria-selected={currentValue === timeZone}
                              className={cx(classes.option, 'time-zone-option')}
                              data-active={isActive ? 'true' : undefined}
                              data-time-zone={timeZone}
                              tabIndex={-1}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => selectTimeZone(timeZone)}
                            >
                              <span>{timeZone}</span>
                              <span className={cx(classes.offset)}>
                                {getUtcOffsetLabel(timeZone)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className={cx(classes.empty)} role="status" aria-live="polite">
                      {nothingFoundMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </FormControl>
  );
}

TimeZonePicker.displayName = 'TimeZonePicker';

export { TimeZonePicker };
