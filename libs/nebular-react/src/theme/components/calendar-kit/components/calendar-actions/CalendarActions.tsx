import React from 'react';
import { NbButton } from '../../../button';
import './calendar-actions.scss';

export type NbCalendarActionsProps = {
  showCurrentTimeButton: boolean;
  applyButtonText?: string;
  currentTimeButtonText?: string;
  setCurrentTime?: () => void;
  saveValue?: () => void;
};

const NbCalendarActions: React.FC<NbCalendarActionsProps> = ({
  showCurrentTimeButton,
  applyButtonText = 'ok',
  currentTimeButtonText = 'now',
  setCurrentTime,
  saveValue
}) => {
  return (
    <div className="nb-calendar-actions">
      {showCurrentTimeButton && (
        <NbButton appearance="ghost" status="primary" size="small" onClick={() => setCurrentTime && setCurrentTime()}>
          {currentTimeButtonText}
        </NbButton>
      )}
      <NbButton className="apply-text-button" status="primary" size="small" onClick={() => saveValue && saveValue()}>
        {applyButtonText}
      </NbButton>
    </div>
  );
};

export { NbCalendarActions };
