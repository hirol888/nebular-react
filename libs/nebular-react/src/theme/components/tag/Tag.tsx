import classNames from 'classnames';
import { BACKSPACE, DELETE, FocusableOption, Highlightable } from 'libs/nebular-react/src/core/cdk';
import { uniqueId } from 'lodash';
import React, { KeyboardEvent, useContext, useEffect, useImperativeHandle, useState } from 'react';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';
import { NbIcon } from '../icon';
import { TagListContext } from './TagList.context';

export type NbTagAppearance = 'filled' | 'outline';

export type NbTagProps = {
  text: string;
  selected?: boolean;
  removable?: boolean;
  appearance?: NbTagAppearance;
  status?: NbComponentOrCustomStatus;
  size?: NbComponentSize;
};

export interface NbTagRef extends FocusableOption, Highlightable {
  id: string;
  toggleSelection(): void;
  setSelected(selected: boolean): void;
  remove(): void;
}

const NbTag = React.forwardRef<NbTagRef, NbTagProps>(
  (
    { text: tagText, selected = false, removable = false, appearance = 'filled', status = 'basic', size = 'medium' },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = useState<boolean>(selected);
    const [removableValue, setRemovableValue] = useState<boolean>(removable);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [tagId] = useState<string>(uniqueId('nb-tag-id-'));
    const { handleTagSelect, handleTagRemove } = useContext(TagListContext);

    useEffect(() => {
      setSelectedValue(selected);
    }, [selected]);

    useEffect(() => {
      setRemovableValue(removable);
    }, [removable]);

    useImperativeHandle(ref, () => ({
      setActiveStyles: () => {
        setIsActive(true);
      },
      setInactiveStyles: () => {
        setIsActive(false);
      },
      focus: () => ({}),
      id: tagId,
      toggleSelection: toggleSelection,
      setSelected: (selected: boolean) => {
        setSelectedValue(selected);
      },
      remove: () => remove()
    }));

    const remove = () => {
      if (removableValue) {
        handleTagRemove && handleTagRemove(tagId);
      }
    };

    const keyDownHandler = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.keyCode === DELETE || event.keyCode === BACKSPACE) {
        remove();
      }
    };

    const toggleSelection = () => {
      handleTagSelect && handleTagSelect(!selectedValue, tagId);
      setSelectedValue(!selectedValue);
    };

    return (
      <div
        className={classNames(
          'nb-tag',
          `appearance-${appearance}`,
          `status-${status}`,
          `size-${size}`,
          'nb-transition',
          {
            selected: selectedValue,
            active: isActive
          }
        )}
        id={tagId}
        role="option"
        aria-selected={selectedValue}
        onKeyDown={keyDownHandler}
        onClick={toggleSelection}
      >
        {tagText}
        {removableValue && (
          <NbIcon
            onClick={remove}
            className={classNames('nb-tag-remove', `size-${size}`)}
            icon="close-outline"
            pack="nebular-essentials"
            aria-hidden="true"
          ></NbIcon>
        )}
      </div>
    );
  }
);

export { NbTag };
