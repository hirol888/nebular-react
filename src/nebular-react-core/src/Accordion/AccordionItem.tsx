import React from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { AccordionItemContext } from './AccordionItem.context';
import useStyles from './AccordionItem.style';
import { AccordionItemHeader } from './AccordionItemHeader';
import { AccordionItemBody } from './AccordionItemBody';
import { useAccordionContext } from './Accordion.context';

export type AccordionItemStylesNames = Selectors<typeof useStyles>;

export interface AccordionItemProps
  extends DefaultProps<AccordionItemStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  value: string;
  disabled?: boolean;
  header: React.ReactNode;
  body: React.ReactNode;
}

const defaultProps: Partial<AccordionItemProps> = {
  disabled: false
};

function AccordionItem(props: AccordionItemProps) {
  const { value, disabled, header, body, className, classNames, unstyled, styles, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { isItemActive } = useAccordionContext();
  const collapsed = !isItemActive(value);
  const { classes, cx } = useStyles(null, { name: 'accordion-item', unstyled, classNames, styles });

  return (
    <AccordionItemContext.Provider value={{ disabled, value }}>
      <div className={cx(classes.root, className, { collapsed, disabled })} {...others}>
        {header}
        {body}
      </div>
    </AccordionItemContext.Provider>
  );
}

AccordionItem.displayName = '@nebular-react/core/AccordionItem';
AccordionItem.Header = AccordionItemHeader;
AccordionItem.Body = AccordionItemBody;

export { AccordionItem };
