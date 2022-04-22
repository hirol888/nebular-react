import {
  NbComponentOrCustomStatus,
  NbComponentSize,
  NbComponentStatus,
  NbCard,
  NbCardBack,
  NbCardBody,
  NbCardFooter,
  NbCardFront,
  NbCardHeader,
  NbFlipCard,
  NbRevealCard
} from '@nebular-react';
import React from 'react';

const CardTest: React.FC = () => {
  const sizes: NbComponentSize[] = [
    'tiny',
    'small',
    'medium',
    'large',
    'giant'
  ];
  const statuses: NbComponentOrCustomStatus[] = [
    'primary',
    'success',
    'info',
    'warning',
    'danger'
  ];
  const accents: NbComponentStatus[] = [
    'primary',
    'success',
    'info',
    'warning',
    'danger'
  ];

  const cards: { size: NbComponentSize; status: NbComponentOrCustomStatus }[] =
    [];
  statuses.forEach((status) => {
    sizes.forEach((size) => {
      cards.push({
        size,
        status
      });
    });
  });

  const accentCards: {
    status: NbComponentOrCustomStatus;
    accent: NbComponentStatus;
  }[] = [];
  statuses.forEach((status) => {
    accents.forEach((accent) => {
      accentCards.push({
        status,
        accent
      });
    });
  });

  const revealFlipCards: { size: NbComponentSize }[] = [];
  sizes.forEach((size) => {
    revealFlipCards.push({
      size
    });
  });

  return (
    <>
      {cards.map((card) => {
        return (
          <NbCard size={card.size} status={card.status}>
            <NbCardHeader>
              <span>Header</span>
            </NbCardHeader>
            {card.size !== 'tiny' && (
              <NbCardBody>
                <span>Body</span>
              </NbCardBody>
            )}
            {card.size !== 'tiny' && (
              <NbCardFooter>
                <span>Footer</span>
              </NbCardFooter>
            )}
          </NbCard>
        );
      })}
      <h3>Accent Cards</h3>
      {accentCards.map((card) => {
        return (
          <NbCard size="small" status={card.status} accent={card.accent}>
            <NbCardHeader>
              <span>Header</span>
            </NbCardHeader>
            <NbCardBody>
              <span>Body</span>
            </NbCardBody>
            <NbCardFooter>
              <span>Footer</span>
            </NbCardFooter>
          </NbCard>
        );
      })}
      <h3>Reveal Cards</h3>
      {revealFlipCards.map((rfCard) => {
        return (
          <NbRevealCard>
            <NbCardFront>
              <NbCard size={rfCard.size}>
                {rfCard.size !== 'tiny' && (
                  <NbCardHeader>
                    <span>Front Header</span>
                  </NbCardHeader>
                )}
                <NbCardBody>
                  <span>Front Reveal Card Body</span>
                </NbCardBody>
                {rfCard.size !== 'tiny' && (
                  <NbCardFooter>
                    <span>Front Footer</span>
                  </NbCardFooter>
                )}
              </NbCard>
            </NbCardFront>
            <NbCardBack>
              <NbCard size={rfCard.size}>
                {rfCard.size !== 'tiny' && (
                  <NbCardHeader>
                    <span>Back Header</span>
                  </NbCardHeader>
                )}
                <NbCardBody>
                  <span>Back Reveal Card Body</span>
                </NbCardBody>
                {rfCard.size !== 'tiny' && (
                  <NbCardFooter>
                    <span>Back Footer</span>
                  </NbCardFooter>
                )}
              </NbCard>
            </NbCardBack>
          </NbRevealCard>
        );
      })}
      <h3>Flip Cards</h3>
      {revealFlipCards.map((rfCard) => {
        return (
          <NbFlipCard>
            <NbCardFront>
              <NbCard size={rfCard.size}>
                {rfCard.size !== 'tiny' && (
                  <NbCardHeader>
                    <span>Front Header</span>
                  </NbCardHeader>
                )}
                <NbCardBody>
                  <span>Front Flip Card Body</span>
                </NbCardBody>
                {rfCard.size !== 'tiny' && (
                  <NbCardFooter>
                    <span>Front Footer</span>
                  </NbCardFooter>
                )}
              </NbCard>
            </NbCardFront>
            <NbCardBack>
              <NbCard size={rfCard.size}>
                {rfCard.size !== 'tiny' && (
                  <NbCardHeader>
                    <span>Back Header</span>
                  </NbCardHeader>
                )}
                <NbCardBody>
                  <span>Back Flip Card Body</span>
                </NbCardBody>
                {rfCard.size !== 'tiny' && (
                  <NbCardFooter>
                    <span>Back Footer</span>
                  </NbCardFooter>
                )}
              </NbCard>
            </NbCardBack>
          </NbFlipCard>
        );
      })}
    </>
  );
};

export default CardTest;
