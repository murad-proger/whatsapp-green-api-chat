import { useEffect, useRef } from 'react';
import type { Chat } from '../types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface Props {
  chat: Chat | null;
  sending: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ chat, sending, onSend }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat?.messages.length]);

  if (!chat) {
    return (
      <div className="chat-panel chat-panel--empty">
        <p>Выберите чат или введите номер телефона, чтобы начать переписку</p>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="avatar">{chat.phone.slice(-2)}</div>
        <div>
          <div className="chat-panel__title">{chat.phone}</div>
          <div className="chat-panel__subtitle">WhatsApp</div>
        </div>
      </div>

      <div className="message-list" ref={listRef}>
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <MessageInput disabled={sending} onSend={onSend} />
    </div>
  );
}
