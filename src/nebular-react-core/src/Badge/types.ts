export type BadgePhysicalPosition =
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'
  | 'center right'
  | 'center left';
export type BadgeLogicalPosition =
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end'
  | 'center start'
  | 'center end';
export type BadgePosition = BadgePhysicalPosition | BadgeLogicalPosition;
