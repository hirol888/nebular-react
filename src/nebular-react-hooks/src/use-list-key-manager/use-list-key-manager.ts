import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { Direction } from '@nebular-react/styles';
import { hasModifierKey, ModifierKey } from '../utils';

export type KeyManagerType = 'focus' | 'active_descendant';

export interface ListOption {
  label?: string;
  disabled?: boolean;
}

export function useListKeyManager<T extends ListOption>(
  items: T[],
  tabOutHandler?: () => void,
  defaultActiveItemIndex = 0,
  /**
   * Configures the key manager to move the selection horizontally.
   * Passing in `null` will disable horizontal movement.
   */
  dir: Direction | null = null,
  /**
   * Sets the predicate function that determines which items should be skipped by the
   * list key manager.
   */
  skipPredicate?: (item: T) => boolean,
  /**
   * Configures wrapping mode, which determines whether the active item will wrap to
   * the other end of list when there are no more items in the given direction.
   */
  wrap = true,
  /**
   * Configures whether the key manager should be able to move the selection vertically.
   */
  verticalEnabled = true,
  /**
   * Modifier keys which are allowed to be held down and whose default actions will be prevented
   * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
   */
  allowedModifierKeys: ModifierKey[] = [],
  /**
   * Configures the key manager to activate the first and last items
   * respectively when the Home or End key is pressed.
   */
  homeAndEndEnabled = true,
  /**
   * Typeahead mode which allows users to set the active item by typing.
   */
  typeAheadDebounce = 200
) {
  const pressedLetters = useRef<string[]>([]);
  const defaultSkipPredicateFn = (item: T): boolean => item.disabled;
  const _skipPredicateFn = skipPredicate || defaultSkipPredicateFn;
  const [activeItemIndex, setActiveItemIndex] = useState<number>(defaultActiveItemIndex);
  // const activeItemIndexRef = useRef<number>(activeItemIndex);
  const itemsRef = useRef<T[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const typeAhead = () => {
    if (pressedLetters.current.length < 1) {
      return;
    }

    const inputString = pressedLetters.current.join('');

    // Start at 1 because we want to start searching at the item immediately
    // following the current active item.
    for (let i = 1; i < itemsRef.current.length + 1; i++) {
      const index = (activeItemIndex + i) % itemsRef.current.length;
      const item = itemsRef.current[index];

      if (
        item &&
        !_skipPredicateFn(item) &&
        item.label.toUpperCase().trim().indexOf(inputString) === 0
      ) {
        setActiveItemIndex(index);
        break;
      }
    }

    pressedLetters.current = [];
  };

  const debouncedTypeAhead = debounce(typeAhead, typeAheadDebounce);

  const onKeyDown = (event: KeyboardEvent) => {
    const modifiers: ModifierKey[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    const isModifierAllowed = modifiers.every(
      (modifier) => !event[modifier] || allowedModifierKeys.indexOf(modifier) > -1
    );

    switch (event.key) {
      case 'Tab':
        tabOutHandler && tabOutHandler();
        return;

      case 'ArrowDown':
        if (verticalEnabled && isModifierAllowed) {
          setNextItemActive();
          break;
        } else {
          return;
        }

      case 'ArrowUp':
        if (verticalEnabled && isModifierAllowed) {
          setPreviousItemActive();
          break;
        } else {
          return;
        }

      case 'ArrowRight':
        if (verticalEnabled && isModifierAllowed) {
          dir === 'rtl' ? setPreviousItemActive() : setNextItemActive();
          break;
        } else {
          return;
        }

      case 'ArrowLeft':
        if (dir && isModifierAllowed) {
          dir === 'rtl' ? setNextItemActive() : setPreviousItemActive();
          break;
        } else {
          return;
        }

      case 'Home':
        if (homeAndEndEnabled && isModifierAllowed) {
          setFirstItemActive();
          break;
        } else {
          return;
        }

      case 'End':
        if (homeAndEndEnabled && isModifierAllowed) {
          setLastItemActive();
          break;
        } else {
          return;
        }

      default:
        if (isModifierAllowed || hasModifierKey(event, 'shiftKey')) {
          if (event.key && event.key.length === 1) {
            pressedLetters.current.push(event.key.toLocaleUpperCase());
            debouncedTypeAhead();
          }
        }

        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }

    pressedLetters.current = [];
    event.preventDefault();
  };

  const setNextItemActive = () => {
    activeItemIndex < 0 ? setFirstItemActive() : setActiveItemByDelta(1);
  };

  const setPreviousItemActive = () => {
    activeItemIndex < 0 && wrap ? setLastItemActive() : setActiveItemByDelta(-1);
  };

  const setFirstItemActive = () => {
    setActiveItemByIndex(0, 1);
  };

  const setLastItemActive = () => {
    setActiveItemByIndex(itemsRef.current.length - 1, -1);
  };

  const setActiveItemByIndex = (index: number, fallbackDelta: -1 | 1 = 1) => {
    if (!itemsRef.current[index]) {
      return;
    }

    while (_skipPredicateFn(itemsRef.current[index])) {
      index += fallbackDelta;

      if (!itemsRef.current[index]) {
        return;
      }
    }

    setActiveItemIndex(index);
  };

  const setActiveItemByDelta = (delta: -1 | 1) => {
    wrap ? setActiveInWrapMode(delta) : setActiveInDefaultMode(delta);
  };

  const setActiveInWrapMode = (delta: -1 | 1) => {
    for (let i = 1; i < itemsRef.current.length; i++) {
      const index =
        (activeItemIndex + delta * i + itemsRef.current.length) % itemsRef.current.length;
      const item = itemsRef.current[index];

      if (!_skipPredicateFn(item)) {
        setActiveItemIndex(index);
        return;
      }
    }
  };

  const setActiveInDefaultMode = (delta: -1 | 1) => {
    setActiveItemByIndex(activeItemIndex + delta, delta);
  };

  // const setActiveItemIndex = (index: number) => {
  //   activeItemIndexRef.current = index;
  //   _setActiveItemIndex(index);
  // }

  return {
    onKeyDown,
    activeItemIndex,
    setActiveItemIndex,
    setPreviousItemActive,
    setNextItemActive,
    setFirstItemActive,
    setLastItemActive,
    setActiveItemByIndex
  };
}
