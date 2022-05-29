import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { ComponentLink, filterComponents, PLAYGROUND_COMPONENTS } from './components-list/components';
import { ComponentsList } from './components-list/ComponentsList';
import { NbLayoutDirectionService } from '@nebular-react';
import { LayoutDirectionToggle } from './layout-direction-toggle/LayoutDirectionToggle';
import { LayoutThemeToggle } from './layout-theme-toggle/LayoutThemeToggle';
import { WithLayout } from './with-layout/WithLayout';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { Subject, takeUntil } from 'rxjs';
import './app.scoped.scss';
import { WithoutLayout } from './without-layout/WithoutLayout';
import { Route, Routes } from 'react-router-dom';
import { BadgeShowcase } from './with-layout/badge';
import {
  ButtonColors,
  ButtonFull,
  ButtonHero,
  ButtonIcon,
  ButtonOutline,
  ButtonShapes,
  ButtonShowcase,
  ButtonSizes,
  LinkButtons
} from './with-layout/button';
import {
  CardAccents,
  CardColors,
  CardFull,
  CardShowcase,
  CardSizes,
  CardSizesCombinations,
  CardTest
} from './with-layout/card';
import { IconColors, IconShowcase } from './with-layout/icon';
import { MenuShowcase } from './with-layout/menu';
import {
  SidebarCompacted,
  SidebarFixed,
  SidebarOneTest,
  SidebarRight,
  SidebarShowcase,
  SidebarTest,
  SidebarThreeTest,
  SidebarToggle,
  SidebarTwoTest
} from './without-layout/sidebar';
import {
  CheckboxDisabled,
  CheckboxIndeterminate,
  CheckboxShowcase,
  CheckboxStatuses,
  CheckboxTest
} from './with-layout/checkbox';
import {
  SelectClean,
  SelectDisabled,
  SelectFilled,
  SelectGroups,
  SelectHero,
  SelectLabel,
  SelectMultiple,
  SelectObjectValue,
  SelectRefExamples,
  SelectShapes,
  SelectShowcase,
  SelectSizes,
  SelectStatuses
} from './with-layout/select';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { InputColors, InputShapes, InputShowcase, InputSizes } from './with-layout/input';
import {
  AutocompleteActiveFirst,
  AutocompleteCustomDisplay,
  AutocompleteDisabled,
  AutocompleteGroup,
  AutocompleteShowcase
} from './with-layout/autocomplete';
import {
  DialogAutoFocus,
  DialogBackdropClick,
  DialogEsc,
  DialogHasBackdrop,
  DialogScroll,
  DialogShowcase
} from './with-layout/dialog';
import { AccordionInteractive, AccordionMultiple, AccordionShowcase, AccordionTest } from './with-layout/accordion';
import {
  ActionBadge,
  ActionDotMode,
  ActionShowcase,
  ActionSizes,
  ActionTest,
  ActionWidth
} from './with-layout/actions';
import { AlertAccents, AlertColors, AlertOutline, AlertShowcase, AlertSizes, AlertTest } from './with-layout/alert';
import {
  ButtonAndButtonToggleGroups,
  ButtonGroupAppearances,
  ButtonGroupDisabled,
  ButtonGroupMultiple,
  ButtonGroupShapes,
  ButtonGroupShowcase,
  ButtonGroupSizes,
  ButtonGroupStatuses,
  ButtonGroupValueChange
} from './with-layout/button-group';
import { CalendarKitFullCalendar } from './with-layout/calendar-kit';
import {
  CalendarBoundingMonth,
  CalendarCustomDayCellShowcase,
  CalendarFilter,
  CalendarMinMax,
  CalendarRangeShowcase,
  CalendarShowcase,
  CalendarSize,
  CalendarStartView,
  CalendarWeekNumber,
  CalendarWithoutNavigation
} from './with-layout/calendar';
import {
  DatepickerFilter,
  DatepickerShowcase,
  DatepickerValidation,
  RangepickerShowcase
} from './with-layout/datepicker';
import { FormFieldInput, FormFieldPassword, FormFieldShowcase } from './with-layout/form-field';
import { SimpleListShowcase } from './with-layout/list';
import { InfiniteListScrollModes, InfiniteListShowcase } from './with-layout/infinite-list';
import {
  PopoverContent,
  PopoverDisable,
  PopoverDynamic,
  PopoverModes,
  PopoverNoop,
  PopoverPlacements,
  PopoverShowcase
} from './with-layout/popover';
import {
  ProgressBarInteractive,
  ProgressBarShowcase,
  ProgressBarSize,
  ProgressBarStatus,
  ProgressBarValue
} from './with-layout/progress-bar';
import { RadioDisabled, RadioShowcase, RadioStatuses } from './with-layout/radio';
import { FlipCardAccents, FlipCardColors, FlipCardFull, FlipCardShowcase } from './with-layout/flip-card';
import { FlipCardSizes } from './with-layout/flip-card/FlipCardSizes';
import {
  RevealCardAccents,
  RevealCardColors,
  RevealCardFull,
  RevealCardShowcase,
  RevealCardSizes
} from './with-layout/reveal-card';
import { SearchCustomizedTest, SearchEvent, SearchShowcase, SearchWithInputEvent } from './without-layout/search';
import { SpinnerButton, SpinnerCard, SpinnerColors, SpinnerSizes } from './with-layout/spinner';
import {
  StepperDisabledStepNav,
  StepperLinear,
  StepperShowcase,
  StepperStepChangeEvent,
  StepperVertical
} from './with-layout/stepper';
import {
  RouteTabsetShowcase,
  TabsetBadge,
  TabsetDisabled,
  TabsetIcon,
  TabsetShowcase,
  TabsetTitle,
  TabsetWidth
} from './with-layout/tabset';

