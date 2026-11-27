import React, { forwardRef, ReactNode, useEffect, useRef, useState } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  SelectAppearance,
  Selectors,
  useComponentDefaultProps,
  useNebularDir,
  createPolymorphicComponent
} from '@nebular-react/styles';
import {
  mergeRefs,
  Position,
  PositionAdjustment,
  useFocusWithin,
  useListKeyManager,
  useMeasure,
  useOverlay,
  useOverlayKeyboard,
  useOverlayTrigger,
  useRefEventListener,
  useFlexibleConnectedPositionStrategy,
  useOverlayClickOutside
} from '@nebular-react/hooks';
import { copyOptionItem } from '../Shared/OptionList/utils/copy-option-item';
import { OptionalPortal } from '../OptionalPortal';
import {
  FormField,
  OptionList,
  OptionInternal,
  DropdownComponentState,
  OptionGroup,
  Option
} from '../Shared';
import useStyles, { SelectStylesParams } from './Select.style';
import { Icon } from '../Icon';
import {
  filterOptionsAndGroups,
  formatData,
  getOptionsOnly,
  OptionFilter,
  withActiveOption
} from '../Shared/OptionList/utils';

export type SelectStylesNames = Selectors<typeof useStyles>;

interface SelectState extends DropdownComponentState {
  selectedOptions: OptionInternal[];
  selectedValues: unknown[];
  selectedText: string;
}

export interface SelectProps
  extends
    DefaultProps<SelectStylesNames, SelectStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onFocus' | 'onBlur' | 'onSelect' | 'onKeyDown'> {
  options: (string | Option | OptionGroup)[];
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  shape?: ComponentShape;
  appearance?: SelectAppearance;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  multiple?: boolean;
  initiallyOpened?: boolean;
  defaultSelected?: string | string[] | Option | Option[];
  dropdownWidth?: number;
  dropdownClass?: string;
  dropdownPanelClass?: string;
  dropdownOffset?: number;
  dropdownPosition?: Position;
  dropdownAdjustment?: PositionAdjustment;
  allowDeselect?: boolean;
  clearable?: boolean;
  loading?: boolean;
  nothingFoundMessage?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?(query: string): void;
  filterOption?: OptionFilter;
  virtualized?: boolean;
  virtualizedMaxHeight?: number;
  customLabel?: ReactNode;
  renderOption?: (option: Option) => React.ReactNode;
  icon?: ReactNode;
  onSelect?(selectedOptions: string | string[] | Option | Option[] | null): void;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  onKeyDown?(event: KeyboardEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}

const defaultProps: Partial<SelectProps> = {
  size: 'medium',
  status: 'basic',
  shape: 'rectangle',
  appearance: 'outline',
  disabled: false,
  fullWidth: false,
  multiple: false,
  dropdownOffset: 8,
  dropdownPosition: 'bottom',
  dropdownAdjustment: 'vertical',
  initiallyOpened: false,
  clearable: false,
  loading: false,
  nothingFoundMessage: 'No options',
  searchable: false,
  searchPlaceholder: 'Search options',
  defaultSearchValue: '',
  virtualized: false,
  virtualizedMaxHeight: 300
};

