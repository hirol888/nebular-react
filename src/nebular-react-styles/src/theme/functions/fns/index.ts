import { ltr, rtl } from './dir/dir';
import { outline } from './outline/outline';
import { transition } from './transition/transition';
import { scrollbars } from './scrollbars/scrollbars';
import { hidden } from './hidden/hidden';
import { mediaBreakpointDown } from './media-breakpoint-down/media-breakpoint-down';
import { mediaBreakpointUp } from './media-breakpoint-up/media-breakpoint-up';
import { mediaBreakpointBetween } from './media-breakpoint-betweeen/media-breakpoint-between';
import { thumb } from './thumb/thumb';
import { track } from './track/track';

export const fns = {
  ltr,
  rtl,
  outline,
  transition,
  scrollbars,
  hidden,
  mediaBreakpointDown,
  mediaBreakpointUp,
  mediaBreakpointBetween,
  thumb,
  track
} as const;
