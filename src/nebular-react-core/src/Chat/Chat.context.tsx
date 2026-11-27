import { ComponentOrCustomStatus } from '@nebular-react/styles';
import React from 'react';
import type { ChatLabels } from './types';

export interface ChatContextType {
  mapKey?: string;
  status?: ComponentOrCustomStatus;
  /** Labels resolved by the parent `Chat`, shared with `ChatForm`. */
  labels?: ChatLabels;
}
export const ChatContext = React.createContext<ChatContextType>({
  mapKey: '',
  status: 'basic'
});
