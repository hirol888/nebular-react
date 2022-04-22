import classNames from 'classnames';
import React, { Children, isValidElement } from 'react';
import { NbCard } from '../Card';

/**
 * Component intended to be used within the `<NbCardFront>` and `<NbCardReveal>` components.
 *
 * Use it as a container for the front card.
 */
const NbCardBack: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...otherProps
}) => {
  const card = Children.toArray(children).find(
    (c) => isValidElement(c) && c.type === NbCard
  );
  return (
    <div className={classNames('nb-card-back', className)} {...otherProps}>
      {card}
    </div>
  );
};

export { NbCardBack };
