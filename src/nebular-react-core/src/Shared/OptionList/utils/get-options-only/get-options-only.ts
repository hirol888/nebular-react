import { OptionGroup, OptionInternal } from '../../types';

export function getOptionsOnly(optionsAndGroups: (OptionInternal | OptionGroup)[]) {
  const optionsOnly: OptionInternal[] = [];

  // use for loop instead of map here because we want
  // optionsOnly items have the same references as optionsAndGroups items have
  const _getOptionsOnly = (_optionsAndGroups: (OptionInternal | OptionGroup)[]) => {
    for (let i = 0; i < _optionsAndGroups.length; i++) {
      if (_optionsAndGroups[i].type === 'option' && !_optionsAndGroups[i].disabled) {
        optionsOnly.push(_optionsAndGroups[i] as OptionInternal);
      }
      if (_optionsAndGroups[i].type === 'group' && !_optionsAndGroups[i].disabled) {
        _getOptionsOnly((_optionsAndGroups[i] as OptionGroup).options);
      }
    }
  };

  _getOptionsOnly(optionsAndGroups);
  return optionsOnly;
}
