import { mergeRefs, useMeasure } from '@nebular-react/hooks';
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated, easings } from '@react-spring/web';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { useAccordionContext } from './Accordion.context';
import { useAccordionItemContext } from './AccordionItem.context';
import useStyles from './AccordionItemBody.style';
import { AccordionItemHeaderStylesParams } from './AccordionItemHeader.style';

export type AccordionItemBodyStylesNames = Selectors<typeof useStyles>;

export interface AccordionItemBodyProps
  extends DefaultProps<AccordionItemBodyStylesNames, AccordionItemHeaderStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {}

const AccordionItemBody: React.FC<AccordionItemBodyProps> = (props) => {
  const { className, children, classNames, styles, unstyled, ...others } = props;
  const { value } = useAccordionItemContext();
  const { isItemActive } = useAccordionContext();
  const [bodyHeight, setBodyHeight] = useState<number>(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyMeasureRef, { height }] = useMeasure<HTMLDivElement>();
  const collapsed = !isItemActive(value);
  const previousCollapsed = useRef<boolean>(collapsed);
  const { classes, cx } = useStyles(
    { collapsed },
    { name: 'accordion-item-body', classNames, styles, unstyled }
  );

  useEffect(() => {
    setBodyHeight(height);
    document.addEventListener('resize', () => setBodyHeight(height));

    return () => {
      document.removeEventListener('resize', () => setBodyHeight(height));
    };
  }, [height]);

  const shouldAnimate = useRef<boolean>(false);

  if (collapsed !== previousCollapsed.current) {
    shouldAnimate.current = true;
  }
  previousCollapsed.current = collapsed;

  const openAnimation = useSpring({
    to: { height: collapsed ? '0px' : `${bodyHeight}px` },
    config: { duration: 300, easing: easings.easeOutExpo }
  });

  return (
    <div className={cx(classes.root, className)} {...others}>
      <animated.div style={shouldAnimate.current ? openAnimation : undefined}>
        <div ref={mergeRefs(bodyRef, bodyMeasureRef)} className={cx(classes.itemBody)}>
          {children}
        </div>
      </animated.div>
    </div>
  );
};

AccordionItemBody.displayName = '@nebular-react/core/AccordionItemBody';

export { AccordionItemBody };
