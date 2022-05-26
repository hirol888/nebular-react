import React, { useEffect, useState } from 'react';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import './spinner.scoped.scss';

export type NbSpinnerProps = {
  isLoading: boolean;
  message?: string;
  size?: NbComponentSize;
  status?: NbComponentOrCustomStatus;
  spinnerContainerRef: React.RefObject<HTMLElement>;
};

const NbSpinner: React.FC<NbSpinnerProps & React.HTMLAttributes<HTMLDivElement>> = ({
  isLoading,
  message = '',
  size = 'medium',
  status = 'basic',
  spinnerContainerRef,
  className,
  ...otherProps
}) => {
  const [isLoadingValue, setIsLoadingValue] = useState<boolean>(isLoading);
  const [content, setContent] = useState<React.ReactPortal | null>(null);

  useEffect(() => {
    setIsLoadingValue(isLoading);
    if (isLoading) {
      spinnerContainerRef.current?.classList.add('nb-spinner-container');
    }
    if (!isLoading) {
      spinnerContainerRef.current?.classList.remove('nb-spinner-container');
    }
  }, [isLoading]);

  useEffect(() => {
    const _content =
      spinnerContainerRef.current &&
      ReactDOM.createPortal(
        <>
          {isLoadingValue && (
            <div className={classNames('nb-spinner', `size-${size}`, `status-${status}`, className)} {...otherProps}>
              <span className="spin-circle"></span>
              {message && <span className="message">{message}</span>}
            </div>
          )}
        </>,
        spinnerContainerRef.current
      );
    setContent(_content);
  }, [isLoadingValue, spinnerContainerRef.current]);

  return content;
};

export { NbSpinner };
