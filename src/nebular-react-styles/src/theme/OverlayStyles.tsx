import React from 'react';
import { Global } from '@emotion/react';
import { NebularTheme } from './types';

const overlayContainerZIndex = 1040;
const overlayZIndex = 1000;
const overlayBackdropZIndex = 1000;

const overlayBackdropColor = 'rgba(0, 0, 0, 0.32)';

const backdropAnimationDuration = '400ms';
const backdropAnimationTimingFunction = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

const getOverlayStyles = <TTheme extends NebularTheme>(theme: TTheme) => {
  const styles = {
    '.overlay-container, .global-overlay-wrapper': {
      // Disable events from being captured on the overlay container.
      pointerEvents: 'none',

      // The container should be the size of the viewport.
      top: 0,
      left: 0,
      height: '100%',
      width: '100%'
    },

    // The overlay-container is an invisible element which contains all individual overlays.
    '.overlay-container': {
      position: 'fixed',
      zIndex: overlayContainerZIndex,

      '&:empty': {
        // Hide the element when it doesn't have any child nodes. This doesn't
        // include overlays that have been detached, rather than disposed.
        display: 'none'
      }
    },

    // We use an extra wrapper element in order to use make the overlay itself a flex item.
    // This makes centering the overlay easy without running into the subpixel rendering
    // problems tied to using `transform` and without interfering with the other position
    // strategies.
    '.global-overlay-wrapper': {
      display: 'flex',
      position: 'absolute',
      zIndex: overlayZIndex
    },

    // A single overlay pane.
    '.overlay-pane': {
      // Note: it's important for this one to start off `absolute`,
      // in order for us to be able to measure it correctly.
      position: 'absolute',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
      zIndex: overlayZIndex,

      // For connected-position overlays, we set `display: flex` in
      // order to force `max-width` and `max-height` to take effect.
      display: 'flex',
      maxWidth: '100%',
      maxHeight: '100%',
      visibility: 'hidden'
    },

    '.overlay-backdrop': {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,

      zIndex: overlayBackdropZIndex,
      pointerEvents: 'auto',

      WebkitTapHighlightColor: 'transparent',
      transition: `opacity ${backdropAnimationDuration} ${backdropAnimationTimingFunction}`,
      opacity: 0,

      backgroundColor: theme.overlay_backdrop_background_color,

      '&.overlay-backdrop-showing': {
        opacity: 1,

        // Note that we can't import and use the `high-contrast` mixin from `_a11y.scss`, because
        // this file will be copied to the top-level `cdk` package when putting together the files
        // for npm. Any relative import paths we use here will become invalid once the file is copied.
        '.high-contrast-active &': {
          // In high contrast mode the rgba background will become solid
          // so we need to fall back to making it opaque using `opacity`.
          opacity: 0.6
        }
      }
    },

    '.overlay-dark-backdrop': {
      background: overlayBackdropColor
    },

    'overlay-transparent-backdrop': {
      // Note: as of Firefox 57, having the backdrop be `background: none` will prevent it from
      // capturing the user's mouse scroll events. Since we also can't use something like
      // `rgba(0, 0, 0, 0)`, we work around the inconsistency by not setting the background at
      // all and using `opacity` to make the element transparent.
      '&, &.overlay-backdrop-showing': {
        opacity: 0
      }
    },

    // Overlay parent element used with the connected position strategy. Used to constrain the
    // overlay element's size to fit within the viewport.
    '.overlay-connected-position-bounding-box': {
      position: 'absolute',
      zIndex: overlayZIndex,

      // We use `display: flex` on this element exclusively for centering connected overlays.
      // When *not* centering, a top/left/bottom/right will be set which overrides the normal
      // flex layout.
      display: 'flex',

      // We use the `column` direction here to avoid some flexbox issues in Edge
      // when using the "grow after open" options.
      flexDirection: 'column',

      // Add some dimensions so the element has an `innerText` which some people depend on in tests.
      minWidth: '1px',
      minHeight: '1px'
    },

    // Used when disabling global scrolling.
    '.global-scrollblock': {
      position: 'static',
      width: 'auto',
      overflow: 'hidden'
    }
  };

  return styles;
};

export const OverlayStyles = React.memo(
  <TTheme extends NebularTheme>({ theme }: { theme: TTheme }) => (
    <Global styles={{ ...(getOverlayStyles(theme) as any) }} />
  )
);
