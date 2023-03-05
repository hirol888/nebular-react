import { useIsomorphicEffect } from '@nebular-react/hooks';
import { Moment } from 'moment';

export function useCellTransition<TDate extends Date | Moment = Date>(
  date: TDate,
  cellRef: React.MutableRefObject<HTMLDivElement>
) {
  // This solves the unneccessary transition issue.
  // If we add transition css directly on cell-content,
  // and we navigate to another period, for the new cells whose statuses (eg. disabled, bounding-month etc)
  // are different from the previous period's ones
  // it adds unneccessary transition at that point, which needs to be avoid
  useIsomorphicEffect(() => {
    setTimeout(() => {
      if (cellRef.current) {
        cellRef.current.style.transition = '0.15s';
        cellRef.current.style.transitionProperty = 'background-color, border-color, color';
        cellRef.current.style.transitionTimingFunction = 'ease-in';
      }
    });

    return () => {
      if (cellRef.current) {
        cellRef.current.style.transition = null;
        cellRef.current.style.transitionProperty = null;
        cellRef.current.style.transitionTimingFunction = null;
      }
    };
  }, [date]);
}
