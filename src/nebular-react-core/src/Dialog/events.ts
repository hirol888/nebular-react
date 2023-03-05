import { createUseExternalEvents } from '@mantine/utils';
import { DialogConfig } from './types';

export type DialogEvents = {
  showDialog: (dialogConfig: Partial<DialogConfig>) => void;
  closeDialog: (id: string) => void;
};

export const [useDialogEvents, createDialogEvents] =
  createUseExternalEvents<DialogEvents>('nebular-dialog');

export const showDialog = createDialogEvents('showDialog');
export const closeDialog = createDialogEvents('closeDialog');
