import { cloneDeep } from 'lodash';
import { KeyManagerType } from '@nebular-react/hooks';

export function formatData<T>(
  data: (string | T)[],
  keyManagerType: KeyManagerType = 'focus',
  activeFirst: boolean = false
) {
  return data
    ? cloneDeep(data).map((item, index) =>
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
              ...item,
              active:
                keyManagerType === 'active_descendant' ? !!(activeFirst && index === 0) : false
            }
      )
    : [];
}
