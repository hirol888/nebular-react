export interface ChatMessageType {
  reply?: boolean;
  message?: string;
  sender?: string;
  date?: Date;
  dateFormat?: string;
  files?: any[];
  quote?: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  type?: string;
  customMessage?: React.ReactNode;
  customMessageFullWidth?: boolean;
}

export interface BaseChatMessageTextProps {
  sender?: string;
  message?: string;
  date?: Date;
  dateFormat?: string;
}
