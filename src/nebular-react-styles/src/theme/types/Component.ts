export type ComponentShape = 'rectangle' | 'semiround' | 'round';
export type ComponentStatus =
  | 'basic'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'control';
export type ComponentOrCustomStatus = ComponentStatus | string;
export type ComponentSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';
export type ButtonAppearance = 'filled' | 'outline' | 'ghost' | 'hero';
export type SelectAppearance = 'outline' | 'filled' | 'hero';
export type ButtonToggleAppearance = Exclude<ButtonAppearance, 'hero'>;
export const ButtonToggleAppearanceValues: Array<ButtonToggleAppearance> = [
  'filled',
  'ghost',
  'outline'
];
export const ComponentStatusValues: Array<ComponentStatus> = [
  'basic',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'control'
];
