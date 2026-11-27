import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, FileButton } from '@nebular-react/core';

const getFileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('FileButton', () => {
  it('FileButton_Click_ShouldOpenTheHiddenInput', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FileButton onChange={() => undefined}>
        <Button>Upload</Button>
      </FileButton>
    );

    const input = getFileInput(container);
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('FileButton_Change_ShouldReportSelectedFiles', () => {
    const onChange = jest.fn();
    const { container } = render(
      <FileButton onChange={onChange}>
        <Button>Upload</Button>
      </FileButton>
    );
    const input = getFileInput(container);
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('FileButton_Multiple_ShouldConfigureTheInput', () => {
    const { container } = render(
      <FileButton onChange={() => undefined} multiple accept="image/*" capture="environment">
        <Button>Upload</Button>
      </FileButton>
    );
    const input = getFileInput(container);

    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(input).toHaveAttribute('capture', 'environment');
  });

  it('FileButton_Disabled_ShouldDisableInputAndSkipClick', () => {
    const { container } = render(
      <FileButton onChange={() => undefined} disabled>
        <Button disabled>Upload</Button>
      </FileButton>
    );
    const input = getFileInput(container);
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(input).toBeDisabled();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('FileButton_ChildOnClick_ShouldRunBeforeOpeningTheInput', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { container } = render(
      <FileButton onChange={() => undefined}>
        <Button onClick={onClick}>Upload</Button>
      </FileButton>
    );
    const input = getFileInput(container);
    jest.spyOn(input, 'click').mockImplementation(() => undefined);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('FileButton_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <FileButton onChange={() => undefined}>
        <Button>Upload</Button>
      </FileButton>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
