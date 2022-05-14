// import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { fromEvent, Observable, Observer, Subscription } from 'rxjs';
import { NbLayoutDirectionService } from '../../services';
import { ScrollDispatcher } from './scroll-dispatcher';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';

export type CdkScrollableRef = {
  scrollTo: (options: ExtendedScrollToOptions) => void;
  measureScrollOffset: (from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end') => number;
  elementRef: React.RefObject<HTMLDivElement>;
};

export type _Without<T> = { [P in keyof T]?: never };
export type _XOR<T, U> = (_Without<T> & U) | (_Without<U> & T);
export type _Top = { top?: number };
export type _Bottom = { bottom?: number };
export type _Left = { left?: number };
export type _Right = { right?: number };
export type _Start = { start?: number };
export type _End = { end?: number };
export type _XAxis = _XOR<_XOR<_Left, _Right>, _XOR<_Start, _End>>;
export type _YAxis = _XOR<_Top, _Bottom>;

/** The possible ways the browser may handle the horizontal scroll axis in RTL languages. */
export const enum RtlScrollAxisType {
  /**
   * scrollLeft is 0 when scrolled all the way left and (scrollWidth - clientWidth) when scrolled
   * all the way right.
   */
  NORMAL,
  /**
   * scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  NEGATED,
  /**
   * scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  INVERTED
}

/**
 * An extended version of ScrollToOptions that allows expressing scroll offsets relative to the
 * top, bottom, left, right, start, or end of the viewport rather than just the top and left.
 * Please note: the top and bottom properties are mutually exclusive, as are the left, right,
 * start, and end properties.
 */
export type ExtendedScrollToOptions = _XAxis & _YAxis & ScrollOptions;

const CdkScrollable = React.forwardRef<CdkScrollableRef, React.HTMLAttributes<HTMLDivElement>>(({ children }, ref) => {
  const [elementScrolled, setElementScrolled] = useState<Observable<Event> | null>(null);
  const [elementScrolledSubscription, setElementScrolledSubscription] = useState<Subscription>(Subscription.EMPTY);
  const elementRef = useRef<HTMLDivElement>(null);

  const scrollDispatcher = useInjection<ScrollDispatcher>(TYPES.ScrollDispatcher);
  const layoutDirection = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);
  const isRtl = layoutDirection.isRtl();

  useEffect(() => {
    const es = new Observable((observer: Observer<Event>) => {
      const esSubscription = fromEvent(elementRef.current!, 'scroll').subscribe(observer);
      setElementScrolledSubscription(esSubscription);
    });
    setElementScrolled(es);

    return () => {
      scrollDispatcher.deregister(elementRef.current!);
      elementScrolledSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (elementScrolled) {
      scrollDispatcher.register(elementRef.current!, elementScrolled);
    }
  }, [elementScrolled]);

  useImperativeHandle(ref, () => ({
    scrollTo: _scrollTo,
    measureScrollOffset: _measureScrollOffset,
    elementRef: elementRef
  }));

  const _scrollTo = (options: ExtendedScrollToOptions) => {
    const el = elementRef.current!;

    // Rewrite start & end offsets as right or left offsets.
    if (options.left == null) {
      options.left = isRtl ? options.end : options.start;
    }

    if (options.right == null) {
      options.right = isRtl ? options.start : options.end;
    }

    // Rewrite the bottom offset as a top offset.
    if (options.bottom != null) {
      (options as _Without<_Bottom> & _Top).top = el.scrollHeight - el.clientHeight - options.bottom;
    }

    // Rewrite the right offset as a left offset.
    if (isRtl && getRtlScrollAxisType() !== RtlScrollAxisType.NORMAL) {
      if (options.left != null) {
        (options as _Without<_Left> & _Right).right = el.scrollWidth - el.clientWidth - options.left;
      }

      if (getRtlScrollAxisType() === RtlScrollAxisType.INVERTED) {
        options.left = options.right;
      } else if (getRtlScrollAxisType() === RtlScrollAxisType.NEGATED) {
        options.left = options.right ? -options.right : options.right;
      }
    } else {
      if (options.right != null) {
        (options as _Without<_Right> & _Left).left = el.scrollWidth - el.clientWidth - options.right;
      }
    }

    applyScrollToOptions(options);
  };

  const applyScrollToOptions = (options: ScrollToOptions) => {
    const el = elementRef.current!;

    if (supportsScrollBehavior()) {
      el.scrollTo(options);
    } else {
      if (options.top != null) {
        el.scrollTop = options.top;
      }
      if (options.left != null) {
        el.scrollLeft = options.left;
      }
    }
  };

  /**
   * Measures the scroll offset relative to the specified edge of the viewport. This method can be
   * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
   * about what scrollLeft means in RTL. The values returned by this method are normalized such that
   * left and right always refer to the left and right side of the scrolling container irrespective
   * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
   * in an RTL context.
   * @param from The edge to measure from.
   */
  const _measureScrollOffset = (from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number => {
    const LEFT = 'left';
    const RIGHT = 'right';
    const el = elementRef.current!;
    if (from === 'top') {
      return el.scrollTop;
    }
    if (from === 'bottom') {
      return el.scrollHeight - el.clientHeight - el.scrollTop;
    }

    // Rewrite start & end as left or right offsets.
    if (from === 'start') {
      from = isRtl ? RIGHT : LEFT;
    } else if (from === 'end') {
      from = isRtl ? LEFT : RIGHT;
    }

    if (isRtl && getRtlScrollAxisType() === RtlScrollAxisType.INVERTED) {
      // For INVERTED, scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and
      // 0 when scrolled all the way right.
      if (from === LEFT) {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      } else {
        return el.scrollLeft;
      }
    } else if (isRtl && getRtlScrollAxisType() === RtlScrollAxisType.NEGATED) {
      // For NEGATED, scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and
      // 0 when scrolled all the way right.
      if (from === LEFT) {
        return el.scrollLeft + el.scrollWidth - el.clientWidth;
      } else {
        return -el.scrollLeft;
      }
    } else {
      // For NORMAL, as well as non-RTL contexts, scrollLeft is 0 when scrolled all the way left and
      // (scrollWidth - clientWidth) when scrolled all the way right.
      if (from === LEFT) {
        return el.scrollLeft;
      } else {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      }
    }
  };

  return <div ref={elementRef}>{children}</div>;
});

export default CdkScrollable;

/**
 * Checks the type of RTL scroll axis used by this browser. As of time of writing, Chrome is NORMAL,
 * Firefox & Safari are NEGATED, and IE & Edge are INVERTED.
 */
export function getRtlScrollAxisType(): RtlScrollAxisType {
  let rtlScrollAxisType: RtlScrollAxisType | undefined;

  // We can't check unless we're on the browser. Just assume 'normal' if we're not.
  if (typeof document !== 'object' || !document) {
    return RtlScrollAxisType.NORMAL;
  }

  if (rtlScrollAxisType == null) {
    // Create a 1px wide scrolling container and a 2px wide content element.
    const scrollContainer = document.createElement('div');
    const containerStyle = scrollContainer.style;
    scrollContainer.dir = 'rtl';
    containerStyle.width = '1px';
    containerStyle.overflow = 'auto';
    containerStyle.visibility = 'hidden';
    containerStyle.pointerEvents = 'none';
    containerStyle.position = 'absolute';

    const content = document.createElement('div');
    const contentStyle = content.style;
    contentStyle.width = '2px';
    contentStyle.height = '1px';

    scrollContainer.appendChild(content);
    document.body.appendChild(scrollContainer);

    rtlScrollAxisType = RtlScrollAxisType.NORMAL;

    // The viewport starts scrolled all the way to the right in RTL mode. If we are in a NORMAL
    // browser this would mean that the scrollLeft should be 1. If it's zero instead we know we're
    // dealing with one of the other two types of browsers.
    if (scrollContainer.scrollLeft === 0) {
      // In a NEGATED browser the scrollLeft is always somewhere in [-maxScrollAmount, 0]. For an
      // INVERTED browser it is always somewhere in [0, maxScrollAmount]. We can determine which by
      // setting to the scrollLeft to 1. This is past the max for a NEGATED browser, so it will
      // return 0 when we read it again.
      scrollContainer.scrollLeft = 1;
      rtlScrollAxisType = scrollContainer.scrollLeft === 0 ? RtlScrollAxisType.NEGATED : RtlScrollAxisType.INVERTED;
    }

    scrollContainer.remove();
  }
  return rtlScrollAxisType;
}

/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior(): boolean {
  /** Cached result of the check that indicates whether the browser supports scroll behaviors. */
  let scrollBehaviorSupported: boolean | undefined;

  if (scrollBehaviorSupported == null) {
    // If we're not in the browser, it can't be supported. Also check for `Element`, because
    // some projects stub out the global `document` during SSR which can throw us off.
    if (typeof document !== 'object' || !document || typeof Element !== 'function' || !Element) {
      scrollBehaviorSupported = false;
      return scrollBehaviorSupported;
    }

    // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
    if ('scrollBehavior' in document.documentElement!.style) {
      scrollBehaviorSupported = true;
    } else {
      // At this point we have 3 possibilities: `scrollTo` isn't supported at all, it's
      // supported but it doesn't handle scroll behavior, or it has been polyfilled.
      // eslint-disable-next-line @typescript-eslint/ban-types
      const scrollToFunction: Function | undefined = Element.prototype.scrollTo;

      if (scrollToFunction) {
        // We can detect if the function has been polyfilled by calling `toString` on it. Native
        // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
        // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
        // polyfilled functions as supporting scroll behavior.
        scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
      } else {
        scrollBehaviorSupported = false;
      }
    }
  }

  return scrollBehaviorSupported;
}
