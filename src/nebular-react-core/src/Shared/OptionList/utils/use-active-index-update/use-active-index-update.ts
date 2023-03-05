import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { DropdownComponentState, OptionInternal } from '../../types';
import { getOptionsOnly } from '../get-options-only/get-options-only';

export function useActiveIndexUpdate<T extends DropdownComponentState>(
  activeItemIndex: number,
  state: T,
  setState: (value: React.SetStateAction<T>) => void
) {
  useEffect(() => {
    const optionsAndGroups = cloneDeep(state.optionsAndGroups);
    const _options = getOptionsOnly(optionsAndGroups);
    const options: OptionInternal[] = [];
    // use for loop instead of map here because we want
    // optionsOnly items have the same references as optionsAndGroups items have
    for (let i = 0; i < _options.length; i++) {
      _options[i].active = activeItemIndex === i;
      options.push(_options[i]);
    }

    setState((current) => ({
      ...current,
      optionsAndGroups,
      options
    }));
  }, [activeItemIndex]);
}
