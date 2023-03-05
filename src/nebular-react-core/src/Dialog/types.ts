export class DialogConfig {
  id: string;
  hasBackdrop?: boolean = true;
  backdropClass?: string = 'overlay-backdrop';
  dialogClass?: string = '';
  closeOnBackdropClick?: boolean = true;
  closeOnEsc?: boolean = true;
  hasScroll?: boolean = false;
  autoFocus?: boolean = true;
  content?: React.ReactNode;

  constructor(config: Partial<DialogConfig>) {
    Object.assign(this, config);
  }
}
