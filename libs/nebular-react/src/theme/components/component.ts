export type NbComponentShape = 'rectangle' | 'semi-round' | 'round';

export type NbComponentStatus = 'basic' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'control';
export type NbComponentOrCustomStatus = NbComponentStatus | string;

export type NbComponentSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';

export interface NbFormControlProps {
  onSizeChange?: (size: NbComponentSize) => void;
  onFullWidthChange?: (fullWidth: boolean) => void;
  onStatusChange?: (status: NbComponentOrCustomStatus) => void;
  onDisableChange?: (disabled: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
}
