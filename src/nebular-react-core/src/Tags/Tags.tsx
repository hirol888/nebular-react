import React, { useEffect, useRef, useState } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir,
  createPolymorphicComponent
} from '@nebular-react/styles';
import { mergeRefs, useId, useListKeyManager, useRefEventListener } from '@nebular-react/hooks';
import { OptionInternal, useGroupItems, OptionGroup } from '../Shared';
import { TagsContext } from './Tags.context';
import { Tag } from './Tag';
import useStyles, { TagsStylesParams } from './Tags.style';
import { TagType } from './types';
import type { AutocompleteProps } from '../Autocomplete';
import { formatData } from '../Shared/OptionList/utils';

export type TagsStylesNames = Selectors<typeof useStyles>;

export interface TagsAutocompleteData {
  label: string;
  value: string;
}

export interface TagsProps
  extends DefaultProps<TagsStylesNames, TagsStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  shape?: ComponentShape;
  status?: ComponentOrCustomStatus;
  separatorKeys?: string[];
  withInput?: boolean;
  withAutocomplete?: boolean;
  autocompleteData?: TagsAutocompleteData[];
  inputAriaLabel?: string;
  inputPrefixIcon?: React.ReactNode;
  inputSuffixIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  tags?: (TagType | string)[];
  autocompleteProps?: Omit<
    AutocompleteProps,
    'useCustomInput' | 'customInputRef' | 'customHostRef' | 'onChange'
  >;
  onTagRemove?: (tag: string) => void;
  onTagAdd?: (tagText: string) => void;
  onInputChange?: (value: string) => void;
}

function normalizeAutocompleteData(
  data: (string | OptionInternal | OptionGroup | TagsAutocompleteData)[]
): TagsAutocompleteData[] {
  const entries: TagsAutocompleteData[] = [];

  data.forEach((item) => {
    if (typeof item === 'string') {
      entries.push({ label: item, value: item });
    } else if ('type' in item && item.type === 'group') {
      entries.push(...normalizeAutocompleteData(item.options ?? []));
    } else if ('type' in item && item.type === 'option') {
      const value = item.value ?? item.label ?? '';
      entries.push({ label: item.label ?? String(value), value: String(value) });
    } else if ('label' in item && 'value' in item) {
      entries.push({ label: String(item.label), value: String(item.value) });
    }
  });

  return entries;
}

const defaultProps: Partial<TagsProps> = {
  size: 'medium',
  shape: 'rectangle',
  status: 'basic',
  separatorKeys: ['Enter'],
  withInput: false,
  withAutocomplete: false,
  fullWidth: false,
  disabled: false,
  autocompleteProps: { data: [] }
};

