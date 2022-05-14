import {
  DOWN_ARROW,
  ESCAPE,
  FocusMonitor,
  NbAdjustment,
  NbPosition,
  NbTrigger,
  Portal,
  UP_ARROW
} from 'libs/nebular-react/src/core/cdk';
import React, { Children, isValidElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NbComponentOrCustomStatus, NbComponentShape, NbComponentSize, NbFormControlProps } from '../component';
import { NbOption, NbOptionGroup, NbOptionList, NbOptionListRef, NbOptionRef, useOptionElements } from '../option';
import { NbSelectLabel } from './SelectLabel';
import * as _ from 'lodash';
import classNames from 'classnames';
import { NbIcon } from '../icon';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import './select.scoped.scss';
import { NbKeyManagerType } from 'libs/nebular-react/src/core/cdk/a11y/key-manager/key-manager-builder';
import {
  useKeyManager,
  useOptionRefs,
  useOverlay,
  usePositionStrategy,
  useBlockOrNoopScrollStrategy,
  useTriggerStrategy
} from 'libs/nebular-react/src/core/cdk/hooks';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { finalize, map } from 'rxjs';

export type NbSelectAppearance = 'outline' | 'filled' | 'hero';

interface SelectProps extends NbFormControlProps {
  /**
   * Select size, available sizes:
   * `tiny`, `small`, `medium` (default), `large`, `giant`
   */
  size?: NbComponentSize;
  /**
   * Select status (adds specific styles):
   * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
   */
  status?: NbComponentOrCustomStatus;
  /**
   * Select shapes: `rectangle` (default), `round`, `semi-round`
   */
  shape?: NbComponentShape;
  /**
   * Select appearances: `outline` (default), `filled`, `hero`
   */
  appearance?: NbSelectAppearance;
  /**
   * Specifies class to be set on `NbOption`s container (`NbOptionList`)
   * */
  optionsListClass?: string;
  /**
   * Specifies class for the overlay panel with options
   * */
  optionsPanelClass?: string | string[];
  /**
   * Specifies width (in pixels) to be set on `NbOption`s container (`NbOptionList`)
   * */
  optionsWidth?: number;
  /**
   * Disables the select
   */
  disabled?: boolean;
  /**
   * If set element will fill its container
   */
  fullWidth?: boolean;
  /**
   * Renders select placeholder if nothing selected.
   * */
  placeholder?: string;
  /**
   * Gives capability just write `multiple` over the element.
   * */
  multiple?: boolean;
  /**
   * Determines options overlay offset (in pixels).
   **/
  optionsOverlayOffset?: number;
  /**
   * Will be emitted when selected value changes.
   * */
  onSelectChange?: (value: any) => void;
}

export type SelectRef = {
  /**
   * Set to disabled/enabled (true/false)
   */
  enable: () => void;
  disable(): void;
  /**
   * Deselect all selected options.
   * */
  reset: () => void;
  /**
   * Get currently selected values
   */
  getSelectedValues: () => any;
} & HTMLDivElement;

