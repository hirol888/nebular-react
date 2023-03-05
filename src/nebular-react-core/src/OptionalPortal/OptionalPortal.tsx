import React from 'react';
import { Portal, ProtalProps } from '../Portal';

export interface OptionalPortalProps extends ProtalProps {
  withinPortal?: boolean;
}

export function OptionalPortal({ withinPortal = true, children, ...others }: OptionalPortalProps) {
  if (withinPortal) {
    return <Portal {...others}>{children}</Portal>;
  }

  return <>{children}</>;
}

OptionalPortal.displayName = '@nebular-react/core/OptionalPortal';
