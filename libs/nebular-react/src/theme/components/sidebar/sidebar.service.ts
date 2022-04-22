/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import 'reflect-metadata'
import { injectable } from 'inversify';
import { Subject, Observable, Observer, ReplaySubject } from 'rxjs';
import { share, refCount, publish } from 'rxjs/operators';
import { NbSidebarResponsiveState, NbSidebarState } from './Sidebar';

export const DEFAULT_TAG = 'default-tag';

/**
 * Sidebar service.
 *
 * Root module service to control the sidebar from any part of the app.
 *
 * Allows you to change sidebar state dynamically from any part of the app:
 * @stacked-example(Sidebar State, sidebar/sidebar-toggle.component)
 */
@injectable()
export class NbSidebarService {

  private toggle$ = new Subject<{ compact: boolean, tag: string }>();
  private expand$ = new Subject<{ tag: string }>();
  private collapse$ = new Subject<{ tag: string }>();
  private compact$ = new Subject<{ tag: string }>();

  public getSidebarState$ = new Subject<{ tag: string, observer: Observer<NbSidebarState> }>();
  public getSidebarResponsiveState$ = new Subject<{ tag: string, observer: Observer<NbSidebarResponsiveState> }>();

  /**
   * Subscribe to toggle events
   *
   * @returns Observable<{ compact: boolean, tag: string }>
   */
  onToggle(): Observable<{ compact: boolean, tag: string }> {
    return this.toggle$.pipe(share());
  }

  /**
   * Subscribe to expand events
   * @returns Observable<{ tag: string }>
   */
  onExpand(): Observable<{ tag: string }> {
    return this.expand$.pipe(share());
  }

  /**
   * Subscribe to collapse evens
   * @returns Observable<{ tag: string }>
   */
  onCollapse(): Observable<{ tag: string }> {
    return this.collapse$.pipe(share());
  }

  /**
   * Subscribe to compact evens
   * @returns Observable<{ tag: string }>
   */
  onCompact(): Observable<{ tag: string }> {
    return this.compact$.pipe(share());
  }

  /**
   * Toggle a sidebar
   * @param {boolean} compact
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  toggle(compact = false, tag?: string) {
    this.toggle$.next({ compact, tag: tag ?? DEFAULT_TAG });
  }

  /**
   * Expands a sidebar
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  expand(tag?: string) {
    this.expand$.next({ tag: tag ?? DEFAULT_TAG });
  }

  /**
   * Collapses a sidebar
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  collapse(tag?: string) {
    this.collapse$.next({ tag: tag ?? DEFAULT_TAG });
  }

  /**
   * Makes sidebar compact
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  compact(tag?: string) {
    this.compact$.next({ tag: tag ?? DEFAULT_TAG });
  }

  /**
   * Returns sidebar state observable which emits once
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar state you need
   */
  getSidebarState(tag?: string): Observable<NbSidebarState> {
    const observer = new ReplaySubject<NbSidebarState>(1);
    this.getSidebarState$.next({ observer, tag: tag ?? DEFAULT_TAG });
    return observer.pipe(publish(), refCount());
  }

  /**
   * Returns sidebar state observable which emits once
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar responsive state you need
   */
  getSidebarResponsiveState(tag?: string): Observable<NbSidebarResponsiveState> {
    const observer = new ReplaySubject<NbSidebarResponsiveState>();
    this.getSidebarResponsiveState$.next({ observer, tag: tag ?? DEFAULT_TAG });
    return observer.pipe(publish(), refCount());
  }
}
