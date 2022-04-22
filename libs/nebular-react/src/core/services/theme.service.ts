/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { inject, injectable } from 'inversify';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, filter, pairwise, distinctUntilChanged, startWith, share } from 'rxjs/operators';
import { TYPES } from '../../ioc-types';
import { NbMediaBreakpoint, NbMediaBreakpointsService } from './breakpoint.service';
import { NbJSThemesRegistry } from './js-themes-registry.service';
import { NbJSThemeOptions } from './js-themes/theme.options';

export interface NbThemeOptions {
  name: string;
}

/**
 * Main Nebular service. Includes various helper methods.
 */
@injectable()
export class NbThemeService {

  // TODO: behavioral subject here?
  currentTheme: string;
  private themeChanges$ = new ReplaySubject<{ name: string; previous: string; }>(1);
  private appendLayoutClass$ = new Subject();
  private removeLayoutClass$ = new Subject();
  private changeWindowWidth$ = new ReplaySubject<number>(2);

  constructor(
    @inject(TYPES.NbMediaBreakpointsService) private breakpointService: NbMediaBreakpointsService,
    @inject(TYPES.NbJsThemesRegistryService) private jsThemesRegistry: NbJSThemesRegistry
  ) {
    this.changeTheme('default');
  }

  /**
   * Change current application theme
   * @param {string} name
   */
  changeTheme(name: string): void {
    this.themeChanges$.next({ name, previous: this.currentTheme });
    this.currentTheme = name;
  }

  changeWindowWidth(width: number): void {
    this.changeWindowWidth$.next(width);
  }

  /**
   * Returns a theme object with variables (color/paddings/etc) on a theme change.
   * Once subscribed - returns current theme.
   *
   * @returns {Observable<NbJSThemeOptions>}
   */
  getJsTheme(): Observable<NbJSThemeOptions> {
    return this.onThemeChange().pipe(
      map((theme: any) => {
        return this.jsThemesRegistry.get(theme.name);
      }),
    );
  }

  /**
   * Triggers media query breakpoint change
   * Returns a pair where the first item is previous media breakpoint and the second item is current breakpoit.
   * ```ts
   *  [{ name: 'xs', width: 0 }, { name: 'md', width: 768 }] // change from `xs` to `md`
   * ```
   * @returns {Observable<[NbMediaBreakpoint, NbMediaBreakpoint]>}
   */
  onMediaQueryChange(): Observable<NbMediaBreakpoint[]> {
    return this.changeWindowWidth$
      .pipe(
        startWith(-1),
        pairwise(),
        map(([prevWidth, width]: [number, number]) => {
          return [
            this.breakpointService.getByWidth(prevWidth),
            this.breakpointService.getByWidth(width),
          ] as [NbMediaBreakpoint, NbMediaBreakpoint];
        }),
        filter(([prevPoint, point]: [NbMediaBreakpoint, NbMediaBreakpoint]) => {
          return prevPoint.name !== point.name;
        }),
        distinctUntilChanged((prev, curr) => prev === curr, params => params[0].name + params[1].name),
        share(),
      );
  }

  /**
   * Triggered when current theme is changed
   * @returns {Observable<any>}
   */
  onThemeChange(): Observable<{ name: string; previous: string; }> {
    return this.themeChanges$.pipe(share());
  }

  /**
   * Append a class to nb-layout
   * @param {string} className
   */
  appendLayoutClass(className: string) {
    this.appendLayoutClass$.next(className);
  }

  /**
   * Triggered when a new class is added to nb-layout through `appendLayoutClass` method
   * @returns {Observable<any>}
   */
  onAppendLayoutClass(): Observable<any> {
    return this.appendLayoutClass$.pipe(share());
  }

  /**
   * Removes a class from nb-layout
   * @param {string} className
   */
  removeLayoutClass(className: string) {
    this.removeLayoutClass$.next(className);
  }

  /**
   * Triggered when a class is removed from nb-layout through `removeLayoutClass` method
   * @returns {Observable<any>}
   */
  onRemoveLayoutClass(): Observable<any> {
    return this.removeLayoutClass$.pipe(share());
  }
}
