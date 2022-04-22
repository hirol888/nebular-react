/**
 * Describes all available options that may be passed to the NbDialogService.
 * */
export class NbDialogConfig {
  /**
   * If true than overlay will render backdrop under a dialog.
   * */
  hasBackdrop = true;

  /**
   * Class that'll be assigned to the backdrop element.
   * */
  backdropClass = 'overlay-backdrop';

  /**
   * Class that'll be assigned to the dialog overlay.
   * */
  dialogClass = '';

  /**
   * If true then mouse clicks by backdrop will close a dialog.
   * */
  closeOnBackdropClick = true;

  /**
   * If true then escape press will close a dialog.
   * */
  closeOnEsc = true;

  /**
   * Disables scroll on content under dialog if true and does nothing otherwise.
   * */
  hasScroll = false;

  /**
   * Focuses dialog automatically after open if true.
   * */
  autoFocus = true;
}