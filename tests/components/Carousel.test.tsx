import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Carousel } from '@nebular-react/core';

const slides = [
  <div key="one">Slide one</div>,
  <div key="two">Slide two</div>,
  <div key="three">Slide three</div>
];

function expectActiveIndicator(active: number) {
  const indicators = screen.getAllByRole('button', { name: /^Go to slide \d+$/ });

  indicators.forEach((indicator, index) => {
    if (index === active - 1) {
      expect(indicator).toHaveAttribute('aria-current', 'true');
    } else {
      expect(indicator).not.toHaveAttribute('aria-current');
    }
  });
}

function getTrack(container: HTMLElement) {
  return container.querySelector('[data-track]') as HTMLElement;
}

describe('Carousel', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders every slide with controls and indicators', () => {
    const { container } = render(<Carousel slides={slides} />);

    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
    expect(screen.getByText('Slide one')).toBeInTheDocument();
    expect(screen.getByText('Slide two')).toBeInTheDocument();
    expect(screen.getByText('Slide three')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Go to slide \d+$/ })).toHaveLength(3);

    expectActiveIndicator(1);
    expect(getTrack(container)).toHaveAttribute('data-active-index', '0');
  });

  it('moves to the next and previous slide through the controls', async () => {
    const user = userEvent.setup();
    const onIndexChange = jest.fn();
    const { container } = render(<Carousel slides={slides} onIndexChange={onIndexChange} />);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));

    expectActiveIndicator(2);
    expect(getTrack(container)).toHaveAttribute('data-active-index', '1');
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    await user.click(screen.getByRole('button', { name: 'Previous slide' }));

    expectActiveIndicator(1);
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it('goes straight to a slide through the indicators', async () => {
    const user = userEvent.setup();
    const onIndexChange = jest.fn();

    render(<Carousel slides={slides} onIndexChange={onIndexChange} />);

    await user.click(screen.getByRole('button', { name: 'Go to slide 3' }));

    expectActiveIndicator(3);
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it('wraps around when loop is enabled', async () => {
    const user = userEvent.setup();

    render(<Carousel slides={slides} defaultIndex={2} />);

    expectActiveIndicator(3);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expectActiveIndicator(1);

    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expectActiveIndicator(3);
  });

  it('stops at the edges when loop is disabled', async () => {
    const user = userEvent.setup();
    const onIndexChange = jest.fn();

    render(
      <Carousel slides={slides} defaultIndex={2} loop={false} onIndexChange={onIndexChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Next slide' }));

    expectActiveIndicator(3);
    expect(onIndexChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Go to slide 1' }));
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));

    expectActiveIndicator(1);
  });

  it('supports keyboard navigation on the horizontal orientation', () => {
    render(<Carousel slides={slides} />);

    const carousel = screen.getByRole('region', { name: 'Carousel' });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expectActiveIndicator(2);

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expectActiveIndicator(3);

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expectActiveIndicator(1);

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expectActiveIndicator(3);
  });

  it('uses the up and down keys on the vertical orientation', () => {
    render(<Carousel slides={slides} orientation="vertical" />);

    const carousel = screen.getByRole('region', { name: 'Carousel' });

    fireEvent.keyDown(carousel, { key: 'ArrowDown' });
    expectActiveIndicator(2);

    fireEvent.keyDown(carousel, { key: 'ArrowUp' });
    expectActiveIndicator(1);

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expectActiveIndicator(1);
  });

  it('keeps the index under control when controlled', async () => {
    const user = userEvent.setup();
    const onIndexChange = jest.fn();
    const { rerender } = render(
      <Carousel slides={slides} index={1} onIndexChange={onIndexChange} />
    );

    expectActiveIndicator(2);

    await user.click(screen.getByRole('button', { name: 'Next slide' }));

    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    expectActiveIndicator(2);

    rerender(<Carousel slides={slides} index={2} onIndexChange={onIndexChange} />);

    expectActiveIndicator(3);
  });

  it('advances automatically while autoPlay is running', () => {
    jest.useFakeTimers();

    render(<Carousel slides={slides} autoPlay autoPlayInterval={1000} />);

    expectActiveIndicator(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expectActiveIndicator(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expectActiveIndicator(3);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expectActiveIndicator(1);
  });

  it('pauses on hover and focus, then resumes', () => {
    jest.useFakeTimers();

    render(<Carousel slides={slides} autoPlay autoPlayInterval={1000} />);

    const carousel = screen.getByRole('region', { name: 'Carousel' });

    fireEvent.mouseOver(carousel);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expectActiveIndicator(1);

    fireEvent.mouseOut(carousel);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expectActiveIndicator(2);

    fireEvent.focus(carousel);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expectActiveIndicator(2);

    fireEvent.blur(carousel);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expectActiveIndicator(3);
  });

  it('does not schedule a timer when autoPlay is off or there is a single slide', () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');

    render(<Carousel slides={slides} />);

    expect(setIntervalSpy).not.toHaveBeenCalled();

    setIntervalSpy.mockClear();

    render(<Carousel slides={[slides[0]]} autoPlay />);

    expect(setIntervalSpy).not.toHaveBeenCalled();

    setIntervalSpy.mockRestore();
  });

  it('hides the controls and indicators when requested', () => {
    render(<Carousel slides={slides} withControls={false} withIndicators={false} />);

    expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Go to slide \d+$/ })).not.toBeInTheDocument();
  });

  it('applies the requested aria label and height', () => {
    render(<Carousel slides={slides} ariaLabel="Featured items" height={240} />);

    expect(screen.getByRole('region', { name: 'Featured items' })).toHaveStyle({ height: '240px' });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Carousel slides={slides} height={240} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
