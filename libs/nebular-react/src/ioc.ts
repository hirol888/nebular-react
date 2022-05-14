import 'reflect-metadata';
import { Container } from 'inversify';
import {
  NbJSThemesRegistry,
  NbLayoutDirectionService,
  NbLayoutRulerService,
  NbLayoutScrollService,
  NbMediaBreakpointsService,
  NbSpinnerService,
  NbStatusService,
  NbThemeService
} from './core/services';
import { TYPES } from './ioc-types';
import { NbIconLibraries, NbMenuInternalService, NbMenuService, NbSidebarService } from './theme';
import {
  NbPlatform,
  ScrollDispatcher,
  ViewportRuler,
  IViewportRuler,
  NbOverlayBuilder,
  NbOverlayPositionBuilder,
  NbPositionBuilderService,
  NbPositionHelper,
  NbScrollStrategyBuilder,
  NbTriggerStrategyBuilder,
  OverlayKeyboardDispatcher,
  OverlayOutsideClickDispatcher,
  ScrollStrategyOptions,
  IScrollStrategyOptions,
  NbBlockScrollStrategyAdapter,
  NbScrollStrategyOptions,
  NbViewportRulerAdapter,
  InputModalityDetector,
  FocusMonitor,
  KeyManagerBuilder,
  InteractivityChecker,
  NbFocusTrapFactoryService,
  FocusTrapFactory
} from './core/cdk';

const container = (locale: string) => {
  const _container = new Container({ skipBaseClassChecks: false });

  /**
   * services
   */
  _container
    .bind<NbMediaBreakpointsService>(TYPES.NbMediaBreakpointsService)
    .to(NbMediaBreakpointsService)
    .inSingletonScope();
  _container
    .bind<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService)
    .to(NbLayoutDirectionService)
    .inSingletonScope();
  _container.bind<NbJSThemesRegistry>(TYPES.NbJsThemesRegistryService).to(NbJSThemesRegistry).inSingletonScope();
  _container.bind<NbLayoutRulerService>(TYPES.NbLayoutRulerService).to(NbLayoutRulerService).inSingletonScope();
  _container.bind<NbLayoutScrollService>(TYPES.NbLayoutScrollService).to(NbLayoutScrollService).inSingletonScope();
  _container.bind<NbSpinnerService>(TYPES.NbSpinnerService).to(NbSpinnerService).inSingletonScope();
  _container.bind<NbStatusService>(TYPES.NbStatusService).to(NbStatusService).inSingletonScope();
  _container.bind<NbThemeService>(TYPES.NbThemeService).to(NbThemeService).inSingletonScope();

  /**
   * cdk
   */
  _container.bind<NbPlatform>(TYPES.NbPlatform).to(NbPlatform).inSingletonScope();
  _container
    .bind<IViewportRuler>(TYPES.ViewportRuler)
    .to(ViewportRuler)
    .inSingletonScope()
    .whenTargetTagged('adapter', false);
  _container
    .bind<IViewportRuler>(TYPES.ViewportRuler)
    .to(NbViewportRulerAdapter)
    .inSingletonScope()
    .whenTargetTagged('adapter', true);
  _container.bind<ScrollDispatcher>(TYPES.ScrollDispatcher).to(ScrollDispatcher).inSingletonScope();
  _container
    .bind<OverlayKeyboardDispatcher>(TYPES.OverlayKeyboardDispatcher)
    .to(OverlayKeyboardDispatcher)
    .inSingletonScope();
  _container
    .bind<OverlayOutsideClickDispatcher>(TYPES.OverlayOutsideClickDispatcher)
    .to(OverlayOutsideClickDispatcher)
    .inSingletonScope();
  _container
    .bind<NbOverlayPositionBuilder>(TYPES.NbOverlayPositionBuilder)
    .to(NbOverlayPositionBuilder)
    .inSingletonScope();
  _container
    .bind<IScrollStrategyOptions>(TYPES.ScrollStrategyOptions)
    .to(ScrollStrategyOptions)
    .inSingletonScope()
    .whenTargetTagged('nb', false);
  _container
    .bind<IScrollStrategyOptions>(TYPES.NbScrollStrategyOptions)
    .to(NbScrollStrategyOptions)
    .inSingletonScope()
    .whenTargetTagged('nb', true);
  _container
    .bind<NbPositionBuilderService>(TYPES.NbPositionBuilderService)
    .to(NbPositionBuilderService)
    .inSingletonScope();
  _container
    .bind<NbBlockScrollStrategyAdapter>(TYPES.NbBlockScrollStrategyAdapter)
    .to(NbBlockScrollStrategyAdapter)
    .inSingletonScope();
  _container.bind<NbPositionHelper>(TYPES.NbPositionHelper).to(NbPositionHelper).inSingletonScope();
  _container
    .bind<NbTriggerStrategyBuilder>(TYPES.NbTriggerStrategyBuilder)
    .to(NbTriggerStrategyBuilder)
    .inSingletonScope();
  _container
    .bind<NbScrollStrategyBuilder>(TYPES.NbScrollStrategyBuilder)
    .to(NbScrollStrategyBuilder)
    .inSingletonScope();
  _container.bind<NbOverlayBuilder>(TYPES.NbOverlayBuilder).to(NbOverlayBuilder).inSingletonScope();
  _container.bind<InputModalityDetector>(TYPES.InputModalityDetector).to(InputModalityDetector).inSingletonScope();
  _container.bind<FocusMonitor>(TYPES.FocusMonitor).to(FocusMonitor).inSingletonScope();
  _container.bind<KeyManagerBuilder>(TYPES.KeyManagerBuilder).to(KeyManagerBuilder).inSingletonScope();
  _container.bind<InteractivityChecker>(TYPES.InteractivityChecker).to(InteractivityChecker).inSingletonScope();
  _container.bind<FocusTrapFactory>(TYPES.FocusTrapFactory).to(FocusTrapFactory).inSingletonScope();
  _container
    .bind<NbFocusTrapFactoryService>(TYPES.NbFocusTrapFactoryService)
    .to(NbFocusTrapFactoryService)
    .inSingletonScope();

  /**
   * component
   */
  _container.bind<NbIconLibraries>(TYPES.NbIconLibraries).to(NbIconLibraries).inSingletonScope();
  _container.bind<NbSidebarService>(TYPES.NbSidebarService).to(NbSidebarService).inSingletonScope();
  _container.bind<NbMenuService>(TYPES.NbMenuService).to(NbMenuService).inSingletonScope();
  _container.bind<NbMenuInternalService>(TYPES.NbMenuInternalService).to(NbMenuInternalService).inSingletonScope();

  /**
   * constants
   */
  _container.bind<string>(TYPES.LOCALE).toConstantValue(locale);

  return _container;
};

export { container };
