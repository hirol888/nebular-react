import React, { useEffect, useRef, useState } from 'react';
import {
  ComponentSize,
  DefaultProps,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  mergeRefs,
  Position,
  PositionAdjustment,
  useFlexibleConnectedPositionStrategy,
  useId,
  useListKeyManager,
  useMeasure,
  useOverlay,
  useOverlayClickOutside,
  useOverlayKeyboard,
  useOverlayTrigger,
  useRefEventListener,
  useMeasureElement
} from '@nebular-react/hooks';
import { copyOptionItem } from '../Shared/OptionList/utils/copy-option-item';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { DropdownComponentState, OptionList, OptionInternal, OptionGroup, Option } from '../Shared';
import { BaseInputProps } from '../Input/Input';
import {
  filterOptionsAndGroups,
  formatData,
  getOptionsOnly,
  OptionFilter,
  withActiveOption
} from '../Shared/OptionList/utils';

type AutocompleteState = DropdownComponentState;

export interface AutocompleteProps
  extends
    DefaultProps,
    Omit<BaseInputProps, 'onChange'>,
    Omit<React.ComponentPropsWithoutRef<'input'>, 'size' | 'onChange'> {
  data?: (string | OptionInternal | OptionGroup)[];
  dropdownSize?: ComponentSize;
  activeFirst?: boolean;
  dropdownClass?: string;
  dropdownPanelClass?: string;
  dropdownWidth?: number;
  dropdownOffset?: number;
  dropdownPosition?: Position;
  dropdownAdjustment?: PositionAdjustment;
  useCustomInput?: boolean;
  customInputRef?: React.RefObject<HTMLInputElement | null>;
  customHostRef?: React.RefObject<HTMLElement | null>;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  onChange?(event: string): void;
  onSearchChange?(query: string): void;
  filterOption?: OptionFilter;
  loading?: boolean;
  nothingFoundMessage?: React.ReactNode;
  virtualized?: boolean;
  virtualizedMaxHeight?: number;
  displayFn?: (value: string) => string;
  renderOption?: (option: Option) => React.ReactNode;
}

