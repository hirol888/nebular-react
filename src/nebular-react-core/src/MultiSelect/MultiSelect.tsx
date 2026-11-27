import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { Property } from 'csstype';
import { useUncontrolled } from '@mantine/hooks';
import type { NebularMessageParams } from '@nebular-react/styles';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { useId, useOverlayClickOutside } from '@nebular-react/hooks';
import { FormControl } from '../FormControl';
import { Icon } from '../Icon';
import type { OptionGroup, OptionInternal } from '../Shared';

export type MultiSelectStylesParams = {
  opened: boolean;
  disabled: boolean;
  invalid: boolean;
};

const useStyles = createStyles(
  (_theme, { opened, disabled, invalid }: MultiSelectStylesParams) => ({
    root: {
      position: 'relative',
      width: '100%',
      fontFamily: 'var(--multi-select-text-font-family, inherit)'
    },

    control: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--multi-select-chip-gap, 0.25rem)',
      width: '100%',
      minHeight: 'var(--multi-select-min-height, 2.25rem)',
      padding: 'var(--multi-select-padding, 0.1875rem 0.5rem)',
      border: '1px solid var(--multi-select-border-color, var(--border-basic-color-4, #e4e9f2))',
      borderRadius: 'var(--multi-select-border-radius, 0.25rem)',
      backgroundColor:
        'var(--multi-select-background-color, var(--background-basic-color-1, #fff))',
      boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      ...(opened
        ? {
            borderColor:
              'var(--multi-select-focus-border-color, var(--color-primary-500, #3366ff))',
            boxShadow:
              '0 0 0 1px var(--multi-select-focus-border-color, var(--color-primary-500, #3366ff))'
          }
        : {}),
      ...(invalid
        ? {
            borderColor: 'var(--multi-select-error-border-color, var(--color-danger-500, #ff3d71))'
          }
        : {})
    },

    chip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.125rem',
      maxWidth: '100%',
      padding: '0 var(--multi-select-chip-padding, 0.125rem 0.125rem 0.125rem 0.5rem)',
      borderRadius: 'var(--multi-select-chip-border-radius, 0.25rem)',
      backgroundColor:
        'var(--multi-select-chip-background-color, var(--background-basic-color-3, #edf1f7))',
      color: 'var(--multi-select-chip-text-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--multi-select-chip-font-size, 0.75rem)',
      lineHeight: 'var(--multi-select-chip-line-height, 1.5)'
    },

    chipLabel: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    chipRemove: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--multi-select-chip-remove-size, 1rem)',
      height: 'var(--multi-select-chip-remove-size, 1rem)',
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      color: 'inherit',
      font: 'inherit',
      lineHeight: 1,
      cursor: 'pointer',
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5
      }
    },

    input: {
      flex: '1 1 var(--multi-select-input-min-width, 4rem)',
      minWidth: 'var(--multi-select-input-min-width, 4rem)',
      padding: '0.125rem 0',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      color: 'var(--multi-select-text-color, var(--text-basic-color, #222b45))',
      font: 'inherit',
      fontSize: 'var(--multi-select-input-font-size, 0.8125rem)',
      '&::placeholder': {
        color: 'var(--multi-select-placeholder-color, var(--text-hint-color, #8f9bb3))'
      }
    },

    actions: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--multi-select-actions-gap, 0.25rem)',
      marginInlineStart: 'auto'
    },

    actionButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      border: 'none',
      backgroundColor: 'transparent',
      color: 'var(--multi-select-action-color, var(--text-hint-color, #8f9bb3))',
      cursor: 'pointer',
      lineHeight: 1
    },

    chevron: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'var(--multi-select-action-color, var(--text-hint-color, #8f9bb3))',
      pointerEvents: 'none',
      lineHeight: 1
    },

    dropdown: {
      position: 'absolute',
      insetInlineStart: 0,
      insetInlineEnd: 0,
      top: 'calc(100% + var(--multi-select-dropdown-offset, 0.25rem))',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'var(--multi-select-dropdown-max-height, 15rem)',
      overflowY: 'auto',
      padding: 'var(--multi-select-dropdown-padding, 0.25rem)',
      border:
        '1px solid var(--multi-select-dropdown-border-color, var(--border-basic-color-4, #e4e9f2))',
      borderRadius: 'var(--multi-select-dropdown-border-radius, 0.25rem)',
      backgroundColor:
        'var(--multi-select-dropdown-background-color, var(--background-basic-color-1, #fff))',
      boxShadow: 'var(--multi-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))'
    },

    group: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    },

    groupHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: 'var(--multi-select-group-header-padding, 0.375rem 0.5rem)',
      color: 'var(--multi-select-group-header-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--multi-select-group-header-font-size, 0.6875rem)',
      fontWeight: 600 as unknown as Property.FontWeight,
      letterSpacing: 'var(--multi-select-group-header-letter-spacing, 0.02em)',
      textTransform: 'uppercase',
      boxSizing: 'border-box'
    },

    option: {
      padding: 'var(--multi-select-option-padding, 0.375rem 0.5rem)',
      borderRadius: 'var(--multi-select-option-border-radius, 0.25rem)',
      color: 'var(--multi-select-option-text-color, var(--text-basic-color, #222b45))',
      fontSize: 'var(--multi-select-option-font-size, 0.8125rem)',
      lineHeight: 'var(--multi-select-option-line-height, 1.4)',
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box'
    },

    optionActive: {
      backgroundColor:
        'var(--multi-select-option-active-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    optionSelected: {
      fontWeight: 600 as unknown as Property.FontWeight,
      color: 'var(--multi-select-option-selected-text-color, var(--color-primary-500, #3366ff))'
    },

    optionDisabled: {
      cursor: 'not-allowed',
      opacity: 0.5
    },

    empty: {
      position: 'absolute',
      insetInlineStart: 0,
      insetInlineEnd: 0,
      top: 'calc(100% + var(--multi-select-dropdown-offset, 0.25rem))',
      zIndex: 1000,
      padding: 'var(--multi-select-empty-padding, 0.5rem)',
      border:
        '1px solid var(--multi-select-dropdown-border-color, var(--border-basic-color-4, #e4e9f2))',
      borderRadius: 'var(--multi-select-dropdown-border-radius, 0.25rem)',
      backgroundColor:
        'var(--multi-select-dropdown-background-color, var(--background-basic-color-1, #fff))',
      color: 'var(--multi-select-empty-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--multi-select-empty-font-size, 0.8125rem)',
      boxShadow: 'var(--multi-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))'
    }
  })
);

