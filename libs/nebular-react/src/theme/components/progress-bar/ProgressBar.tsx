import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';
import './progress-bar.scoped.scss';

export type NbProgressBarProps = {
  value?: number;
  status?: NbComponentOrCustomStatus;
  size?: NbComponentSize;
  displayValue?: boolean;
};

const NbProgressBar: React.FC<NbProgressBarProps & React.HTMLAttributes<HTMLDivElement>> = ({
  value = 0,
  status = 'basic',
  size = 'medium',
  displayValue = false,
  className,
  children,
  ...otherProps
}) => {
  const [progressValue, setProgressValue] = useState<number>(value);

  useEffect(() => {
    setProgressValue(value);
  }, [value]);

  return (
    <div className={classNames('nb-progress-bar', `size-${size}`, `status-${status}`, className)} {...otherProps}>
      <div className="progress-container">
        <div className="progress-value" style={{ width: `${progressValue}%` }}>
          {displayValue && <span>{progressValue}</span>}
          {children}
        </div>
      </div>
    </div>
  );
};

export { NbProgressBar };
