import { randomId } from '@nebular-react/hooks';

export type WindowDisplayState = 'minimized' | 'maximized' | 'full-screen';

export class WindowConfig {
  title?: React.ReactNode = '';
  initialState?: WindowDisplayState = 'full-screen';
  hasBackdrop?: boolean = true;
  backdropClass?: string = '';
  closeOnBackdropClick?: boolean = true;
  closeOnEsc?: boolean = true;
  windowClass?: string = '';
  hasMinimizeButton?: boolean = true;
  hasMaximizeButton?: boolean = true;
  hasFullScreenButton?: boolean = true;
  hasCloseButton?: boolean = true;
  content?: React.ReactNode;

  private _id: string;
  get id() {
    return this._id;
  }

  constructor(config: Partial<WindowConfig>) {
    Object.assign(this, config);
    this._id = `nebular-window-${randomId()}`;
  }
}