export type MultiSelectStylesNames = Selectors<typeof useStyles>;

export interface MultiSelectItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectGroup extends Omit<OptionGroup, 'type' | 'options'> {
  type: 'group';
  options?: (string | MultiSelectItem | OptionInternal)[];
}

export type MultiSelectData = string | MultiSelectItem | MultiSelectGroup;

interface NormalizedGroup {
  key: string;
  label?: string;
  disabled: boolean;
}

interface NormalizedOption extends MultiSelectItem {
  key: string;
}

interface MultiSelectDataEntry {
  group?: NormalizedGroup;
  options: NormalizedOption[];
}

type MultiSelectRow =
  | { kind: 'group'; group: NormalizedGroup; key: string }
  | {
      kind: 'option';
      option: NormalizedOption;
      group?: NormalizedGroup;
      optionIndex: number;
      key: string;
    };

interface MultiSelectRowSegment {
  group?: NormalizedGroup;
  firstRowIndex: number;
  rows: { row: MultiSelectRow; rowIndex: number }[];
}

/**
 * Visible text and accessible names rendered by `MultiSelect`.
 * Defaults come from the Nebular locale catalog; every entry can be overridden.
 */
export interface MultiSelectLabels {
  /** Visible message shown when the filter matches no options. */
  noOptions: string;
  /** Visible message shown while options are loading. */
  loading: string;
  /** Search placeholder and accessible name used when no other label is provided. */
  search: string;
  /** Accessible name of the button that clears the selection. */
  clear: string;
  /** Accessible name of the button that removes a selected chip. */
  remove(name: string): string;
}

export interface MultiSelectProps extends DefaultProps<
  MultiSelectStylesNames,
  MultiSelectStylesParams
