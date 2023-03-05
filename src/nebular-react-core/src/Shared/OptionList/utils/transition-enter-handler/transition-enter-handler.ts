import { TransitionState } from '../../../../Transition';

export function transitionEnterHandler<T extends TransitionState>(
  setState: (value: React.SetStateAction<T>) => void,
  onOpen?: () => void
) {
  setState((state) => ({ ...state, mounted: true }));
  typeof onOpen === 'function' && onOpen();
}
