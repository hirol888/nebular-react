import { transitions } from '@nebular-react/styles';

export { Transition } from './Transition';

export type { TransitionProps } from './Transition';
export type { TransitionState } from './types';

export const AVAILABLE_TRANSITIONS = Object.keys(transitions) as Array<keyof typeof transitions>;