const NbSelect = React.forwardRef<SelectRef, SelectProps & React.HTMLAttributes<HTMLDivElement>>(
  (
    {
      size = 'medium',
      status = 'basic',
      shape = 'rectangle',
      appearance = 'outline',
      optionsListClass,
      optionsPanelClass,
      optionsWidth,
      disabled = false,
      fullWidth = false,
      placeholder = '',
      multiple = false,
      optionsOverlayOffset = 8,
      onSelectChange,
      onSizeChange,
      onFullWidthChange,
      onStatusChange,
      onDisableChange,
      onFocusChange,
      className,
      children,
      ...otherProps
    },
    ref
  ) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const paneRef = useRef<HTMLDivElement>(null);
    const [paneId] = useState<string>(_.uniqueId('cdk-overlay-'));

    /**
     * The callback function for an option is selected.
     * Rerender option list
     * If it is not multiple, close option list
     * @param selected
     * @param optionId
     * @param value
     */
    const handleOptionChange = (selected: boolean, optionId: string, value: any) => {
      rerenderOptionElements(multiple, selected, optionId, value);

      if (!multiple) {
        setIsOpen(false);
      }
    };

    /**
     * Highlight the new selected one and unhighlight previously selected ones
     * It is for non-multiple only
     * @param selected
     * @param value
     * @returns
     */
    const rerenderOptionElements = (multiple: boolean, selected: boolean, optionId: string, value: any) => {
      if (optionElements === undefined) {
        return;
      }

      // Recursively clone elements with new selected values
      const mapOptionElements = (
        _opEls: React.ReactElement<any, string | React.JSXElementConstructor<any>>[]
      ): React.ReactElement<any, string | React.JSXElementConstructor<any>>[] => {
        return _opEls.map((oe) => {
          if (oe.type === NbOption) {
            const isSelected = multiple // If it is multiple
              ? (oe as any).ref.current.id === optionId // set selected for new selected option
                ? selected
                  ? true
                  : false
                : (oe as any).ref.current.selected // keep selected value for other option
              : // If it is not multiple
              selected
              ? value === undefined || value === null // If selected value is undefined or null, clear all selected values
                ? false
                : oe.props.value === value
                ? true
                : false
              : false;
            return React.cloneElement(oe, {
              ...oe.props,
              selected: isSelected
            });
          }
          if (oe.type === NbOptionGroup) {
            return React.cloneElement(oe, {
              ...oe.props,
              children: mapOptionElements(
                oe.props.children as React.ReactElement<any, string | React.JSXElementConstructor<any>>[]
              )
            });
          }
          return oe;
        });
      };

      const _optionElements = mapOptionElements(optionElements);

      setOptionElements(_optionElements);
    };

    /**
     * Calculates the current select values and tiles based on elements
     * @returns
     */
    const getCurrentSelected = (): { selectedValues: any[]; selectedTitleText: string } => {
      const selectedValues: any[] = [];
      const selectedTitles: string[] = [];

      const getSelected = (
        _opEls: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined
      ) => {
        if (_opEls) {
          _opEls.forEach((oe) => {
            if (oe.type === NbOption) {
              if ((oe as any).ref.current?.selected || oe.props.selected) {
                selectedValues.push(oe.props.value);
                selectedTitles.push(oe.props.title);
              }
            }
            if (oe.type === NbOptionGroup) {
              getSelected(oe.props.children);
            }
          });
        }
      };

      getSelected(optionElements);
      const selectedTitleText = selectedTitles.join(', ');

      return { selectedValues, selectedTitleText };
    };

    // #region states
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [rendered, setRendered] = useState<boolean>(false);
    const [sizeValue, setSizeValue] = useState<NbComponentSize>(size);
    const [statusValue, setStatusValue] = useState<NbComponentOrCustomStatus>(status);
    const [fullWidthValue, setFullWidthValue] = useState<boolean>(fullWidth);
    const [disabledValue, setDisabledValue] = useState<boolean>(disabled);
    const optionListRef = useRef<NbOptionListRef>(null);
    const optionRefs = useOptionRefs(rendered, optionListRef, children);
    const [optionElements, setOptionElements] = useOptionElements(children);
    const [selectedOptions, setSelectedOptions] = useState<{ selectedValues: any[]; selectedTitleText: string }>(
      getCurrentSelected()
    );
    const [optionsWidthValue, setOptionsWidthValue] = useState<number>(0);
    // #endregion

    useEffect(() => {
      setSizeValue(size);
      onSizeChange && onSizeChange(size);
    }, [size]);

    useEffect(() => {
      setStatusValue(status);
      onStatusChange && onStatusChange(status);
    }, [status]);

    useEffect(() => {
      setFullWidthValue(fullWidth);
      onFullWidthChange && onFullWidthChange(fullWidth);
    }, [fullWidth]);

    useEffect(() => {
      setDisabledValue(disabled);
      onDisableChange && onDisableChange(disabled);
    }, [disabled]);

    const focusMonitor = useInjection<FocusMonitor>(TYPES.FocusMonitor);
    useEffect(() => {
      const focusMonitorSubscription = focusMonitor
        .monitor(componentRef.current!)
        .pipe(
          map((origin) => !!origin),
          finalize(() => focusMonitor.stopMonitoring(componentRef.current!))
        )
        .subscribe((focused) => onFocusChange && onFocusChange(focused));

      return () => {
        focusMonitorSubscription.unsubscribe();
      };
    }, []);

    useEffect(() => {
      const { selectedValues, selectedTitleText } = getCurrentSelected();
      setSelectedOptions({ selectedValues, selectedTitleText });

      if (onSelectChange) {
        onSelectChange([...selectedValues]);
      }
    }, [optionElements]);

    useEffect(() => {
      const hostWidth = componentRef.current?.getBoundingClientRect().width;
      if (!optionsWidth && optionsWidthValue !== hostWidth) {
        setOptionsWidthValue(hostWidth!);
      }
    }, [selectedOptions]);

    const customLabel = Children.toArray(children).find((c) => isValidElement(c) && c.type === NbSelectLabel);

    /**
     * Set the first selected one as active based on elements
     */
    const setActiveOption = () => {
      const selectedRefs: React.RefObject<NbOptionRef>[] = [];

      const getSelectedRefs = (
        _opEls: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined
      ) => {
        if (_opEls) {
          _opEls.forEach((oe) => {
            if (oe.type === NbOption) {
              if (oe.props.selected) {
                selectedRefs.push((oe as any).ref);
              }
            }
            if (oe.type === NbOptionGroup) {
              getSelectedRefs(oe.props.children);
            }
          });
        }
      };
      getSelectedRefs(optionElements);

      if (selectedRefs?.length && selectedRefs[0].current) {
        keyManager?.setActiveItem(selectedRefs[0]);
      } else {
        keyManager?.setFirstItemActive();
      }
    };

    /**
     * Show option list
     */
    const show = () => {
      if (!isOpen) {
        setIsOpen(true);
      }
    };

    /**
     * Hide option list
     */
    const hide = () => {
      if (isOpen) {
        overlayRef?.detach();
        setIsOpen(false);
      }
    };

    const handleTabOut = () => hide();

    const handleKeydownOverlay = (event: KeyboardEvent) => {
      if (event.keyCode === ESCAPE) {
        buttonRef.current?.focus();
        hide();
      } else {
        keyManager?.onKeydown(event);
      }
    };

    // #region overlay settings
    const { positionStrategy, overlayPosition } = usePositionStrategy(
      rendered,
      componentRef,
      optionsOverlayOffset,
      NbPosition.BOTTOM,
      NbAdjustment.VERTICAL
    );
    const keyManager = useKeyManager(
      rendered,
      optionRefs,
      isOpen,
      NbKeyManagerType.FOCUS_KEY_MANAGER,
      handleTabOut,
      setActiveOption
    );
    const scrollStrategy = useBlockOrNoopScrollStrategy();
    const overlayRef = useOverlay(
      rendered,
      optionsPanelClass,
      positionStrategy,
      scrollStrategy,
      undefined,
      undefined,
      handleKeydownOverlay
    );
    useTriggerStrategy(rendered, isOpen, paneId, componentRef, buttonRef, NbTrigger.CLICK, show, hide);
    // #endregion

    const handleKeydown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
        show();
      }
    };

    // Updates rendered value for overlay settings, most of overlay services can only be initialized after rendered.
    useEffect(() => {
      setRendered(true);
      const _optionsWidth = optionsWidth ?? componentRef.current?.getBoundingClientRect().width;
      setOptionsWidthValue(_optionsWidth ?? 0);
    }, []);

    useImperativeHandle(ref, () => ({
      enable: () => {
        setDisabledValue(false);
      },
      disable: () => {
        setDisabledValue(true);
      },
      reset: () => {
        rerenderOptionElements(multiple, false, '', null);
        hide();
        buttonRef.current?.focus();
      },
      getSelectedValues: () => {
        return selectedOptions.selectedValues;
      },
      ...componentRef.current!
    }));

    return (
      <div
        className={classNames(
          'nb-select',
          'nb-transition',
          `size-${sizeValue}`,
          `status-${statusValue}`,
          `shape-${shape}`,
          `appearance-${appearance}`,
          className,
          {
            'full-width': fullWidthValue,
            open: isOpen
          }
        )}
        ref={mergedRefs(ref, componentRef)}
        {...otherProps}
      >
        <button
          type="button"
          className={classNames({
            'select-button': true,
            disabled: disabledValue,
            placeholder: _.isEmpty(selectedOptions.selectedTitleText),
            empty: _.isEmpty(selectedOptions.selectedTitleText) && !placeholder
          })}
          ref={buttonRef}
          disabled={disabledValue}
          onKeyDown={handleKeydown}
        >
          <span>
            {!_.isEmpty(selectedOptions.selectedTitleText) ? (
              <>{customLabel ? <>{customLabel}</> : <>{selectedOptions.selectedTitleText}</>}</>
            ) : (
              <>{placeholder}</>
            )}
          </span>
          <NbIcon icon="chevron-down-outline" pack="nebular-essentials" aria-hidden="true"></NbIcon>
        </button>
        <Portal overlayRef={overlayRef} isOpen={isOpen} paneRef={paneRef}>
          <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
            <NbOptionList
              position={overlayPosition}
              ref={optionListRef}
              className={optionsListClass}
              size={sizeValue}
              multiple={multiple}
              style={{ width: `${optionsWidthValue}px` }}
              onOptionChange={handleOptionChange}
            >
              {optionElements}
            </NbOptionList>
          </div>
        </Portal>
      </div>
    );
  }
);

export { NbSelect };
