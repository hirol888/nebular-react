import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Collapse } from '../Shared/Collapse/Collapse';
import { useAccordionContext } from './Accordion.context';
import { useAccordionItemContext } from './AccordionItem.context';
import useStyles from './AccordionItemBody.style';
import { AccordionItemHeaderStylesParams } from './AccordionItemHeader.style';

export type AccordionItemBodyStylesNames = Selectors<typeof useStyles>;

export interface AccordionItemBodyProps
  extends
    DefaultProps<AccordionItemBodyStylesNames, AccordionItemHeaderStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {}

const AccordionItemBody: React.FC<AccordionItemBodyProps> = (props) => {
  const { className, children, classNames, styles, unstyled, ...others } = props;
  const { value } = useAccordionItemContext();
  const { isItemActive } = useAccordionContext();
  const collapsed = !isItemActive(value);
  const { classes, cx } = useStyles(
    { collapsed },
    { name: 'accordion-item-body', classNames, styles, unstyled }
  );

  return (
    <div className={cx(classes.root, className)} {...others}>
      <Collapse expanded={!collapsed}>
        <div className={cx(classes.itemBody)}>{children}</div>
      </Collapse>
    </div>
  );
};

AccordionItemBody.displayName = 'AccordionItemBody';

export { AccordionItemBody };
