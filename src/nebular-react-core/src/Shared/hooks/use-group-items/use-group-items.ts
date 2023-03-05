import { useEffect, useState } from 'react';

export type ItemValue<Multiple extends boolean> = Multiple extends true ? string[] : string | null;

export function useGroupItems<Multiple extends boolean = false>(
  multiple: boolean,
  onChange: (activeItems: ItemValue<Multiple>) => void,
  initialActiveItems?: ItemValue<Multiple>
) {
  const [activeItems, setActiveItems] = useState<ItemValue<Multiple>>(
    initialActiveItems || (multiple ? ([] as any) : null)
  );

  useEffect(() => {
    setActiveItems(initialActiveItems || (multiple ? ([] as any) : null));
  }, [initialActiveItems]);

  const isItemActive = (itemValue: string) =>
    Array.isArray(activeItems) ? activeItems.includes(itemValue) : itemValue === activeItems;

  const handleActiveItemChange = (itemValue: string) => {
    const newOpenedItems: ItemValue<Multiple> = Array.isArray(activeItems)
      ? activeItems.includes(itemValue)
        ? activeItems.filter((selectedItem) => selectedItem !== itemValue)
        : [...activeItems, itemValue]
      : itemValue === activeItems
      ? null
      : (itemValue as any);

    setActiveItems(newOpenedItems);
    typeof onChange === 'function' && onChange(newOpenedItems);
  };

  return { isItemActive, handleActiveItemChange };
}
