import { KeyManagerType } from '@nebular-react/hooks';
import type { OptionGroup, OptionInternal } from '../../types';
import { copyOptionItem } from '../copy-option-item';

export function formatData<T extends OptionInternal | OptionGroup>(
  data: (string | T)[],
  keyManagerType: KeyManagerType = 'focus',
  activeFirst: boolean = false
) {
  return data
    ? data.map((item, index) =>
        typeof item === 'string'
          ? ({
              type: 'option',
              label: item,
              value: item,
              disabled: false,
              selected: false,
              active:
                keyManagerType === 'active_descendant' ? !!(activeFirst && index === 0) : false
            } as T)
          : {
              ...copyOptionItem(item),
              active:
                keyManagerType === 'active_descendant' ? !!(activeFirst && index === 0) : false
            }
      )
    : [];
}
