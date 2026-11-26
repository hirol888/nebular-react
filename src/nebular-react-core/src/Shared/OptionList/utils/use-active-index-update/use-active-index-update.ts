import { useEffect } from 'react';
import { DropdownComponentState, OptionInternal } from '../../types';
import { copyOptionItem } from '../copy-option-item';
import { getOptionsOnly } from '../get-options-only/get-options-only';

export function useActiveIndexUpdate<T extends DropdownComponentState>(
  activeItemIndex: number,
  setState: (value: React.SetStateAction<T>) => void
) {
  useEffect(() => {
    setState((current) => {
      const optionsAndGroups = current.optionsAndGroups.map(copyOptionItem);
      const _options = getOptionsOnly(optionsAndGroups);
      const options: OptionInternal[] = [];

      // Use a for loop instead of map here because we want the options-only
      // items to keep the same references as the optionsAndGroups items.
      for (let i = 0; i < _options.length; i++) {
        _options[i].active = activeItemIndex === i;
        options.push(_options[i]);
      }

      return {
        ...current,
        optionsAndGroups,
        options
      };
    });
  }, [activeItemIndex, setState]);
}
