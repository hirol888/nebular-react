import { fireEvent, renderHook } from '@testing-library/react';
import { act } from 'react';
import { useBreakpoint } from './use-breakpoint';

describe('@nebular-react/hooks/use-breakpoint', () => {
  it('should initialize breakpointState', () => {
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.breakpointState.prevBreakpoint).toEqual({ name: 'unknown', width: -1 });
    expect(result.current.breakpointState.currBreakpoint).not.toEqual({
      name: 'unknown',
      width: -1
    });
  });

  it('should update beakpointState when resizing window', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 500;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'is', width: 400 });

    act(() => {
      window.innerWidth = 1000;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState).toEqual({
      prevBreakpoint: { name: 'is', width: 400 },
      currBreakpoint: { name: 'lg', width: 992 }
    });
  });

  it('should update currBreakpoint to xs', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 300;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'xs', width: 0 });
  });

  it('should update currBreakpoint to is', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 500;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'is', width: 400 });
  });

  it('should update currBreakpoint to sm', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 600;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'sm', width: 576 });
  });

  it('should update currBreakpoint to md', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 800;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'md', width: 768 });
  });

  it('should update currBreakpoint to lg', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 1000;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'lg', width: 992 });
  });

  it('should update currBreakpoint to xl', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 1250;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'xl', width: 1200 });
  });

  it('should update currBreakpoint to macpro', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 1300;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'macpro', width: 1280 });
  });

  it('should update currBreakpoint to xxl', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 1500;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'xxl', width: 1400 });
  });

  it('should update currBreakpoint to xxxl', () => {
    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.innerWidth = 1700;
      fireEvent(window, new Event('resize'));
    });

    expect(result.current.breakpointState.currBreakpoint).toEqual({ name: 'xxxl', width: 1600 });
  });
});
