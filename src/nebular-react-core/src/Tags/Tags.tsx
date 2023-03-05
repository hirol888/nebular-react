import React, { useEffect, useRef, useState } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import { mergeRefs, useId, useListKeyManager, useRefEventListener } from '@nebular-react/hooks';
import { createPolymorphicComponent } from '@mantine/utils';
import { OptionInternal, useGroupItems, OptionGroup } from '../Shared';
import { TagsContext } from './Tags.context';
import { Tag } from './Tag';
import useStyles, { TagsStylesParams } from './Tags.style';
import { TagType } from './types';
import { Autocomplete, AutocompleteProps } from '../Autocomplete';
import { formatData } from '../Shared/OptionList/utils';

export type TagsStylesNames = Selectors<typeof useStyles>;

export interface TagsProps
  extends DefaultProps<TagsStylesNames, TagsStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  shape?: ComponentShape;
  status?: ComponentOrCustomStatus;
  separatorKeys?: string[];
  withInput?: boolean;
  withAutocomplete?: boolean;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedData = formatData<OptionInternal | OptionGroup>(
    tagValues,
    'active_descendant',
    true
  );
  const { isItemActive: isItemSelected, handleActiveItemChange: handleSelectedItemChange } =
    useGroupItems(false, null, null);

  const dir = useNebularDir();

  const { activeItemIndex, setActiveItemByIndex, setActiveItemIndex, setLastItemActive } =
    useListKeyManager(formattedData, null, -1, dir, null, true);

  const keydownHandler = useRefEventListener((event: KeyboardEvent) => {
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
  const keydownListener = (event: KeyboardEvent) => {
    keydownHandler.current && keydownHandler.current(event);
  };

  useEffect(() => {
    if (tagHostRef.current) {
      tagHostRef.current.addEventListener('keydown', keydownListener);
    }

    return () => {
      if (tagHostRef.current) {
        tagHostRef.current.removeEventListener('keydown', keydownListener);
      }
    };
  }, []);

  useEffect(() => {
    if (activeItemIndex >= tagValues.length) {
      setActiveItemIndex(tagValues.length - 1);
    }
  }, [tagValues.length]);

  const handleTagSelected = (tag: string) => {
    handleSelectedItemChange(tag);
    setActiveItemByIndex(tagValues.indexOf(tag));
  };

  const handleTagRemove = (tag: string) => {
    typeof onTagRemove === 'function' && onTagRemove(tag);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    typeof onInputChange === 'function' && onInputChange(event.target.value);
  };

  const isSeparatorKey = (key: string) => separatorKeys.includes(key);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSeparatorKey(event.key) && inputRef.current?.value) {
      typeof onTagAdd === 'function' && onTagAdd(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  const handleBlur = () => {
    setFocused(false);
    setActiveItemIndex(-1);
  };

  const uuid = useId();

  return (
    <TagsContext.Provider
      value={{ isItemSelected, handleSelectedItemChange, handleTagSelected, handleTagRemove, size }}
    >
      <div
        className={cx(classes.root, {
          [classes.tagsWithInput]: withInput,
          [classes.fullWidth]: fullWidth,
          focus: focused
        })}
        ref={mergeRefs(tagHostRef, ref)}
        role="listbox"
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        {...others}
      >
        <div className={cx(classes.tagsWrapper)}>
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
          {withInput && (
            <input
              ref={inputRef}
              onChange={(event) => handleInputChange(event)}
              onKeyDown={handleInputKeyDown}
              className={cx(classes.tagInput)}
            />
          )}
        </div>
      </div>
      {withAutocomplete && (
        <Autocomplete
          useCustomInput
          customHostRef={tagHostRef}
          customInputRef={inputRef}
          onChange={(event) => {
            typeof onTagAdd === 'function' && onTagAdd(event);
            inputRef.current.value = '';
          }}
          {...autocompleteProps}
        />
      )}
    </TagsContext.Provider>
  );
});

_Tags.displayName = '@nebular-react/core/Tags';

export const Tags = createPolymorphicComponent<'div', TagsProps>(_Tags);