const _Tags = React.forwardRef<HTMLDivElement, TagsProps>((props: TagsProps, ref) => {
  const {
    size,
    shape,
    status,
    separatorKeys,
    withInput,
    withAutocomplete,
    autocompleteData,
    inputAriaLabel = 'Add tag',
    inputPrefixIcon,
    inputSuffixIcon,
    fullWidth,
    disabled,
    tags,
    autocompleteProps,
    onTagRemove,
    onTagAdd,
    onInputChange,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { shape, size, status, withPrefix: !!inputPrefixIcon, withSuffix: !!inputSuffixIcon },
    { name: 'tags', classNames, styles, unstyled }
  );
  const tagValues = tags.map((t) => (typeof t === 'string' ? t : t.tag));

  const tagHostRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const showInput = withInput || withAutocomplete;

  const formattedData = formatData<OptionInternal | OptionGroup>(
    tagValues,
    'active_descendant',
    true
  );
  const { isItemActive: isItemSelected, handleActiveItemChange: handleSelectedItemChange } =
    useGroupItems(false, () => undefined, null);

  const dir = useNebularDir();

  const { activeItemIndex, setActiveItemByIndex, setActiveItemIndex, setLastItemActive } =
    useListKeyManager(formattedData, undefined, -1, dir, undefined, true);

  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
    if (disabled || event.target === inputRef.current) {
      return;
    }

    if (event.key === ' ') {
      handleSelectedItemChange(tagValues[activeItemIndex]);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      if (activeItemIndex > -1) {
        handleTagRemove(tagValues[activeItemIndex]);
      } else {
        setLastItemActive();
      }
    }
  });
  useEffect(() => {
    const host = tagHostRef.current;

    if (!host) {
      return undefined;
    }

    const keydownListener = (event: KeyboardEvent) => {
      keydownHandler.current && keydownHandler.current(event);
    };

    host.addEventListener('keydown', keydownListener);

    return () => {
      host.removeEventListener('keydown', keydownListener);
    };
  }, [keydownHandler]);

  useEffect(() => {
    if (activeItemIndex >= tagValues.length) {
      setActiveItemIndex(tagValues.length - 1);
    }
  }, [tagValues.length, activeItemIndex, setActiveItemIndex]);

  const handleTagSelected = (tag: string) => {
    handleSelectedItemChange(tag);
    setActiveItemByIndex(tagValues.indexOf(tag));
  };

  const handleTagRemove = (tag: string) => {
    typeof onTagRemove === 'function' && onTagRemove(tag);
  };

  const autocompleteEntries =
    autocompleteData ?? normalizeAutocompleteData(autocompleteProps?.data ?? []);
  const autocompleteSuggestions = withAutocomplete
    ? autocompleteEntries.filter(
        (entry) =>
          !tagValues.includes(entry.value) &&
          entry.label.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase())
      )
    : [];

  const handleAutocompleteSelect = (value: string) => {
    if (disabled) {
      return;
    }

    typeof onTagAdd === 'function' && onTagAdd(value);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    typeof onInputChange === 'function' && onInputChange('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    typeof onInputChange === 'function' && onInputChange(event.target.value);
  };

  const isSeparatorKey = (key: string) => separatorKeys.includes(key);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSeparatorKey(event.key) && inputRef.current?.value) {
      typeof onTagAdd === 'function' && onTagAdd(inputRef.current.value);
      inputRef.current.value = '';
      setInputValue('');
      typeof onInputChange === 'function' && onInputChange('');
    }
  };

  const handleBlur = () => {
    setFocused(false);
    setActiveItemIndex(-1);
  };

  const uuid = useId();
  const { 'aria-label': ariaLabel, ...rootProps } = others;

  return (
    <TagsContext.Provider
      value={{
        isItemSelected,
        handleSelectedItemChange,
        handleTagSelected,
        handleTagRemove,
        size,
        disabled
      }}
    >
      <div
        {...rootProps}
        className={cx(classes.root, {
          [classes.tagsWithInput]: showInput,
          [classes.fullWidth]: fullWidth,
          focus: focused
        })}
        ref={mergeRefs(tagHostRef, ref)}
        role="group"
        // The group handles keyboard navigation for the tag list.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
      >
        <div className={cx(classes.tagsWrapper)}>
          <div
            role="listbox"
            aria-label={ariaLabel ?? 'Tags'}
            aria-multiselectable="true"
            aria-disabled={disabled || undefined}
            className={cx(classes.tagsListbox)}
          >
            {tags.map((t, index) => (
              <Tag
                text={typeof t === 'string' ? t : t.tag}
                removable={typeof t === 'string' ? true : t.removable}
                key={`${uuid}-tag-${index}`}
                active={index === activeItemIndex}
                appearance={typeof t === 'string' ? 'filled' : t.appearance}
                status={typeof t === 'string' ? 'basic' : t.status}
              />
            ))}
          </div>
          {showInput && (
            <input
              ref={inputRef}
              onChange={(event) => handleInputChange(event)}
              onKeyDown={handleInputKeyDown}
              className={cx(classes.tagInput)}
              aria-label={inputAriaLabel}
              role={withAutocomplete ? 'combobox' : undefined}
              aria-autocomplete={withAutocomplete ? 'list' : undefined}
              aria-expanded={
                withAutocomplete ? focused && autocompleteSuggestions.length > 0 : undefined
              }
              aria-controls={withAutocomplete ? `${uuid}-autocomplete` : undefined}
              disabled={disabled}
            />
          )}
        </div>
        {withAutocomplete && !disabled && focused && autocompleteSuggestions.length > 0 && (
          <div
            className={cx(classes.autocompleteList)}
            id={`${uuid}-autocomplete`}
            role="listbox"
            aria-label="Suggestions"
          >
            {autocompleteSuggestions.map((entry) => (
              <div
                key={entry.value}
                role="option"
                aria-selected={false}
                // Options are controlled by the parent combobox; -1 keeps them programmatically focusable.
                tabIndex={-1}
                className={cx(classes.autocompleteItem)}
                data-autocomplete-value={entry.value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleAutocompleteSelect(entry.value);
                }}
              >
                {entry.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </TagsContext.Provider>
  );
});

_Tags.displayName = 'Tags';

export const Tags = createPolymorphicComponent<'div', TagsProps>(_Tags);
