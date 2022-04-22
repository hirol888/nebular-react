import React, { Children, isValidElement, useState } from "react";
import { NbOption, NbOptionRef } from "./Option";
import { NbOptionGroup } from "./OptionGroup";

/**
 * optionElements hook
 * @param children
 * @param optionChangeHandler
 * @returns
 */
export function useOptionElements(
  children: React.ReactNode
): [
    React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined,
    React.Dispatch<React.SetStateAction<React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined>>
  ] {
  const _optionElements = getOptionElementsRecursive(children);
  const [optionElements, setOptionElements] = useState<
    React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined
  >(_optionElements);

  return [optionElements, setOptionElements];
}

/**
 * Maps children to option elements, add option change handler callback.
 * @param children
 * @param optionChangeHandler
 * @returns
 */
export function getOptionElementsRecursive(children: React.ReactNode) {
  const mapOptionElements = (
    _children: React.ReactNode
  ): React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | null | undefined => {
    return Children.map(_children, (child) => {
      if (isValidElement(child) && child.type === NbOption) {
        return cloneOptionElement(child);
      }
      if (isValidElement(child) && child.type === NbOptionGroup) {
        return React.cloneElement(child, {
          ...child.props,
          children: mapOptionElements(child.props.children as React.ReactNode)
        });
      }
      return null;
    });
  };

  return mapOptionElements(children)?.filter((o) => !!o);
}

/**
 * Clone option element from child, add option change handler callback
 * Add optionRef to new element.
 */
const cloneOptionElement = (child: React.ReactElement) => {
  const optionRef = React.createRef<NbOptionRef>();

  return React.cloneElement(child, {
    ...child.props,
    ref: optionRef
  });
};