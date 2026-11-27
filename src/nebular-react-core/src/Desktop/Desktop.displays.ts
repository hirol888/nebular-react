import { useCallback, useEffect, useRef, useState } from 'react';
import type { DesktopDisplay } from './Desktop.types';

interface ScreenDetailedLike {
  label: string;
  isPrimary: boolean;
  isInternal?: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
  devicePixelRatio?: number;
}

interface ScreenDetailsLike extends EventTarget {
  screens: ScreenDetailedLike[];
  currentScreen: ScreenDetailedLike;
}

interface WindowWithScreenDetails extends Window {
  getScreenDetails?: () => Promise<ScreenDetailsLike>;
}

export interface UseDesktopDisplaysResult {
  supported: boolean;
  displays: DesktopDisplay[];
  isExtended: boolean;
  error?: unknown;
  request(): Promise<boolean>;
}

function fallbackDisplay(): DesktopDisplay[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const { screen } = window;

  return [
    {
      id: 'primary',
      label: 'Display 1',
      primary: true,
      bounds: {
        x: 0,
        y: 0,
        width: screen?.width || 1920,
        height: screen?.height || 1080
      }
    }
  ];
}

function toDisplays(details: ScreenDetailsLike): DesktopDisplay[] {
  return details.screens.map((screen, index) => ({
    id: `display-${index}-${screen.left}-${screen.top}`,
    label: screen.label || `Display ${index + 1}`,
    primary: screen.isPrimary,
    scaleFactor: screen.devicePixelRatio,
    bounds: {
      x: screen.left,
      y: screen.top,
      width: screen.width,
      height: screen.height
    }
  }));
}

export function useDesktopDisplays(): UseDesktopDisplaysResult {
  const supportedRef = useRef(
    typeof window !== 'undefined' &&
      typeof (window as WindowWithScreenDetails).getScreenDetails === 'function'
  );
  const [displays, setDisplays] = useState<DesktopDisplay[]>(() => fallbackDisplay());
  const [error, setError] = useState<unknown>(undefined);
  const [details, setDetails] = useState<ScreenDetailsLike | null>(null);

  const apply = useCallback((next: ScreenDetailsLike) => {
    setDetails(next);
    setDisplays(toDisplays(next));
    setError(undefined);
  }, []);

  useEffect(() => {
    if (!details) {
      return undefined;
    }

    const handleChange = () => apply(details);
    details.addEventListener('screenschange', handleChange);

    return () => details.removeEventListener('screenschange', handleChange);
  }, [apply, details]);

  const request = useCallback(async () => {
    const { getScreenDetails } = window as WindowWithScreenDetails;

    if (typeof getScreenDetails !== 'function') {
      setDisplays(fallbackDisplay());
      return false;
    }

    try {
      const next = await getScreenDetails.call(window);
      apply(next);
      return true;
    } catch (reason) {
      setError(reason);
      setDisplays(fallbackDisplay());
      return false;
    }
  }, [apply]);

  return {
    supported: supportedRef.current,
    displays,
    isExtended: displays.length > 1,
    error,
    request
  };
}
