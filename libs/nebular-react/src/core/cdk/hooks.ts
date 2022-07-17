import { useObservable, useSubscription } from 'observable-hooks';
import React, { useEffect, useState } from 'react';
import { filter, switchMap } from 'rxjs';
import { useInjection, useInjectionTagged } from '../../ioc-provider';
import { TYPES } from '../../ioc-types';
import { NbOptionListRef, NbOptionRef } from '../../theme';
import { FocusableOption, Highlightable, ListKeyManager } from './a11y';
import { KeyManagerBuilder, NbKeyManagerType } from './a11y/key-manager/key-manager-builder';
import { NbScrollStrategyOptions } from './adapter';
import {
  NbAdjustableConnectedPositionStrategy,
  NbAdjustment,
  NbGlobalPositionStrategy,
  NbOverlayBuilder,
  NbPosition,
  NbPositionBuilderService,
  NbPositionStrategy,
  NbScrollStrategy,
  NbTrigger,
  NbTriggerStrategy,
  NbTriggerStrategyBuilder,
  OverlayReference
} from './overlay';

/**
 * Position strategy hook
 * @param rendered
 * @param hostRef
 * @param optionsOverlayOffset
 * @returns
 */
export function usePositionStrategy(
  rendered: boolean,
  hostRef: React.RefObject<HTMLElement>,
  optionsOverlayOffset: number,
  position: NbPosition,
  adjustment: NbAdjustment
): {
  positionStrategy: NbAdjustableConnectedPositionStrategy | undefined;
  overlayPosition: NbPosition;
} {
  const positionBuilder = useInjection<NbPositionBuilderService>(TYPES.NbPositionBuilderService);
  const [overlayPosition, setOverlayPosition] = useState<NbPosition>('' as NbPosition);
  const [positionStrategy, setPositionStrategy] = useState<NbAdjustableConnectedPositionStrategy>();

  const positionChange$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(([renderedValue, hostRefValue]) => renderedValue && !!hostRefValue),
        switchMap(([, hostRefValue]) => {
          const _positionStrategy = positionBuilder
            .connectedTo(hostRefValue!)
            .position(position)
            .offset(optionsOverlayOffset)
            .adjustment(adjustment);
          setPositionStrategy(_positionStrategy);

          return _positionStrategy.positionChange;
        })
      ),
    [rendered, hostRef.current]
  );
  useSubscription(positionChange$, (position: NbPosition | undefined) => {
    setOverlayPosition(position!);
  });

  useEffect(() => {
    return () => {
      positionStrategy?.dispose();
    };
  }, []);

  return { positionStrategy, overlayPosition };
}

/**
 * Overlay Reference hook, it's after position strategy
 * @param rendered
 * @param isOpen
 * @param buttonRef
 * @param panelClass
 * @param positionStrategy
 * @param keyManager
 * @param hide
 * @returns
 */
export function useOverlay(
  rendered: boolean,
  panelClass: string | string[] | undefined,
  positionStrategy: NbPositionStrategy | undefined,
  scrollStrategy: NbScrollStrategy,
  hasBackdrop?: boolean,
  backdropClass?: string,
  handleKeydown?: (event: KeyboardEvent) => void
): OverlayReference | null {
  const overlayBuilder = useInjection<NbOverlayBuilder>(TYPES.NbOverlayBuilder);
  const [overlayRef, setOverlayRef] = useState<OverlayReference | null>(null);

  const refKeydownEvents$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(
          ([renderedValue, positionStrategyValue, scrollStrategyValue]) =>
            renderedValue && !!positionStrategyValue && !!scrollStrategyValue
        ),
        switchMap(([, positionStrategyValue, scrollStrategyValue, hasBackdropValue]) => {
          const _overlayRef = overlayBuilder.create({
            positionStrategy: positionStrategyValue,
            scrollStrategy: scrollStrategyValue,
            panelClass: panelClass ?? '',
            hasBackdrop: hasBackdropValue,
            backdropClass: backdropClass ?? ''
          });
          setOverlayRef(_overlayRef);

          return _overlayRef.keydownEvents();
        })
      ),
    [rendered, positionStrategy, scrollStrategy, hasBackdrop]
  );
  useSubscription(refKeydownEvents$, (event: KeyboardEvent) => handleKeydown && handleKeydown(event));

  useEffect(() => {
    return () => {
      overlayRef?.dispose();
      overlayBuilder.dispose();
    };
  }, []);

  return overlayRef;
}

export function useBlockOrNoopScrollStrategy(hasScroll = false) {
  const scrollStrategyOptions = useInjectionTagged<NbScrollStrategyOptions>(TYPES.NbScrollStrategyOptions, 'nb', true);
  const _scrollStrategy = hasScroll ? scrollStrategyOptions.noop() : scrollStrategyOptions.block();
  const [scrollStrategy, setScrollStrategy] = useState<NbScrollStrategy>(_scrollStrategy);

  useEffect(() => {
    setScrollStrategy(_scrollStrategy);
  }, [hasScroll]);

  return scrollStrategy;
}

export function useRepositionScrollStrategy() {
  const scrollStrategyOptions = useInjectionTagged<NbScrollStrategyOptions>(TYPES.NbScrollStrategyOptions, 'nb', true);
  const [scrollStrategy] = useState<NbScrollStrategy>(scrollStrategyOptions.reposition());
  return scrollStrategy;
}

