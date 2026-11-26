import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { ImageCropper, clampCrop } from '@nebular-react/core';

const src = 'https://example.com/nebula.png';

const getCropBox = (name = 'Crop area') => screen.getByRole('group', { name });

const pointer = (type: string, init: MouseEventInit = {}) =>
  new MouseEvent(type, { bubbles: true, cancelable: true, ...init });

const setViewportRect = (cropBox: HTMLElement, width = 200, height = 200) => {
  const viewport = cropBox.parentElement as HTMLElement;

  jest.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({})
  } as DOMRect);

  return viewport;
};

describe('clampCrop', () => {
  it('keeps the crop area inside the image bounds', () => {
    expect(clampCrop({ x: 90, y: 90, width: 30, height: 30 })).toEqual({
      x: 70,
      y: 70,
      width: 30,
      height: 30
    });
  });

  it('pulls negative offsets back to the image origin', () => {
    expect(clampCrop({ x: -20, y: -5, width: 40, height: 40 })).toEqual({
      x: 0,
      y: 0,
      width: 40,
      height: 40
    });
  });

  it('enforces the minimum crop size', () => {
    expect(clampCrop({ x: 10, y: 10, width: 4, height: 3 }, 10)).toEqual({
      x: 10,
      y: 10,
      width: 10,
      height: 10
    });
  });

  it('caps the crop size at the image bounds', () => {
    expect(clampCrop({ x: -10, y: -10, width: 140, height: 120 })).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  });
});

describe('ImageCropper', () => {
  it('renders the image and exposes an accessible crop area', () => {
    render(<ImageCropper src={src} alt="Nebula" ariaLabel="Nebula cropper" />);

    expect(screen.getByAltText('Nebula')).toHaveAttribute('src', src);
    expect(screen.getByRole('group', { name: 'Nebula cropper' })).toBeInTheDocument();

    const cropBox = screen.getByRole('group', { name: 'Crop area' });
    expect(cropBox).toHaveAttribute('tabindex', '0');
  });

  it('centers a square default crop when no value is provided', () => {
    render(<ImageCropper src={src} alt="Nebula" />);

    expect(getCropBox()).toHaveStyle({
      left: '10%',
      top: '10%',
      width: '80%',
      height: '80%'
    });
  });

  it('derives the default crop from the aspect ratio', () => {
    render(<ImageCropper src={src} alt="Nebula" aspectRatio={2} />);

    expect(getCropBox()).toHaveStyle({
      left: '10%',
      top: '30%',
      width: '80%',
      height: '40%'
    });
  });

  it('moves the crop area with the arrow keys', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        defaultValue={{ x: 20, y: 20, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith({ x: 21, y: 20, width: 40, height: 40 });
    expect(cropBox).toHaveStyle({ left: '21%', top: '20%' });

    fireEvent.keyDown(cropBox, { key: 'ArrowDown' });
    expect(cropBox).toHaveStyle({ top: '21%' });
  });

  it('clamps the crop area to the image bounds when moving with the keyboard', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        defaultValue={{ x: 0, y: 0, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowLeft' });
    fireEvent.keyDown(cropBox, { key: 'ArrowUp' });

    expect(onChange).not.toHaveBeenCalled();
    expect(cropBox).toHaveStyle({ left: '0%', top: '0%' });
  });

  it('resizes the crop area with Shift and the arrow keys', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        defaultValue={{ x: 20, y: 20, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowRight', shiftKey: true });

    expect(onChange).toHaveBeenLastCalledWith({ x: 20, y: 20, width: 41, height: 41 });
    expect(cropBox).toHaveStyle({ width: '41%', height: '41%' });
  });

  it('keeps the aspect ratio when resizing', () => {
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        aspectRatio={2}
        defaultValue={{ x: 10, y: 10, width: 40, height: 20 }}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowRight', shiftKey: true });

    expect(cropBox).toHaveStyle({ width: '41%', height: '20.5%' });
  });

  it('does not shrink the crop area below the minimum size', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        minSize={10}
        defaultValue={{ x: 10, y: 10, width: 10, height: 10 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowLeft', shiftKey: true });

    expect(onChange).not.toHaveBeenCalled();
    expect(cropBox).toHaveStyle({ width: '10%', height: '10%' });
  });

  it('supports a controlled crop value', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <ImageCropper
        src={src}
        alt="Nebula"
        value={{ x: 10, y: 10, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    fireEvent.keyDown(cropBox, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith({ x: 11, y: 10, width: 40, height: 40 });
    expect(cropBox).toHaveStyle({ left: '10%' });

    rerender(
      <ImageCropper
        src={src}
        alt="Nebula"
        value={{ x: 11, y: 10, width: 40, height: 40 }}
        onChange={onChange}
      />
    );

    expect(cropBox).toHaveStyle({ left: '11%' });
  });

  it('moves the crop area with pointer drags', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        defaultValue={{ x: 10, y: 10, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();
    setViewportRect(cropBox);

    fireEvent(cropBox, pointer('pointerdown', { clientX: 100, clientY: 100 }));
    fireEvent(document, pointer('pointermove', { clientX: 120, clientY: 130 }));
    fireEvent(document, pointer('pointerup'));

    expect(onChange).toHaveBeenLastCalledWith({ x: 20, y: 25, width: 40, height: 40 });
    expect(cropBox).toHaveStyle({ left: '20%', top: '25%' });
  });

  it('resizes the crop area by dragging a corner handle', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        aspectRatio={2}
        defaultValue={{ x: 10, y: 10, width: 40, height: 20 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();
    setViewportRect(cropBox);
    const handle = cropBox.querySelector('[data-handle="se"]') as HTMLElement;

    fireEvent(handle, pointer('pointerdown', { clientX: 100, clientY: 100 }));
    fireEvent(document, pointer('pointermove', { clientX: 140, clientY: 120 }));
    fireEvent(document, pointer('pointerup'));

    expect(onChange).toHaveBeenLastCalledWith({ x: 10, y: 10, width: 60, height: 30 });
  });

  it('clamps the crop area when the pointer leaves the image', () => {
    render(
      <ImageCropper src={src} alt="Nebula" defaultValue={{ x: 10, y: 10, width: 40, height: 40 }} />
    );
    const cropBox = getCropBox();
    setViewportRect(cropBox);

    fireEvent(cropBox, pointer('pointerdown', { clientX: 100, clientY: 100 }));
    fireEvent(document, pointer('pointermove', { clientX: 400, clientY: 400 }));
    fireEvent(document, pointer('pointerup'));

    expect(cropBox).toHaveStyle({ left: '60%', top: '60%' });
  });

  it('ignores pointer and keyboard input when disabled', () => {
    const onChange = jest.fn();
    render(
      <ImageCropper
        src={src}
        alt="Nebula"
        disabled
        defaultValue={{ x: 10, y: 10, width: 40, height: 40 }}
        onChange={onChange}
      />
    );
    const cropBox = getCropBox();

    expect(cropBox).toHaveAttribute('aria-disabled', 'true');
    expect(cropBox).toHaveAttribute('tabindex', '-1');
    expect(cropBox.querySelector('[data-handle]')).toBeNull();

    fireEvent.keyDown(cropBox, { key: 'ArrowRight' });
    fireEvent(cropBox, pointer('pointerdown', { clientX: 100, clientY: 100 }));
    fireEvent(document, pointer('pointermove', { clientX: 140, clientY: 140 }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ImageCropper src={src} alt="Nebula" ariaLabel="Nebula cropper" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
