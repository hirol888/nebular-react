import { injectable } from 'inversify';
import {
  debounceTime,
  delay,
  EMPTY,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  repeat,
  share,
  Subject,
  switchMap,
  takeUntil,
  takeWhile
} from 'rxjs';

export type NbTriggerValues = 'noop' | 'click' | 'hover' | 'hint' | 'focus';
export enum NbTrigger {
  NOOP = 'noop',
  CLICK = 'click',
  HOVER = 'hover',
  HINT = 'hint',
  FOCUS = 'focus'
}

/**
 * Provides entity with two event stream: show and hide.
 * Each stream provides different events depends on implementation.
 * We have three main trigger strategies: click, hint and hover.
 * */
export interface NbTriggerStrategy {
  show$: Observable<never | Event>;
  hide$: Observable<never | Event>;

  dispose: () => void;
}

export abstract class NbTriggerStrategyBase implements NbTriggerStrategy {
  dispose() {
    this.destroyed$.next();
  }

  protected destroyed$ = new Subject<void>();

  // @breaking-change 9.0.0 Change parameter to Element instead of Event
  protected isNotOnHostOrContainer(event: Event): boolean {
    return !this.isOnHost(event) && !this.isOnContainer(event);
  }

  protected isOnHostOrContainer(event: Event): boolean {
    return this.isOnHost(event) || this.isOnContainer(event);
  }

  protected isOnHost({ target }: Event): boolean {
    return this.host.outerHTML.indexOf((target as HTMLElement).outerHTML) > -1;
  }

  protected isOnContainer(event: Event): boolean {
    const _pane = document.getElementById(this.paneId);
    return _pane ? _pane.outerHTML.indexOf((event.target as HTMLElement).outerHTML) > -1 : false;
  }

  protected isSourceDisabled() {
    return this.source.hasAttribute('disabled') || this.source.classList.contains('disabled');
  }

  protected paneAppended() {
    const _pane = document.getElementById(this.paneId);
    if (_pane) {
      return true;
    }
    return false;
  }

  abstract show$: Observable<Event>;
  abstract hide$: Observable<Event>;

  constructor(protected host: HTMLElement, protected paneId: string, protected source: HTMLElement) {}
}

/**
 * Creates show and hide event streams.
 * Fires toggle event when the click was performed on the host element.
 * Fires close event when the click was performed on the document but
 * not on the host or container.
 * */
export class NbClickTriggerStrategy extends NbTriggerStrategyBase {
  // since we should track click for both SHOW and HIDE event we firstly need to track the click and the state
  // of the container and then later on decide should we hide it or show
  // if we track the click & state separately this will case a behavior when the container is getting shown
  // and then hidden right away
  protected click$: Observable<[boolean, Event]> = fromEvent<Event>(document, 'click').pipe(
    filter(() => !this.isSourceDisabled()),
    map((event: Event) => [!this.paneAppended() && this.isOnHost(event), event] as [boolean, Event]),
    share(),
    takeUntil(this.destroyed$)
  );

  readonly show$: Observable<Event> = this.click$.pipe(
    filter(([shouldShow]) => shouldShow),
    map(([, event]) => event),
    takeUntil(this.destroyed$)
  );

  readonly hide$: Observable<Event> = this.click$.pipe(
    filter(([shouldShow, event]) => !shouldShow && !this.isOnContainer(event)),
    map(([, event]) => event),
    takeUntil(this.destroyed$)
  );
}

/**
 * Creates show and hide event streams.
 * Fires open event when a mouse hovers over the host element and stay over at least 100 milliseconds.
 * Fires close event when the mouse leaves the host element and stops out of the host and popover container.
 * */
export class NbHoverTriggerStrategy extends NbTriggerStrategyBase {
  show$: Observable<Event> = fromEvent<Event>(this.host, 'mouseenter').pipe(
    // this `delay & takeUntil & repeat` operators combination is a synonym for `conditional debounce`
    // meaning that if one event occurs in some time after the initial one we won't react to it
    delay(100),
    takeUntil(fromEvent(this.host, 'mouseleave')),
    repeat(),
    takeUntil(this.destroyed$)
  );

  hide$: Observable<Event> = fromEvent<Event>(this.host, 'mouseleave').pipe(
    switchMap(() =>
      fromEvent<Event>(document, 'mousemove').pipe(
        debounceTime(100),
        // takeWhile(() => !!this.container()),
        filter((event) => this.isNotOnHostOrContainer(event))
      )
    ),
    takeUntil(this.destroyed$)
  );
}