> {
  data: MultiSelectData[];
  value?: string[];
  defaultValue?: string[];
  onChange?(value: string[]): void;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  withAsterisk?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  maxValues?: number;
  nothingFoundMessage?: string;
  ariaLabel?: string;
  onSearchChange?(query: string): void;
  loading?: boolean;
  virtualized?: boolean;
  virtualizedMaxHeight?: number;
  itemHeight?: number;
  overscan?: number;
  renderOption?(option: MultiSelectItem): React.ReactNode;
  /** Overrides the visible text and accessible names rendered by the component. */
  labels?: Partial<MultiSelectLabels>;
}

const defaultProps: Partial<MultiSelectProps> = {
  defaultValue: [],
  required: false,
  withAsterisk: false,
  searchable: false,
  clearable: false,
  disabled: false,
  loading: false,
  virtualized: false,
  virtualizedMaxHeight: 300,
  itemHeight: 36,
  overscan: 3
};

type MultiSelectTranslate = (
  key: string,
  fallback: string,
  params?: NebularMessageParams
) => string;

const createMultiSelectLabels = (t: MultiSelectTranslate): MultiSelectLabels => ({
  noOptions: t('multiSelect.noOptions', 'No options'),
  loading: t('multiSelect.loading', 'Loading options…'),
  search: t('multiSelect.search', 'Search'),
  clear: t('multiSelect.clear', 'Clear selection'),
  remove: (name) => t('multiSelect.remove', 'Remove {name}', { name })
});

const normalizeOption = (
  item: string | MultiSelectItem | OptionInternal,
  group: NormalizedGroup | undefined,
  key: string
): NormalizedOption => {
  if (typeof item === 'string') {
    return { label: item, value: item, disabled: !!group?.disabled, key };
  }

  return {
    label: item.label ?? item.value,
    value: item.value,
    disabled: !!item.disabled || !!group?.disabled,
    key
  };
};

const isMultiSelectGroup = (item: MultiSelectData): item is MultiSelectGroup =>
  typeof item !== 'string' && 'type' in item && item.type === 'group';

