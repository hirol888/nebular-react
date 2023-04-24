import { NEBULAR_COMPONENTS_CATEGORIES, NEBULAR_COMPONENTS_ORDER } from './components';
import { NEBULAR_HOOKS_ORDER, NEBULAR_HOOKS_CATEGORIES } from './nebular-hooks';

export const NEBULAR_HOOKS_CATEGORIZED = {
  group: 'nebular-hooks',
  categories: NEBULAR_HOOKS_CATEGORIES,
  order: NEBULAR_HOOKS_ORDER
};

export const NEBULAR_COMPONENTS_CATEGORIZED = {
  group: 'components',
  categories: NEBULAR_COMPONENTS_CATEGORIES,
  order: NEBULAR_COMPONENTS_ORDER
};

export const CATEGORIZED = [
  { group: 'getting-started', categories: {}, order: [] },
  { group: 'guides', categories: {}, order: [] },
  { group: 'design-system', categories: {}, order: [] },
  { group: 'usability', categories: {}, order: [] },
  // NEBULAR_HOOKS_CATEGORIZED,
  NEBULAR_COMPONENTS_CATEGORIZED,
  { group: 'Other packages', categories: {}, order: [] },
  { group: 'changelog', categories: {}, order: [] }
];
