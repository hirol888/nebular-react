import classNames from 'classnames';
import React, { Children, isValidElement, useState } from 'react';
import { NbIcon } from '../../icon';
import { NbCardBack } from '../shared/CardBack';
import { NbCardFront } from '../shared/CardFront';
import './reveal-card.scoped.scss';

interface RevealCardProps {
  showToggleButton?: boolean;
}

const NbRevealCard: React.FC<
  RevealCardProps & React.HTMLAttributes<HTMLDivElement>
> = ({ showToggleButton = true, children, className, ...otherProps }) => {
  const cardFront = Children.toArray(children).find(
    (c) => isValidElement(c) && c.type === NbCardFront
  );

  const cardBack = Children.toArray(children).find(
    (c) => isValidElement(c) && c.type === NbCardBack
  );

  const [revealed, setRevealed] = useState<boolean>(false);

  const toggle = () => {
    setRevealed(!revealed);
  };

  return (
    <div
      className={classNames('nb-reveal-card', className, {
        revealed: revealed
      })}
      {...otherProps}
    >
      {cardFront}
      <div className="second-card-container">{cardBack}</div>
      {showToggleButton && (
        <a className="reveal-button" onClick={toggle}>
          <NbIcon
            icon="chevron-down-outline"
            pack="nebular-essentials"
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  );
};

export { NbRevealCard };
