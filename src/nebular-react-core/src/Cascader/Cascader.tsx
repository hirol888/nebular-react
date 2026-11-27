import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import type { NebularMessageParams } from '@nebular-react/styles';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps,
  useNebularDir,
  useNebularLocale
} from '@nebular-react/styles';
import {
  useFlexibleConnectedPositionStrategy,
  useId,
  useMeasure,
  useOverlay,
  useOverlayClickOutside,
  useOverlayKeyboard,
  useRefEventListener
} from '@nebular-react/hooks';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { OptionalPortal } from '../OptionalPortal';

export interface CascaderOption {
  value: string;
  label: React.ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
  /** Indicates that children will be loaded on demand by `loadData`. */
  hasChildren?: boolean;
}

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
});

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    width: '100%'
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
    color: 'var(--cascader-clear-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--cascader-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--cascader-min-width, 16rem)',
    maxWidth: 'var(--cascader-max-width, 40rem)',
    overflow: 'hidden',
    border: '1px solid var(--cascader-panel-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--cascader-panel-border-radius, 0.25rem)',
    backgroundColor:
      'var(--cascader-panel-background-color, var(--background-basic-color-1, #fff))',
    boxShadow: 'var(--cascader-panel-shadow, 0 4px 12px rgba(0, 0, 0, 0.12))'
  },

  columnsContainer: {
    display: 'flex',
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden'
  },

  searchContainer: {
    padding: '0.5rem',
    borderBottom:
      '1px solid var(--cascader-search-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  searchInput: {
    width: '100%',
    padding: '0.4rem 0.5rem',
    border:
      '1px solid var(--cascader-search-input-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--cascader-search-input-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',

    '&:focus': {
      borderColor:
        'var(--cascader-search-input-focus-border-color, var(--color-primary-500, #3366ff))'
    }
  },

  searchResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    maxHeight: 'var(--cascader-column-max-height, 18rem)',
    overflowY: 'auto',
    padding: '0.25rem'
  },

  searchResultLabel: {
    minWidth: 0,
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal'
  },

  column: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--cascader-column-min-width, 10rem)',
    maxHeight: 'var(--cascader-column-max-height, 18rem)',
    overflowY: 'auto',
    padding: '0.25rem',
    borderRight:
      '1px solid var(--cascader-column-border-color, var(--border-basic-color-3, #e4e9f2))',

    '&:last-of-type': {
      borderRight: 0
    }
  },

  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    minHeight: '1.75rem',
    padding: '0.2rem 0.35rem',
    borderRadius: 'var(--cascader-option-border-radius, 0.25rem)',
    color: 'var(--cascader-text-color, var(--text-basic-color, #222b45))',
    cursor: 'pointer',
    fontSize: 'var(--cascader-font-size, 0.875rem)',

    '&:hover': {
      backgroundColor:
        'var(--cascader-option-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    }
  },

  optionActive: {
    backgroundColor:
      'var(--cascader-option-active-background-color, var(--background-basic-color-2, #f7f9fc))',
    outline:
      '2px solid var(--cascader-option-active-outline-color, var(--color-primary-500, #3366ff))',
    outlineOffset: '-2px'
  },

  optionSelected: {
    backgroundColor:
      'var(--cascader-option-selected-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--cascader-option-selected-color, var(--color-primary-500, #3366ff))'
  },

  optionDisabled: {
    opacity: 'var(--cascader-option-disabled-opacity, 0.5)',
    cursor: 'not-allowed'
  },

  optionLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  optionIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'var(--cascader-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  spinner: {
    display: 'inline-block',
    flex: '0 0 auto',
    width: '0.85rem',
    height: '0.85rem',
    border: '2px solid currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: `${spin} 600ms linear infinite`
  },

  empty: {
    padding: '0.75rem 1rem',
    minWidth: 'var(--cascader-min-width, 16rem)',
    color: 'var(--cascader-empty-color, inherit)',
    textAlign: 'center'
  }
}));

export type CascaderStylesNames = Selectors<typeof useStyles>;

/**
 * Visible text and accessible names rendered by `Cascader`.
 * Defaults come from the Nebular locale catalog; every entry can be overridden.
 */
