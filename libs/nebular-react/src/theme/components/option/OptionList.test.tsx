/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NbComponentSize } from '@nebular-react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbOptionList } from './OptionList';

describe('NbOptionList', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should set size class', () => {
    const sizes: NbComponentSize[] = [
      'tiny',
      'small',
      'medium',
      'large',
      'giant'
    ];

    for (const size of sizes) {
      ({ unmount } = render(
        <NbOptionList data-testid="optionlist" size={size} />
      ));
      const optionList = screen.getByTestId('optionlist');
      expect(optionList).toHaveClass(`size-${size}`);

      unmount();
    }
  });
});
