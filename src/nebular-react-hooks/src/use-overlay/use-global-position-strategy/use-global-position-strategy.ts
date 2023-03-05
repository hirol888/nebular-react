import React, { useRef } from 'react';
import { Property } from 'csstype';
import { Direction } from '@nebular-react/styles';
import { GlobalPositionStrategy } from './types';

export function useGlobalPositionStrategy(
  globalPositionStrategy: GlobalPositionStrategy,
  dir: Direction,
  width?: Property.Width,
  height?: Property.Height,
  maxWidth?: Property.MaxWidth,
  maxHeight?: Property.MaxHeight
): {
  apply: () => void;
  paneRef: React.MutableRefObject<HTMLDivElement>;
  globalWrapperRef: React.MutableRefObject<HTMLDivElement>;
} {
  const paneRef = useRef<HTMLDivElement>(null);
  const globalWrapperRef = useRef<HTMLDivElement>(null);

  const apply = () => {
    const styles = paneRef.current?.style;
    const parentStyles = globalWrapperRef.current?.style;
    const shouldBeFlushHorizontally =
      (width === '100%' || width === '100vw') &&
      (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');
    const shouldBeFlushVertically =
      (height === '100%' || height === '100vh') &&
      (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');

    styles.position = 'static';
    styles.marginLeft = shouldBeFlushHorizontally ? '0' : globalPositionStrategy._leftOffset;
    styles.marginTop = shouldBeFlushVertically ? '0' : globalPositionStrategy._topOffset;
    styles.marginBottom = globalPositionStrategy._bottomOffset;
    styles.marginRight = globalPositionStrategy._rightOffset;

    if (shouldBeFlushHorizontally) {
      parentStyles.justifyContent = 'flex-start';
    } else if (globalPositionStrategy._justifyContent === 'center') {
      parentStyles.justifyContent = 'center';
    } else if (dir === 'rtl') {
      // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we
      // don't want that because our positioning is explicitly `left` and `right`, hence
      // why we do another inversion to ensure that the overlay stays in the same position.
      // TODO: reconsider this if we add `start` and `end` methods.
      if (globalPositionStrategy._justifyContent === 'flex-start') {
        parentStyles.justifyContent = 'flex-end';
      } else if (globalPositionStrategy._justifyContent === 'flex-end') {
        parentStyles.justifyContent = 'flex-start';
      }
    } else {
      parentStyles.justifyContent = globalPositionStrategy._justifyContent;
    }

    parentStyles.alignItems = shouldBeFlushVertically
      ? 'flex-start'
      : globalPositionStrategy._alignItems;
  };

  return { apply, paneRef, globalWrapperRef };
}
