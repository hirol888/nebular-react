/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React from 'react';

/**
 * Component intended to be used within the `<NbCard>` component.
 * Adds styles for a preset body section.
 */
const NbCardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...otherProps
}) => {
  return (
    <div className={classNames('nb-card-body', className)} {...otherProps}>
      {children}
    </div>
  );
};

export { NbCardBody };
