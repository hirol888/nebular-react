import classNames from 'classnames';
import React, { Children, isValidElement, useState } from 'react';
import { NbIcon } from '../../icon';
import { NbCardBack } from '../shared/CardBack';
import { NbCardFront } from '../shared/CardFront';
import './flip-card.scoped.scss';

interface FlipCardProps {
  showToggleButton?: boolean;
}

const NbFlipCard: React.FC<
  FlipCardProps & React.HTMLAttributes<HTMLDivElement>
> = ({ showToggleButton = true, children, className, ...otherProps }) => {
  const cardFront = Children.toArray(children).find(
    (c) => isValidElement(c) && c.type === NbCardFront
  );

  const cardBack = Children.toArray(children).find(
    (c) => isValidElement(c) && c.type === NbCardBack
  );

  const [flipped, setFlipped] = useState<boolean>(false);

  const toggle = () => {
    setFlipped(!flipped);
  };

  return (
    <div
      className={classNames('nb-flip-card', className, {
        flipped: flipped
      })}
      {...otherProps}
    >
      <div className="flipcard-body">
        <div className="front-container">
          {cardFront}
          {showToggleButton && (
            <a className="flip-button" onClick={toggle}>
              <NbIcon
                icon="chevron-left-outline"
                pack="nebular-essentials"
                aria-hidden="true"
              />
            </a>
          )}
        </div>
        <div className="back-container">
          {cardBack}
          {showToggleButton && (
            <a className="flip-button" onClick={toggle}>
              <NbIcon
                icon="chevron-left-outline"
                pack="nebular-essentials"
                aria-hidden="true"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export { NbFlipCard };
