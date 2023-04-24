import { Category } from './types';

export const NEBULAR_COMPONENTS_ORDER = [
  'global',
  'navigation',
  'forms',
  'modals & overlays',
  'extra'
] as const;

export const NEBULAR_COMPONENTS_CATEGORIES: Record<
  (typeof NEBULAR_COMPONENTS_ORDER)[number],
  Category
> = {
  global: {
    title: 'Global',
    icon: null
  },

  navigation: {
    title: 'Navigation',
    icon: null
  },

  forms: {
    title: 'Forms',
    icon: null
  },

  'modals & overlays': {
    title: 'Modals & Overlays',
    icon: null
  },

  extra: {
    title: 'Extra',
    icon: null
  }

  // feedback: {
  //   title: 'Feedback',
  //   icon: IconSpeakerphone,
  // },

  // typography: {
  //   title: 'Typography',
  //   icon: IconLetterCase,
  // },

  // layout: {
  //   title: 'Layout',
  //   icon: IconLayout2,
  // },

  // buttons: {
  //   title: 'Buttons',
  //   icon: IconClick,
  // },
};
