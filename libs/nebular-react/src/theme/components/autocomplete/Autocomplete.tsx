import classNames from 'classnames';
import {
  ENTER,
  ESCAPE,
  FocusableOption,
  Highlightable,
  NbAdjustment,
  NbKeyManagerActiveItemMode,
  NbPosition,
  NbTrigger,
  Portal
} from 'libs/nebular-react/src/core/cdk';
import { mergeRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import React, { useEffect, useRef, useState } from 'react';
import { NbComponentSize } from '../component';
import { NbInput, NbInputProps } from '../input';
import { getOptionElementsRecursive, NbOptionList, NbOptionListRef, NbOptionRef, useOptionElements } from '../option';
import * as _ from 'lodash';
import {
  useKeyManager,
  useOptionRefs,
  useOverlay,
  usePositionStrategy,
  useBlockOrNoopScrollStrategy,
  useTriggerStrategy
} from 'libs/nebular-react/src/core/cdk/hooks';
import { NbKeyManagerType } from 'libs/nebular-react/src/core/cdk/a11y/key-manager/key-manager-builder';
import './autocomplete.scoped.scss';

export interface NbAutocompleteProps {
  optionListSize?: NbComponentSize;
  activeFirst?: boolean;
  optionsListClass?: string;
  optionsPanelClass?: string | string[];
  optionsWidth?: number;
  optionsOverlayOffset?: number;
  onChange?: (event: string) => void;
  displayFn?: (value: any) => string;
}

const NbAutocomplete = React.forwardRef<
  HTMLInputElement,
  NbAutocompleteProps & NbInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      optionListSize = 'medium',
      fieldSize = 'medium',
      activeFirst = false,
      optionsListClass,
      optionsPanelClass,
      optionsWidth,
      optionsOverlayOffset = 8,
      onChange,
      displayFn,
      className,
      children,
      ...otherProps
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [fieldSizeValue, setFieldSizeValue] = useState<NbComponentSize>(fieldSize);
    const [id] = useState<string>(_.uniqueId('nb-autocomplete-'));
    const [paneId] = useState<string>(_.uniqueId('cdk-overlay-'));
    const [optionsWidthValue, setOptionsWidthValue] = useState<number>(0);
    const [rendered, setRendered] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [_activeItem, _setActiveItem] = useState<React.RefObject<FocusableOption & Highlightable & NbOptionRef>>();
    const [optionElements, setOptionElements] = useOptionElements(children);
    const [updateKey, setUpdateKey] = useState<string>(_.uniqueId('update-key'));

    const componentRef = useRef<HTMLInputElement>(null);
    const paneRef = useRef<HTMLDivElement>(null);
    const optionListRef = useRef<NbOptionListRef>(null);
    const optionRefs = useOptionRefs(rendered, optionListRef, children);

    useEffect(() => {
      setFieldSizeValue(fieldSize);
    }, [fieldSize]);

    useEffect(() => {
      setRendered(true);
    }, []);

    const show = () => {
      if (!isOpen) {
        setIsOpen(true);
      }
    };

    const hide = () => {
      if (isOpen) {
        overlayRef?.detach();
        setIsOpen(false);
      }
    };

    useEffect(() => {
      const _optionElements = getOptionElementsRecursive(children);
      setOptionElements(_optionElements);
      setUpdateKey(_.uniqueId('update-key'));
    }, [children]);

    const setActiveItem = () => {
      const mode = activeFirst ? NbKeyManagerActiveItemMode.FIRST_ACTIVE : NbKeyManagerActiveItemMode.RESET_ACTIVE;
      keyManager?.setActiveItem(mode);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      componentRef.current?.focus();
      onChange && onChange(event.target.value);
    };

    const getDisplayValue = (value: any) => {
      return displayFn ? displayFn(value) : value;
    };

    const handleOptionChange = (selected: boolean, optionId: string, value: any) => {
      setInputValue(getDisplayValue(value));
      onChange && onChange(value);
      hide();
    };

    const handleKeydownOverlay = (event: KeyboardEvent) => {
      if (event.keyCode === ESCAPE && isOpen) {
        event.preventDefault();
        componentRef.current?.focus();
        hide();
      } else if (event.keyCode === ENTER) {
        event.preventDefault();
        const activeItem = keyManager?.activeItem;
        if (!activeItem) {
          return;
        }
        _setActiveItem(activeItem);
        handleOptionChange(true, activeItem.current!.id, activeItem.current?.getValue());
      } else {
        keyManager?.onKeydown(event);
      }
    };

    const { positionStrategy, overlayPosition } = usePositionStrategy(
      rendered,
      componentRef,
      optionsOverlayOffset,
      NbPosition.BOTTOM,
      NbAdjustment.VERTICAL
    );
    const scrollStrategy = useBlockOrNoopScrollStrategy();
    const keyManager = useKeyManager(
      rendered,
      optionRefs,
      isOpen,
      NbKeyManagerType.ACTIVE_DESCENDANT_KEY_MANAGER,
      undefined,
      setActiveItem
    );
    const overlayRef = useOverlay(
      rendered,
      optionsPanelClass,
      positionStrategy,
      scrollStrategy,
      undefined,
      undefined,
      handleKeydownOverlay
    );
    useTriggerStrategy(rendered, isOpen, paneId, componentRef, componentRef, NbTrigger.FOCUS, show, hide);

    useEffect(() => {
      const _optionsWidth = optionsWidth ?? componentRef.current?.getBoundingClientRect().width;
      setOptionsWidthValue(_optionsWidth ?? 0);
    }, [overlayRef]);

    return (
      <>
        <NbInput
          ref={mergeRefs(ref, componentRef)}
          className={classNames('nb-auto-complete', className, {
            'nb-autocomplete-position-top': overlayPosition === NbPosition.TOP,
            'nb-autocomplete-position-bottom': overlayPosition === NbPosition.BOTTOM
          })}
          fieldSize={fieldSizeValue}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-owns={isOpen ? id : undefined}
          aria-activedescendant={isOpen && _activeItem ? _activeItem.current?.id : undefined}
          onChange={(event) => handleInputChange(event)}
          value={inputValue}
          {...otherProps}
        />
        <Portal overlayRef={overlayRef} isOpen={isOpen} updateKey={updateKey} paneRef={paneRef}>
          <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
            <NbOptionList
              position={overlayPosition}
              ref={optionListRef}
              className={optionsListClass}
              size={optionListSize}
              style={{ width: `${optionsWidthValue}px` }}
              onOptionChange={handleOptionChange}
            >
              {optionElements}
            </NbOptionList>
          </div>
        </Portal>
      </>
    );
  }
);

export { NbAutocomplete };
