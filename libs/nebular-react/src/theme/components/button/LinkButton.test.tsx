/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  NbComponentStatus,
  NbComponentSize,
  NbComponentShape
} from '@nebular-react';
import { BrowserRouter } from 'react-router-dom';
import { NbButtonAppearance } from './Button';
import { NbLinkButton } from './LinkButton';

describe('NbLinkButton', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should has basic status and medium size by default', () => {
    ({ unmount } = render(<NbLinkButton data-testid="button" />));
    const button = screen.getByTestId('button');

    expect(button).toHaveClass('status-basic');
    expect(button).toHaveClass('size-medium');
  });

  it('should set status class', () => {
    const statuses: NbComponentStatus[] = [
      'primary',
      'success',
      'info',
      'warning',
      'danger'
    ];

    for (const status of statuses) {
      ({ unmount } = render(
        <NbLinkButton data-testid="button" status={status} />
      ));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`status-${status}`);

      unmount();
    }
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
      ({ unmount } = render(<NbLinkButton data-testid="button" size={size} />));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`size-${size}`);

      unmount();
    }
  });

  it('should set shape class', () => {
    const shapes: NbComponentShape[] = ['rectangle', 'semi-round', 'round'];

    for (const shape of shapes) {
      ({ unmount } = render(
        <NbLinkButton data-testid="button" shape={shape} />
      ));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`shape-${shape}`);

      unmount();
    }
  });

  it('should set appearance class', () => {
    const appearances: NbButtonAppearance[] = [
      'outline',
      'filled',
      'hero',
      'ghost'
    ];

    for (const appearance of appearances) {
      ({ unmount } = render(
        <NbLinkButton data-testid="button" appearance={appearance} />
      ));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`appearance-${appearance}`);

      unmount();
    }
  });

  it('should render Link', () => {
    ({ unmount } = render(
      <BrowserRouter>
        <NbLinkButton data-testid="button" useRoute to="/" />
      </BrowserRouter>
    ));
    const button = screen.getByTestId('button');
    expect(button).not.toBeNull();
  });
});
