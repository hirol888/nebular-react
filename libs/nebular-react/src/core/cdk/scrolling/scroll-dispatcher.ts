import { inject, injectable } from 'inversify';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { auditTime, filter, fromEvent, Observable, Observer, of, Subject, Subscription } from 'rxjs';
import { getWindow } from '../helper';
import { NbPlatform } from '../platform';

/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;

/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
@injectable()
export class ScrollDispatcher {
  constructor(@inject(TYPES.NbPlatform) private _platform: NbPlatform) { }

  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  private readonly _scrolled = new Subject<HTMLElement | void>();

  /** Keeps track of the global `scroll` and `resize` subscriptions. */
  private _globalSubscription: Subscription | null = null;

  /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
  private _scrolledCount = 0;

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   */
  scrollContainers: Map<HTMLElement, Subscription> = new Map();

  /**
   * Registers a scrollable instance with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event to its scrolled observable.
   * @param scrollable Scrollable instance to be registered.
   */
  register(scrollable: HTMLElement, elementScrolled: Observable<Event>): void {
    if (!this.scrollContainers.has(scrollable)) {
      this.scrollContainers.set(scrollable, elementScrolled.subscribe(() => this._scrolled.next(scrollable)));
    }
  }

  /**
   * Deregisters a Scrollable reference and remove eventListener from it.
   * @param scrollable Scrollable instance to be deregistered.
   */
  deregister(scrollable: HTMLElement): void {
    const scrollableReference = this.scrollContainers.get(scrollable);

    if (scrollableReference) {
      scrollableReference.unsubscribe();
      this.scrollContainers.delete(scrollable);
    }
  }

  dispose() {
    this._removeGlobalListener();
    this.scrollContainers.forEach((_, c) => this.deregister(c));
    this._scrolled.complete();
  }

  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
   * to override the default "throttle" time.
   *
   * **Note:** in order to avoid hitting change detection for every scroll event,
   * all of the events emitted from this stream will be run outside the Angular zone.
   * If you need to update any data bindings as a result of a scroll event, you have
   * to run the callback using `NgZone.run`.
   */
  scrolled(auditTimeInMs: number = DEFAULT_SCROLL_TIME): Observable<HTMLElement | void> {
    if (!this._platform.isBrowser) {
      return of();
    }

    return new Observable((observer: Observer<HTMLElement | void>) => {
      if (!this._globalSubscription) {
        this._addGlobalListener();
      }

      // In the case of a 0ms delay, use an observable without auditTime
      // since it does add a perceptible delay in processing overhead.
      const subscription =
        auditTimeInMs > 0
          ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer)
          : this._scrolled.subscribe(observer);

      this._scrolledCount++;

      return () => {
        subscription.unsubscribe();
        this._scrolledCount--;

        if (!this._scrolledCount) {
          this._removeGlobalListener();
        }
      };
    });
  }

  /**
   * Returns an observable that emits whenever any of the
   * scrollable ancestors of an element are scrolled.
   * @param elementOrElementRef Element whose ancestors to listen for.
   * @param auditTimeInMs Time to throttle the scroll events.
   */
  ancestorScrolled(
    elementOrElementRef: HTMLElement,
    auditTimeInMs?: number,
  ): Observable<HTMLElement | void> {
    const ancestors = this.getAncestorScrollContainers(elementOrElementRef);

    return this.scrolled(auditTimeInMs).pipe(
      filter(target => {
        return !target || ancestors.indexOf(target) > -1;
      }),
    );
  }

  /** Returns all registered Scrollables that contain the provided element. */
  getAncestorScrollContainers(elementOrElementRef: HTMLElement): HTMLElement[] {
    const scrollingContainers: HTMLElement[] = [];

    this.scrollContainers.forEach((_subscription: Subscription, scrollable: HTMLElement) => {
      if (this._scrollableContainsElement(scrollable, elementOrElementRef)) {
        scrollingContainers.push(scrollable);
      }
    });

    return scrollingContainers;
  }

  /** Returns true if the element is contained within the provided Scrollable. */
  private _scrollableContainsElement(
    scrollable: HTMLElement,
    element: HTMLElement,
  ): boolean {
    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      if (element === scrollable) {
        return true;
      }
    } while ((element = element!.parentElement!));

    return false;
  }

  /** Sets up the global scroll listeners. */
  private _addGlobalListener() {
    const window = getWindow();
    return fromEvent(window.document, 'scroll').subscribe(() => this._scrolled.next());
  }

  /** Cleans up the global scroll listener. */
  private _removeGlobalListener() {
    if (this._globalSubscription) {
      this._globalSubscription.unsubscribe();
      this._globalSubscription = null;
    }
  }
}
