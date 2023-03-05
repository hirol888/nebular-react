import { ComponentOrCustomStatus } from '@nebular-react/styles';
import React from 'react';

export interface ChatContextType {
  mapKey?: string;
  status?: ComponentOrCustomStatus;
}
export const ChatContext = React.createContext<ChatContextType>({
  mapKey: '',
  status: 'basic'
});
