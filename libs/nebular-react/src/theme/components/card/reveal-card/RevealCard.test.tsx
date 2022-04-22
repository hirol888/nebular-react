/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NbCard, NbCardBack, NbCardFront, NbRevealCard } from '..';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'inversify-react';
import { container } from 'libs/nebular-react/src/ioc';

describe('NbRevealCard', () => {
  it('should toggle revealed status', () => {
    const { unmount } = render(
      <Provider container={container}>
        <NbRevealCard data-testid="revealcard">
          <NbCardFront>
            <NbCard />
          </NbCardFront>
          <NbCardBack>
            <NbCard />
          </NbCardBack>
        </NbRevealCard>
      </Provider>
    );
    const card = screen.getByTestId('revealcard');

    expect(card).not.toHaveClass('revealed');

    const revealButton = card?.querySelector('.reveal-button');
    revealButton && fireEvent.click(revealButton);
    expect(card).toHaveClass('revealed');

    revealButton && fireEvent.click(revealButton);
    expect(card).not.toHaveClass('revealed');

    unmount();
  });
});
