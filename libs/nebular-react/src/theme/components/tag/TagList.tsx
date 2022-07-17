import classNames from 'classnames';
import {
  BACKSPACE,
  DELETE,
  FocusMonitor,
  KeyManagerBuilder,
  ListKeyManager,
  NbKeyManagerType,
  NbLayoutDirection,
  SPACE
} from 'libs/nebular-react/src/core/cdk';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import { NbLayoutDirectionService } from 'libs/nebular-react/src/core/services';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { useObservable, useSubscription } from 'observable-hooks';
import React, { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { filter, finalize, fromEvent, map, switchMap } from 'rxjs';
import { NbComponentSize, NbFormControlProps } from '../component';
import { NbTag, NbTagRef } from './Tag';
import { NbTagInput } from './TagInput';
import { TagListContext } from './TagList.context';

export interface NbTagListProps extends NbFormControlProps {
  size?: NbComponentSize;
  multiple?: boolean;
  onTagRemove?: (tagIndex: number) => void;
}

const NbTagList = React.forwardRef<HTMLDivElement, NbTagListProps & React.HTMLAttributes<HTMLDivElement>>(
  (
    {
      size = 'medium',
      multiple = false,
      onTagRemove,
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
    let tagInputRef = React.createRef<HTMLInputElement>();
    const tagInput = Children.map(children, (child) => {
      if (isValidElement(child) && child.type === NbTagInput) {
        if ((child as any).ref) {
          tagInputRef = (child as any).ref;
        }
        return React.cloneElement(child, {
          ref: tagInputRef,
          onSizeChhange: onSizeChange,
          onFullWidthChange: onFullWidthChange,
          onStatusChange: onStatusChange,
          onDisableChange: onDisableChange,
          onFocusChange: onFocusChange,
          ...child.props
        });
      }
      return null;
    });

    const hostRef = useRef<HTMLDivElement>(null);

    const sizeClass =
      tagInput && tagInput.length > 0 && tagInput[0].props.fieldSize
        ? `size-${tagInput[0].props.fieldSize}`
        : `size-${size}`;
    const shapeClass =
      tagInput && tagInput.length > 0 && tagInput[0].props.shape
        ? `shape-${tagInput[0].props.shape}`
        : 'shape-rectangle';
    const statusClass =
      tagInput && tagInput.length > 0 && tagInput[0].props.status
        ? `status-${tagInput[0].props.status}`
        : 'status-basic';

    const [focused, setFocused] = useState<boolean>(false);
    const [rendered, setRendered] = useState<boolean>(false);

    const [tagRefs, setTagRefs] = useState<React.RefObject<NbTagRef>[]>([]);
    const [tags, setTags] = useState<
      React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | null | undefined
    >([]);

    useLayoutEffect(() => {
      const _tagRefs: React.RefObject<NbTagRef>[] = [];

      const _tags = Children.map(children, (child) => {
        if (isValidElement(child) && child.type === NbTag) {
          const tagRef = React.createRef<NbTagRef>();
          _tagRefs.push(tagRef);
          return React.cloneElement(child, {
            ref: tagRef,
            ...child.props
          });
        }
        return null;
      });
      setTags(_tags);
      setTagRefs(_tagRefs);
    }, [children]);

    const layoutService = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);
    useSubscription(layoutService.onDirectionChange(), (direction: NbLayoutDirection) => {
      keyManager?.withHorizontalOrientation(direction);
    });

    const keyManagerBuilder = useInjection<KeyManagerBuilder>(TYPES.KeyManagerBuilder);
    const [keyManager, setKeyManager] = useState<ListKeyManager<NbTagRef>>();

    const focusMonitor = useInjection<FocusMonitor>(TYPES.FocusMonitor);
    const monitor$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([inputRefValue]) => !!inputRefValue),
          switchMap(([inputRefValue, focusMonitorValue]) => {
            return focusMonitorValue.monitor(inputRefValue.current!).pipe(
              map((origin) => !!origin),
              finalize(() => focusMonitorValue.stopMonitoring(hostRef.current!))
            );
          })
        ),
      [tagInputRef, focusMonitor]
    );
    useSubscription(monitor$, (focused) => handleFocusChange(focused));

    useEffect(() => {
      setRendered(true);
    }, []);

    useEffect(() => {
      if (rendered) {
        const _keyManager = keyManagerBuilder
          .create(NbKeyManagerType.ACTIVE_DESCENDANT_KEY_MANAGER, tagRefs)
          .withHorizontalOrientation(layoutService.getDirection())
          .withWrap();

        // get previous active item and set it to new key manager after rerendering
        if (keyManager && keyManager.activeItemIndex !== null && keyManager.activeItemIndex > -1) {
          _keyManager.setActiveItem(keyManager.activeItemIndex);
        }
        setKeyManager(_keyManager);
      }
    }, [rendered, tagRefs]);

    const keyDown$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([hostRefElement]) => !!hostRefElement),
          switchMap(([hostRefElement]) => fromEvent<KeyboardEvent>(hostRefElement!, 'keydown'))
        ),
      [hostRef.current]
    );

    const tagListKeyDown$ = useObservable(() =>
      keyDown$.pipe(filter((event: KeyboardEvent) => event.target === hostRef.current))
    );
    useSubscription(tagListKeyDown$, (event: KeyboardEvent) => {
      keyManager?.onKeydown(event);
    });
    const activeTagKeyDownSpace$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([_keyManager]) => _keyManager !== undefined),
          switchMap(([_keyManager]) => {
            return tagListKeyDown$.pipe(
              filter(() => !!_keyManager?.activeItem),
              filter(({ keyCode }: KeyboardEvent) => keyCode === SPACE)
            );
          })
        ),
      [keyManager]
    );
    const activeTagKeyDownDelete$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([_keyManager]) => _keyManager !== undefined),
          switchMap(([_keyManager]) => {
            return tagListKeyDown$.pipe(
              filter(() => !!_keyManager?.activeItem),
              filter(({ keyCode }: KeyboardEvent) => isBackspaceOrDelete(keyCode)),
              map(() => _keyManager?.activeItem)
            );
          })
        ),
      [keyManager]
    );
    useSubscription(activeTagKeyDownSpace$, (event: KeyboardEvent) => {
      keyManager?.activeItem?.current?.toggleSelection();
      event.preventDefault();
    });
    useSubscription(activeTagKeyDownDelete$, (tagToRemove) => tagToRemove?.current?.remove());

    const inputKeyDown$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([tagInputRefValue]) => !!tagInputRefValue),
          switchMap(([tagInputRefValue, tagRefsValue]) => {
            return keyDown$.pipe(
              filter(({ target }: KeyboardEvent) => target === tagInputRefValue.current),
              filter(
                ({ keyCode }: KeyboardEvent) =>
                  !tagInputRefValue.current?.value && isBackspaceOrDelete(keyCode) && tagRefsValue.length > 0
              )
            );
          })
        ),
      [tagInputRef, tagRefs]
    );
    useSubscription(inputKeyDown$, () => {
      hostRef.current?.focus();
      keyManager?.setLastItemActive();
    });

    const isBackspaceOrDelete = (keyCode: number) => {
      return keyCode === BACKSPACE || keyCode === DELETE;
    };

    const handleFocusChange = (isFocused: boolean) => {
      isFocused !== focused && setFocused(isFocused);

      if (!isFocused || document.activeElement === tagInputRef.current) {
        keyManager?.setActiveItem(-1);
        return;
      }

      // Focus input when focusing tag list without tags. Otherwise select first tag.
      if (tagRefs.length === 0) {
        tagInputRef.current?.focus();
      } else {
        keyManager?.setFirstItemActive();
      }
    };

    const handleTagSelect = (selected: boolean, tagId: string) => {
      tagRefs.forEach((tag) => {
        if (tag.current?.id !== tagId) {
          selected && !multiple && tag.current?.setSelected(false);
        } else {
          keyManager?.setActiveItem(tagRefs.indexOf(tag));
        }
      });
    };

    const handleTagRemove = (tagId: string) => {
      const toRemoveTagIndex = tagRefs.map((tag) => tag.current?.id).indexOf(tagId);
      // it is the last tag
      if (toRemoveTagIndex === tagRefs.length - 1) {
        keyManager?.setPreviousItemActive();
      }
      onTagRemove && onTagRemove(toRemoveTagIndex);
    };

    return (
      <TagListContext.Provider value={{ multiple: multiple, handleTagSelect, handleTagRemove }}>
        <div
          ref={mergedRefs(ref, hostRef)}
          className={classNames('nb-tag-list', 'nb-transition', sizeClass, shapeClass, statusClass, className, {
            'nb-tag-list-with-input': tagInput && tagInput.length > 0,
            focus: focused,
            'input-full-width': tagInput && tagInput.length > 0 ? tagInput[0].props.fullWidth : false
          })}
          role="listbox"
          aria-multiselectable={multiple}
          aria-activedescendant={
            keyManager && keyManager.activeItemIndex && keyManager.activeItemIndex > -1
              ? tagRefs[keyManager.activeItemIndex].current?.id
              : undefined
          }
          tabIndex={0}
          {...otherProps}
        >
          <div className="nb-tag-list-tags-wrapper">
            {tags}
            {tagInput}
          </div>
        </div>
      </TagListContext.Provider>
    );
  }
);

export { NbTagList };
