import { ComponentType, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NbLayout, NbLayoutColumn } from '@nebular-react';

const WithLayout = (WrappedComponent: ComponentType, onRouteChange: () => void) => {
  const location = useLocation();

  useEffect(() => {
    onRouteChange();
  }, [location]);

  return (
    <NbLayout>
      <NbLayoutColumn>
        <WrappedComponent />
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { WithLayout };
