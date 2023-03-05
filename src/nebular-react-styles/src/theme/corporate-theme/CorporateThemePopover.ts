import { DefaultThemePopover } from '../default-theme';
import { NebularThemePopover } from '../types/nebular-theme';

export const CorporateThemePopover: NebularThemePopover = {
  ...DefaultThemePopover,
  popover_border_width: '1px',
  popover_border_color: 'var(--border-basic-color-4)'
};