/**
 * KeyManager hook, it's after optionRefs initialization.
 * Keep it in mind that optionRefs is from option list which can be not rendered yet,
 * in this case optionRefs is null or every optionRef.current is null
 * Set action option when selected values is changed
 * @param rendered
 * @param optionRefs
 * @param selectedValues
 * @param hide
 * @param setActiveOption
 * @returns
 */
export function useKeyManager<T extends FocusableOption & Highlightable & NbOptionRef>(
  rendered: boolean,
  optionRefs: React.RefObject<T>[],
  isOpen: boolean,
  keyManagerType: NbKeyManagerType,
  handleTabOut?: () => void,
  setActiveOption?: () => void
): ListKeyManager<T> | undefined {
  const keyManagerBuilder = useInjection<KeyManagerBuilder>(TYPES.KeyManagerBuilder);
  const [keyManager, setKeyManager] = useState<ListKeyManager<T>>();

  const keyTabOut$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(([renderedValue, optionRefsValue]) => renderedValue && !!optionRefsValue),
        switchMap(([, optionRefsValue]) => {
          const _keyManager = keyManagerBuilder.create(keyManagerType, optionRefsValue).withTypeAhead(200);
          setKeyManager(_keyManager);

          return _keyManager.tabOut;
        })
      ),
    [rendered, optionRefs]
  );
  useSubscription(keyTabOut$, () => {
    handleTabOut && handleTabOut();
  });

  const optionsLoaded$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(
          ([, optionRefsValue, keyManagerValue]) =>
            !!keyManagerValue && !!optionRefsValue && optionRefsValue.every((or) => !!or.current)
        )
      ),
    [isOpen, optionRefs, keyManager]
  );
  useSubscription(optionsLoaded$, ([, optionRefsValue]) => {
    keyManager?.updateItems(optionRefsValue);
    setActiveOption && setActiveOption();
  });

  return keyManager;
}

/**
 * Trigger strategy hook
 * @param rendered
 * @param isOpen
 * @param overlayRef
 * @param componentRef
 * @param show
 * @param hide
 */
export function useTriggerStrategy(
  rendered: boolean,
  isOpen: boolean,
  paneId: string,
  triggerHostRef: React.RefObject<HTMLElement>,
  triggerSourceRef: React.RefObject<HTMLElement>,
  triggerType: NbTrigger,
  show: () => void,
  hide: () => void
) {
  const triggerStrategyBuilder = useInjection<NbTriggerStrategyBuilder>(TYPES.NbTriggerStrategyBuilder);
  const [triggerStrategy, setTriggerStrategy] = useState<NbTriggerStrategy>();

  const triggerShow$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(
          ([renderedValue, triggerHostRefValue, triggerSourceRefValue]) =>
            renderedValue && !!triggerHostRefValue && !!triggerSourceRefValue
        ),
        switchMap(([, triggerHostRefValue, triggerSourceRefValue]) => {
          const _triggerStrategy = triggerStrategyBuilder
            .trigger(triggerType)
            .triggerHost(triggerHostRefValue!)
            .triggerSourceElement(triggerSourceRefValue!)
            .paneId(paneId)
            .build();
          setTriggerStrategy(_triggerStrategy);

          return _triggerStrategy.show$;
        })
      ),
    [rendered, triggerHostRef.current, triggerSourceRef.current]
  );
  useSubscription(triggerShow$, () => {
    show();
  });

  const triggerHide$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(
          ([renderedValue, isOpenValue, triggerStrategyValue]) => renderedValue && isOpenValue && !!triggerStrategyValue
        ),
        switchMap(([, , triggerStrategyValue]) => {
          return triggerStrategyValue!.hide$;
        })
      ),
    [rendered, isOpen, triggerStrategy]
  );
  useSubscription(triggerHide$, ($event: Event) => {
    hide();
  });

  useEffect(() => {
    return () => {
      triggerStrategy?.dispose();
    };
  }, []);
}

/**
 * optionRefs hook. It gets optionRefs from option list
 * @param rendered
 * @param optionListRef
 * @returns
 */
export function useOptionRefs(
  rendered: boolean,
  optionListRef: React.RefObject<NbOptionListRef>,
  children: React.ReactNode
): React.RefObject<NbOptionRef>[] {
  const [optionRefs, setOptionRefs] = useState<React.RefObject<NbOptionRef>[]>([]);

  const optionRefs$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(([renderedValue, optionsRefsValue$]) => renderedValue && !!optionsRefsValue$),
        switchMap(([, optionsRefsValue$]) => optionsRefsValue$!)
      ),
    [rendered, optionListRef.current?.optionRefs$, children]
  );
  useSubscription(optionRefs$, (opRefs) => {
    setOptionRefs(opRefs);
  });

  return optionRefs;
}

export function useGlobalPositionStrategy(rendered: boolean) {
  const positionBuilder = useInjection<NbPositionBuilderService>(TYPES.NbPositionBuilderService);
  const [positionStrategy, setPositionStrategy] = useState<NbGlobalPositionStrategy>();

  useEffect(() => {
    if (rendered) {
      const _positionStrategy = positionBuilder.global().centerVertically().centerHorizontally();

      setPositionStrategy(_positionStrategy);
    }

    return () => {
      positionStrategy?.dispose();
    };
  }, [rendered]);

  return positionStrategy;
}
