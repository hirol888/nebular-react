/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NbCard, NbCardBack, NbCardFront, NbFlipCard } from '..';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'inversify-react';
import { container } from 'libs/nebular-react/src/ioc';

describe('NbFlipCard', () => {
  it('should toggle flipped status', () => {
    const { unmount } = render(
      <Provider container={container}>
        <NbFlipCard data-testid="flipcard">
          <NbCardFront>
            <NbCard />
          </NbCardFront>
          <NbCardBack>
            <NbCard />
          </NbCardBack>
        </NbFlipCard>
      </Provider>
    );

    const card = screen.getByTestId('flipcard');

    expect(card).not.toHaveClass('flipped');

    const frontFlipButton = card
      ?.querySelector('.front-container')
      ?.querySelector('.flip-button');
    frontFlipButton && fireEvent.click(frontFlipButton);
    expect(card).toHaveClass('flipped');

    frontFlipButton && fireEvent.click(frontFlipButton);
    expect(card).not.toHaveClass('flipped');

    unmount();
  });
});
