import { OptionGroup, OptionInternal } from '../../types';

export type OptionFilter = (option: OptionInternal, query: string) => boolean;

export const defaultOptionFilter: OptionFilter = (option, query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return `${option.label ?? ''} ${option.value ?? ''}`.toLowerCase().includes(normalizedQuery);
};

export function withActiveOption(
  data: (OptionInternal | OptionGroup)[],
  activeOption?: OptionInternal
): (OptionInternal | OptionGroup)[] {
  return data.map((item) => {
    if (item.type === 'group') {
      return {
        ...item,
        options: item.options?.map((option) => ({
          ...option,
          active: option === activeOption
        }))
      };
    }

    return { ...item, active: item === activeOption };
  });
}

export function filterOptionsAndGroups(
  data: (OptionInternal | OptionGroup)[],
  query: string,
  filterOption: OptionFilter = defaultOptionFilter
): (OptionInternal | OptionGroup)[] {
  if (!query.trim()) {
    return data;
  }

  return data.reduce<(OptionInternal | OptionGroup)[]>((result, item) => {
    if (item.type === 'group') {
      const options = (item.options ?? []).filter((option) => filterOption(option, query));

      if (options.length > 0) {
        result.push({ ...item, options });
      }

      return result;
    }

    if (filterOption(item, query)) {
      result.push(item);
    }

    return result;
  }, []);
}