/**
 * Creates show and hide event streams.
 * Fires open event when a mouse hovers over the host element and stay over at least 100 milliseconds.
 * Fires close event when the mouse leaves the host element.
 * */
export class NbHintTriggerStrategy extends NbTriggerStrategyBase {
  show$: Observable<Event> = fromEvent<Event>(this.host, 'mouseenter').pipe(
    // this `delay & takeUntil & repeat` operators combination is a synonym for `conditional debounce`
    // meaning that if one event occurs in some time after the initial one we won't react to it
    delay(100),
    takeUntil(fromEvent(this.host, 'mouseleave')),
    repeat(),
    takeUntil(this.destroyed$)
  );

  hide$: Observable<Event> = fromEvent(this.host, 'mouseleave').pipe(takeUntil(this.destroyed$));
}

/**
 * Creates show and hide event streams.
 * Fires open event when a focus is on the host element and stay over at least 100 milliseconds.
 * Fires close event when the focus leaves the host element.
 * */
export class NbFocusTriggerStrategy extends NbTriggerStrategyBase {
  protected focusOut$: Observable<Event> = fromEvent<Event>(this.host, 'focusout').pipe(
    switchMap(() =>
      fromEvent<Event>(document, 'focusin').pipe(
        takeWhile(() => this.paneAppended()),
        filter((event) => this.isNotOnHostOrContainer(event))
      )
    ),
    takeUntil(this.destroyed$)
  );

  protected clickIn$: Observable<Event> = fromEvent<Event>(this.host, 'click').pipe(takeUntil(this.destroyed$));

  protected clickOut$: Observable<Event> = fromEvent<Event>(document, 'click').pipe(
    /**
     * Event target of `click` could be different from `activeElement`.
     * If during click you return focus to the host, it won't be opened.
     */
    filter((event) => {
      if (this.isNotOnHostOrContainer(event)) {
        return this.isNotOnHostOrContainer({ target: document.activeElement } as unknown as Event);
      }
      return false;
    }),
    takeUntil(this.destroyed$)
  );

  protected tabKeyPress$: Observable<Event> = fromEvent<Event>(document, 'keydown').pipe(
    filter((event: Event) => (event as KeyboardEvent).keyCode === 9),
    takeUntil(this.destroyed$)
  );

  show$: Observable<Event> = merge(fromEvent<Event>(this.host, 'focusin'), this.clickIn$).pipe(
    debounceTime(100),
    takeUntil(fromEvent(this.host, 'focusout')),
    repeat(),
    takeUntil(this.destroyed$)
  );

  hide$ = merge(this.focusOut$, this.tabKeyPress$, this.clickOut$).pipe(takeUntil(this.destroyed$));
}

/**
 * Creates empty show and hide event streams.
 * */
export class NbNoopTriggerStrategy extends NbTriggerStrategyBase {
  show$: Observable<Event> = EMPTY;
  hide$: Observable<Event> = EMPTY;
}

@injectable()
export class NbTriggerStrategyBuilder {
  private _triggerHost: HTMLElement;
  private _paneId: string;
  private _trigger: NbTrigger;
  private _triggerSourceElement: HTMLElement;

  trigger(trigger: NbTrigger): this {
    this._trigger = trigger;
    return this;
  }

  triggerHost(host: HTMLElement): this {
    this._triggerHost = host;
    return this;
  }

  triggerSourceElement(source: HTMLElement): this {
    this._triggerSourceElement = source;
    return this;
  }

  paneId(paneId: string): this {
    this._paneId = paneId;
    return this;
  }

  build(): NbTriggerStrategy {
    switch (this._trigger) {
      case NbTrigger.CLICK:
        return new NbClickTriggerStrategy(this._triggerHost, this._paneId, this._triggerSourceElement);
      case NbTrigger.HINT:
        return new NbHintTriggerStrategy(this._triggerHost, this._paneId, this._triggerSourceElement);
      case NbTrigger.HOVER:
        return new NbHoverTriggerStrategy(this._triggerHost, this._paneId, this._triggerSourceElement);
      case NbTrigger.FOCUS:
        return new NbFocusTriggerStrategy(this._triggerHost, this._paneId, this._triggerSourceElement);
      case NbTrigger.NOOP:
        return new NbNoopTriggerStrategy(this._triggerHost, this._paneId, this._triggerSourceElement);
      default:
        throw new Error('TriggerType have to be provided');
    }
  }
}