export interface CascaderLabels {
  /** Placeholder and accessible name of the search input. */
  search: string;
  /** Accessible name of the search results list. */
  searchResults: string;
  /** Visible message shown when the search matches no options. */
  noResults: string;
  /** Accessible name of the button that clears the selection. */
  clear: string;
  /** Placeholder used when the `placeholder` prop is not provided. */
  placeholder: string;
  /** Visible message shown when there are no options. */
  noOptions: string;
  /** Accessible name of the listbox rendered for a column. */
  level(level: number): string;
  /** Accessible name of an option while its children are loading. */
  loadingChildren(name: string): string;
}

export interface CascaderProps
  extends
    DefaultProps<CascaderStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?(value: string[]): void;
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  changeOnSelect?: boolean;
  separator?: string;
  /** Shows a search input that filters the tree as a flat list. */
  searchable?: boolean;
  /** Loads children when an option with `hasChildren` is expanded. */
  loadData?(option: CascaderOption): Promise<CascaderOption[]>;
  onLoadError?(option: CascaderOption, error: unknown): void;
  loadingLabel?: string;
  ariaLabel?: string;
  /** Overrides the visible text and accessible names rendered by the component. */
  labels?: Partial<CascaderLabels>;
}

interface CascaderColumn {
  level: number;
  options: CascaderOption[];
  path: string[];
}

interface CascaderSearchResult {
  option: CascaderOption;
  path: string[];
  pathLabel: string;
  selectable: boolean;
}

const defaultProps: Partial<CascaderProps> = {
  clearable: false,
  disabled: false,
  changeOnSelect: false,
  separator: ' / ',
  searchable: false,
  required: false,
  withAsterisk: false
};

type CascaderTranslate = (key: string, fallback: string, params?: NebularMessageParams) => string;

const createCascaderLabels = (t: CascaderTranslate): CascaderLabels => ({
  search: t('cascader.search', 'Search options'),
  searchResults: t('cascader.searchResults', 'Search results'),
  noResults: t('cascader.noResults', 'No results'),
  clear: t('cascader.clear', 'Clear selection'),
  placeholder: t('cascader.placeholder', 'Select an item'),
  noOptions: t('cascader.noOptions', 'No options'),
  level: (level) => t('cascader.level', 'Level {level}', { level }),
  loadingChildren: (name) => t('cascader.loading', 'Loading children of {name}', { name })
});

const getOptionText = (option: CascaderOption): string =>
  typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : option.value;

const getPathKey = (path: string[]): string => path.join('\u0000');

const isSamePath = (first: string[], second: string[]): boolean =>
  first.length === second.length && first.every((value, index) => value === second[index]);

const getAdjacentEnabledIndex = (options: CascaderOption[], from: number, step: 1 | -1): number => {
  if (options.length === 0) {
    return -1;
  }

  let index = from < 0 ? (step > 0 ? 0 : options.length - 1) : from + step;

  while (index >= 0 && index < options.length) {
    if (!options[index].disabled) {
      return index;
    }

    index += step;
  }

  return from >= 0 && from < options.length && !options[from].disabled ? from : -1;
};

const getBoundaryEnabledIndex = (options: CascaderOption[], fromEnd: boolean): number => {
  for (let index = 0; index < options.length; index += 1) {
    const targetIndex = fromEnd ? options.length - 1 - index : index;

    if (!options[targetIndex].disabled) {
      return targetIndex;
    }
  }

  return -1;
};

const getAdjacentSelectableResultIndex = (
  results: CascaderSearchResult[],
  from: number,
  step: 1 | -1
): number => {
  if (results.length === 0) {
    return -1;
  }

  let index = from < 0 ? (step > 0 ? 0 : results.length - 1) : from + step;

  while (index >= 0 && index < results.length) {
    if (results[index].selectable) {
      return index;
    }

    index += step;
  }

  return from >= 0 && from < results.length && results[from].selectable ? from : -1;
};

const getBoundarySelectableResultIndex = (
  results: CascaderSearchResult[],
  fromEnd: boolean
): number => {
  for (let index = 0; index < results.length; index += 1) {
    const targetIndex = fromEnd ? results.length - 1 - index : index;

    if (results[targetIndex].selectable) {
      return targetIndex;
    }
  }

  return -1;
};

