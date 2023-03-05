import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Icon } from '../Icon';
import { useAccordionContext } from './Accordion.context';
import { useAccordionItemContext } from './AccordionItem.context';
import useStyles, { AccordionItemHeaderStylesParams } from './AccordionItemHeader.style';

export type AccordionItemHeaderStylesNames = Selectors<typeof useStyles>;

export interface AccordionItemHeaderProps
  extends DefaultProps<AccordionItemHeaderStylesNames, AccordionItemHeaderStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {}

const AccordionItemHeader: React.FC<AccordionItemHeaderProps> = (props) => {
  const { className, children, classNames, styles, unstyled, ...others } = props;
  const { disabled, value } = useAccordionItemContext();
  const { isItemActive, handleActiveItemChange } = useAccordionContext();
  const collapsed = !isItemActive(value);
  const { classes, cx } = useStyles(
    { collapsed },
    {
      name: 'accordion-item-header',
      classNames,
      styles,
      unstyled
    }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      handleActiveItemChange(value);
    }
  };

  return (
    <div
      className={cx(classes.root, className)}
      aria-expanded={!collapsed}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && handleActiveItemChange(value)}
      onKeyDown={(event) => !disabled && handleKeyDown(event)}
      {...others}
    >
      {children}
      {!disabled && (
        <Icon
          className={cx(classes.expansionIndicator)}
          icon="chevron-down-outline"
          pack="nebular-essentials"
        />
      )}
    </div>
  );
};

AccordionItemHeader.displayName = '@nebular-react/core/AccordionItemHeader';

export { AccordionItemHeader };
