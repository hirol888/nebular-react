import { createUseExternalEvents } from '@nebular-react/styles';
import { WindowConfig } from './types';

export type WindowEvents = {
  showWindow: (windowConfig: Partial<WindowConfig>) => void;
  closeWindow: (windowConfig: WindowConfig) => void;
};

export const [useWindowEvents, createWindowEvents] =
  createUseExternalEvents<WindowEvents>('nebular-window');

export const showWindow = createWindowEvents('showWindow');
export const closeWindow = createWindowEvents('closeWindow');
