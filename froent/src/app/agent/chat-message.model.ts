export interface ChatUser {
  id: number;
  name?: string;
  email?: string;
}

export interface ChatMessage {
  id: number;
  sender: ChatUser;
  receiver: ChatUser;
  message: string;
  timestamp: string;
  seen: boolean;
}