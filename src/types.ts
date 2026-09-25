export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageDirection = 'outgoing' | 'incoming';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  timestamp: number; // unix seconds
  status?: 'sending' | 'sent' | 'failed';
}

export interface Chat {
  chatId: string; // e.g. 79876543210@c.us
  phone: string; // e.g. 79876543210
  messages: ChatMessage[];
}

// Shape of an incoming notification body we care about (subset of GREEN-API's format)
export interface IncomingNotificationBody {
  typeWebhook: string;
  senderData?: {
    chatId: string;
    sender: string;
    senderName?: string;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    extendedTextMessageData?: {
      text: string;
    };
  };
  timestamp?: number;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: IncomingNotificationBody;
}
