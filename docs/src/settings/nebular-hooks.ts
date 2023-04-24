import { Category } from './types';

export const NEBULAR_HOOKS_ORDER = ['state', 'dom', 'utils', 'lifecycle'] as const;

export const NEBULAR_HOOKS_CATEGORIES: Record<(typeof NEBULAR_HOOKS_ORDER)[number], Category> = {
  state: {
    title: 'State management',
    icon: null
  },

  dom: {
    title: 'UI and Dom',
    icon: null
  },

  utils: {
    title: 'Utilities',
    icon: null
  },

  lifecycle: {
    title: 'Lifecycle',
    icon: null
  }
};
