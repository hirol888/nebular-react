import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Image } from '@nebular-react/core';

describe('Image', () => {
  it('renders the image source and alternative text', () => {
    render(<Image src="/nebula.png" alt="Nebula" />);

    const image = screen.getByRole('img', { name: 'Nebula' });

    expect(image).toHaveAttribute('src', '/nebula.png');
    expect(image).toHaveAttribute('alt', 'Nebula');
  });

  it('shows a skeleton placeholder until the image finishes loading', () => {
    const onLoad = jest.fn();
    const { container } = render(<Image src="/nebula.png" alt="Nebula" onLoad={onLoad} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    fireEvent.load(screen.getByRole('img', { name: 'Nebula' }));

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('renders without the placeholder when withSkeleton is false', () => {
    const { container } = render(<Image src="/nebula.png" alt="Nebula" withSkeleton={false} />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Nebula' })).toBeInTheDocument();
  });

  it('sizes the placeholder with skeletonHeight', () => {
    const { container } = render(<Image src="/nebula.png" alt="Nebula" skeletonHeight={180} />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({ height: '180px' });
  });

  it('swaps to fallbackSrc only once when the image fails', () => {
    const onError = jest.fn();
    render(<Image src="/missing.png" alt="Nebula" fallbackSrc="/fallback.png" onError={onError} />);

    const image = screen.getByRole('img', { name: 'Nebula' });

    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/fallback.png');
    expect(onError).toHaveBeenCalledTimes(1);

    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/fallback.png');
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('keeps the placeholder while the fallback loads and hides it afterwards', () => {
    const { container } = render(
      <Image src="/missing.png" alt="Nebula" fallbackSrc="/fallback.png" />
    );

    const image = screen.getByRole('img', { name: 'Nebula' });

    fireEvent.error(image);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    fireEvent.load(image);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('drops the placeholder when an image without fallback fails', () => {
    const onError = jest.fn();
    const { container } = render(<Image src="/missing.png" alt="Nebula" onError={onError} />);

    fireEvent.error(screen.getByRole('img', { name: 'Nebula' }));

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('shows the placeholder again when the source changes', () => {
    const { container, rerender } = render(<Image src="/a.png" alt="Nebula" />);

    fireEvent.load(screen.getByRole('img', { name: 'Nebula' }));
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();

    rerender(<Image src="/b.png" alt="Nebula" />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Nebula' })).toHaveAttribute('src', '/b.png');
  });

  it('applies the requested object fit and radius', () => {
    render(<Image src="/nebula.png" alt="Nebula" fit="contain" radius={12} />);

    expect(screen.getByRole('img', { name: 'Nebula' })).toHaveStyle({
      objectFit: 'contain',
      borderRadius: '12px'
    });
  });

  it('renders an optional caption', () => {
    render(<Image src="/nebula.png" alt="Nebula" caption="Nebula in Carina" />);

    expect(screen.getByText('Nebula in Carina')).toBeInTheDocument();
  });

  it('forwards className to the image and wrapperClassName to the wrapper', () => {
    const { container } = render(
      <Image src="/nebula.png" alt="Nebula" className="rounded" wrapperClassName="frame" />
    );

    expect(screen.getByRole('img', { name: 'Nebula' })).toHaveClass('rounded');
    expect(container.querySelector('.frame')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Image src="/nebula.png" alt="Nebula" caption="Nebula in Carina" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