const _MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    placeholder,
    label,
    description,
    error,
    required,
    withAsterisk,
    searchable,
    clearable,
    disabled,
    maxValues,
    nothingFoundMessage,
    ariaLabel,
    onSearchChange,
    loading,
    virtualized,
    virtualizedMaxHeight,
    itemHeight,
    overscan,
    renderOption,
    labels,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { t } = useNebularLocale();
  const resolvedLabels: MultiSelectLabels = { ...createMultiSelectLabels(t), ...labels };
  const resolvedPlaceholder = placeholder ?? resolvedLabels.search;

  const isAsyncSearch = typeof onSearchChange === 'function';

  const entries = useMemo<MultiSelectDataEntry[]>(() => {
    const result: MultiSelectDataEntry[] = [];

    data.forEach((item, index) => {
      if (isMultiSelectGroup(item)) {
        const group: NormalizedGroup = {
          key: `group-${index}`,
          label: item.label,
          disabled: !!item.disabled
        };

        result.push({
          group,
          options: (item.options ?? []).map((groupItem, optionIndex) =>
            normalizeOption(groupItem, group, `${group.key}-option-${optionIndex}`)
          )
        });

        return;
      }

      result.push({ options: [normalizeOption(item, undefined, `option-${index}`)] });
    });

    return result;
  }, [data]);

  const allOptions = useMemo(() => entries.flatMap((entry) => entry.options), [entries]);
  const labelCache = useRef(new Map<string, string>());

  useEffect(() => {
    allOptions.forEach((option) => labelCache.current.set(option.value, option.label));
  }, [allOptions]);

  const [selectedValues, setSelectedValues] = useUncontrolled<string[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });

  const [opened, setOpened] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const { classes, cx } = useStyles(
    { opened, disabled, invalid: !!error },
    { name: 'multi-select', classNames, styles, unstyled }
  );

  const selectedOptions = selectedValues.map(
    (selected) =>
      allOptions.find((option) => option.value === selected) ?? {
        label: labelCache.current.get(selected) ?? selected,
        value: selected,
        disabled: false,
        key: `selected-${selected}`
      }
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntries = useMemo(() => {
    if (!searchable || isAsyncSearch || !normalizedQuery) {
      return entries;
    }

    return entries
      .map((entry) => ({
        ...entry,
        options: entry.options.filter((option) =>
          option.label.toLocaleLowerCase().includes(normalizedQuery)
        )
      }))
      .filter((entry) => entry.options.length > 0);
  }, [entries, isAsyncSearch, normalizedQuery, searchable]);

  const { rows, visibleOptions } = useMemo(() => {
    const nextRows: MultiSelectRow[] = [];
    const nextVisibleOptions: NormalizedOption[] = [];

    filteredEntries.forEach((entry) => {
      if (entry.group?.label) {
        nextRows.push({ kind: 'group', group: entry.group, key: `${entry.group.key}-header` });
      }

      entry.options.forEach((option) => {
        nextRows.push({
          kind: 'option',
          option,
          group: entry.group,
          optionIndex: nextVisibleOptions.length,
          key: option.key
        });
        nextVisibleOptions.push(option);
      });
    });

    return { rows: nextRows, visibleOptions: nextVisibleOptions };
  }, [filteredEntries]);

  const canVirtualize = virtualized && rows.length > 0;
  const totalHeight = rows.length * itemHeight;
  const startIndex = canVirtualize ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0;
  const endIndex = canVirtualize
    ? Math.min(rows.length, Math.ceil((scrollTop + virtualizedMaxHeight) / itemHeight) + overscan)
    : rows.length;
  const visibleRows = canVirtualize ? rows.slice(startIndex, endIndex) : rows;

  const segments = useMemo<MultiSelectRowSegment[]>(() => {
    const nextSegments: MultiSelectRowSegment[] = [];

    visibleRows.forEach((row, offset) => {
      const rowIndex = startIndex + offset;
      const lastSegment = nextSegments[nextSegments.length - 1];

      if (lastSegment && row.group !== undefined && lastSegment.group === row.group) {
        lastSegment.rows.push({ row, rowIndex });
        return;
      }

      nextSegments.push({
        group: row.group,
        firstRowIndex: rowIndex,
        rows: [{ row, rowIndex }]
      });
    });

    return nextSegments;
  }, [startIndex, visibleRows]);

  const maxReached = maxValues !== undefined && selectedValues.length >= maxValues;

  const isOptionDisabled = (option: MultiSelectItem) =>
    !!option.disabled || (maxReached && !selectedValues.includes(option.value));

  useEffect(() => {
    if (activeIndex >= visibleOptions.length) {
      setActiveIndex(visibleOptions.length > 0 ? 0 : -1);
    }
  }, [activeIndex, visibleOptions.length]);

  useEffect(() => {
    if (!canVirtualize || activeIndex < 0) {
      return;
    }

    const list = listRef.current;
    const activeRowIndex = rows.findIndex(
      (row) => row.kind === 'option' && row.optionIndex === activeIndex
    );

    if (!list || activeRowIndex < 0) {
      return;
    }

    const itemTop = activeRowIndex * itemHeight;
    const itemBottom = itemTop + itemHeight;

    if (itemTop < list.scrollTop) {
      list.scrollTop = itemTop;
      setScrollTop(itemTop);
    } else if (itemBottom > list.scrollTop + virtualizedMaxHeight) {
      const nextScrollTop = itemBottom - virtualizedMaxHeight;
      list.scrollTop = nextScrollTop;
      setScrollTop(nextScrollTop);
    }
  }, [activeIndex, canVirtualize, itemHeight, rows, virtualizedMaxHeight]);

  const open = () => {
    if (disabled) {
      return;
    }

    setOpened(true);
  };

  const close = () => {
    setOpened(false);
    setQuery('');
    setActiveIndex(-1);
    setScrollTop(0);

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    if (isAsyncSearch) {
      onSearchChange?.('');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const toggleOption = (option: MultiSelectItem) => {
    if (disabled || isOptionDisabled(option)) {
      return;
    }

    const nextValues = selectedValues.includes(option.value)
      ? selectedValues.filter((selected) => selected !== option.value)
      : [...selectedValues, option.value];

    setSelectedValues(nextValues);
    setQuery('');
    setScrollTop(0);
    setActiveIndex(allOptions.findIndex((item) => item.value === option.value));

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    if (isAsyncSearch) {
      onSearchChange?.('');
    }

    focusInput();
  };

  const removeValue = (selectedValue: string) => {
    if (disabled) {
      return;
    }

    setSelectedValues(selectedValues.filter((selected) => selected !== selectedValue));
    focusInput();
  };

  const clearSelection = () => {
    if (disabled) {
      return;
    }

    setSelectedValues([]);
    setActiveIndex(-1);
    focusInput();
  };

  const removeLastValue = () => {
    if (selectedValues.length === 0) {
      return;
    }

    removeValue(selectedValues[selectedValues.length - 1]);
  };

  const getNextEnabledIndex = (from: number, step: 1 | -1) => {
    const { length } = visibleOptions;

    if (length === 0) {
      return -1;
    }

    const base = from >= 0 ? from : step === 1 ? -1 : 0;

    for (let offset = 1; offset <= length; offset++) {
      const index = (((base + step * offset) % length) + length) % length;

      if (!isOptionDisabled(visibleOptions[index])) {
        return index;
      }
    }

    return -1;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!searchable) {
      return;
    }

    const nextQuery = event.target.value;

    setQuery(nextQuery);
    setActiveIndex(-1);
    setScrollTop(0);

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    if (isAsyncSearch) {
      onSearchChange(nextQuery);
    }

    open();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!opened) {
        open();
        setActiveIndex(getNextEnabledIndex(-1, 1));
        return;
      }

      setActiveIndex(getNextEnabledIndex(activeIndex, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!opened) {
        open();
        setActiveIndex(getNextEnabledIndex(-1, -1));
        return;
      }

      setActiveIndex(getNextEnabledIndex(activeIndex, -1));
    } else if (event.key === 'Enter') {
      if (!opened) {
        open();
        return;
      }

      const activeOption = visibleOptions[activeIndex];

      if (activeOption) {
        event.preventDefault();
        toggleOption(activeOption);
      }
    } else if (event.key === 'Escape') {
      if (opened) {
        event.preventDefault();
        close();
      }
    } else if (event.key === 'Backspace' && !query) {
      if (selectedValues.length > 0) {
        event.preventDefault();
        removeLastValue();
      }
    }
  };

  useOverlayClickOutside([rootRef], () => {
    if (opened) {
      close();
    }
  });

  const renderGroupHeader = (group: NormalizedGroup, key: string, isVirtualizedRow: boolean) => (
    <div
      key={key}
      className={cx(classes.groupHeader)}
      role="presentation"
      style={isVirtualizedRow ? { height: '100%' } : undefined}
    >
      {group.label}
    </div>
  );

  const renderOptionRow = (
    row: Extract<MultiSelectRow, { kind: 'option' }>,
    isVirtualizedRow: boolean
  ) => {
    const { option, optionIndex } = row;
    const optionDisabled = isOptionDisabled(option);
    const optionSelected = selectedValues.includes(option.value);

    return (
      <div
        key={row.key}
        id={`${listboxId}-option-${optionIndex}`}
        role="option"
        tabIndex={-1}
        aria-selected={optionSelected}
        aria-disabled={optionDisabled || undefined}
        aria-label={typeof renderOption === 'function' ? option.label : undefined}
        aria-setsize={canVirtualize ? visibleOptions.length : undefined}
        aria-posinset={canVirtualize ? optionIndex + 1 : undefined}
        data-active={optionIndex === activeIndex || undefined}
        data-disabled={optionDisabled || undefined}
        className={cx(classes.option, {
          [classes.optionActive]: optionIndex === activeIndex,
          [classes.optionSelected]: optionSelected,
          [classes.optionDisabled]: optionDisabled
        })}
        style={isVirtualizedRow ? { height: '100%' } : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(optionIndex)}
        onClick={() => toggleOption(option)}
      >
        {typeof renderOption === 'function' ? renderOption(option) : option.label}
      </div>
    );
  };

  const accessibleLabel = ariaLabel ?? label ?? resolvedPlaceholder;

  return (
    <FormControl
      ref={ref}
      label={label}
      description={description}
      error={error}
      required={required}
      withAsterisk={withAsterisk}
      htmlFor={inputId}
      className={className}
    >
      <div
        ref={rootRef}
        className={cx(classes.root)}
        data-opened={opened}
        data-disabled={disabled || undefined}
      >
        <div
          className={cx(classes.control)}
          data-disabled={disabled || undefined}
          onMouseDown={(event) => {
            if (event.target !== inputRef.current) {
              event.preventDefault();
              focusInput();
            }

            open();
          }}
        >
          {selectedOptions.map((option) => (
            <span key={option.value} className={cx(classes.chip)} data-multi-select-chip>
              <span className={cx(classes.chipLabel)}>{option.label}</span>
              <button
                type="button"
                className={cx(classes.chipRemove)}
                aria-label={resolvedLabels.remove(option.label)}
                disabled={disabled}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  removeValue(option.value);
                }}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            </span>
          ))}

          <input
            id={inputId}
            ref={inputRef}
            type="text"
            role="combobox"
            autoComplete="off"
            className={cx(classes.input)}
            value={query}
            readOnly={!searchable}
            disabled={disabled}
            placeholder={selectedValues.length === 0 ? resolvedPlaceholder : undefined}
            aria-label={accessibleLabel}
            aria-expanded={opened}
            aria-haspopup="listbox"
            aria-controls={opened && !loading && visibleOptions.length > 0 ? listboxId : undefined}
            aria-autocomplete={searchable ? 'list' : undefined}
            aria-busy={loading || undefined}
            aria-activedescendant={
              opened && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onClick={open}
          />

          <span className={cx(classes.actions)}>
            {clearable && selectedValues.length > 0 && !disabled && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                aria-label={resolvedLabels.clear}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  clearSelection();
                }}
              >
                <Icon icon="close-outline" pack="nebular-essentials" />
              </button>
            )}
            <Icon
              className={cx(classes.chevron)}
              icon="chevron-down-outline"
              pack="nebular-essentials"
              aria-hidden="true"
            />
          </span>
        </div>

        {opened &&
          (loading ? (
            <div role="status" aria-live="polite" className={cx(classes.empty)}>
              {resolvedLabels.loading}
            </div>
          ) : visibleOptions.length > 0 ? (
            <div
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-multiselectable="true"
              aria-label="Options"
              className={cx(classes.dropdown)}
              style={canVirtualize ? { maxHeight: virtualizedMaxHeight } : undefined}
              data-virtualized={canVirtualize || undefined}
              onScroll={
                canVirtualize ? (event) => setScrollTop(event.currentTarget.scrollTop) : undefined
              }
            >
              {canVirtualize ? (
                <div style={{ height: totalHeight, position: 'relative' }}>
                  {segments.map((segment) => (
                    <div
                      key={`segment-${segment.firstRowIndex}`}
                      role={segment.group ? 'group' : undefined}
                      aria-label={segment.group?.label}
                      aria-disabled={segment.group?.disabled || undefined}
                      data-disabled={segment.group?.disabled || undefined}
                      style={{
                        position: 'absolute',
                        top: segment.firstRowIndex * itemHeight,
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        height: segment.rows.length * itemHeight
                      }}
                    >
                      {segment.rows.map(({ row, rowIndex }) => (
                        <div
                          key={row.key}
                          style={{
                            position: 'absolute',
                            top: (rowIndex - segment.firstRowIndex) * itemHeight,
                            insetInlineStart: 0,
                            insetInlineEnd: 0,
                            height: itemHeight
                          }}
                        >
                          {row.kind === 'group'
                            ? renderGroupHeader(row.group, row.key, true)
                            : renderOptionRow(row, true)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                segments.map((segment) => {
                  const content = segment.rows.map(({ row }) =>
                    row.kind === 'group'
                      ? renderGroupHeader(row.group, row.key, false)
                      : renderOptionRow(row, false)
                  );

                  if (!segment.group) {
                    return (
                      <React.Fragment key={`segment-${segment.firstRowIndex}`}>
                        {content}
                      </React.Fragment>
                    );
                  }

                  return (
                    <div
                      key={`segment-${segment.firstRowIndex}`}
                      role="group"
                      aria-label={segment.group.label}
                      aria-disabled={segment.group.disabled || undefined}
                      data-disabled={segment.group.disabled || undefined}
                      className={cx(classes.group)}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div role="status" aria-live="polite" className={cx(classes.empty)}>
              {nothingFoundMessage ?? resolvedLabels.noOptions}
            </div>
          ))}
      </div>
    </FormControl>
  );
});

_MultiSelect.displayName = 'MultiSelect';

export { _MultiSelect as MultiSelect };
