import { ComponentType, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const WithoutLayout = (WrappedComponent: ComponentType, onRouteChange: () => void) => {
  const location = useLocation();

  useEffect(() => {
    onRouteChange();
  }, [location]);

  return <WrappedComponent />;
};

export { WithoutLayout };
