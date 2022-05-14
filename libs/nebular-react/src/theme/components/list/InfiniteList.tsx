import { NbLayoutRulerService, NbLayoutScrollService } from 'libs/nebular-react/src/core/services';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useEffect, useRef } from 'react';
import { filter, forkJoin, map, of, switchMap } from 'rxjs';
import * as _ from 'lodash';
import './list.scoped.scss';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';

export interface NbScrollableContainerDimentions {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export type NbInfiniteListProps = {
  threshold?: number;
  listenWindowScroll?: boolean;
  bottomThreshold?(): void;
  topThreshold?(): void;
};

const NbInfiniteList = React.forwardRef<HTMLDivElement, NbInfiniteListProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ threshold = 0, listenWindowScroll = false, bottomThreshold, topThreshold, children }, ref) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const lastScrollPosition = useRef<number>();

    const scrollService = useInjection<NbLayoutScrollService>(TYPES.NbLayoutScrollService);
    const dimensionsService = useInjection<NbLayoutRulerService>(TYPES.NbLayoutRulerService);

    const getContainerDimensions = () => {
      if (!listenWindowScroll) {
        const { scrollTop, scrollHeight, clientHeight } = componentRef.current!;
        return of({ scrollTop, scrollHeight, clientHeight });
      }

      return forkJoin([scrollService.getPosition(), dimensionsService.getDimensions()]).pipe(
        map(([scrollPosition, dimensions]) => ({
          scrollTop: scrollPosition.y,
          scrollHeight: dimensions.scrollHeight,
          clientHeight: dimensions.clientHeight
        }))
      );
    };

    const checkPosition = ({ scrollHeight, scrollTop, clientHeight }: NbScrollableContainerDimentions) => {
      return _.debounce(() => {
        const initialCheck = lastScrollPosition.current === undefined;
        const manualCheck = lastScrollPosition.current === scrollTop;
        const scrollUp = scrollTop < (lastScrollPosition.current ?? 0);
        const scrollDown = scrollTop > (lastScrollPosition.current ?? 0);
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;

        if ((initialCheck || manualCheck || scrollDown) && distanceToBottom <= threshold) {
          bottomThreshold && bottomThreshold();
        }
        if ((initialCheck || scrollUp) && scrollTop <= threshold) {
          topThreshold && topThreshold();
        }

        lastScrollPosition.current = scrollTop;
      }, 50);
    };

    const onElementScroll = () => {
      checkPosition(componentRef.current!)();
    };

    useEffect(() => {
      if (!listenWindowScroll) {
        componentRef.current?.addEventListener('scroll', onElementScroll);
      }

      const scrollSubscription = scrollService
        .onScroll()
        .pipe(
          filter(() => listenWindowScroll),
          switchMap(() => getContainerDimensions())
        )
        .subscribe((dimensions) => checkPosition(dimensions)());

      const dimensionsSubscription = getContainerDimensions().subscribe((dimensions) => checkPosition(dimensions)());

      return () => {
        scrollSubscription.unsubscribe();
        dimensionsSubscription.unsubscribe();
        if (!listenWindowScroll) {
          componentRef.current?.removeEventListener('scroll', onElementScroll);
        }
      };
    }, []);

    return (
      <div ref={mergedRefs(ref, componentRef)} className="nb-list" role="list">
        {children}
      </div>
    );
  }
);

export { NbInfiniteList };
