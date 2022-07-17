import * as _ from 'lodash';

export const filterComponents = (searchString: string) => {
  if (_.isEmpty(searchString)) {
    return PLAYGROUND_COMPONENTS;
  }

  const filterBySearchString = (components: ComponentLink[], componentLink: ComponentLink) => {
    if (componentLink.name?.toLowerCase().includes(searchString)) {
      components.push(componentLink);
      return components;
    }
    if (componentLink.children) {
      const children = componentLink.children.reduce(filterBySearchString, []);
      if (children.length) {
        components.push({ ...componentLink, children });
      }
    }
    return components;
  };

  return PLAYGROUND_COMPONENTS.reduce(filterBySearchString, []);
};

export function extractLinks(componentLink: ComponentLink[]): string[] {
  return componentLink.reduce((acc: string[], item) => {
    if (item.link) {
      acc.push(item.link);
    }
    if (item.children) {
      acc = [...acc, ...extractLinks(item.children)];
    }
    return acc;
  }, []);
}

export interface ComponentLink {
  path: string;
  name?: string;
  component?: string;
  link?: string;
  children?: ComponentLink[];
}

export const PLAYGROUND_COMPONENTS: ComponentLink[] = [
  {
    path: 'accordion',
    children: [
      {
        path: 'accordion-multiple',
        link: '/accordion/accordion-multiple',
        component: 'AccordionMultipleComponent',
        name: 'Accordion Multiple'
      },
      {
        path: 'accordion-showcase',
        link: '/accordion/accordion-showcase',
        component: 'AccordionShowcaseComponent',
        name: 'Accordion Showcase'
      },
      {
        path: 'accordion-test',
        link: '/accordion/accordion-test',
        component: 'AccordionTestComponent',
        name: 'Accordion Test'
      },
      {
        path: 'accordion-interactive',
        link: '/accordion/accordion-interactive',
        component: 'AccordionInteractiveComponent',
        name: 'Accordion Interactive'
      }
    ]
  },
  {
    path: 'action',
    children: [
      {
        path: 'action-badge',
        link: '/action/action-badge',
        component: 'ActionBadgeComponent',
        name: 'Action Badge'
      },
      {
        path: 'action-showcase',
        link: '/action/action-showcase',
        component: 'ActionShowcaseComponent',
        name: 'Action Showcase'
      },
      {
        path: 'action-sizes',
        link: '/action/action-sizes',
        component: 'ActionSizesComponent',
        name: 'Action Sizes'
      },
      {
        path: 'action-test',
        link: '/action/action-test',
        component: 'ActionTestComponent',
        name: 'Action Test'
      },
      {
        path: 'action-width',
        link: '/action/action-width',
        component: 'ActionWidthComponent',
        name: 'Action Width'
      },
      {
        path: 'action-dot-mode',
        link: '/action/action-dot-mode',
        component: 'ActionDotModeComponent',
        name: 'Action Dot Mode'
      }
    ]
  },
  {
    path: 'alert',
    children: [
      {
        path: 'alert-accents',
        link: '/alert/alert-accents',
        component: 'AlertAccentsComponent',
        name: 'Alert Accents'
      },
      {
        path: 'alert-colors',
        link: '/alert/alert-colors',
        component: 'AlertColorsComponent',
        name: 'Alert Colors'
      },
      {
        path: 'alert-outline',
        link: '/alert/alert-outline',
        component: 'AlertOutlineComponent',
        name: 'Alert Outline'
      },
      {
        path: 'alert-showcase',
        link: '/alert/alert-showcase',
        component: 'AlertShowcaseComponent',
        name: 'Alert Showcase'
      },
      {
        path: 'alert-sizes',
        link: '/alert/alert-sizes',
        component: 'AlertSizesComponent',
        name: 'Alert Sizes'
      },
      {
        path: 'alert-test',
        link: '/alert/alert-test',
        component: 'AlertTestComponent',
        name: 'Alert Test'
      }
    ]
  },
  {
    path: 'autocomplete',
    children: [
      {
        path: 'autocomplete-showcase',
        link: '/autocomplete/autocomplete-showcase',
        component: 'AutocompleteShowcaseComponent',
        name: 'Autocomplete Showcase'
      },
      {
        path: 'autocomplete-form.component',
        link: '/autocomplete/autocomplete-form.component',
        component: 'AutocompleteFormComponent',
        name: 'Autocomplete Form'
      },
      {
        path: 'autocomplete-group',
        link: '/autocomplete/autocomplete-group',
        component: 'AutocompleteGroupComponent',
        name: 'Autocomplete Group'
      },
      {
        path: 'autocomplete-custom-display',
        link: '/autocomplete/autocomplete-custom-display',
        component: 'AutocompleteCustomDisplayComponent',
        name: 'Autocomplete Custom Display'
      },
      {
        path: 'autocomplete-active-first',
        link: '/autocomplete/autocomplete-active-first',
        component: 'AutocompleteActiveFirstComponent',
        name: 'Autocomplete Active First'
      },
      {
        path: 'autocomplete-disabled',
        link: '/autocomplete/autocomplete-disabled',
        component: 'AutocompleteDisabledComponent',
        name: 'Autocomplete Disabled'
      }
    ]
  },
  {
    path: 'badge',
    children: [
      {
        path: 'badge-showcase',
        link: '/badge/badge-showcase',
        component: 'BadgeShowcaseComponent',
        name: 'Badge Showcase'
      }
    ]
  },
  {
    path: 'button',
    children: [
      {
        path: 'button-colors',
        link: '/button/button-colors',
        component: 'ButtonColorsComponent',
        name: 'Button Colors'
      },
      {
        path: 'button-fullwidth',
        link: '/button/button-fullwidth',
        component: 'ButtonFullWidthComponent',
        name: 'Button Full Width'
      },
      {
        path: 'button-hero',
        link: '/button/button-hero',
        component: 'ButtonHeroComponent',
        name: 'Button Hero'
      },
      {
        path: 'button-outline',
        link: '/button/button-outline',
        component: 'ButtonOutlineComponent',
        name: 'Button Outline'
      },
      {
        path: 'button-shapes',
        link: '/button/button-shapes',
        component: 'ButtonShapesComponent',
        name: 'Button Shapes'
      },
      {
        path: 'button-showcase',
        link: '/button/button-showcase',
        component: 'ButtonShowcaseComponent',
        name: 'Button Showcase'
      },
      {
        path: 'button-sizes',
        link: '/button/button-sizes',
        component: 'ButtonSizesComponent',
        name: 'Button Sizes'
      },
      {
        path: 'button-types.component',
        link: '/button/button-types.component',
        component: 'ButtonTypesComponent',
        name: 'Button Types'
      },
      {
        path: 'button-icon',
        link: '/button/button-icon',
        component: 'ButtonIconComponent',
        name: 'Button Icon'
      },
      {
        path: 'button-interactive.component',
        link: '/button/button-interactive.component',
        component: 'ButtonInteractiveComponent',
        name: 'Button Interactive'
      },
      {
        path: 'link-buttons',
        link: '/button/link-buttons',
        component: 'LinkButtons',
        name: 'Link Buttons'
      }
    ]
  },
  {
    path: 'button-group',
    children: [
      {
        path: 'button-group-showcase',
        link: '/button-group/button-group-showcase',
        component: 'ButtonGroupShowcaseComponent',
        name: 'Button Group Showcase'
      },
      {
        path: 'button-group-multiple',
        link: '/button-group/button-group-multiple',
        component: 'ButtonGroupMultipleComponent',
        name: 'Button Group Multiple'
      },
      {
        path: 'button-group-sizes',
        link: '/button-group/button-group-sizes',
        component: 'ButtonGroupSizesComponent',
        name: 'Button Group Sizes'
      },
      {
        path: 'button-group-appearances',
        link: '/button-group/button-group-appearances',
        component: 'ButtonGroupAppearancesComponent',
        name: 'Button Group Appearances'
      },
      {
        path: 'button-group-shapes',
        link: '/button-group/button-group-shapes',
        component: 'ButtonGroupShapesComponent',
        name: 'Button Group Shapes'
      },
      {
        path: 'button-and-button-toggle-groups',
        link: '/button-group/button-and-button-toggle-groups',
        component: 'ButtonAndButtonToggleGroupsComponent',
        name: 'Button And Button Toggle Groups'
      },
      {
        path: 'button-group-interactive.component',
        link: '/button-group/button-group-interactive.component',
        component: 'ButtonGroupInteractiveComponent',
        name: 'Button Group Interactive'
      },
      {
        path: 'button-group-disabled',
        link: '/button-group/button-group-disabled',
        component: 'ButtonGroupDisabledComponent',
        name: 'Button Group Disabled'
      },
      {
        path: 'button-group-statuses',
        link: '/button-group/button-group-statuses',
        component: 'ButtonGroupStatusesComponent',
        name: 'Button Group Statuses'
      },
      {
        path: 'button-group-value-change',
        link: '/button-group/button-group-value-change',
        component: 'ButtonGroupValueChangeComponent',
        name: 'Button Group Value Change'
      }
    ]
  },
  {
    path: 'calendar',
    children: [
      {
        path: 'calendar-bounding-month',
        link: '/calendar/calendar-bounding-month',
        component: 'CalendarBoundingMonthComponent',
        name: 'Calendar Bounding Month'
      },
      {
        path: 'calendar-custom-day-cell-showcase',
        link: '/calendar/calendar-custom-day-cell-showcase',
        component: 'CalendarCustomDayCellShowcaseComponent',
        name: 'Calendar Custom Day Cell Showcase'
      },
      {
        path: 'calendar-filter',
        link: '/calendar/calendar-filter',
        component: 'CalendarFilterComponent',
        name: 'Calendar Filter'
      },
      {
        path: 'calendar-min-max',
        link: '/calendar/calendar-min-max',
        component: 'CalendarMinMaxComponent',
        name: 'Calendar Min Max'
      },
      {
        path: 'calendar-range-showcase',
        link: '/calendar/calendar-range-showcase',
        component: 'CalendarRangeShowcaseComponent',
        name: 'Calendar Range Showcase'
      },
      {
        path: 'calendar-showcase',
        link: '/calendar/calendar-showcase',
        component: 'CalendarShowcaseComponent',
        name: 'Calendar Showcase'
      },
      {
        path: 'calendar-size',
        link: '/calendar/calendar-size',
        component: 'CalendarSizeComponent',
        name: 'Calendar Size'
      },
      {
        path: 'calendar-start-view',
        link: '/calendar/calendar-start-view',
        component: 'CalendarStartViewComponent',
        name: 'Calendar Start View'
      },
      {
        path: 'calendar-without-navigation',
        link: '/calendar/calendar-without-navigation',
        component: 'CalendarWithoutNavigationComponent',
        name: 'Calendar Without Navigation'
      },
      {
        path: 'calendar-week-number',
        link: '/calendar/calendar-week-number',
        component: 'CalendarWeekNumberComponent',
        name: 'Calendar Week Number'
      }
    ]
  },
  {
    path: 'calendar-kit',
    children: [
      {
        path: 'calendar-kit-full-calendar',
        link: '/calendar-kit/calendar-kit-full-calendar',
        component: 'CalendarKitFullCalendarShowcaseComponent',
        name: 'Calendar Kit Full Calendar Showcase'
      }
    ]
  },
  {
    path: 'card',
    children: [
      {
        path: 'card-accents',
        link: '/card/card-accents',
        component: 'CardAccentsComponent',
        name: 'Card Accents'
      },
      {
        path: 'card-colors',
        link: '/card/card-colors',
        component: 'CardColorsComponent',
        name: 'Card Colors'
      },
      {
        path: 'card-full',
        link: '/card/card-full',
        component: 'CardFullComponent',
        name: 'Card Full'
      },
      {
        path: 'card-showcase',
        link: '/card/card-showcase',
        component: 'CardShowcaseComponent',
        name: 'Card Showcase'
      },
      {
        path: 'card-sizes',
        link: '/card/card-sizes',
        component: 'CardSizesComponent',
        name: 'Card Sizes'
      },
      {
        path: 'card-test',
        link: '/card/card-test',
        component: 'CardTestComponent',
        name: 'Card Test'
      },
      {
        path: 'card-without-body.component',
        link: '/card/card-without-body.component',
        component: 'CardWithoutBodyComponent',
        name: 'Card Without Body'
      },
      {
        path: 'card-sizes-combinations',
        link: '/card/card-sizes-combinations',
        component: 'CardSizesCombinationsComponent',
        name: 'Card Sizes Combinations'
      }
    ]
  },
  {
    path: 'chat',
    children: [
      {
        path: 'chat-colors.component',
        link: '/chat/chat-colors.component',
        component: 'ChatColorsComponent',
        name: 'Chat Colors'
      },
      {
        path: 'chat-conversation-showcase.component',
        link: '/chat/chat-conversation-showcase.component',
        component: 'ChatConversationShowcaseComponent',
        name: 'Chat Conversation Showcase'
      },
      {
        path: 'chat-drop.component',
        link: '/chat/chat-drop.component',
        component: 'ChatDropComponent',
        name: 'Chat Drop'
      },
      {
        path: 'chat-message-types-showcase.component',
        link: '/chat/chat-message-types-showcase.component',
        component: 'ChatMessageTypesShowcaseComponent',
        name: 'Chat Message Types Showcase'
      },
      {
        path: 'chat-showcase.component',
        link: '/chat/chat-showcase.component',
        component: 'ChatShowcaseComponent',
        name: 'Chat Showcase'
      },
      {
        path: 'chat-sizes.component',
        link: '/chat/chat-sizes.component',
        component: 'ChatSizesComponent',
        name: 'Chat Sizes'
      },
      {
        path: 'chat-test.component',
        link: '/chat/chat-test.component',
        component: 'ChatTestComponent',
        name: 'Chat Test'
      },
      {
        path: 'chat-custom-message.component',
        link: '/chat/chat-custom-message.component',
        component: 'ChatCustomMessageComponent',
        name: 'Chat Custom Message'
      },
      {
        path: 'chat-template-title.component',
        link: '/chat/chat-template-title.component',
        component: 'ChatTemplateTitleComponent',
        name: 'Chat Template Title'
      }
    ]
  },
  {
    path: 'checkbox',
    children: [
      {
        path: 'checkbox-disabled',
        link: '/checkbox/checkbox-disabled',
        component: 'CheckboxDisabledComponent',
        name: 'Checkbox Disabled'
      },
      {
        path: 'checkbox-showcase',
        link: '/checkbox/checkbox-showcase',
        component: 'CheckboxShowcaseComponent',
        name: 'Checkbox Showcase'
      },
      {
        path: 'checkbox-status',
        link: '/checkbox/checkbox-statuses',
        component: 'CheckboxStatusComponent',
        name: 'Checkbox Statuses'
      },
      {
        path: 'checkbox-test',
        link: '/checkbox/checkbox-test',
        component: 'CheckboxTestComponent',
        name: 'Checkbox Test'
      },
      {
        path: 'checkbox-indeterminate',
        link: '/checkbox/checkbox-indeterminate',
        component: 'CheckboxIndeterminateComponent',
        name: 'Checkbox Indeterminate'
      }
    ]
  },
  {
    path: 'datepicker',
    children: [
      {
        path: 'datepicker-forms.component',
        link: '/datepicker/datepicker-forms.component',
        component: 'DatepickerFormsComponent',
        name: 'Datepicker Forms'
      },
      {
        path: 'datepicker-showcase',
        link: '/datepicker/datepicker-showcase',
        component: 'DatepickerShowcaseComponent',
        name: 'Datepicker Showcase'
      },
      {
        path: 'date-timepicker-showcase.component',
        link: '/datepicker/date-timepicker-showcase.component',
        component: 'DateTimepickerShowcaseComponent',
        name: 'Date Timepicker Showcase'
      },
      {
        path: 'date-timepicker-single-column.component',
        link: '/datepicker/date-timepicker-single-column.component',
        component: 'DateTimepickerSingleColumnComponent',
        name: 'Date Timepicker Single Column'
      },
      {
        path: 'datepicker-validation',
        link: '/datepicker/datepicker-validation',
        component: 'DatepickerValidationComponent',
        name: 'Datepicker Validation'
      },
      {
        path: 'rangepicker-showcase',
        link: '/datepicker/rangepicker-showcase',
        component: 'RangepickerShowcaseComponent',
        name: 'Rangepicker Showcase'
      },
      {
        path: 'datepicker-filter',
        link: '/datepicker/datepicker-filter',
        component: 'DatepickerFilterComponent',
        name: 'Datepicker Filter'
      }
    ]
  },
  {
    path: 'timepicker',
    children: [
      {
        path: 'timepicker-showcase.component',
        link: '/timepicker/timepicker-showcase.component',
        component: 'TimepickerShowcaseComponent',
        name: 'Timepicker Showcase'
      },
      {
        path: 'timepicker-twelve-hours-format.component',
        link: '/timepicker/timepicker-twelve-hours-format.component',
        component: 'TimepickerTwelveHoursFormatComponent',
        name: 'Timepicker Twelve Hours Format'
      },
      {
        path: 'timepicker-single-column.component',
        link: '/timepicker/timepicker-single-column.component',
        component: 'TimepickerSingleColumnComponent',
        name: 'Timepicker Single Column'
      },
      {
        path: 'timepicker-with-seconds.component',
        link: '/timepicker/timepicker-with-seconds.component',
        component: 'TimepickerWithSecondsComponent',
        name: 'Timepicker With Seconds'
      },
      {
        path: 'timepicker-form-control.component',
        link: '/timepicker/timepicker-form-control.component',
        component: 'TimepickerFormControlComponent',
        name: 'Timepicker Form Control'
      },
      {
        path: 'timepicker-ng-model.component',
        link: '/timepicker/timepicker-ng-model.component',
        component: 'TimepickerNgModelComponent',
        name: 'Timepicker Ng Model'
      }
    ]
  },
  {
    path: 'dialog',
    children: [
      {
        path: 'dialog-auto-focus',
        link: '/dialog/dialog-auto-focus',
        component: 'DialogAutoFocusComponent',
        name: 'Dialog Auto Focus'
      },
      {
        path: 'dialog-backdrop-click',
        link: '/dialog/dialog-backdrop-click',
        component: 'DialogBackdropClickComponent',
        name: 'Dialog Backdrop Click'
      },
      {
        path: 'dialog-esc',
        link: '/dialog/dialog-esc',
        component: 'DialogEscComponent',
        name: 'Dialog Esc'
      },
      {
        path: 'dialog-has-backdrop',
        link: '/dialog/dialog-has-backdrop',
        component: 'DialogHasBackdropComponent',
        name: 'Dialog Has Backdrop'
      },
      {
        path: 'dialog-result.component',
        link: '/dialog/dialog-result.component',
        component: 'DialogResultComponent',
        name: 'Dialog Result'
      },
      {
        path: 'dialog-scroll',
        link: '/dialog/dialog-scroll',
        component: 'DialogScrollComponent',
        name: 'Dialog Scroll'
      },
      {
        path: 'dialog-showcase',
        link: '/dialog/dialog-showcase',
        component: 'DialogShowcaseComponent',
        name: 'Dialog Showcase'
      },
      {
        path: 'dialog-template.component',
        link: '/dialog/dialog-template.component',
        component: 'DialogTemplateComponent',
        name: 'Dialog Template'
      }
    ]
  },
  {
    path: 'flip-card',
    children: [
      {
        path: 'flip-card-accents',
        link: '/flip-card/flip-card-accents',
        component: 'FlipCardAccentsComponent',
        name: 'Flip Card Accents'
      },
      {
        path: 'flip-card-colors',
        link: '/flip-card/flip-card-colors',
        component: 'FlipCardColorsComponent',
        name: 'Flip Card Colors'
      },
      {
        path: 'flip-card-full',
        link: '/flip-card/flip-card-full',
        component: 'FlipCardFullComponent',
        name: 'Flip Card Full'
      },
      {
        path: 'flip-card-showcase',
        link: '/flip-card/flip-card-showcase',
        component: 'FlipCardShowcaseComponent',
        name: 'Flip Card Showcase'
      },
      {
        path: 'flip-card-sizes',
        link: '/flip-card/flip-card-sizes',
        component: 'FlipCardSizesComponent',
        name: 'Flip Card Sizes'
      }
    ]
  },
  {
    path: 'infinite-list',
    children: [
      {
        path: 'infinite-list-placeholders',
        link: '/infinite-list/infinite-list-placeholders',
        component: 'InfiniteListPlaceholdersComponent',
        name: 'Infinite List Placeholders'
      },
      {
        path: 'infinite-list-scroll-modes',
        link: '/infinite-list/infinite-list-scroll-modes',
        component: 'InfiniteListScrollModesComponent',
        name: 'Infinite List Scroll Modes'
      },
      {
        path: 'infinite-list-showcase',
        link: '/infinite-list/infinite-list-showcase',
        component: 'InfiniteListShowcaseComponent',
        name: 'Infinite List Showcase'
      },
      {
        path: 'infinite-news-list.component',
        link: '/infinite-list/infinite-news-list.component',
        component: 'InfiniteNewsListComponent',
        name: 'Infinite News List'
      }
    ]
  },
  {
    path: 'input',
    children: [
      {
        path: 'input-colors',
        link: '/input/input-colors',
        component: 'InputColorsComponent',
        name: 'Input Colors'
      },
      {
        path: 'input-full-width.component',
        link: '/input/input-full-width.component',
        component: 'InputFullWidthComponent',
        name: 'Input Full Width'
      },
      {
        path: 'input-shapes',
        link: '/input/input-shapes',
        component: 'InputShapesComponent',
        name: 'Input Shapes'
      },
      {
        path: 'input-showcase',
        link: '/input/input-showcase',
        component: 'InputsShowcaseComponent',
        name: 'Inputs Showcase'
      },
      {
        path: 'input-sizes',
        link: '/input/input-sizes',
        component: 'InputSizesComponent',
        name: 'Input Sizes'
      },
      {
        path: 'input-types.component',
        link: '/input/input-types.component',
        component: 'InputTypesComponent',
        name: 'Input Types'
      },
      {
        path: 'input-form.component',
        link: '/input/input-form.component',
        component: 'InputFormComponent',
        name: 'Input Form'
      }
    ]
  },
  {
    path: 'list',
    children: [
      {
        path: 'simple-list-showcase',
        link: '/list/simple-list-showcase',
        component: 'SimpleListShowcaseComponent',
        name: 'Simple List Showcase'
      },
      {
        path: 'users-list-showcase.component',
        link: '/list/users-list-showcase.component',
        component: 'UsersListShowcaseComponent',
        name: 'Users List Showcase'
      }
    ]
  },
  {
    path: 'menu',
    children: [
      {
        path: 'menu-children.component',
        link: '/menu/menu-children.component',
        component: 'MenuChildrenComponent',
        name: 'Menu Children'
      },
      {
        path: 'menu-showcase',
        link: '/menu/menu-showcase',
        component: 'MenuShowcaseComponent',
        name: 'Menu Showcase'
      },
      {
        path: 'menu-autocollapse.component',
        link: '/menu/menu-autocollapse.component',
        component: 'MenuAutoCollapseComponent',
        name: 'Menu Auto Collapse'
      },
      {
        path: 'menu-link-params.component',
        link: '/menu/menu-link-params.component',
        component: 'MenuLinkParamsComponent',
        name: 'Menu Link Params'
      },
      {
        path: 'menu-badge.component',
        link: '/menu/menu-badge.component',
        component: 'MenuBadgeComponent',
        name: 'Menu Badge'
      },
      {
        path: 'menu-service.component',
        link: '/menu/menu-service.component',
        component: 'MenuServiceComponent',
        name: 'Menu Service',
        children: [
          {
            path: '2',
            link: '/menu/menu-service.component/2',
            component: 'MenuServiceItem2Component',
            name: 'Menu Service Item2'
          },
          {
            path: '3',
            link: '/menu/menu-service.component/3',
            component: 'MenuServiceItem3Component',
            name: 'Menu Service Item3',
            children: [
              {
                path: '1',
                link: '/menu/menu-service.component/3/1',
                component: 'MenuServiceItem31Component',
                name: 'Menu Service Item31'
              },
              {
                path: '2',
                link: '/menu/menu-service.component/3/2',
                component: 'MenuServiceItem32Component',
                name: 'Menu Service Item32'
              },
              {
                path: '3',
                link: '/menu/menu-service.component/3/3',
                component: 'MenuServiceItem33Component',
                name: 'Menu Service Item33',
                children: [
                  {
                    path: '1',
                    link: '/menu/menu-service.component/3/3/1',
                    component: 'MenuServiceItem331Component',
                    name: 'Menu Service Item331'
                  },
                  {
                    path: '2',
                    link: '/menu/menu-service.component/3/3/2',
                    component: 'MenuServiceItem332Component',
                    name: 'Menu Service Item332'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'overlay',
    children: [
      {
        path: 'overlay-showcase.component',
        link: '/overlay/overlay-showcase.component',
        component: 'OverlayShowcaseComponent',
        name: 'Overlay Showcase'
      }
    ]
  },
  {
    path: 'popover',
    children: [
      {
        path: 'popover-content',
        link: '/popover/popover-content',
        component: 'PopoverCustomComponentComponent',
        name: 'Popover Rich Content'
      },
      {
        path: 'popover-modes',
        link: '/popover/popover-modes',
        component: 'PopoverModesComponent',
        name: 'Popover Modes'
      },
      {
        path: 'popover-placements',
        link: '/popover/popover-placements',
        component: 'PopoverPlacementsComponent',
        name: 'Popover Placements'
      },
      {
        path: 'popover-showcase',
        link: '/popover/popover-showcase',
        component: 'PopoverShowcaseComponent',
        name: 'Popover Showcase'
      },
      {
        path: 'popover-template-ref.component',
        link: '/popover/popover-template-ref.component',
        component: 'PopoverTemplateRefComponent',
        name: 'Popover Template Ref'
      },
      {
        path: 'popover-test.component',
        link: '/popover/popover-test.component',
        component: 'PopoverTestComponent',
        name: 'Popover Test'
      },
      {
        path: 'popover-noop',
        link: '/popover/popover-noop',
        component: 'PopoverNoopComponent',
        name: 'Popover Noop'
      },
      {
        path: 'popover-dynamic',
        link: '/popover/popover-dynamic',
        component: 'PopoverDynamicComponent',
        name: 'Popover Dynamic'
      },
      {
        path: 'popover-disable',
        link: '/popover/popover-disable',
        component: 'PopoverDynamicCodeComponent',
        name: 'Popover Disable'
      }
    ]
  },
  {
    path: 'progress-bar',
    children: [
      {
        path: 'progress-bar-interactive',
        link: '/progress-bar/progress-bar-interactive',
        component: 'ProgressBarInteractiveComponent',
        name: 'Progress Bar Interactive'
      },
      {
        path: 'progress-bar-showcase',
        link: '/progress-bar/progress-bar-showcase',
        component: 'ProgressBarShowcaseComponent',
        name: 'Progress Bar Showcase'
      },
      {
        path: 'progress-bar-size',
        link: '/progress-bar/progress-bar-size',
        component: 'ProgressBarSizeComponent',
        name: 'Progress Bar Size'
      },
      {
        path: 'progress-bar-status',
        link: '/progress-bar/progress-bar-status',
        component: 'ProgressBarStatusComponent',
        name: 'Progress Bar Status'
      },
      {
        path: 'progress-bar-value',
        link: '/progress-bar/progress-bar-value',
        component: 'ProgressBarValueComponent',
        name: 'Progress Bar Value'
      }
    ]
  },
  {
    path: 'radio',
    children: [
      {
        path: 'radio-disabled',
        link: '/radio/radio-disabled',
        component: 'RadioDisabledComponent',
        name: 'Radio Disabled'
      },
      {
        path: 'radio-showcase',
        link: '/radio/radio-showcase',
        component: 'RadioShowcaseComponent',
        name: 'Radio Showcase'
      },
      {
        path: 'radio-statuses',
        link: '/radio/radio-statuses',
        component: 'RadioStatusesComponent',
        name: 'Radio Statuses'
      },
      {
        path: 'radio-disabled-group.component',
        link: '/radio/radio-disabled-group.component',
        component: 'RadioDisabledGroupComponent',
        name: 'Radio Disabled Group'
      },
      {
        path: 'radio-form.component',
        link: '/radio/radio-form.component',
        component: 'RadioFormComponent',
        name: 'Radio Form'
      }
    ]
  },
  {
    path: 'reveal-card',
    children: [
      {
        path: 'reveal-card-accents',
        link: '/reveal-card/reveal-card-accents',
        component: 'RevealCardAccentsComponent',
        name: 'Reveal Card Accents'
      },
      {
        path: 'reveal-card-colors',
        link: '/reveal-card/reveal-card-colors',
        component: 'RevealCardColorsComponent',
        name: 'Reveal Card Colors'
      },
      {
        path: 'reveal-card-full',
        link: '/reveal-card/reveal-card-full',
        component: 'RevealCardFullComponent',
        name: 'Reveal Card Full'
      },
      {
        path: 'reveal-card-showcase',
        link: '/reveal-card/reveal-card-showcase',
        component: 'RevealCardShowcaseComponent',
        name: 'Reveal Card Showcase'
      },
      {
        path: 'reveal-card-sizes',
        link: '/reveal-card/reveal-card-sizes',
        component: 'RevealCardSizesComponent',
        name: 'Reveal Card Sizes'
      }
    ]
  },
  {
    path: 'select',
    children: [
      {
        path: 'select-clean',
        link: '/select/select-clean',
        component: 'SelectCleanComponent',
        name: 'Select Clean'
      },
      {
        path: 'select-disabled',
        link: '/select/select-disabled',
        component: 'SelectDisabledComponent',
        name: 'Select Disabled'
      },
      {
        path: 'select-filled',
        link: '/select/select-filled',
        component: 'SelectFilledComponent',
        name: 'Select Filled'
      },
      {
        path: 'select-form.component',
        link: '/select/select-form.component',
        component: 'SelectFormComponent',
        name: 'Select Form'
      },
      {
        path: 'select-groups',
        link: '/select/select-groups',
        component: 'SelectGroupsComponent',
        name: 'Select Groups'
      },
      {
        path: 'select-hero',
        link: '/select/select-hero',
        component: 'SelectHeroComponent',
        name: 'Select Hero'
      },
      {
        path: 'select-label',
        link: '/select/select-label',
        component: 'SelectLabelShowcaseComponent',
        name: 'Select Label Showcase'
      },
      {
        path: 'select-multiple',
        link: '/select/select-multiple',
        component: 'SelectMultipleComponent',
        name: 'Select Multiple'
      },
      {
        path: 'select-multiple-object',
        link: '/select/select-object-value',
        component: 'SelectMultipleComponent',
        name: 'Select Object Value'
      },
      {
        path: 'select-multiple-ref',
        link: '/select/select-ref-examples',
        component: 'SelectMultipleComponent',
        name: 'Select Ref Examples'
      },
      {
        path: 'select-shapes',
        link: '/select/select-shapes',
        component: 'SelectShapeComponent',
        name: 'Select Shapes'
      },
      {
        path: 'select-showcase',
        link: '/select/select-showcase',
        component: 'SelectShowcaseComponent',
        name: 'Select Showcase'
      },
      {
        path: 'select-sizes',
        link: '/select/select-sizes',
        component: 'SelectSizesComponent',
        name: 'Select Sizes'
      },
      {
        path: 'select-status',
        link: '/select/select-statuses',
        component: 'SelectStatusComponent',
        name: 'Select Statuses'
      },
      {
        path: 'select-interactive.component',
        link: '/select/select-interactive.component',
        component: 'SelectInteractiveComponent',
        name: 'Select Interactive'
      },
      {
        path: 'select-test.component',
        link: '/select/select-test.component',
        component: 'SelectTestComponent',
        name: 'Select Test'
      },
      {
        path: 'select-compare-with.component',
        link: '/select/select-compare-with.component',
        component: 'SelectCompareWithComponent',
        name: 'Select Compare With'
      },
      {
        path: 'select-icon.component',
        link: '/select/select-icon.component',
        component: 'SelectIconComponent',
        name: 'Select Icon'
      }
    ]
  },
  {
    path: 'spinner',
    children: [
      {
        path: 'spinner-button',
        link: '/spinner/spinner-button',
        component: 'SpinnerButtonComponent',
        name: 'Spinner Button'
      },
      {
        path: 'spinner-card',
        link: '/spinner/spinner-card',
        component: 'SpinnerCardComponent',
        name: 'Spinner Card'
      },
      {
        path: 'spinner-colors',
        link: '/spinner/spinner-colors',
        component: 'SpinnerColorsComponent',
        name: 'Spinner Colors'
      },
      {
        path: 'spinner-sizes',
        link: '/spinner/spinner-sizes',
        component: 'SpinnerSizesComponent',
        name: 'Spinner Sizes'
      },
      {
        path: 'spinner-tabs.component',
        link: '/spinner/spinner-tabs.component',
        component: 'SpinnerTabsComponent',
        name: 'Spinner Tabs'
      }
    ]
  },
  {
    path: 'stepper',
    children: [
      {
        path: 'stepper-showcase',
        link: '/stepper/stepper-showcase',
        component: 'StepperShowcaseComponent',
        name: 'Stepper Showcase'
      },
      {
        path: 'stepper-test.component',
        link: '/stepper/stepper-test.component',
        component: 'StepperTestComponent',
        name: 'Stepper Test'
      },
      {
        path: 'stepper-validation.component',
        link: '/stepper/stepper-validation.component',
        component: 'StepperValidationComponent',
        name: 'Stepper Validation'
      },
      {
        path: 'stepper-vertical',
        link: '/stepper/stepper-vertical',
        component: 'StepperVerticalComponent',
        name: 'Stepper Vertical'
      },
      {
        path: 'stepper-disabled-step-nav',
        link: '/stepper/stepper-disabled-step-nav',
        component: 'StepperDisabledStepNavComponent',
        name: 'Stepper Disabled Step Nav'
      },
      {
        path: 'stepper-linear',
        link: '/stepper/stepper-linear',
        component: 'StepperLinearComponent',
        name: 'Stepper Linear'
      },
      {
        path: 'stepper-step-change-event',
        link: '/stepper/stepper-step-change-event',
        component: 'StepperStepChangeEventComponent',
        name: 'Stepper Step Change Event'
      }
    ]
  },
  {
    path: 'tag',
    children: [
      {
        path: 'tag-showcase',
        link: '/tag/tag-showcase',
        component: 'TagShowcaseComponent',
        name: 'Tag Showcase'
      },
      {
        path: 'tag-appearance',
        link: '/tag/tag-appearance',
        component: 'TagAppearanceComponent',
        name: 'Tag Appearance'
      },
      {
        path: 'tag-input',
        link: '/tag/tag-input',
        component: 'TagInputComponent',
        name: 'Tag Input'
      },
      {
        path: 'tag-input-with-autocomplete',
        link: '/tag/tag-input-with-autocomplete',
        component: 'TagInputWithAutocompleteComponent',
        name: 'Tag Input With Autocomplete'
      },
      {
        path: 'tag-status',
        link: '/tag/tag-status',
        component: 'TagStatusComponent',
        name: 'Tag Status'
      },
      {
        path: 'tag-removable.component',
        link: '/tag/tag-removable.component',
        component: 'TagRemovableComponent',
        name: 'Tag Removable'
      }
    ]
  },
  {
    path: 'tabset',
    children: [
      {
        path: 'route-tabset-showcase',
        link: '/tabset/route-tabset-showcase',
        component: 'RouteTabsetShowcaseComponent',
        name: 'Route Tabset Showcase'
      },
      {
        path: 'tabset-badge',
        link: '/tabset/tabset-badge',
        component: 'TabsetBadgeComponent',
        name: 'Tabset Badge'
      },
      {
        path: 'tabset-icon',
        link: '/tabset/tabset-icon',
        component: 'TabsetIconComponent',
        name: 'Tabset Icon'
      },
      {
        path: 'tabset-showcase',
        link: '/tabset/tabset-showcase',
        component: 'TabsetShowcaseComponent',
        name: 'Tabset Showcase'
      },
      {
        path: 'tabset-test.component',
        link: '/tabset/tabset-test.component',
        component: 'TabsetTestComponent',
        name: 'Tabset Test'
      },
      {
        path: 'tabset-test.component/:tab',
        link: '/tabset/tabset-test.component/:tab',
        component: 'TabsetTestComponent',
        name: 'Tabset Test'
      },
      {
        path: 'tabset-width',
        link: '/tabset/tabset-width',
        component: 'TabsetWidthComponent',
        name: 'Tabset Width'
      },
      {
        path: 'tabset-disabled',
        link: '/tabset/tabset-disabled',
        component: 'TabsetDisabledComponent',
        name: 'Tabset Disabled'
      },
      {
        path: 'tabset-title',
        link: '/tabset/tabset-title',
        component: 'TabsetTemplateTitleComponent',
        name: 'Tabset Template Title'
      }
    ]
  },
  {
    path: 'toastr',
    children: [
      {
        path: 'toastr-destroy-by-click.component',
        link: '/toastr/toastr-destroy-by-click.component',
        component: 'ToastrDestroyByClickComponent',
        name: 'Toastr Destroy By Click'
      },
      {
        path: 'toastr-duration.component',
        link: '/toastr/toastr-duration.component',
        component: 'ToastrDurationComponent',
        name: 'Toastr Duration'
      },
      {
        path: 'toastr-icon.component',
        link: '/toastr/toastr-icon.component',
        component: 'ToastrIconComponent',
        name: 'Toastr Icon'
      },
      {
        path: 'toastr-positions.component',
        link: '/toastr/toastr-positions.component',
        component: 'ToastrPositionsComponent',
        name: 'Toastr Positions'
      },
      {
        path: 'toastr-prevent-duplicates.component',
        link: '/toastr/toastr-prevent-duplicates.component',
        component: 'ToastrPreventDuplicatesComponent',
        name: 'Toastr Prevent Duplicates'
      },
      {
        path: 'toastr-prevent-duplicates-behaviour.component',
        link: '/toastr/toastr-prevent-duplicates-behaviour.component',
        component: 'ToastrPreventDuplicatesBehaviourComponent',
        name: 'Toastr Prevent Duplicates Behaviour'
      },
      {
        path: 'toastr-showcase.component',
        link: '/toastr/toastr-showcase.component',
        component: 'ToastrShowcaseComponent',
        name: 'Toastr Showcase'
      },
      {
        path: 'toastr-statuses.component',
        link: '/toastr/toastr-statuses.component',
        component: 'ToastrStatusesComponent',
        name: 'Toastr Statuses'
      },
      {
        path: 'toastr-limit.component',
        link: '/toastr/toastr-limit.component',
        component: 'ToastrLimitComponent',
        name: 'Toastr Limit'
      }
    ]
  },
  {
    path: 'tooltip',
    children: [
      {
        path: 'tooltip-colors.component',
        link: '/tooltip/tooltip-colors.component',
        component: 'TooltipColorsComponent',
        name: 'Tooltip Colors'
      },
      {
        path: 'tooltip-placements.component',
        link: '/tooltip/tooltip-placements.component',
        component: 'TooltipPlacementsComponent',
        name: 'Tooltip Placements'
      },
      {
        path: 'tooltip-showcase.component',
        link: '/tooltip/tooltip-showcase.component',
        component: 'TooltipShowcaseComponent',
        name: 'Tooltip Showcase'
      },
      {
        path: 'tooltip-with-icon.component',
        link: '/tooltip/tooltip-with-icon.component',
        component: 'TooltipWithIconComponent',
        name: 'Tooltip With Icon'
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        path: 'user-showcase.component',
        link: '/user/user-showcase.component',
        component: 'UserShowcaseComponent',
        name: 'User Showcase'
      },
      {
        path: 'user-sizes.component',
        link: '/user/user-sizes.component',
        component: 'UserSizesComponent',
        name: 'User Sizes'
      },
      {
        path: 'user-avatar-settings.component',
        link: '/user/user-avatar-settings.component',
        component: 'UserAvatarSettingsComponent',
        name: 'User Avatar Settings'
      },
      {
        path: 'user-hide-captions.component',
        link: '/user/user-hide-captions.component',
        component: 'UserHideCaptionsComponent',
        name: 'User Hide Captions'
      },
      {
        path: 'user-shape.component',
        link: '/user/user-shape.component',
        component: 'NbUserShapeComponent',
        name: 'Nb User Shape'
      }
    ]
  },
  {
    path: 'window',
    children: [
      {
        path: 'template-window.component',
        link: '/window/template-window.component',
        component: 'TemplateWindowComponent',
        name: 'Template Window'
      },
      {
        path: 'window-showcase.component',
        link: '/window/window-showcase.component',
        component: 'WindowShowcaseComponent',
        name: 'Window Showcase'
      },
      {
        path: 'windows-backdrop.component',
        link: '/window/windows-backdrop.component',
        component: 'WindowsBackdropComponent',
        name: 'Windows Backdrop'
      },
      {
        path: 'window-controls.component',
        link: '/window/window-controls.component',
        component: 'WindowControlsComponent',
        name: 'Window Controls'
      },
      {
        path: 'window-template-title.component',
        link: '/window/window-template-title.component',
        component: 'WindowTemplateTitleComponent',
        name: 'Window Template Title'
      }
    ]
  },
  {
    path: 'oauth2',
    children: [
      {
        path: 'callback',
        link: '/oauth2/callback',
        component: 'OAuth2CallbackComponent',
        name: 'OAuth2Callback'
      }
    ]
  },
  {
    path: 'oauth2-password'
  },
  {
    path: 'tree-grid',
    children: [
      {
        path: 'tree-grid-showcase.component',
        link: '/tree-grid/tree-grid-showcase.component',
        component: 'TreeGridShowcaseComponent',
        name: 'Tree Grid Showcase'
      },
      {
        path: 'tree-grid-sortable.component',
        link: '/tree-grid/tree-grid-sortable.component',
        component: 'TreeGridSortableComponent',
        name: 'Tree Grid Sortable'
      },
      {
        path: 'tree-grid-filterable.component',
        link: '/tree-grid/tree-grid-filterable.component',
        component: 'TreeGridFilterableComponent',
        name: 'Tree Grid Filterable'
      },
      {
        path: 'tree-grid-basic.component',
        link: '/tree-grid/tree-grid-basic.component',
        component: 'TreeGridBasicComponent',
        name: 'Tree Grid Basic'
      },
      {
        path: 'tree-grid-responsive.component',
        link: '/tree-grid/tree-grid-responsive.component',
        component: 'TreeGridResponsiveComponent',
        name: 'Tree Grid Responsive'
      },
      {
        path: 'tree-grid-custom-icons.component',
        link: '/tree-grid/tree-grid-custom-icons.component',
        component: 'TreeGridCustomIconsComponent',
        name: 'Tree Grid Custom Icons'
      },
      {
        path: 'tree-grid-disable-click-toggle.component',
        link: '/tree-grid/tree-grid-disable-click-toggle.component',
        component: 'TreeGridDisableClickToggleComponent',
        name: 'Tree Grid Disable Click Toggle'
      },
      {
        path: 'tree-grid-custom-node-structure.component',
        link: '/tree-grid/tree-grid-custom-node-structure.component',
        component: 'TreeGridCustomNodeStructureComponent',
        name: 'Tree Grid Custom Node Structure'
      }
    ]
  },
  {
    path: 'icon',
    children: [
      {
        path: 'icon-showcase',
        link: '/icon/icon-showcase',
        component: 'IconShowcaseComponent',
        name: 'Icon Showcase'
      },
      {
        path: 'icon-colors',
        link: '/icon/icon-colors',
        component: 'IconColorsComponent',
        name: 'Icon Colors'
      }
    ]
  },
  {
    path: 'toggle',
    children: [
      {
        path: 'toggle-disabled.component',
        link: '/toggle/toggle-disabled.component',
        component: 'ToggleDisabledComponent',
        name: 'Toggle Disabled'
      },
      {
        path: 'toggle-showcase.component',
        link: '/toggle/toggle-showcase.component',
        component: 'ToggleShowcaseComponent',
        name: 'Toggle Showcase'
      },
      {
        path: 'toggle-status.component',
        link: '/toggle/toggle-status.component',
        component: 'ToggleStatusComponent',
        name: 'Toggle Status'
      },
      {
        path: 'toggle-test.component',
        link: '/toggle/toggle-test.component',
        component: 'ToggleTestComponent',
        name: 'Toggle Test'
      },
      {
        path: 'toggle-label-position.component',
        link: '/toggle/toggle-label-position.component',
        component: 'ToggleLabelPositionComponent',
        name: 'Toggle Label Position'
      },
      {
        path: 'toggle-form.component',
        link: '/toggle/toggle-form.component',
        component: 'ToggleFormComponent',
        name: 'Toggle Form'
      }
    ]
  },
  {
    path: 'form-field',
    children: [
      {
        path: 'form-field-showcase',
        link: '/form-field/form-field-showcase',
        component: 'FormFieldShowcaseComponent',
        name: 'Form Field Showcase'
      },
      {
        path: 'form-field-password',
        link: '/form-field/form-field-password',
        component: 'FormFieldPasswordComponent',
        name: 'Form Field Password'
      },
      {
        path: 'form-field-input',
        link: '/form-field/form-field-input',
        component: 'FormFieldInputComponent',
        name: 'Form Field Input'
      }
    ]
  },
  {
    path: 'context-menu',
    children: [
      {
        path: 'context-menu-click.component',
        link: '/context-menu/context-menu-click.component',
        component: 'ContextMenuClickComponent',
        name: 'Context Menu Click'
      },
      {
        path: 'context-menu-showcase.component',
        link: '/context-menu/context-menu-showcase.component',
        component: 'ContextMenuShowcaseComponent',
        name: 'Context Menu Showcase'
      },
      {
        path: 'context-menu-test.component',
        link: '/context-menu/context-menu-test.component',
        component: 'ContextMenuTestComponent',
        name: 'Context Menu Test'
      },
      {
        path: 'context-menu-modes.component',
        link: '/context-menu/context-menu-modes.component',
        component: 'ContextMenuModesComponent',
        name: 'Context Menu Modes'
      },
      {
        path: 'context-menu-noop.component',
        link: '/context-menu/context-menu-noop.component',
        component: 'ContextMenuNoopComponent',
        name: 'Context Menu Noop'
      },
      {
        path: 'context-menu-right-click.component',
        link: '/context-menu/context-menu-right-click.component',
        component: 'ContextMenuRightClickComponent',
        name: 'Context Menu Right Click'
      }
    ]
  },
  {
    path: 'layout',
    children: [
      {
        path: 'layout-column-left.component',
        link: '/layout/layout-column-left.component',
        component: 'LayoutColumnLeftComponent',
        name: 'Layout Column Left'
      },
      {
        path: 'layout-fixed-header.component',
        link: '/layout/layout-fixed-header.component',
        component: 'LayoutFixedHeaderComponent',
        name: 'Layout Fixed Header'
      },
      {
        path: 'layout-footer-test.component',
        link: '/layout/layout-footer-test.component',
        component: 'LayoutFooterTestComponent',
        name: 'Layout Footer Test'
      },
      {
        path: 'layout-header-test.component',
        link: '/layout/layout-header-test.component',
        component: 'LayoutHeaderTestComponent',
        name: 'Layout Header Test'
      },
      {
        path: 'layout-showcase.component',
        link: '/layout/layout-showcase.component',
        component: 'LayoutShowcaseComponent',
        name: 'Layout Showcase'
      },
      {
        path: 'layout-sidebar-subheader.component',
        link: '/layout/layout-sidebar-subheader.component',
        component: 'LayoutSidebarSubheaderComponent',
        name: 'Layout Sidebar Subheader'
      },
      {
        path: 'layout-subheader.component',
        link: '/layout/layout-subheader.component',
        component: 'LayoutSubheaderComponent',
        name: 'Layout Subheader'
      },
      {
        path: 'layout-test.component',
        link: '/layout/layout-test.component',
        component: 'LayoutTestComponent',
        name: 'Layout Test'
      },
      {
        path: 'layout-w-footer.component',
        link: '/layout/layout-w-footer.component',
        component: 'LayoutWFooterComponent',
        name: 'Layout WFooter'
      },
      {
        path: 'theme-breakpoint-test.component',
        link: '/layout/theme-breakpoint-test.component',
        component: 'ThemeBreakpointTestComponent',
        name: 'Theme Breakpoint Test'
      },
      {
        path: 'theme-change-test.component',
        link: '/layout/theme-change-test.component',
        component: 'ThemeChangeTestComponent',
        name: 'Theme Change Test'
      }
    ]
  },
  {
    path: 'scroll',
    children: [
      {
        path: 'scroll-window.component',
        link: '/scroll/scroll-window.component',
        component: 'ScrollWindowComponent',
        name: 'Scroll Window'
      }
    ]
  },
  {
    path: 'search',
    children: [
      {
        path: 'search-customized-test',
        link: '/search/search-customized-test',
        component: 'SearchCustomizedTestComponent',
        name: 'Search Customized Test'
      },
      {
        path: 'search-event',
        link: '/search/search-event',
        component: 'SearchEventComponent',
        name: 'Search Event'
      },
      {
        path: 'search-showcase',
        link: '/search/search-showcase',
        component: 'SearchShowcaseComponent',
        name: 'Search Showcase'
      },
      {
        path: 'search-test.component',
        link: '/search/search-test.component',
        component: 'SearchTestComponent',
        name: 'Search Test'
      },
      {
        path: 'search-with-input-event',
        link: '/search/search-with-input-event',
        component: 'SearchWithInputEventComponent',
        name: 'Search With Input Event'
      }
    ]
  },
  {
    path: 'sidebar',
    children: [
      {
        path: 'sidebar-compacted',
        link: '/sidebar/sidebar-compacted',
        component: 'SidebarCompactedComponent',
        name: 'Sidebar Compacted'
      },
      {
        path: 'sidebar-fixed',
        link: '/sidebar/sidebar-fixed',
        component: 'SidebarFixedComponent',
        name: 'Sidebar Fixed'
      },
      {
        path: 'sidebar-one-test',
        link: '/sidebar/sidebar-one-test',
        component: 'SidebarOneTestComponent',
        name: 'Sidebar One Test'
      },
      {
        path: 'sidebar-right',
        link: '/sidebar/sidebar-right',
        component: 'SidebarRightComponent',
        name: 'Sidebar Right'
      },
      {
        path: 'sidebar-showcase',
        link: '/sidebar/sidebar-showcase',
        component: 'SidebarShowcaseComponent',
        name: 'Sidebar Showcase'
      },
      {
        path: 'sidebar-test',
        link: '/sidebar/sidebar-test',
        component: 'SidebarTestComponent',
        name: 'Sidebar Test'
      },
      {
        path: 'sidebar-three-test',
        link: '/sidebar/sidebar-three-test',
        component: 'SidebarThreeTestComponent',
        name: 'Sidebar Three Test'
      },
      {
        path: 'sidebar-toggle',
        link: '/sidebar/sidebar-toggle',
        component: 'SidebarToggleComponent',
        name: 'Sidebar Toggle'
      },
      {
        path: 'sidebar-two-test',
        link: '/sidebar/sidebar-two-test',
        component: 'SidebarTwoTestComponent',
        name: 'Sidebar Two Test'
      }
    ]
  },
  {
    path: 'menu',
    children: [
      {
        path: 'menu-test.component',
        link: '/menu/menu-test.component',
        component: 'MenuTestComponent',
        name: 'Menu Test',
        children: [
          {
            path: '1',
            link: '/menu/menu-test.component/1',
            component: 'MenuItem1Component',
            name: 'Menu Item1'
          },
          {
            path: '2',
            link: '/menu/menu-test.component/2',
            component: 'MenuItem2Component',
            name: 'Menu Item2'
          },
          {
            path: '12',
            link: '/menu/menu-test.component/12',
            component: 'MenuItem1Component',
            name: 'Menu Item1'
          },
          {
            path: '3',
            link: '/menu/menu-test.component/3',
            component: 'MenuItem3Component',
            name: 'Menu Item3',
            children: [
              {
                path: '1',
                link: '/menu/menu-test.component/3/1',
                component: 'MenuItem31Component',
                name: 'Menu Item31'
              },
              {
                path: '2',
                link: '/menu/menu-test.component/3/2',
                component: 'MenuItem32Component',
                name: 'Menu Item32'
              },
              {
                path: '3',
                link: '/menu/menu-test.component/3/3',
                component: 'MenuItem33Component',
                name: 'Menu Item33',
                children: [
                  {
                    path: '1',
                    link: '/menu/menu-test.component/3/3/1',
                    component: 'MenuItem331Component',
                    name: 'Menu Item331'
                  },
                  {
                    path: '2',
                    link: '/menu/menu-test.component/3/3/2',
                    component: 'MenuItem332Component',
                    name: 'Menu Item332'
                  }
                ]
              }
            ]
          },
          {
            path: '4',
            link: '/menu/menu-test.component/4',
            component: 'MenuItem4Component',
            name: 'Menu Item4'
          }
        ]
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        path: 'user-test.component',
        link: '/user/user-test.component',
        component: 'UserTestComponent',
        name: 'User Test'
      }
    ]
  },
  {
    path: 'azure',
    children: [
      {
        path: 'callback',
        link: '/azure/callback',
        component: 'AzureCallbackComponent',
        name: 'Azure Callback'
      }
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        link: '/auth/login',
        component: 'NbLoginComponent',
        name: 'Nb Login'
      },
      {
        path: 'register',
        link: '/auth/register',
        component: 'NbRegisterComponent',
        name: 'Nb Register'
      },
      {
        path: 'logout',
        link: '/auth/logout',
        component: 'NbLogoutComponent',
        name: 'Nb Logout'
      },
      {
        path: 'request-password',
        link: '/auth/request-password',
        component: 'NbRequestPasswordComponent',
        name: 'Nb Request Password'
      },
      {
        path: 'reset-password',
        link: '/auth/reset-password',
        component: 'NbResetPasswordComponent',
        name: 'Nb Reset Password'
      },
      {
        path: 'acl/acl-test.component',
        link: '/auth/acl/acl-test.component',
        component: 'AclTestComponent',
        name: 'Acl Test'
      },
      {
        path: 'auth-guard.service',
        link: '/auth/auth-guard.service',
        component: 'AuthPlaygroundComponent',
        name: 'Auth Playground'
      },
      {
        path: 'api-calls.component',
        link: '/auth/api-calls.component',
        component: 'PlaygroundApiCallsComponent',
        name: 'Playground Api Calls'
      }
    ]
  },
  {
    path: 'firebase',
    children: [
      {
        path: 'login',
        link: '/firebase/login',
        component: 'NbLoginComponent',
        name: 'Nb Login'
      },
      {
        path: 'register',
        link: '/firebase/register',
        component: 'NbRegisterComponent',
        name: 'Nb Register'
      },
      {
        path: 'logout',
        link: '/firebase/logout',
        component: 'NbLogoutComponent',
        name: 'Nb Logout'
      },
      {
        path: 'request-password',
        link: '/firebase/request-password',
        component: 'NbRequestPasswordComponent',
        name: 'Nb Request Password'
      },
      {
        path: 'reset-password',
        link: '/firebase/reset-password',
        component: 'NbResetPasswordComponent',
        name: 'Nb Reset Password'
      },
      {
        path: 'password-showcase',
        link: '/firebase/password-showcase',
        component: 'PasswordAuthShowcaseComponent',
        name: 'Password Auth Showcase'
      },
      {
        path: 'social-auth-showcase',
        link: '/firebase/social-auth-showcase',
        component: 'IdentityProvidersAuthShowcaseComponent',
        name: 'Identity Providers Auth Showcase'
      }
    ]
  },
  {
    path: 'smart-home',
    children: [
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            link: '/smart-home/auth/login',
            component: 'LoginComponent',
            name: 'Login'
          }
        ]
      }
    ]
  },
  {
    path: 'bootstrap',
    children: [
      {
        path: 'bootstrap-test.component',
        link: '/bootstrap/bootstrap-test.component',
        component: 'BootstrapTestComponent',
        name: 'Bootstrap Test'
      }
    ]
  }
];
