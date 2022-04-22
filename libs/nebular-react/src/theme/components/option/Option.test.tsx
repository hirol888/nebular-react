/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbOption } from './Option';
import { OptionGroupContext } from './OptionGroup';
import { OptionListContext } from './OptionList';

describe('NbOption', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('checkbox should be rendered if multiple is true', () => {
    ({ unmount } = render(
      <OptionListContext.Provider value={{ multiple: true }}>
        <NbOption data-testid="option" text="text" value={1} />
      </OptionListContext.Provider>
    ));

    expect(screen.getByTestId('option').querySelector('.nb-checkbox')).not.toBeNull();
  });

  it('checkbox should not be rendered if multiple is not true', () => {
    ({ unmount } = render(<NbOption data-testid="option" text="text" value={1} />));

    expect(screen.getByTestId('option').querySelector('.nb-checkbox')).toBeNull();
  });

  it('should have selected class if initial selected is true', () => {
    ({ unmount } = render(<NbOption data-testid="option" text="text" value={1} selected />));

    const optionDiv = screen.getByTestId('option');
    expect(optionDiv).toHaveClass('selected');
  });

  it('should have disabled class if initial disabled is true', () => {
    ({ unmount } = render(<NbOption data-testid="option" text="text" value={1} disabled />));

    const optionDiv = screen.getByTestId('option');
    expect(optionDiv).toHaveClass('disabled');
  });

  it('should have disabled class if initial disabledByGroup is true', () => {
    ({ unmount } = render(
      <OptionListContext.Provider value={{ multiple: false }}>
        <OptionGroupContext.Provider value={{ disabled: true }}>
          <NbOption data-testid="option" text="text" value={1} />
        </OptionGroupContext.Provider>
      </OptionListContext.Provider>
    ));

    const optionDiv = screen.getByTestId('option');
    expect(optionDiv).toHaveClass('disabled');
  });

  it('should call changeHandler when an option is selected', () => {
    const changeHandlerFn = jest.fn();
    ({ unmount } = render(<NbOption changeHandler={changeHandlerFn} data-testid="option" text="text" value={1} />));
    const option = screen.getByTestId('option');

    fireEvent.click(option);

    expect(changeHandlerFn).toBeCalledTimes(1);
  });

  it('should emit change event when clicked', () => {
    const mOnChange = jest.fn();
    ({ unmount } = render(<NbOption data-testid="option" text="text" value={1} changeHandler={mOnChange} />));
    const option = screen.getByTestId('option');

    fireEvent.click(option);

    expect(mOnChange).toBeCalledTimes(1);
  });
});
