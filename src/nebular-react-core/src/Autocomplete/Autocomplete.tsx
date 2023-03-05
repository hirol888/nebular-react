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
  useMeasureElement,
  UseMeasureRef
} from '@nebular-react/hooks';
import { cloneDeep } from 'lodash';
import { Input } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { DropdownComponentState, OptionList, OptionInternal, OptionGroup } from '../Shared';
import { BaseInputProps } from '../Input/Input';
import { formatData, getOptionsOnly, useActiveIndexUpdate } from '../Shared/OptionList/utils';

interface AutocompleteState extends DropdownComponentState {}

export interface AutocompleteProps
  extends DefaultProps,
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
  customInputRef?: React.RefObject<HTMLInputElement>;
  customHostRef?: React.RefObject<HTMLElement>;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  onChange?(event: string): void;
  displayFn?: (value: string) => string;
}

const defaultProps: Partial<AutocompleteProps> = {
  dropdownSize: 'medium',
  size: 'medium',
  status: 'basic',
  activeFirst: false,
  dropdownOffset: 8,
  dropdownPosition: 'bottom',
  dropdownAdjustment: 'vertical',
  useCustomInput: false
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
    useCustomInput,
    customHostRef,
    customInputRef,
    activeFirst,
    onDropdownOpen,
    onDropdownClose,
    onChange,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);

  let wrapperRef: UseMeasureRef<HTMLDivElement>;
  let _dropdownWidth: number;
  if (!useCustomInput) {
    [wrapperRef, { width: _dropdownWidth }] = useMeasure<HTMLDivElement>();
  } else {
    customHostRef &&
      ({ width: _dropdownWidth } = useMeasureElement<HTMLElement>(customHostRef.current));
  }

  const formattedData = formatData(data, 'active_descendant', activeFirst);
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    optionsAndGroups: formattedData,
    options: getOptionsOnly(formattedData),
    opened: false
  });

  useEffect(() => {
    const _formattedData = formatData(data, 'active_descendant', activeFirst);
    setAutocompleteState((state) => ({
      ...state,
      optionsAndGroups: _formattedData,
      options: getOptionsOnly(_formattedData)
    }));
    setActiveItemIndex(activeFirst ? 0 : -1);
  }, [data, activeFirst]);

  const triggerRef = useCustomInput ? customInputRef : useRef<HTMLInputElement>(null);

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
  } = useListKeyManager(autocompleteState.options, hide, activeFirst ? 0 : -1);
  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      triggerRef.current?.focus();
      hide();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const activeOption = autocompleteState.options.find((option) => option.active);
      if (!activeOption) {
        return;
      }
      optionSelectedHandler(activeOption);
    } else {
      activeFirst && onListKeyDown(event);
    }
  });
  useOverlayKeyboard(keydownHandler, autocompleteState.opened);
  useActiveIndexUpdate(activeItemIndex, autocompleteState, setAutocompleteState);

  const optionSelectedHandler = (clickedOption: {
    label?: string;
    value?: string;
    selected?: boolean;
  }) => {
    const optionsAndGroups = cloneDeep(autocompleteState.optionsAndGroups);
    const options = getOptionsOnly(optionsAndGroups).map((option, index) => {
      option.active = !!(index === 0 && activeFirst);

      if (option.label === clickedOption.label && option.value === clickedOption.value) {
        triggerRef.current.value =
          typeof displayFn === 'function' ? displayFn(option.value) : option.value;
        typeof onChange === 'function' && onChange(option.value);
      }

      return option;
    });

    setAutocompleteState((state) => ({ ...state, options, opened: false }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    typeof onChange === 'function' && onChange(event.target.value);
  };

  return (
    <>
      {!useCustomInput && (
        <Input
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
          {...others}
        />
      )}
      <OptionalPortal withinPortal>
        <div ref={boundingBoxRef} style={{ display: autocompleteState.opened ? 'flex' : 'none' }}>
          <div ref={paneRef} className="overlay-pane">
            <OptionList
              data={autocompleteState.optionsAndGroups}
              onOptionSelected={optionSelectedHandler}
              size={dropdownSize}
              keyManagerType="active_descendant"
              className={dropdownClass}
              style={dropdownWidth > 0 ? {} : { width: `${_dropdownWidth}px` }}
            />
          </div>
        </div>
      </OptionalPortal>
    </>
  );
});

Autocomplete.displayName = '@nebular-react/core/Autocomplete';

export { Autocomplete };