const defaultProps: Partial<AutocompleteProps> = {
  dropdownSize: 'medium',
  size: 'medium',
  status: 'basic',
  activeFirst: false,
  dropdownOffset: 8,
  dropdownPosition: 'bottom',
  dropdownAdjustment: 'vertical',
  useCustomInput: false,
  loading: false,
  nothingFoundMessage: 'No options',
  virtualized: false,
  virtualizedMaxHeight: 300
};

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>((props, ref) => {
  const {
    data,
    size,
    status,
    fullWidth,
    disabled,
    prefixIcon,
    suffixIcon,
    dropdownSize,
    dropdownClass,
    dropdownOffset,
    dropdownPanelClass,
    dropdownWidth,
    dropdownPosition,
    dropdownAdjustment,
    displayFn,
    renderOption,
    useCustomInput,
    customHostRef,
    customInputRef,
    activeFirst,
    onDropdownOpen,
    onDropdownClose,
    onChange,
    onSearchChange,
    filterOption,
    loading,
    nothingFoundMessage,
    virtualized,
    virtualizedMaxHeight,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);

  const [customHostElement, setCustomHostElement] = useState<HTMLElement | null>(null);
  const [wrapperRef, { width: measuredWrapperWidth }] = useMeasure<HTMLDivElement>();
  const customHostRect = useMeasureElement<HTMLElement>(customHostElement ?? undefined);
  const _dropdownWidth = useCustomInput ? customHostRect.width : measuredWrapperWidth;
  const internalTriggerRef = useRef<HTMLInputElement>(null);
  const triggerRef = useCustomInput ? customInputRef : internalTriggerRef;

  useEffect(() => {
    setCustomHostElement(useCustomInput ? customHostRef?.current : null);
  }, [useCustomInput, customHostRef]);

  const formattedData = formatData(data, 'active_descendant', activeFirst);
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    optionsAndGroups: formattedData,
    options: getOptionsOnly(formattedData),
    opened: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const isAsyncSearch = typeof onSearchChange === 'function';
  const filteredOptionsAndGroups = isAsyncSearch
    ? autocompleteState.optionsAndGroups
    : filterOptionsAndGroups(autocompleteState.optionsAndGroups, searchQuery, filterOption);
  const visibleOptions = getOptionsOnly(filteredOptionsAndGroups);

  const dir = useNebularDir();
  const uuid = useId();

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setAutocompleteState((state) => ({ ...state, opened: true }));
      typeof onDropdownOpen === 'function' && onDropdownOpen();
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setAutocompleteState((state) => ({ ...state, opened: false }));
      setSearchQuery('');
      typeof onDropdownClose === 'function' && onDropdownClose();
    }
  };

  const { apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    dropdownPosition,
    dropdownAdjustment,
    useCustomInput ? customHostRef.current : triggerRef.current,
    dir,
    dropdownOffset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened: autocompleteState.opened,
    panelClass: dropdownPanelClass
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'focus', show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);
  const {
    onKeyDown: onListKeyDown,
    activeItemIndex,
    setActiveItemIndex
  } = useListKeyManager(visibleOptions, hide, activeFirst ? 0 : -1);
  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      triggerRef.current?.focus();
      hide();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const activeOption = visibleOptions[activeItemIndex];
      if (!activeOption) {
        return;
      }
      optionSelectedHandler(activeOption);
    } else {
      onListKeyDown(event);
    }
  });
  useOverlayKeyboard(keydownHandler, autocompleteState.opened);

  useEffect(() => {
    if (activeItemIndex >= visibleOptions.length) {
      setActiveItemIndex(visibleOptions.length > 0 ? 0 : -1);
    }
  }, [activeItemIndex, visibleOptions.length, setActiveItemIndex]);

  useEffect(() => {
    const _formattedData = formatData(data, 'active_descendant', activeFirst);
    setAutocompleteState((state) => ({
      ...state,
      optionsAndGroups: _formattedData,
      options: getOptionsOnly(_formattedData)
    }));
    setActiveItemIndex(activeFirst ? 0 : -1);
  }, [data, activeFirst, setActiveItemIndex]);

  const optionSelectedHandler = (clickedOption: {
    label?: string;
    value?: string;
    selected?: boolean;
  }) => {
    const optionsAndGroups = autocompleteState.optionsAndGroups.map(copyOptionItem);
    const options = getOptionsOnly(optionsAndGroups).map((option, index) => {
      option.active = !!(index === 0 && activeFirst);

      if (option.label === clickedOption.label && option.value === clickedOption.value) {
        if (!triggerRef.current) {
          return option;
        }

        triggerRef.current.value =
          typeof displayFn === 'function' ? displayFn(option.value) : option.value;
        typeof onChange === 'function' && onChange(option.value);
      }

      return option;
    });

    const selectedIndex = visibleOptions.findIndex(
      (option) => option.label === clickedOption.label && option.value === clickedOption.value
    );
    if (selectedIndex >= 0) {
      setActiveItemIndex(selectedIndex);
    }

    setAutocompleteState((state) => ({ ...state, options, opened: false }));
  };

  const activeVisibleOption = visibleOptions[activeItemIndex];
  const displayOptionsAndGroups = withActiveOption(filteredOptionsAndGroups, activeVisibleOption);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setSearchQuery(nextValue);
    setActiveItemIndex(activeFirst ? 0 : -1);
    typeof onSearchChange === 'function' && onSearchChange(nextValue);
    typeof onChange === 'function' && onChange(nextValue);
  };

  return (
    <>
      {!useCustomInput && (
        <Input
          {...others}
          size={size}
          status={status}
          fullWidth={fullWidth}
          disabled={disabled}
          prefixIcon={prefixIcon}
          suffixIcon={suffixIcon}
          ref={mergeRefs(triggerRef, ref)}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-expanded={autocompleteState.opened}
          aria-owns={autocompleteState.opened ? uuid : undefined}
          aria-activedescendant={
            autocompleteState.opened && autocompleteState.options[activeItemIndex]
              ? autocompleteState.options[activeItemIndex].label
              : undefined
          }
          onChange={handleInputChange}
          fieldRef={wrapperRef}
        />
      )}
      <OptionalPortal withinPortal>
        <div ref={boundingBoxRef} style={{ display: autocompleteState.opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            {loading ? (
              <div
                role="status"
                aria-live="polite"
                style={{ padding: '0.75rem 1rem', textAlign: 'center' }}
              >
                Loading options…
              </div>
            ) : filteredOptionsAndGroups.length > 0 ? (
              <OptionList
                data={displayOptionsAndGroups}
                onOptionSelected={optionSelectedHandler}
                size={dropdownSize}
                keyManagerType="active_descendant"
                className={dropdownClass}
                ariaLabel={props.placeholder ? `${props.placeholder} options` : 'Options'}
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
              <div
                role="status"
                aria-live="polite"
                style={{ padding: '0.75rem 1rem', textAlign: 'center' }}
              >
                {nothingFoundMessage}
              </div>
            )}
          </div>
        </div>
      </OptionalPortal>
    </>
  );
});

Autocomplete.displayName = 'Autocomplete';

export { Autocomplete };