const _Select = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const {
    options,
    size,
    status,
    shape,
    appearance,
    disabled,
    fullWidth,
    placeholder,
    multiple,
    initiallyOpened,
    defaultSelected,
    dropdownWidth,
    dropdownClass,
    dropdownPanelClass,
    dropdownOffset,
    dropdownPosition,
    dropdownAdjustment,
    allowDeselect,
    clearable,
    loading,
    nothingFoundMessage,
    searchable,
    searchPlaceholder,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    filterOption,
    virtualized,
    virtualizedMaxHeight,
    customLabel,
    renderOption,
    icon,
    onSelect,
    onKeyDown,
    onBlur,
    onFocus,
    onDropdownOpen,
    onDropdownClose,
    className,
    unstyled,
    classNames,
    styles,
    ...others
  } = useComponentDefaultProps(defaultProps, props);

  const formattedData = formatData(options);
  const formattedInitialSelected = formatData(
    Array.isArray(defaultSelected) ? defaultSelected : defaultSelected ? [defaultSelected] : []
  );

  const applySelectedValues = (
    data: (OptionInternal | OptionGroup)[],
    values: unknown[]
  ): (OptionInternal | OptionGroup)[] => {
    const clonedData = data.map(copyOptionItem);
    getOptionsOnly(clonedData).forEach((option) => {
      option.selected = values.includes(option.value);
    });
    return clonedData;
  };

  const initialSelectedValues = formattedInitialSelected.map((x) => x.value);

  const [selectState, setSelectState] = useState<SelectState>(() => {
    const initialOptionsAndGroups = applySelectedValues(formattedData, initialSelectedValues);

    return {
      optionsAndGroups: initialOptionsAndGroups,
      options: getOptionsOnly(initialOptionsAndGroups),
      selectedOptions: formattedInitialSelected,
      selectedValues: initialSelectedValues,
      selectedText: formattedInitialSelected.map((x) => x.label).join(', '),
      opened: false
    };
  });

  const [internalSearchValue, setInternalSearchValue] = useState(defaultSearchValue);
  const activeSearchValue = searchValue !== undefined ? searchValue : internalSearchValue;
  const isAsyncSearch = typeof onSearchChange === 'function';
  const filteredOptionsAndGroups =
    searchable && !isAsyncSearch
      ? filterOptionsAndGroups(selectState.optionsAndGroups, activeSearchValue, filterOption)
      : selectState.optionsAndGroups;
  const visibleOptions = getOptionsOnly(filteredOptionsAndGroups);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [wrapperRef, { width: _dropdownWidth }] = useMeasure<HTMLDivElement>();
  const { classes, cx } = useStyles(
    {
      appearance,
      size,
      shape,
      status,
      withPrefix: !!icon,
      hasPlaceholder: selectState.selectedValues.length === 0,
      opened: selectState.opened,
      empty: selectState.selectedValues.length === 0 && !placeholder
    },
    { name: 'select', unstyled, classNames, styles }
  );

  const triggerRef = useRef<HTMLButtonElement>(null);

  const { ref: focusRef, focused } = useFocusWithin({ onBlur, onFocus });
  const dir = useNebularDir();

  useEffect(() => {
    const _formattedData = formatData(options);
    setSelectState((state) => ({
      ...state,
      optionsAndGroups: _formattedData,
      options: getOptionsOnly(_formattedData)
    }));
  }, [options]);

  // open dropdown when initiallyOpened is true
  useEffect(() => {
    if (initiallyOpened) {
      setSelectState((state) => ({ ...state, opened: true }));
    }
  }, [initiallyOpened]);

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setSelectState((state) => ({ ...state, opened: true }));
      typeof onDropdownOpen === 'function' && onDropdownOpen();
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setSelectState((state) => ({ ...state, opened: false }));
      setTimeout(() => triggerRef.current?.focus());
      typeof onDropdownClose === 'function' && onDropdownClose();
    }
  };

  const clearSelection = () => {
    const optionsAndGroups = selectState.optionsAndGroups.map(copyOptionItem);
    const nextOptions = getOptionsOnly(optionsAndGroups).map((option) => ({
      ...option,
      selected: false,
      active: false
    }));

    setSelectState((state) => ({
      ...state,
      optionsAndGroups,
      options: nextOptions,
      selectedOptions: [],
      selectedValues: [],
      selectedText: ''
    }));
    setActiveItemIndex(-1);
    typeof onSelect === 'function' && onSelect(multiple ? [] : null);
    setTimeout(() => triggerRef.current?.focus());
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    dropdownPosition,
    dropdownAdjustment,
    triggerRef.current,
    dir,
    dropdownOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened: selectState.opened,
    panelClass: dropdownPanelClass
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'click', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);
  const {
    onKeyDown: onListKeydown,
    activeItemIndex,
    setActiveItemIndex
  } = useListKeyManager(visibleOptions, hide, searchable ? -1 : 0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (searchValue === undefined) {
      setInternalSearchValue(nextValue);
    }

    typeof onSearchChange === 'function' && onSearchChange(nextValue);
    setActiveItemIndex(-1);
  };

  useEffect(() => {
    if (selectState.opened && searchable) {
      const timeout = setTimeout(() => searchInputRef.current?.focus(), 0);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [selectState.opened, searchable]);

  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    const isSearchInput =
      (event.target as HTMLElement | null)?.getAttribute('data-nebular-select-search') === 'true';

    if (isSearchInput) {
      if (event.key === 'Escape') {
        hide();
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        onListKeydown(event);
      } else if (event.key === 'Enter') {
        const activeOption = visibleOptions[activeItemIndex];
        activeOption && optionSelectedHandler(activeOption);
      }

      typeof onKeyDown === 'function' && onKeyDown(event);
      return;
    }

    if (event.key === 'Escape') {
      hide();
    } else if (event.key === ' ') {
      event.preventDefault();
    } else {
      onListKeydown(event);
    }
    typeof onKeyDown === 'function' && onKeyDown(event);
  });
  useOverlayKeyboard(keydownHandler, selectState.opened);

  useEffect(() => {
    if (activeItemIndex >= visibleOptions.length) {
      setActiveItemIndex(visibleOptions.length > 0 ? 0 : -1);
    }
  }, [activeItemIndex, visibleOptions.length, setActiveItemIndex]);

  const activeVisibleOption = visibleOptions[activeItemIndex];
  const displayOptionsAndGroups = withActiveOption(filteredOptionsAndGroups, activeVisibleOption);

  const optionSelectedHandler = (clickedOption: {
    label?: string;
    value?: string;
    selected?: boolean;
  }) => {
    const optionsAndGroups = selectState.optionsAndGroups.map(copyOptionItem);
    const _options = getOptionsOnly(optionsAndGroups).map((option) => {
      if (option.label === clickedOption.label && option.value === clickedOption.value) {
        option.selected = allowDeselect || multiple ? clickedOption.selected : true;
        option.active = true;
      } else {
        if (!multiple && clickedOption.selected) {
          option.selected = false;
        }
        option.active = false;
      }
      return option;
    });

    const selectedOptions = _options.filter((o) => o.selected);
    const selectedValues = _options.filter((o) => o.selected).map((o) => o.value);
    const selectedText = _options
      .filter((o) => o.selected)
      .map((o) => o.label)
      .join(', ');

    const selectedIndex = visibleOptions.findIndex(
      (option) => option.label === clickedOption.label && option.value === clickedOption.value
    );
    if (selectedIndex >= 0) {
      setActiveItemIndex(selectedIndex);
    }

    if (multiple) {
      setSelectState((state) => ({
        ...state,
        options: _options,
        optionsAndGroups,
        selectedOptions,
        selectedValues,
        selectedText
      }));
    } else {
      setSelectState((state) => ({
        ...state,
        options: _options,
        optionsAndGroups,
        selectedOptions,
        selectedValues,
        selectedText,
        opened: false
      }));
      setTimeout(() => triggerRef.current?.focus());
    }

    const emitsPrimitiveValues = typeof options[0] === 'string';
    const selectedOptionValues = selectedOptions
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string');

    const nextSelection: string | string[] | Option | Option[] | null = multiple
      ? emitsPrimitiveValues
        ? selectedOptionValues
        : selectedOptions
      : emitsPrimitiveValues
        ? (selectedOptionValues[0] ?? null)
        : (selectedOptions[0] ?? null);

    if (typeof onSelect === 'function') {
      onSelect(nextSelection);
    }
  };

  return (
    <FormField
      size={size}
      status={status}
      fullWidth={fullWidth}
      disabled={disabled}
      prefixIcon={icon}
      fieldFocused={focused}
      className={cx(className, size, status, shape, appearance)}
      ref={ref}
    >
      <div
        className={cx(classes.root, {
          [classes.fullWidth]: fullWidth
        })}
        ref={wrapperRef}
        {...others}
      >
        <button
          type="button"
          className={cx(classes.selectButton, {
            [classes.disabled]: disabled,
            [classes.clearable]: clearable && selectState.selectedValues.length > 0
          })}
          disabled={disabled}
          ref={mergeRefs(triggerRef, focusRef)}
          aria-haspopup="listbox"
          aria-expanded={selectState.opened}
          aria-busy={loading || undefined}
        >
          <span>
            {selectState.selectedValues.length > 0 ? (
              <>{customLabel ? <>{customLabel}</> : selectState.selectedText}</>
            ) : (
              <>{placeholder}</>
            )}
          </span>
          <Icon icon="chevron-down-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
        {clearable && selectState.selectedValues.length > 0 && !disabled && (
          <button
            type="button"
            className={cx(classes.clearButton)}
            onClick={clearSelection}
            aria-label="Clear selection"
          >
            <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        )}
        <OptionalPortal withinPortal>
          <div ref={boundingBoxRef} style={{ display: selectState.opened ? 'flex' : 'none' }}>
            <div ref={paneRef} className="overlay-pane">
              {searchable && (
                <div className={cx(classes.searchContainer)}>
                  <input
                    ref={searchInputRef}
                    data-nebular-select-search="true"
                    type="search"
                    className={cx(classes.searchInput)}
                    value={activeSearchValue}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder || 'Search options'}
                  />
                </div>
              )}
              {loading ? (
                <div className={cx(classes.dropdownStatus)} role="status" aria-live="polite">
                  Loading options…
                </div>
              ) : filteredOptionsAndGroups.length > 0 ? (
                <OptionList
                  data={displayOptionsAndGroups}
                  onOptionSelected={optionSelectedHandler}
                  multiple={multiple}
                  size={size}
                  className={dropdownClass}
                  keyManagerType="focus"
                  ariaLabel={placeholder ? `${placeholder} options` : 'Options'}
                  virtualized={virtualized}
                  virtualizedMaxHeight={virtualizedMaxHeight}
                  renderOption={renderOption}
                  style={
                    dropdownWidth > 0
                      ? { width: `${dropdownWidth}px` }
                      : { width: `${_dropdownWidth}px` }
                  }
                />
              ) : (
                <div className={cx(classes.dropdownStatus)} role="status" aria-live="polite">
                  {nothingFoundMessage}
                </div>
              )}
            </div>
          </div>
        </OptionalPortal>
      </div>
    </FormField>
  );
});

_Select.displayName = 'Select';

export const Select = createPolymorphicComponent<'div', SelectProps>(_Select);
