import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Dropzone } from '@nebular-react/core';

const createFile = (name: string, type: string, size = 10): File =>
  new File([new Array(size).fill('x').join('')], name, { type });

const getInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('Dropzone', () => {
  it('Dropzone_Accept_ShouldFilterByExtensionWildcardAndExactType', () => {
    const onDrop = jest.fn();
    const onReject = jest.fn();
    const { container } = render(
      <Dropzone accept=".png,image/*,application/pdf" onDrop={onDrop} onReject={onReject} />
    );
    const png = createFile('photo.png', 'image/png');
    const pdf = createFile('doc.pdf', 'application/pdf');
    const text = createFile('notes.txt', 'text/plain');

    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [png, pdf, text] }
    });

    expect(onDrop).toHaveBeenCalledWith([png, pdf]);
    expect(onReject).toHaveBeenCalledWith([text]);
    expect(getInput(container)).toHaveAttribute('accept', '.png,image/*,application/pdf');
  });

  it('Dropzone_MaxSize_ShouldRejectOversizedFiles', () => {
    const onDrop = jest.fn();
    const onReject = jest.fn();
    const small = createFile('small.txt', 'text/plain', 4);
    const large = createFile('large.txt', 'text/plain', 20);

    render(<Dropzone maxSize={10} onDrop={onDrop} onReject={onReject} />);

    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [small, large] }
    });

    expect(onDrop).toHaveBeenCalledWith([small]);
    expect(onReject).toHaveBeenCalledWith([large]);
  });

  it('Dropzone_WithoutMultiple_ShouldKeepOnlyTheFirstAcceptedFile', () => {
    const onDrop = jest.fn();
    const first = createFile('a.txt', 'text/plain');
    const second = createFile('b.txt', 'text/plain');

    render(<Dropzone multiple={false} onDrop={onDrop} />);
    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [first, second] }
    });

    expect(onDrop).toHaveBeenCalledWith([first]);
  });

  it('Dropzone_EmptyDrop_ShouldNotCallHandlers', () => {
    const onDrop = jest.fn();
    const onReject = jest.fn();

    render(<Dropzone onDrop={onDrop} onReject={onReject} />);
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [] } });

    expect(onDrop).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });

  it('Dropzone_Disabled_ShouldIgnoreClicksAndDrops', () => {
    const onDrop = jest.fn();
    const { container } = render(<Dropzone disabled onDrop={onDrop} />);
    const zone = screen.getByRole('button');
    const input = getInput(container);
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.click(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [createFile('a.txt', 'text/plain')] } });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    expect(zone).toHaveAttribute('tabindex', '-1');
    expect(input).toBeDisabled();
  });

  it('Dropzone_Keyboard_ShouldOpenTheFileDialogOnEnterAndSpace', () => {
    const { container } = render(<Dropzone onDrop={() => undefined} />);
    const zone = screen.getByRole('button');
    const input = getInput(container);
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    const enter = fireEvent.keyDown(zone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(enter).toBe(false);

    const space = fireEvent.keyDown(zone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(space).toBe(false);

    const other = fireEvent.keyDown(zone, { key: 'a' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(other).toBe(true);
  });

  it('Dropzone_Click_ShouldOpenTheFileDialog', () => {
    const { container } = render(<Dropzone onDrop={() => undefined} />);
    const input = getInput(container);
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole('button'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('Dropzone_DragState_ShouldToggleTheActiveClass', () => {
    const { container } = render(<Dropzone onDrop={() => undefined} />);
    const zone = screen.getByRole('button');
    const initialClass = zone.className;

    fireEvent.dragOver(zone);
    expect(zone.className).not.toBe(initialClass);

    fireEvent.dragLeave(zone);
    expect(zone.className).toBe(initialClass);

    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(zone.className).toBe(initialClass);
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('Dropzone_InputChange_ShouldReportFilesAndResetTheInput', () => {
    const onDrop = jest.fn();
    const { container } = render(<Dropzone onDrop={onDrop} />);
    const input = getInput(container);
    const file = createFile('a.txt', 'text/plain');

    fireEvent.change(input, { target: { files: [file] } });

    expect(onDrop).toHaveBeenCalledWith([file]);
    expect(input.value).toBe('');
  });

  it('Dropzone_Children_ShouldReplaceTheDefaultContent', () => {
    render(
      <Dropzone onDrop={() => undefined}>
        <span>Custom content</span>
      </Dropzone>
    );

    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(screen.queryByText('Drop files here')).not.toBeInTheDocument();
  });

  it('Dropzone_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<Dropzone onDrop={() => undefined} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