export function App() {
  const [showToolbar, setShowToolbar] = useState<boolean>(true);
  const [showComponentsList, setShowComponentsList] = useState<boolean>(false);
  const [components, setComponents] = useState<ComponentLink[]>(PLAYGROUND_COMPONENTS);
  const [dir, setDir] = useState<string>('ltr');

  const destroy$ = useRef<Subject<void>>(new Subject<void>());
  const layoutDirection = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    layoutDirection
      .onDirectionChange()
      .pipe(takeUntil(destroy$.current))
      .subscribe((d) => setDir(d));

    return () => {
      destroy$.current.next();
      destroy$.current.complete();
    };
  });

  const toggleToolbar = () => {
    if (!showToolbar) {
      setShowComponentsList(false);
    }
    setShowToolbar((showToolbar) => !showToolbar);
  };

  const showComponentList = () => {
    setShowComponentsList(true);
  };

  const hideComponentsList = () => {
    setShowComponentsList(false);
  };

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setShowComponentsList(true);
    setComponents(filterComponents(e.currentTarget.value));
  };

  const onRouteChange = () => {
    hideComponentsList();
  };

  return (
    <>
      <div
        className={classNames({
          toolbar: true,
          'tools-visible': showToolbar
        })}
        dir={dir}
      >
        <button
          className={classNames({
            'toolbar-toggle-fixed': !showToolbar,
            'toolbar-toggle': true
          })}
          onClick={toggleToolbar}
        >
          {showToolbar ? 'hide' : 'show'} toolbar
        </button>
        {showToolbar && (
          <>
            <span className="tools-divider"></span>
            <LayoutDirectionToggle />
            <span className="tools-divider"></span>
            <LayoutThemeToggle />
            <span className="tools-divider"></span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Components search (/)"
              onFocus={showComponentList}
              onClick={showComponentList}
              onInput={(e) => onSearchChange(e)}
            />
            {showComponentsList && (
              <>
                <button tabIndex={-1} onClick={hideComponentsList}>
                  hide list
                </button>
                <div className="component-list-wrapper">
                  <ComponentsList components={components}></ComponentsList>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Routes>
        {/* Accordion */}
        <Route path="/accordion/accordion-interactive" element={WithLayout(AccordionInteractive, onRouteChange)} />
        <Route path="/accordion/accordion-multiple" element={WithLayout(AccordionMultiple, onRouteChange)} />
        <Route path="/accordion/accordion-showcase" element={WithLayout(AccordionShowcase, onRouteChange)} />
        <Route path="/accordion/accordion-test" element={WithLayout(AccordionTest, onRouteChange)} />
        {/* End Accordion */}
        {/* Actions */}
        <Route path="/action/action-badge" element={WithLayout(ActionBadge, onRouteChange)} />
        <Route path="/action/action-dot-mode" element={WithLayout(ActionDotMode, onRouteChange)} />
        <Route path="/action/action-showcase" element={WithLayout(ActionShowcase, onRouteChange)} />
        <Route path="/action/action-sizes" element={WithLayout(ActionSizes, onRouteChange)} />
        <Route path="/action/action-test" element={WithLayout(ActionTest, onRouteChange)} />
        <Route path="/action/action-width" element={WithLayout(ActionWidth, onRouteChange)} />
        {/* End Actions */}
        {/* Alert */}
        <Route path="/alert/alert-accents" element={WithLayout(AlertAccents, onRouteChange)} />
        <Route path="/alert/alert-colors" element={WithLayout(AlertColors, onRouteChange)} />
        <Route path="/alert/alert-outline" element={WithLayout(AlertOutline, onRouteChange)} />
        <Route path="/alert/alert-showcase" element={WithLayout(AlertShowcase, onRouteChange)} />
        <Route path="/alert/alert-sizes" element={WithLayout(AlertSizes, onRouteChange)} />
        <Route path="/alert/alert-test" element={WithLayout(AlertTest, onRouteChange)} />
        {/* End Alert */}
        {/* Autocomplete */}
        <Route
          path="/autocomplete/autocomplete-active-first"
          element={WithLayout(AutocompleteActiveFirst, onRouteChange)}
        />
        <Route
          path="/autocomplete/autocomplete-custom-display"
          element={WithLayout(AutocompleteCustomDisplay, onRouteChange)}
        />
        <Route path="/autocomplete/autocomplete-disabled" element={WithLayout(AutocompleteDisabled, onRouteChange)} />
        <Route path="/autocomplete/autocomplete-group" element={WithLayout(AutocompleteGroup, onRouteChange)} />
        <Route path="/autocomplete/autocomplete-showcase" element={WithLayout(AutocompleteShowcase, onRouteChange)} />
        {/* End Autocomplete */}
        {/* Badge */}
        <Route path="/badge/badge-showcase" element={WithLayout(BadgeShowcase, onRouteChange)} />
        {/* End Badge */}
        {/* Button */}
        <Route path="/button/button-colors" element={WithLayout(ButtonColors, onRouteChange)} />
        <Route path="/button/button-fullwidth" element={WithLayout(ButtonFull, onRouteChange)} />
        <Route path="/button/button-hero" element={WithLayout(ButtonHero, onRouteChange)} />
        <Route path="/button/button-icon" element={WithLayout(ButtonIcon, onRouteChange)} />
        <Route path="/button/button-outline" element={WithLayout(ButtonOutline, onRouteChange)} />
        <Route path="/button/button-shapes" element={WithLayout(ButtonShapes, onRouteChange)} />
        <Route path="/button/button-showcase" element={WithLayout(ButtonShowcase, onRouteChange)} />
        <Route path="/button/button-sizes" element={WithLayout(ButtonSizes, onRouteChange)} />
        <Route path="/button/link-buttons" element={WithLayout(LinkButtons, onRouteChange)} />
        {/* End Button */}
        {/* Button Group */}
        <Route
          path="/button-group/button-and-button-toggle-groups"
          element={WithLayout(ButtonAndButtonToggleGroups, onRouteChange)}
        />
        <Route
          path="/button-group/button-group-appearances"
          element={WithLayout(ButtonGroupAppearances, onRouteChange)}
        />
        <Route path="/button-group/button-group-disabled" element={WithLayout(ButtonGroupDisabled, onRouteChange)} />
        <Route path="/button-group/button-group-multiple" element={WithLayout(ButtonGroupMultiple, onRouteChange)} />
        <Route path="/button-group/button-group-shapes" element={WithLayout(ButtonGroupShapes, onRouteChange)} />
        <Route path="/button-group/button-group-showcase" element={WithLayout(ButtonGroupShowcase, onRouteChange)} />
        <Route path="/button-group/button-group-sizes" element={WithLayout(ButtonGroupSizes, onRouteChange)} />
        <Route path="/button-group/button-group-statuses" element={WithLayout(ButtonGroupStatuses, onRouteChange)} />
        <Route
          path="/button-group/button-group-value-change"
          element={WithLayout(ButtonGroupValueChange, onRouteChange)}
        />
        {/* End Button Group */}
        {/* Calendar */}
        <Route path="/calendar/calendar-bounding-month" element={WithLayout(CalendarBoundingMonth, onRouteChange)} />
        <Route
          path="/calendar/calendar-custom-day-cell-showcase"
          element={WithLayout(CalendarCustomDayCellShowcase, onRouteChange)}
        />
        <Route path="/calendar/calendar-filter" element={WithLayout(CalendarFilter, onRouteChange)} />
        <Route path="/calendar/calendar-min-max" element={WithLayout(CalendarMinMax, onRouteChange)} />
        <Route path="/calendar/calendar-range-showcase" element={WithLayout(CalendarRangeShowcase, onRouteChange)} />
        <Route path="/calendar/calendar-showcase" element={WithLayout(CalendarShowcase, onRouteChange)} />
        <Route path="/calendar/calendar-size" element={WithLayout(CalendarSize, onRouteChange)} />
        <Route path="/calendar/calendar-start-view" element={WithLayout(CalendarStartView, onRouteChange)} />
        <Route path="/calendar/calendar-week-number" element={WithLayout(CalendarWeekNumber, onRouteChange)} />
        <Route
          path="/calendar/calendar-without-navigation"
          element={WithLayout(CalendarWithoutNavigation, onRouteChange)}
        />
        {/* End Calendar */}
        {/* Calendar Kit */}
        <Route
          path="/calendar-kit/calendar-kit-full-calendar"
          element={WithLayout(CalendarKitFullCalendar, onRouteChange)}
        />
        {/* End Calendar Kit */}
        {/* Card */}
        <Route path="/card/card-accents" element={WithLayout(CardAccents, onRouteChange)} />
        <Route path="/card/card-colors" element={WithLayout(CardColors, onRouteChange)} />
        <Route path="/card/card-full" element={WithLayout(CardFull, onRouteChange)} />
        <Route path="/card/card-showcase" element={WithLayout(CardShowcase, onRouteChange)} />
        <Route path="/card/card-sizes" element={WithLayout(CardSizes, onRouteChange)} />
        <Route path="/card/card-sizes-combinations" element={WithLayout(CardSizesCombinations, onRouteChange)} />
        <Route path="/card/card-test" element={WithLayout(CardTest, onRouteChange)} />
        {/* End Card */}
        {/* Checkbox */}
        <Route path="/checkbox/checkbox-disabled" element={WithLayout(CheckboxDisabled, onRouteChange)} />
        <Route path="/checkbox/checkbox-indeterminate" element={WithLayout(CheckboxIndeterminate, onRouteChange)} />
        <Route path="/checkbox/checkbox-showcase" element={WithLayout(CheckboxShowcase, onRouteChange)} />
        <Route path="/checkbox/checkbox-statuses" element={WithLayout(CheckboxStatuses, onRouteChange)} />
        <Route path="/checkbox/checkbox-test" element={WithLayout(CheckboxTest, onRouteChange)} />
        {/* End Checkbox */}
        {/* Datepicker */}
        <Route path="/datepicker/datepicker-filter" element={WithLayout(DatepickerFilter, onRouteChange)} />
        <Route path="/datepicker/datepicker-showcase" element={WithLayout(DatepickerShowcase, onRouteChange)} />
        <Route path="/datepicker/datepicker-validation" element={WithLayout(DatepickerValidation, onRouteChange)} />
        <Route path="/datepicker/rangepicker-showcase" element={WithLayout(RangepickerShowcase, onRouteChange)} />
        {/* End Datepicker */}
        {/* Dialog */}
        <Route path="/dialog/dialog-auto-focus" element={WithLayout(DialogAutoFocus, onRouteChange)} />
        <Route path="/dialog/dialog-backdrop-click" element={WithLayout(DialogBackdropClick, onRouteChange)} />
        <Route path="/dialog/dialog-esc" element={WithLayout(DialogEsc, onRouteChange)} />
        <Route path="/dialog/dialog-has-backdrop" element={WithLayout(DialogHasBackdrop, onRouteChange)} />
        <Route path="/dialog/dialog-scroll" element={WithLayout(DialogScroll, onRouteChange)} />
        <Route path="/dialog/dialog-showcase" element={WithLayout(DialogShowcase, onRouteChange)} />
        {/* End Dialog */}
        {/* Flip Card */}
        <Route path="/flip-card/flip-card-accents" element={WithLayout(FlipCardAccents, onRouteChange)} />
        <Route path="/flip-card/flip-card-colors" element={WithLayout(FlipCardColors, onRouteChange)} />
        <Route path="/flip-card/flip-card-full" element={WithLayout(FlipCardFull, onRouteChange)} />
        <Route path="/flip-card/flip-card-showcase" element={WithLayout(FlipCardShowcase, onRouteChange)} />
        <Route path="/flip-card/flip-card-sizes" element={WithLayout(FlipCardSizes, onRouteChange)} />
        {/* End Flip Card */}
        {/* FormField */}
        <Route path="/form-field/form-field-input" element={WithLayout(FormFieldInput, onRouteChange)} />
        <Route path="/form-field/form-field-password" element={WithLayout(FormFieldPassword, onRouteChange)} />
        <Route path="/form-field/form-field-showcase" element={WithLayout(FormFieldShowcase, onRouteChange)} />
        {/* End FormField */}
        {/* Icon */}
        <Route path="/icon/icon-showcase" element={WithLayout(IconShowcase, onRouteChange)} />
        <Route path="/icon/icon-colors" element={WithLayout(IconColors, onRouteChange)} />
        {/* End Icon */}
        {/* Infinite List */}
        {/* <Route
          path="/infinite-list/infinite-list-placeholders"
          element={WithLayout(InfiniteListPlaceholders, onRouteChange)}
        /> */}
        <Route
          path="/infinite-list/infinite-list-scroll-modes"
          element={WithLayout(InfiniteListScrollModes, onRouteChange)}
        />
        <Route path="/infinite-list/infinite-list-showcase" element={WithLayout(InfiniteListShowcase, onRouteChange)} />
        {/* End Infinite List */}
        {/* Input */}
        <Route path="/input/input-colors" element={WithLayout(InputColors, onRouteChange)} />
        <Route path="/input/input-shapes" element={WithLayout(InputShapes, onRouteChange)} />
        <Route path="/input/input-showcase" element={WithLayout(InputShowcase, onRouteChange)} />
        <Route path="/input/input-sizes" element={WithLayout(InputSizes, onRouteChange)} />
        {/* End Input */}
        {/* List */}
        <Route path="/list/simple-list-showcase" element={WithLayout(SimpleListShowcase, onRouteChange)} />
        {/* End List */}
        {/* Menu */}
        <Route path="/menu/menu-showcase" element={WithLayout(MenuShowcase, onRouteChange)} />
        {/* End Menu */}
        {/* Popover */}
        <Route path="/popover/popover-dynamic" element={WithLayout(PopoverDynamic, onRouteChange)} />
        <Route path="/popover/popover-disable" element={WithLayout(PopoverDisable, onRouteChange)} />
        <Route path="/popover/popover-showcase" element={WithLayout(PopoverShowcase, onRouteChange)} />
        <Route path="/popover/popover-content" element={WithLayout(PopoverContent, onRouteChange)} />
        <Route path="/popover/popover-modes" element={WithLayout(PopoverModes, onRouteChange)} />
        <Route path="/popover/popover-noop" element={WithLayout(PopoverNoop, onRouteChange)} />
        <Route path="/popover/popover-placements" element={WithLayout(PopoverPlacements, onRouteChange)} />
        {/* End Popover */}
        {/* Progress Bar */}
        <Route
          path="/progress-bar/progress-bar-interactive"
          element={WithLayout(ProgressBarInteractive, onRouteChange)}
        />
        <Route path="/progress-bar/progress-bar-size" element={WithLayout(ProgressBarSize, onRouteChange)} />
        <Route path="/progress-bar/progress-bar-showcase" element={WithLayout(ProgressBarShowcase, onRouteChange)} />
        <Route path="/progress-bar/progress-bar-status" element={WithLayout(ProgressBarStatus, onRouteChange)} />
        <Route path="/progress-bar/progress-bar-value" element={WithLayout(ProgressBarValue, onRouteChange)} />
        {/* End Progress Bar */}
        {/* Radio */}
        <Route path="/radio/radio-disabled" element={WithLayout(RadioDisabled, onRouteChange)} />
        <Route path="/radio/radio-showcase" element={WithLayout(RadioShowcase, onRouteChange)} />
        <Route path="/radio/radio-statuses" element={WithLayout(RadioStatuses, onRouteChange)} />
        {/* End Radio */}
        {/* Reveal Card */}
        <Route path="/reveal-card/reveal-card-accents" element={WithLayout(RevealCardAccents, onRouteChange)} />
        <Route path="/reveal-card/reveal-card-colors" element={WithLayout(RevealCardColors, onRouteChange)} />
        <Route path="/reveal-card/reveal-card-full" element={WithLayout(RevealCardFull, onRouteChange)} />
        <Route path="/reveal-card/reveal-card-showcase" element={WithLayout(RevealCardShowcase, onRouteChange)} />
        <Route path="/reveal-card/reveal-card-sizes" element={WithLayout(RevealCardSizes, onRouteChange)} />
        {/* End Reveal Card */}
        {/* Select */}
        <Route path="/select/select-clean" element={WithLayout(SelectClean, onRouteChange)} />
        <Route path="/select/select-disabled" element={WithLayout(SelectDisabled, onRouteChange)} />
        <Route path="/select/select-filled" element={WithLayout(SelectFilled, onRouteChange)} />
        <Route path="/select/select-groups" element={WithLayout(SelectGroups, onRouteChange)} />
        <Route path="/select/select-hero" element={WithLayout(SelectHero, onRouteChange)} />
        <Route path="/select/select-label" element={WithLayout(SelectLabel, onRouteChange)} />
        <Route path="/select/select-multiple" element={WithLayout(SelectMultiple, onRouteChange)} />
        <Route path="/select/select-object-value" element={WithLayout(SelectObjectValue, onRouteChange)} />
        <Route path="/select/select-ref-examples" element={WithLayout(SelectRefExamples, onRouteChange)} />
        <Route path="/select/select-shapes" element={WithLayout(SelectShapes, onRouteChange)} />
        <Route path="/select/select-showcase" element={WithLayout(SelectShowcase, onRouteChange)} />
        <Route path="/select/select-sizes" element={WithLayout(SelectSizes, onRouteChange)} />
        <Route path="/select/select-statuses" element={WithLayout(SelectStatuses, onRouteChange)} />
        {/* End Select */}
        {/* Search */}
        <Route path="search/search-customized-test" element={WithoutLayout(SearchCustomizedTest, onRouteChange)} />
        <Route path="search/search-event" element={WithoutLayout(SearchEvent, onRouteChange)} />
        <Route path="search/search-showcase" element={WithoutLayout(SearchShowcase, onRouteChange)} />
        <Route path="search/search-with-input-event" element={WithoutLayout(SearchWithInputEvent, onRouteChange)} />
        {/* End Search */}
        {/* Sidebar */}
        <Route path="sidebar/sidebar-compacted" element={WithoutLayout(SidebarCompacted, onRouteChange)} />
        <Route path="sidebar/sidebar-fixed" element={WithoutLayout(SidebarFixed, onRouteChange)} />
        <Route path="sidebar/sidebar-one-test" element={WithoutLayout(SidebarOneTest, onRouteChange)} />
        <Route path="sidebar/sidebar-right" element={WithoutLayout(SidebarRight, onRouteChange)} />
        <Route path="sidebar/sidebar-showcase" element={WithoutLayout(SidebarShowcase, onRouteChange)} />
        <Route path="sidebar/sidebar-test" element={WithoutLayout(SidebarTest, onRouteChange)} />
        <Route path="sidebar/sidebar-three-test" element={WithoutLayout(SidebarThreeTest, onRouteChange)} />
        <Route path="sidebar/sidebar-toggle" element={WithoutLayout(SidebarToggle, onRouteChange)} />
        <Route path="sidebar/sidebar-two-test" element={WithoutLayout(SidebarTwoTest, onRouteChange)} />
        {/* End Sidebar */}
        {/* Spinner */}
        <Route path="/spinner/spinner-button" element={WithLayout(SpinnerButton, onRouteChange)} />
        <Route path="/spinner/spinner-card" element={WithLayout(SpinnerCard, onRouteChange)} />
        <Route path="/spinner/spinner-colors" element={WithLayout(SpinnerColors, onRouteChange)} />
        <Route path="/spinner/spinner-sizes" element={WithLayout(SpinnerSizes, onRouteChange)} />
        {/* End Spinner */}
        {/* Stepper */}
        <Route path="/stepper/stepper-disabled-step-nav" element={WithLayout(StepperDisabledStepNav, onRouteChange)} />
        <Route path="/stepper/stepper-linear" element={WithLayout(StepperLinear, onRouteChange)} />
        <Route path="/stepper/stepper-showcase" element={WithLayout(StepperShowcase, onRouteChange)} />
        <Route path="/stepper/stepper-step-change-event" element={WithLayout(StepperStepChangeEvent, onRouteChange)} />
        <Route path="/stepper/stepper-vertical" element={WithLayout(StepperVertical, onRouteChange)} />
        {/* End Stepper */}
        {/* TabSet */}
        <Route path="/tabset/route-tabset-showcase/*" element={WithLayout(RouteTabsetShowcase, onRouteChange)} />
        <Route path="/tabset/tabset-showcase" element={WithLayout(TabsetShowcase, onRouteChange)} />
        <Route path="/tabset/tabset-badge" element={WithLayout(TabsetBadge, onRouteChange)} />
        <Route path="/tabset/tabset-disabled" element={WithLayout(TabsetDisabled, onRouteChange)} />
        <Route path="/tabset/tabset-icon" element={WithLayout(TabsetIcon, onRouteChange)} />
        <Route path="/tabset/tabset-title" element={WithLayout(TabsetTitle, onRouteChange)} />
        <Route path="/tabset/tabset-width" element={WithLayout(TabsetWidth, onRouteChange)} />
        {/* End TabSet */}
      </Routes>
    </>
  );
}

export default App;
