import type { OptionGroup, OptionInternal } from '../types';

export function copyOptionItem<T extends OptionInternal | OptionGroup>(item: T): T {
  if (item.type === 'group' && item.options) {
    return { ...item, options: item.options.map(copyOptionItem) };
  }

  return { ...item };
}
