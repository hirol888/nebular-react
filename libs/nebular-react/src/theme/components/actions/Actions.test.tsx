/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbActions } from '.';
import { NbComponentSize } from '@nebular-react';

describe('NbActions', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should has full width class if fullWidth is set', () => {
    ({ unmount } = render(<NbActions data-testid="actions" fullWidth />));
    const actions = screen.getByTestId('actions');

    expect(actions).toHaveClass('full-width');
  });

  it('should set size class corresponding to current size', () => {
    const sizes: NbComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];

    for (const size of sizes) {
      ({ unmount } = render(<NbActions data-testid="actions" size={size} />));
      const actions = screen.getByTestId('actions');

      expect(actions).toHaveClass(`size-${size}`);
      unmount();
    }
  });
});
