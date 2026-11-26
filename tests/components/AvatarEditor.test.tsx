import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { AvatarEditor } from '@nebular-react/core';

const src = 'https://example.com/avatar.png';

const getCropBox = () => screen.getByRole('group', { name: 'Crop area' });

describe('AvatarEditor', () => {
  it('renders a square cropper sized by the size prop', () => {
    render(<AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" size={240} />);

    const image = screen.getByAltText('Avatar');
    const viewport = image.parentElement as HTMLElement;

    expect(screen.getByRole('group', { name: 'Avatar editor' })).toBeInTheDocument();
    expect(viewport).toHaveStyle({ height: '240px' });
    expect(getCropBox()).toHaveStyle({ width: '80%', height: '80%' });
  });

  it('masks the cropper as a circle when shape is circle', () => {
    render(
      <AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" shape="circle" size={200} />
    );

    const viewport = screen.getByAltText('Avatar').parentElement as HTMLElement;
    expect(viewport).toHaveStyle({ borderRadius: '50%' });
  });

  it('applies the default zoom to the image', () => {
    render(<AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" />);

    expect(screen.getByAltText('Avatar')).toHaveStyle({ transform: 'scale(1)' });
  });

  it('updates the image scale and reports zoom changes', () => {
    const onZoomChange = jest.fn();
    render(
      <AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" onZoomChange={onZoomChange} />
    );
    const slider = screen.getByRole('slider', { name: 'Zoom' });

    fireEvent.change(slider, { target: { value: '2' } });

    expect(onZoomChange).toHaveBeenCalledWith(2);
    expect(screen.getByAltText('Avatar')).toHaveStyle({ transform: 'scale(2)' });
    expect(slider).toHaveValue('2');
  });

  it('supports a controlled zoom value', () => {
    const onZoomChange = jest.fn();
    const { rerender } = render(
      <AvatarEditor
        src={src}
        alt="Avatar"
        ariaLabel="Avatar editor"
        zoom={1.5}
        onZoomChange={onZoomChange}
      />
    );
    const slider = screen.getByRole('slider', { name: 'Zoom' });

    expect(slider).toHaveValue('1.5');
    fireEvent.change(slider, { target: { value: '2.5' } });

    expect(onZoomChange).toHaveBeenCalledWith(2.5);
    expect(slider).toHaveValue('1.5');

    rerender(
      <AvatarEditor
        src={src}
        alt="Avatar"
        ariaLabel="Avatar editor"
        zoom={2.5}
        onZoomChange={onZoomChange}
      />
    );

    expect(slider).toHaveValue('2.5');
    expect(screen.getByAltText('Avatar')).toHaveStyle({ transform: 'scale(2.5)' });
  });

  it('forwards crop changes from the underlying cropper', () => {
    const onChange = jest.fn();
    render(
      <AvatarEditor
        src={src}
        alt="Avatar"
        ariaLabel="Avatar editor"
        defaultValue={{ x: 10, y: 10, width: 80, height: 80 }}
        onChange={onChange}
      />
    );

    fireEvent.keyDown(getCropBox(), { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith({ x: 11, y: 10, width: 80, height: 80 });
    expect(getCropBox()).toHaveStyle({ left: '11%' });
  });

  it('disables the zoom slider and the crop area when disabled', () => {
    render(<AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" disabled />);

    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeDisabled();
    expect(getCropBox()).toHaveAttribute('aria-disabled', 'true');
    expect(getCropBox()).toHaveAttribute('tabindex', '-1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AvatarEditor src={src} alt="Avatar" ariaLabel="Avatar editor" shape="circle" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
