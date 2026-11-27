import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  mergeRefs,
  useFlexibleConnectedPositionStrategy,
  useListKeyManager,
  useMeasure,
  useOverlay
} from '@nebular-react/hooks';
import { createStyles, DefaultProps, Selectors, useNebularDir } from '@nebular-react/styles';
import { Input, InputProps } from '../Input';
import { OptionalPortal } from '../OptionalPortal';
import { OptionList } from '../Shared/OptionList';

const useStyles = createStyles(() => ({
  root: { minWidth: 0 },
  status: {
    padding: 'var(--combobox-popup-padding, 0.5rem 0.75rem)',
    color: 'var(--text-basic-color, #222b45)',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  }
}));

export interface ComboboxOption {
  /** Unique option identity within the options array. */
  value: string;
  label: string;
  disabled?: boolean;
}

export type ComboboxStylesNames = Selectors<typeof useStyles>;
export type ComboboxInputProps = InputProps & React.RefAttributes<HTMLInputElement>;

export interface ComboboxProps
  extends
    DefaultProps<ComboboxStylesNames>,
    Omit<InputProps, keyof DefaultProps | 'value' | 'defaultValue' | 'onChange'> {
  options: readonly ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (query: string) => void;
  filterOption?: ((option: ComboboxOption, query: string) => boolean) | false;
  renderInput?: (props: ComboboxInputProps) => React.ReactNode;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  listLabel?: string;
  emptyLabel?: React.ReactNode;
  loadingLabel?: React.ReactNode;
  loading?: boolean;
  virtualized?: boolean;
}

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim());

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    options,
    value,
    defaultValue,
    onChange,
    inputValue,
    defaultInputValue,
    onInputChange,
    filterOption = defaultFilter,
    renderInput,
    renderOption,
    listLabel = 'Options',
    emptyLabel = 'No options',
    loadingLabel = 'Loading options…',
    loading = false,
    virtualized,
    disabled,
    readOnly,
    className,
    classNames,
    styles,
    unstyled,
    style,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    fieldRef,
    ...otherInputProps
  } = props;
  const { classes, cx } = useStyles(null, { name: 'combobox', classNames, styles, unstyled });
  const [selected, setSelected] = useUncontrolled({ value, defaultValue, finalValue: null });
  const [draft, setDraft] = useState<string | null>(defaultInputValue ?? null);
  const [opened, setOpened] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const [measureRef, { width }] = useMeasure<HTMLDivElement>();
  const listId = useId();
  const dir = useNebularDir();
  const { apply, paneRef, boundingBoxRef, appliedPosition } = useFlexibleConnectedPositionStrategy(
    'bottom',
    'vertical',
    anchorRef.current,
    dir,
    4
  );
  const isOpen = opened && !disabled && !readOnly;
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    opened: isOpen,
    scrollStrategy: 'reposition',
    width: width || undefined
  });

  const query = inputValue ?? draft ?? '';
  const inputText =
    inputValue ?? draft ?? options.find((option) => option.value === selected)?.label ?? '';
  const visible =
    loading || filterOption === false
      ? options
      : options.filter((option) => filterOption(option, query));
  const hasOptions = !loading && visible.length > 0;
  const visibleByValue = new Map(visible.map((option) => [option.value, option]));
  const optionId = (optionValue: string) => `${listId}-${encodeURIComponent(optionValue)}`;
  const { activeItemIndex, setActiveItemIndex, setNextItemActive, setPreviousItemActive } =
    useListKeyManager(loading ? [] : [...visible], undefined, -1);
  const activeOption = visible[activeItemIndex];
  const activeId =
    isOpen && hasOptions && activeOption && !activeOption.disabled
      ? optionId(activeOption.value)
      : undefined;

  useEffect(() => {
    if (!virtualized && activeId) {
      anchorRef.current?.ownerDocument
        .getElementById(activeId)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeId, virtualized]);

  const close = () => {
    setOpened(false);
    setActiveItemIndex(-1);
  };

  const select = (option: ComboboxOption | undefined) => {
    if (!option || option.disabled || disabled || readOnly) {
      return;
    }
    setSelected(option.value);
    setDraft(null);
    onChange?.(option.value);
    onInputChange?.(option.label);
    close();
  };

  const inputProps: ComboboxInputProps = {
    ...otherInputProps,
    fieldRef: mergeRefs(fieldRef, measureRef),
    ref: mergeRefs(ref, anchorRef),
    disabled,
    readOnly,
    value: inputText,
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': isOpen && hasOptions,
    'aria-busy': isOpen && loading ? true : undefined,
    'aria-controls': isOpen && hasOptions ? listId : undefined,
    'aria-activedescendant': activeId,
    onFocus: (event) => {
      onFocus?.(event);
      if (!event.defaultPrevented) {
        setOpened(true);
      }
    },
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpened(true);
      }
    },
    onBlur: (event) => {
      onBlur?.(event);
      close();
    },
    onChange: (event) => {
      setDraft(event.currentTarget.value);
      onInputChange?.(event.currentTarget.value);
      setActiveItemIndex(-1);
      setOpened(true);
    },
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing || disabled || readOnly) {
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          return;
        }
        event.preventDefault();
        setOpened(true);
        if (event.key === 'ArrowDown') {
          setNextItemActive();
        } else {
          setPreviousItemActive();
        }
      } else if (event.key === 'Enter' && activeId) {
        event.preventDefault();
        select(activeOption);
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }
  };

  return (
    <div style={style} className={cx(classes.root, className)}>
      {renderInput ? renderInput(inputProps) : <Input {...inputProps} />}
      <OptionalPortal withinPortal>
        <div
          ref={boundingBoxRef}
          style={{ display: isOpen ? 'flex' : 'none' }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <div ref={paneRef} className="overlay-pane">
            {isOpen &&
              (hasOptions ? (
                <OptionList
                  listId={listId}
                  data={visible.map((option, index) => ({
                    ...option,
                    type: 'option',
                    active: index === activeItemIndex && !option.disabled,
                    selected: option.value === selected
                  }))}
                  size={otherInputProps.size}
                  position={appliedPosition}
                  ariaLabel={listLabel}
                  keyManagerType="active_descendant"
                  virtualized={virtualized}
                  getOptionProps={(option) => {
                    const item = visibleByValue.get(option.value);
                    return {
                      id: optionId(option.value),
                      'aria-label': option.label,
                      children: item && renderOption?.(item)
                    };
                  }}
                  onOptionSelected={({ value: nextValue }) =>
                    select(nextValue === undefined ? undefined : visibleByValue.get(nextValue))
                  }
                />
              ) : (
                <div role="status" className={cx(classes.status)}>
                  {loading ? loadingLabel : emptyLabel}
                </div>
              ))}
          </div>
        </div>
      </OptionalPortal>
    </div>
  );
});

Combobox.displayName = 'Combobox';
