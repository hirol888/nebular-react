/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbButton } from '.';
import {
  NbComponentStatus,
  NbComponentSize,
  NbComponentShape
} from '@nebular-react';
import { NbButtonAppearance } from './Button';

describe('NbButton', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should has basic status and medium size by default', () => {
    ({ unmount } = render(<NbButton data-testid="button" />));
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
      ({ unmount } = render(<NbButton data-testid="button" status={status} />));
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
      ({ unmount } = render(<NbButton data-testid="button" size={size} />));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`size-${size}`);

      unmount();
    }
  });

  it('should set shape class', () => {
    const shapes: NbComponentShape[] = ['rectangle', 'semi-round', 'round'];

    for (const shape of shapes) {
      ({ unmount } = render(<NbButton data-testid="button" shape={shape} />));
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
        <NbButton data-testid="button" appearance={appearance} />
      ));
      const button = screen.getByTestId('button');
      expect(button).toHaveClass(`appearance-${appearance}`);

      unmount();
    }
  });

  it('should emit onClick event', () => {
    const mOnClick = jest.fn();
    ({ unmount } = render(
      <NbButton data-testid="button" onClick={mOnClick} />
    ));
    const button = screen.getByTestId('button');

    fireEvent.click(button);

    expect(mOnClick).toBeCalledTimes(1);
  });

  it('should not emit onClick event when disabled', () => {
    const mOnClick = jest.fn();
    ({ unmount } = render(
      <NbButton data-testid="button" onClick={mOnClick} disabled />
    ));
    const button = screen.getByTestId('button');

    fireEvent.click(button);

    expect(mOnClick).toBeCalledTimes(0);
  });
});
