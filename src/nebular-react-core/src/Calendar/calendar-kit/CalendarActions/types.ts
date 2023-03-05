import { ButtonAppearance, ComponentOrCustomStatus, ComponentSize } from '@nebular-react/styles';

export interface BaseCalendarActionsProps {
  showCurrentTimeButton?: boolean;
  applyButtonText?: string;
  applyButtonStatus?: ComponentOrCustomStatus;
  applyButtonSize?: ComponentSize;
  applyButtonAppearance?: ButtonAppearance;
  currentTimeButtonText?: string;
  currentTimeButtonStatus?: ComponentOrCustomStatus;
  currentTimeButtonSize?: ComponentSize;
  currentTimeButtonAppearance?: ButtonAppearance;
}
