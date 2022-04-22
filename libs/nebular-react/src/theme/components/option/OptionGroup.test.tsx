/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbOptionGroup } from './OptionGroup';

describe('NbOptionGroup', () => {
  it('should have disabled class if initial disabled is true', () => {
    const { unmount } = render(
      <NbOptionGroup data-testid="optiongroup" disabled />
    );

    const optionGroupDiv = screen.getByTestId('optiongroup');
    expect(optionGroupDiv).toHaveClass('disabled');

    unmount();
  });
});
