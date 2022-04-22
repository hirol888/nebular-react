/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { CheckboxRef, NbCheckbox } from '.';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { container, NbComponentStatus } from '@nebular-react';
import { Provider } from 'inversify-react';

describe('NbCheckbox', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('Setting disabled to true disables checkbox input', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" disabled />
      </Provider>
    ));
    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');

    expect(checkboxInput?.disabled).toBeTruthy();
  });

  it('Setting disabled to false enables checkbox input', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" disabled={false} />
      </Provider>
    ));
    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');

    expect(checkboxInput?.disabled).toBeFalsy();
  });

  it('Setting checked to true makes checkbox input checked', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" checked />
      </Provider>
    ));
    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');

    expect(checkboxInput?.checked).toBeTruthy();
  });

  it('Setting checked to false makes checkbox input unchecked', () => {
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" checked={false} />
      </Provider>
    ));
    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');

    expect(checkboxInput?.checked).toBeFalsy();
  });

  it('should set status class', () => {
    const statuses: NbComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];

    for (const status of statuses) {
      ({ unmount } = render(
        <Provider container={container}>
          <NbCheckbox data-testid="checkbox" status={status} />
        </Provider>
      ));
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass(`status-${status}`);

      unmount();
    }
  });

  it('should set checked value not emit change event when input changed', async () => {
    const mOnClick = jest.fn();
    const ref = React.createRef<CheckboxRef>();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" ref={ref} onCheck={mOnClick} />
      </Provider>
    ));

    act(() => {
      ref.current?.setChecked(true);
    });

    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');

    expect(mOnClick).toBeCalledTimes(0);
    expect(checkboxInput?.checked).toBeTruthy();
  });

  it('should emit change event when clicked', async () => {
    const mOnClick = jest.fn();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" onCheck={mOnClick} />
      </Provider>
    ));

    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');
    checkboxInput && fireEvent.click(checkboxInput);

    expect(mOnClick).toBeCalledWith(true);
    expect(mOnClick).toBeCalledTimes(1);
    expect(checkboxInput?.checked).toBeTruthy();
  });

  it('should change value to opposite when clicked', () => {
    const mOnClick = jest.fn();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" onCheck={mOnClick} />
      </Provider>
    ));

    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');
    checkboxInput && fireEvent.click(checkboxInput);

    expect(mOnClick).toBeCalledWith(true);
    expect(checkboxInput?.checked).toBeTruthy();

    checkboxInput && fireEvent.click(checkboxInput);

    expect(mOnClick).toBeCalledWith(false);
    expect(mOnClick).toBeCalledTimes(2);
    expect(checkboxInput?.checked).toBeFalsy();
  });

  it('should reset indeterminate state when clicked on unchecked checkbox', () => {
    const mOnClick = jest.fn();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" onCheck={mOnClick} indeterminate />
      </Provider>
    ));

    const checkboxInput = screen.getByTestId('checkbox').querySelector('input');
    checkboxInput && fireEvent.click(checkboxInput);

    expect(mOnClick).toBeCalledWith(true);
    expect(mOnClick).toBeCalledTimes(1);
    expect(checkboxInput?.indeterminate).toBeFalsy();
  });

  it('should set disabled', () => {
    const mOnClick = jest.fn();
    const ref = React.createRef<CheckboxRef>();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox data-testid="checkbox" ref={ref} onCheck={mOnClick} />
      </Provider>
    ));

    act(() => {
      ref.current?.setDisabled(true);
    });

    expect(screen.getByTestId('checkbox').querySelector('input')?.disabled).toBeTruthy();
  });

  it('should get checked value', () => {
    const mOnClick = jest.fn();
    const ref = React.createRef<CheckboxRef>();
    ({ unmount } = render(
      <Provider container={container}>
        <NbCheckbox ref={ref} onCheck={mOnClick} checked />
      </Provider>
    ));

    act(() => {
      const checkedValue = ref.current?.isChecked();
      expect(checkedValue).toBeTruthy();
    });
  });
});