const _Cascader = forwardRef<HTMLDivElement, CascaderProps>((props, ref) => {
  const {
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    label,
    description,
    error,
    required,
    withAsterisk,
    clearable,
    disabled,
    changeOnSelect,
    separator,
    searchable,
    loadData,
    onLoadError,
    loadingLabel,
    ariaLabel,
    labels: labelsProp,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { t } = useNebularLocale();
  const resolvedLabels: CascaderLabels = { ...createCascaderLabels(t), ...labelsProp };
  const resolvedPlaceholder = placeholder ?? resolvedLabels.placeholder;
  const { classes, cx } = useStyles(null, { name: 'cascader', classNames, styles, unstyled });
  const uuid = useId();
  const dir = useNebularDir();

  const [selectedValue, setSelectedValue] = useUncontrolled<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    finalValue: [],
    onChange
  });

  const [opened, setOpened] = useState(false);
  const [panelPath, setPanelPath] = useState<string[]>(selectedValue);
  const [activeLevel, setActiveLevel] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [loadedChildren, setLoadedChildren] = useState<Record<string, CascaderOption[]>>({});
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);

  const triggerRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingLoads = useRef<Set<string>>(new Set());
  const [wrapperRef, { width: wrapperWidth }] = useMeasure<HTMLDivElement>();

  const isPathLoaded = (path: string[]): boolean => Object.hasOwn(loadedChildren, getPathKey(path));

  const getOptionChildren = (option: CascaderOption, path: string[]): CascaderOption[] =>
    loadedChildren[getPathKey(path)] ?? option.children ?? [];

  const isOptionExpandable = (option: CascaderOption, path: string[]): boolean => {
    const children = getOptionChildren(option, path);

    return children.length > 0 || (option.hasChildren === true && !isPathLoaded(path));
  };

  const columns = useMemo<CascaderColumn[]>(() => {
    const result: CascaderColumn[] = [];
    let currentOptions = options;
    let path: string[] = [];

    result.push({ level: 0, options: currentOptions, path });

    for (let index = 0; index < panelPath.length; index += 1) {
      const selected = panelPath[index];
      const option = currentOptions.find((item) => item.value === selected);

      if (!option) {
        break;
      }

      const nextPath = [...path, selected];
      const key = getPathKey(nextPath);
      const children = loadedChildren[key] ?? option.children ?? [];
      const expandable =
        children.length > 0 || (option.hasChildren === true && !Object.hasOwn(loadedChildren, key));

      if (!expandable) {
        break;
      }

      path = nextPath;
      currentOptions = children;
      result.push({ level: result.length, options: currentOptions, path });
    }

    return result;
  }, [loadedChildren, options, panelPath]);

  const displayValue = useMemo(() => {
    const labels: string[] = [];
    let currentOptions = options;
    let path: string[] = [];

    selectedValue.forEach((currentValue) => {
      const option = currentOptions.find((item) => item.value === currentValue);

      if (!option) {
        labels.push(currentValue);
        currentOptions = [];

        return;
      }

      labels.push(getOptionText(option));
      path = [...path, currentValue];
      currentOptions = loadedChildren[getPathKey(path)] ?? option.children ?? [];
    });

    return labels.join(separator);
  }, [loadedChildren, options, selectedValue, separator]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = searchable && normalizedQuery.length > 0;

  const searchResults = useMemo<CascaderSearchResult[]>(() => {
    if (!isSearching) {
      return [];
    }

    const results: CascaderSearchResult[] = [];

    const walk = (nodes: CascaderOption[], parentPath: string[], parentLabels: string[]) => {
      nodes.forEach((option) => {
        const path = [...parentPath, option.value];
        const optionText = getOptionText(option);
        const labels = [...parentLabels, optionText];
        const key = getPathKey(path);
        const children = loadedChildren[key] ?? option.children ?? [];
        const expandable =
          children.length > 0 ||
          (option.hasChildren === true && !Object.hasOwn(loadedChildren, key));

        if (optionText.toLowerCase().includes(normalizedQuery)) {
          results.push({
            option,
            path,
            pathLabel: labels.join(separator),
            selectable: !option.disabled && (changeOnSelect || !expandable)
          });
        }

        if (children.length > 0) {
          walk(children, path, labels);
        }
      });
    };

    walk(options, [], []);

    return results;
  }, [changeOnSelect, isSearching, loadedChildren, normalizedQuery, options, separator]);

  const activeColumn = columns[Math.min(activeLevel, columns.length - 1)];
  const activeColumnOptions = activeColumn ? activeColumn.options : [];
  const activeOption =
    activeIndex >= 0 && activeIndex < activeColumnOptions.length
      ? activeColumnOptions[activeIndex]
      : null;
  const activeSearchResult =
    activeResultIndex >= 0 && activeResultIndex < searchResults.length
      ? searchResults[activeResultIndex]
      : null;

  const hide = () => {
    setOpened(false);
    setActiveLevel(0);
    setActiveIndex(-1);
    setSearchQuery('');
    setActiveResultIndex(-1);
  };

  const show = () => {
    if (disabled) {
      return;
    }

    setPanelPath(selectedValue);
    setOpened(true);
    setActiveLevel(0);
    setActiveIndex(-1);
    setSearchQuery('');
    setActiveResultIndex(-1);
  };

  const closeAndFocus = () => {
    hide();
    triggerRef.current?.focus();
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    triggerRef.current,
    dir,
    8
  );

  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened
  });
  useOverlayClickOutside([triggerRef, paneRef], hide);

  useEffect(() => {
    if (opened && searchable) {
      searchInputRef.current?.focus();
    }
  }, [opened, searchable]);

  useEffect(() => {
    if (!opened) {
      setPanelPath((current) => (isSamePath(current, selectedValue) ? current : selectedValue));
    }
  }, [opened, selectedValue]);

  useEffect(() => {
    if (activeLevel > columns.length - 1) {
      setActiveLevel(columns.length - 1);
      setActiveIndex(-1);
    } else if (activeIndex >= activeColumnOptions.length) {
      setActiveIndex(activeColumnOptions.length > 0 ? 0 : -1);
    }
  }, [activeColumnOptions.length, activeIndex, activeLevel, columns.length]);

  const loadChildren = async (option: CascaderOption, path: string[]) => {
    const key = getPathKey(path);

    if (
      typeof loadData !== 'function' ||
      Object.hasOwn(loadedChildren, key) ||
      pendingLoads.current.has(key)
    ) {
      return;
    }

    pendingLoads.current.add(key);
    setLoadingKeys((current) => (current.includes(key) ? current : [...current, key]));

    try {
      const children = await loadData(option);
      setLoadedChildren((current) => ({ ...current, [key]: children ?? [] }));
    } catch (loadError) {
      onLoadError?.(option, loadError);
    } finally {
      pendingLoads.current.delete(key);
      setLoadingKeys((current) => current.filter((loadingKey) => loadingKey !== key));
    }
  };

  const requestChildren = (option: CascaderOption, path: string[]) => {
    if (
      typeof loadData === 'function' &&
      option.hasChildren === true &&
      getOptionChildren(option, path).length === 0 &&
      !isPathLoaded(path)
    ) {
      loadChildren(option, path);
    }
  };

  const selectSearchResult = (result: CascaderSearchResult) => {
    if (!result.selectable) {
      return;
    }

    setSelectedValue(result.path);
    closeAndFocus();
  };

  const selectOption = (column: CascaderColumn, option: CascaderOption) => {
    if (option.disabled) {
      return;
    }

    const nextPath = [...column.path, option.value];
    setPanelPath(nextPath);

    if (isOptionExpandable(option, nextPath)) {
      if (changeOnSelect) {
        setSelectedValue(nextPath);
      }

      requestChildren(option, nextPath);
      setActiveLevel(column.level + 1);
      setActiveIndex(-1);

      return;
    }

    setSelectedValue(nextPath);
    closeAndFocus();
  };

  const openNextColumn = (column: CascaderColumn, option: CascaderOption) => {
    const nextPath = [...column.path, option.value];

    if (option.disabled || !isOptionExpandable(option, nextPath)) {
      return;
    }

    setPanelPath(nextPath);
    requestChildren(option, nextPath);
    setActiveLevel(column.level + 1);
    setActiveIndex(-1);
  };

  const goToPreviousColumn = () => {
    if (activeLevel <= 0) {
      return;
    }

    const previousLevel = activeLevel - 1;
    const previousColumn = columns[previousLevel];
    const selectedInPrevious = panelPath[previousLevel];
    const previousIndex = previousColumn
      ? previousColumn.options.findIndex((option) => option.value === selectedInPrevious)
      : -1;

    setActiveLevel(previousLevel);
    setActiveIndex(previousIndex);
  };

  const activateOption = (
    event: KeyboardEvent,
    column: CascaderColumn | undefined,
    index: number
  ) => {
    if (!column || index < 0 || index >= column.options.length) {
      return;
    }

    const option = column.options[index];

    if (option.disabled) {
      return;
    }

    const optionPath = [...column.path, option.value];

    if (isOptionExpandable(option, optionPath)) {
      event.preventDefault();
      openNextColumn(column, option);
    } else {
      event.preventDefault();
      selectOption(column, option);
    }
  };

  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const trigger = triggerRef.current;
    const pane = paneRef.current;

    if (!target || (!trigger?.contains(target) && !pane?.contains(target))) {
      return;
    }

    const isSearchField = target.getAttribute('data-nebular-cascader-search') === 'true';

    if (isSearchField) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndFocus();

        return;
      }

      if (isSearching) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setActiveResultIndex((current) =>
              getAdjacentSelectableResultIndex(searchResults, current, 1)
            );
            return;
          case 'ArrowUp':
            event.preventDefault();
            setActiveResultIndex((current) =>
              getAdjacentSelectableResultIndex(searchResults, current, -1)
            );
            return;
          case 'Home':
            event.preventDefault();
            setActiveResultIndex(getBoundarySelectableResultIndex(searchResults, false));
            return;
          case 'End':
            event.preventDefault();
            setActiveResultIndex(getBoundarySelectableResultIndex(searchResults, true));
            return;
          case 'Enter':
            event.preventDefault();

            if (activeSearchResult) {
              selectSearchResult(activeSearchResult);
            }

            return;
          default:
            return;
        }
      }

      if (
        !['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(
          event.key
        )
      ) {
        return;
      }
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeAndFocus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => getAdjacentEnabledIndex(activeColumnOptions, current, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => getAdjacentEnabledIndex(activeColumnOptions, current, -1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(getBoundaryEnabledIndex(activeColumnOptions, false));
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(getBoundaryEnabledIndex(activeColumnOptions, true));
        break;
      case 'ArrowRight':
        event.preventDefault();

        if (activeOption) {
          openNextColumn(activeColumn, activeOption);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousColumn();
        break;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        activateOption(event, activeColumn, activeIndex);
        break;
      default:
        break;
    }
  });

  useOverlayKeyboard(keydownHandler, opened);

  const triggerKeydownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || opened) {
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Spacebar'].includes(event.key)) {
      event.preventDefault();
      show();
    }
  };

  const triggerClickHandler = () => {
    if (disabled) {
      return;
    }

    if (opened) {
      hide();
    } else {
      show();
    }
  };

  const clearSelection = () => {
    setSelectedValue([]);
    setPanelPath([]);
    triggerRef.current?.focus();
  };

  const inputAriaLabel = ariaLabel ?? (label ? undefined : resolvedPlaceholder);
  const popupId = `${uuid}-cascader-popup`;
  const searchResultsId = `${uuid}-cascader-search-results`;

  const getOptionId = (level: number, optionValue: string) =>
    `${uuid}-cascader-option-${level}-${optionValue.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const getSearchResultId = (index: number) => `${uuid}-cascader-search-result-${index}`;

  const activeOptionId =
    opened && !isSearching && activeOption && activeColumn
      ? getOptionId(activeColumn.level, activeOption.value)
      : undefined;
  const activeSearchResultId =
    isSearching && activeSearchResult ? getSearchResultId(activeResultIndex) : undefined;

  return (
    <FormControl
      ref={ref}
      label={label}
      description={description}
      error={error}
      required={required}
      withAsterisk={withAsterisk}
      htmlFor={uuid}
      className={className}
    >
      <div {...others} ref={wrapperRef} className={cx(classes.root)}>
        <Input
          id={uuid}
          ref={triggerRef}
          value={displayValue}
          readOnly
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          fullWidth
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={opened}
          aria-controls={opened ? popupId : undefined}
          aria-activedescendant={activeOptionId}
          aria-label={inputAriaLabel}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          onClick={triggerClickHandler}
          onKeyDown={triggerKeydownHandler}
        />
        {clearable && selectedValue.length > 0 && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            aria-label={resolvedLabels.clear}
            onClick={clearSelection}
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        )}
        <OptionalPortal withinPortal>
          <div ref={boundingBoxRef} style={{ display: opened ? 'flex' : 'none' }}>
            <div ref={paneRef} className="overlay-pane">
              {opened && (
                <div
                  id={popupId}
                  className={cx(classes.panel)}
                  style={wrapperWidth > 0 ? { width: `${wrapperWidth}px` } : undefined}
                >
                  {searchable && (
                    <div className={cx(classes.searchContainer)}>
                      <input
                        ref={searchInputRef}
                        data-nebular-cascader-search="true"
                        type="search"
                        role="combobox"
                        aria-label={resolvedLabels.search}
                        aria-autocomplete="list"
                        aria-expanded={opened}
                        aria-controls={isSearching ? searchResultsId : popupId}
                        aria-activedescendant={isSearching ? activeSearchResultId : activeOptionId}
                        className={cx(classes.searchInput)}
                        value={searchQuery}
                        placeholder={resolvedLabels.search}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setActiveResultIndex(-1);
                        }}
                      />
                    </div>
                  )}
                  {isSearching ? (
                    searchResults.length > 0 ? (
                      <div
                        id={searchResultsId}
                        role="listbox"
                        aria-label={resolvedLabels.searchResults}
                        className={cx(classes.searchResults)}
                      >
                        {searchResults.map((result, resultIndex) => {
                          const isActive = activeResultIndex === resultIndex;
                          const isSelected = isSamePath(selectedValue, result.path);

                          return (
                            <div
                              key={getPathKey(result.path)}
                              id={getSearchResultId(resultIndex)}
                              role="option"
                              tabIndex={-1}
                              aria-selected={isSelected}
                              aria-disabled={!result.selectable || undefined}
                              data-active={isActive || undefined}
                              className={cx(classes.option, {
                                [classes.optionActive]: isActive,
                                [classes.optionSelected]: isSelected,
                                [classes.optionDisabled]: !result.selectable
                              })}
                              onClick={() => selectSearchResult(result)}
                            >
                              <span className={cx(classes.searchResultLabel)}>
                                {result.pathLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        id={searchResultsId}
                        role="status"
                        aria-live="polite"
                        className={cx(classes.empty)}
                      >
                        {resolvedLabels.noResults}
                      </div>
                    )
                  ) : columns.every((column) => column.options.length === 0) ? (
                    <div role="status" aria-live="polite" className={cx(classes.empty)}>
                      {resolvedLabels.noOptions}
                    </div>
                  ) : (
                    <div className={cx(classes.columnsContainer)}>
                      {columns
                        .filter((column) => column.options.length > 0)
                        .map((column) => (
                          <div
                            key={column.level}
                            role="listbox"
                            aria-label={resolvedLabels.level(column.level + 1)}
                            className={cx(classes.column)}
                          >
                            {column.options.map((option, optionIndex) => {
                              const optionPath = [...column.path, option.value];
                              const optionKey = getPathKey(optionPath);
                              const isExpandable = isOptionExpandable(option, optionPath);
                              const isLoading = loadingKeys.includes(optionKey);
                              const isActive =
                                activeColumn?.level === column.level && activeIndex === optionIndex;
                              const isSelected = panelPath[column.level] === option.value;

                              return (
                                <div
                                  key={option.value}
                                  id={getOptionId(column.level, option.value)}
                                  role="option"
                                  tabIndex={-1}
                                  aria-label={
                                    isLoading
                                      ? loadingLabel
                                        ? `${loadingLabel} ${getOptionText(option)}`
                                        : resolvedLabels.loadingChildren(getOptionText(option))
                                      : undefined
                                  }
                                  aria-selected={isSelected}
                                  aria-disabled={option.disabled || undefined}
                                  aria-busy={isLoading || undefined}
                                  data-active={isActive || undefined}
                                  className={cx(classes.option, {
                                    [classes.optionActive]: isActive,
                                    [classes.optionSelected]: isSelected,
                                    [classes.optionDisabled]: option.disabled
                                  })}
                                  onClick={() => selectOption(column, option)}
                                >
                                  <span className={cx(classes.optionLabel)}>{option.label}</span>
                                  {isLoading ? (
                                    <span className={cx(classes.spinner)} aria-hidden="true" />
                                  ) : (
                                    isExpandable && (
                                      <Icon
                                        icon="chevron-right-outline"
                                        pack="nebular-essentials"
                                        aria-hidden="true"
                                        className={cx(classes.optionIcon)}
                                      />
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </OptionalPortal>
      </div>
    </FormControl>
  );
});

_Cascader.displayName = 'Cascader';

export { _Cascader as Cascader };
