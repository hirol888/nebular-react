import React, { forwardRef, ReactNode, useEffect, useRef, useState } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  SelectAppearance,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
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
import { cloneDeep } from 'lodash';
import { createPolymorphicComponent } from '@mantine/utils';
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
import { formatData, getOptionsOnly, useActiveIndexUpdate } from '../Shared/OptionList/utils';

export type SelectStylesNames = Selectors<typeof useStyles>;

interface SelectState extends DropdownComponentState {
  selectedOptions: OptionInternal[];
  selectedValues: any[];
  selectedText: string;
}

export interface SelectProps
  extends DefaultProps<SelectStylesNames, SelectStylesParams>,
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
  customLabel?: ReactNode;
  icon?: ReactNode;
  onSelect?(selectedOptions: string | string[] | Option | Option[]): void;
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
  initiallyOpened: false
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
    customLabel,
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

  const [selectState, setSelectState] = useState<SelectState>({
    optionsAndGroups: formattedData,
    options: getOptionsOnly(formattedData),
    selectedOptions: formattedInitialSelected,
    selectedValues: formattedInitialSelected.map((x) => x.value),
    selectedText: formattedInitialSelected.map((x) => x.label).join(', '),
    opened: false
  });

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
  } = useListKeyManager(selectState.options, hide);
  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
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
  useActiveIndexUpdate(activeItemIndex, selectState, setSelectState);

  const optionSelectedHandler = (clickedOption: {
    label?: string;
    value?: string;
    selected?: boolean;
  }) => {
    const optionsAndGroups = cloneDeep(selectState.optionsAndGroups);
    const _options = getOptionsOnly(optionsAndGroups).map((option, index) => {
      if (option.label === clickedOption.label && option.value === clickedOption.value) {
        option.selected = allowDeselect || multiple ? clickedOption.selected : true;
        option.active = true;
        setActiveItemIndex(index);
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

    typeof onSelect === 'function' &&
      onSelect(
        multiple
          ? selectedOptions.map((x) => (typeof options[0] === 'string' ? x.value : x))
          : selectedOptions.length > 0
          ? typeof options[0] === 'string'
            ? selectedOptions[0].value
            : selectedOptions[0]
          : null
      );
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
          className={cx(classes.selectButton, { [classes.disabled]: disabled })}
          disabled={disabled}
          ref={mergeRefs(triggerRef, focusRef)}
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
        <OptionalPortal withinPortal>
          <div ref={boundingBoxRef} style={{ display: selectState.opened ? 'flex' : 'none' }}>
            <div ref={paneRef} className="overlay-pane">
              <OptionList
                data={selectState.optionsAndGroups}
                onOptionSelected={optionSelectedHandler}
                multiple={multiple}
                size={size}
                className={dropdownClass}
                keyManagerType="focus"
                style={dropdownWidth > 0 ? {} : { width: `${_dropdownWidth}px` }}
              />
            </div>
          </div>
        </OptionalPortal>
      </div>
    </FormField>
  );
});

_Select.displayName = '@nebular-react/core/Select';

export const Select = createPolymorphicComponent<'div', SelectProps>(_Select);
