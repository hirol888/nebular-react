import { createUseExternalEvents } from '@mantine/utils';
import { ToastrConfig } from './types';

export type ToastrEvents = {
  showToast: (details: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  successToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  infoToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  warningToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  primaryToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  dangerToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  controlToast: (toast: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => void;
  hideToast: (id: string) => void;
};

export const [useToastrEvents, createToastrEvents] =
  createUseExternalEvents<ToastrEvents>('nebular-toastr');

export const showToast = createToastrEvents('showToast');
export const successToast = createToastrEvents('successToast');
export const infoToast = createToastrEvents('infoToast');
export const warningToast = createToastrEvents('warningToast');
export const primaryToast = createToastrEvents('primaryToast');
export const dangerToast = createToastrEvents('dangerToast');
export const controlToast = createToastrEvents('controlToast');
export const hideToast = createToastrEvents('hideToast');
