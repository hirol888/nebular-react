/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';

/**
 * Component is used by NbSelect for custom label.
 */
const NbSelectLabel: React.FC = ({ children }) => {
  return <div className="nb-select-label">{children}</div>;
};

export { NbSelectLabel };
