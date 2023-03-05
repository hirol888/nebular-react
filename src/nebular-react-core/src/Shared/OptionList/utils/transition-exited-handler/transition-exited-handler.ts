import { TransitionState } from '../../../../Transition';

export function transitionExitedHandler<T extends TransitionState>(
  setState: (value: React.SetStateAction<T>) => void,
  onClose?: () => void
) {
  setState((state) => ({ ...state, mounted: false }));
  typeof onClose === 'function' && onClose();
}
