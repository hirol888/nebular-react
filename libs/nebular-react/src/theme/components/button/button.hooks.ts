import { isValidElement, JSXElementConstructor, useEffect, useState } from "react";

/**
 * Custom hook for setting tabIndex
 * @param disabled
 * @param tabIndex
 * @returns
 */
export function useTabIndexState(
  disabled: boolean,
  tabIndex?: number
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [tabIndexValue, setTabIndexValue] = useState<number>(tabIndex ?? 0);

  useEffect(() => {
    if (disabled) setTabIndexValue(-1);
    else setTabIndexValue(tabIndex ?? 0);
  }, [disabled]);

  return [tabIndexValue, setTabIndexValue];
}

/**
 * Check if the child is iconType
 * @param child
 * @param iconType
 * @returns
 */
export function isIconExist(
  child: React.ReactChild | React.ReactFragment | React.ReactPortal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconType: string | JSXElementConstructor<any>
) {
  return isValidElement(child) && child.type === iconType;
}