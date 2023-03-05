import { GlobalLogicalPosition, GlobalPosition, randomId } from '@nebular-react/hooks';
import { ComponentOrCustomStatus, ComponentStatus, TransitionType } from '@nebular-react/styles';

type IconToClassMap = {
  [status in ComponentStatus]: string;
};

export interface ToastrContextProps {
  limit: number;
  transition: TransitionType;
  transitionDuration: number;
  transitionTimingFunction: string;
}

export class Toast {
  title: string;
  message: string;
  config: ToastrConfig;
  onClose?(props: Toast): void;
  onOpen?(props: Toast): void;
}

export class ToastrConfig {
  position: GlobalPosition = GlobalLogicalPosition.TOP_END;
  status: ComponentOrCustomStatus = 'basic';
  autoClose: false | number = 3000;
  destroyByClick: boolean = true;
  toastClass: string = '';
  hasIcon: boolean = true;
  icon: string = 'email';
  iconPack: string = 'nebular-essentials';

  private _id: string;
  get id(): string {
    return this._id;
  }

  protected icons: IconToClassMap = {
    danger: 'flash-outline',
    success: 'checkmark-outline',
    info: 'question-mark-outline',
    warning: 'alert-triangle-outline',
    primary: 'email-outline',
    control: 'email-outline',
    basic: 'email-outline'
  };

  constructor(config: Partial<ToastrConfig>) {
    this.patchIcon(config);
    Object.assign(this, config);
    this._id = `nebular-toastr-${randomId()}`;
  }

  protected patchIcon(config: Partial<ToastrConfig>) {
    if (!('icon' in config)) {
      config.icon = this.icons[config.status] || this.icons.basic;
      config.iconPack = 'nebular-essentials';
    }
  }
}
