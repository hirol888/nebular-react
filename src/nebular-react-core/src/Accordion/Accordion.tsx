import React from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { useUncontrolled } from '@mantine/hooks';
import { AccordionContext } from './Accordion.context';
import useStyles from './Accordion.style';
import { AccordionItem } from './AccordionItem';
import { AccordionItemHeader } from './AccordionItemHeader';
import { AccordionItemBody } from './AccordionItemBody';
import { ItemValue, useGroupItems } from '../Shared';

export type AccordionStylesNames = Selectors<typeof useStyles>;

export interface AccordionProps<Multiple extends boolean = false>
  extends DefaultProps<AccordionStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  multiple?: boolean;
  expanded?: ItemValue<Multiple>;
  children?: React.ReactNode;
  onChange?(openedItems: ItemValue<Multiple>): void;
}

const defaultProps: Partial<AccordionProps> = {
  multiple: false
};

function Accordion<Multiple extends boolean = false>(props: AccordionProps<Multiple>) {
  const {
    multiple,
    onChange,
    expanded,
    children,
    className,
    unstyled,
    classNames,
    styles,
    ...others
  } = useComponentDefaultProps<AccordionProps<Multiple>>(
    defaultProps as AccordionProps<Multiple>,
    props
  );
  const { classes, cx } = useStyles(null, { name: 'accordion', unstyled, classNames, styles });

  const [_expanded, setExpanded] = useUncontrolled<ItemValue<Multiple>>({
    value: expanded,
    defaultValue: multiple ? ([] as any) : null,
    finalValue: multiple ? ([] as any) : null,
    onChange
  });

  const { isItemActive, handleActiveItemChange } = useGroupItems(multiple, setExpanded, _expanded);

  return (
    <AccordionContext.Provider value={{ multiple, isItemActive, handleActiveItemChange }}>
      <div className={cx(classes.root, className)} {...others}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

Accordion.displayName = '@nebular-react/core/Accordion';
Accordion.Item = AccordionItem;
Accordion.Item.Header = AccordionItemHeader;
Accordion.Item.Body = AccordionItemBody;

export { Accordion };
