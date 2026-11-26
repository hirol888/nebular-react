import { createContext, useContext } from 'react';
import type { DesktopContextValue, DesktopWindowContextValue } from './Desktop.types';

export const DesktopContext = createContext<DesktopContextValue | null>(null);
export const DesktopWindowContext = createContext<DesktopWindowContextValue | null>(null);

export function useDesktop(): DesktopContextValue {
  const context = useContext(DesktopContext);

  if (!context) {
    throw new Error('useDesktop must be used inside <Desktop>');
  }

  return context;
}

export function useDesktopWindow(): DesktopWindowContextValue {
  const context = useContext(DesktopWindowContext);

  if (!context) {
    throw new Error('useDesktopWindow must be used inside a Desktop window');
  }

  return context;
}

export function useDesktopWindowState<T>(
  defaultState: T
): [T, (next: T | ((current: T) => T)) => void] {
  const { window, setWindowState } = useDesktopWindow();
  const current = (window.state as T | undefined) ?? defaultState;

  return [
    current,
    (next) => {
      const value = typeof next === 'function' ? (next as (value: T) => T)(current) : next;
      setWindowState(value);
    }
  ];
}
