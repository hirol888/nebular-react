import { DefaultThemeCard } from '../default-theme';
import { NebularThemeCard } from '../types/nebular-theme';

export const CorporateThemeCard: NebularThemeCard = {
  ...DefaultThemeCard,
  card_border_width: '1px',
  card_border_color: 'var(--border-basic-color-4)'
};
