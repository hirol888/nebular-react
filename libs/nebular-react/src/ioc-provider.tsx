import { Container, interfaces } from 'inversify';
import React, { useContext } from 'react';

export const InversifyContext = React.createContext<{ container: Container | null }>({ container: null });

type Props = {
  container: Container;
};

export const Provider: React.FC<Props> = (props) => {
  return <InversifyContext.Provider value={{ container: props.container }}>{props.children}</InversifyContext.Provider>;
};

export function useInjection<T>(identifier: interfaces.ServiceIdentifier<T>): T {
  const { container } = useContext(InversifyContext);
  if (!container) {
    throw new Error();
  }
  return container.get<T>(identifier);
}

export function useInjectionTagged<T>(
  identifier: interfaces.ServiceIdentifier<T>,
  key: string | number | symbol,
  value: unknown
): T {
  const { container } = useContext(InversifyContext);
  if (!container) {
    throw new Error();
  }
  return container.getTagged(identifier, key, value);
}
