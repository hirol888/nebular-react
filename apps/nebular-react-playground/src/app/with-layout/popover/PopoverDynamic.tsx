import { NbButton, NbCard, NbCardHeader, NbList, NbListItem, NbPopover, NbPosition, NbTrigger } from '@nebular-react';
import { useRef, useState } from 'react';
import './popover-dynamic.scoped.scss';

export function PopoverDynamic() {
  const hostRef = useRef<HTMLButtonElement>(null);
  const contentTypes = ['list', 'tab', 'text'];

  const listContent = () => {
    return (
      <NbCard>
        <NbCardHeader>Shopping List</NbCardHeader>
        <NbList>
          <NbListItem>Apple</NbListItem>
          <NbListItem>Orange</NbListItem>
        </NbList>
      </NbCard>
    );
  };

  const tabContent = () => {
    return (
      <NbCard>
        <NbCardHeader>Shopping List</NbCardHeader>
      </NbCard>
    );
  };

  const [content, setContent] = useState<JSX.Element | string>(listContent());
  const [_interval, _setInterval] = useState<NodeJS.Timer>();

  const changeContent = (contentType: string) => {
    switch (contentType) {
      case 'list':
        setContent(listContent());
        break;
      case 'tab':
        setContent(tabContent());
        break;
      case 'text':
        setContent('Hello World');
        break;
    }
  };

  const startRuntimeChange = () => {
    if (!_interval) {
      const i = setInterval(() => {
        const random = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        changeContent(random);
      }, 2000);
      _setInterval(i);
    }
  };

  const stopRuntimeChange = () => {
    if (_interval) {
      clearInterval(_interval);
      _setInterval(undefined);
    }
  };

  return (
    <div className="popover-dynamic">
      <div className="popover-container">
        <NbButton ref={hostRef}>Show Popover</NbButton>
        <NbPopover hostRef={hostRef} position={NbPosition.BOTTOM} trigger={NbTrigger.CLICK}>
          {content && <>{content}</>}
        </NbPopover>
      </div>
      <div className="section">
        <h6>Change Content</h6>
        <NbButton size="small" status="success" onClick={() => changeContent('list')}>
          Use List Component
        </NbButton>
        <NbButton size="small" status="success" onClick={() => changeContent('tab')}>
          Use Tab Component
        </NbButton>
        <NbButton size="small" status="success" onClick={() => changeContent('text')}>
          Use String
        </NbButton>
        {!_interval && (
          <NbButton size="small" status="warning" onClick={startRuntimeChange}>
            Enable Runtime Change
          </NbButton>
        )}
        {_interval && (
          <NbButton size="small" status="warning" onClick={stopRuntimeChange}>
            {' '}
            Disable Runtime Change
          </NbButton>
        )}
        <div>
          <small>When "Runtime Change" is enabled, open the Popover to see a content change every 2 seconds.</small>
        </div>
      </div>
    </div>
  );
}
