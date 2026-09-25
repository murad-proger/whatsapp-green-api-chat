import { FormEvent, useState } from 'react';
import type { Chat } from '../types';

interface Props {
  idInstance: string;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (phone: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  idInstance,
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onLogout,
}: Props) {
  const [phone, setPhone] = useState('');

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!digits) return;
    onCreateChat(digits);
    setPhone('');
  }

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__account">
          <div className="avatar">{idInstance.slice(-2)}</div>
          <span>Инстанс {idInstance}</span>
        </div>
        <button className="icon-btn" title="Выйти" onClick={onLogout}>
          ⎋
        </button>
      </div>

      <div className="new-chat-panel">
        <form onSubmit={handleCreate}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Номер телефона получателя, напр. 79991234567"
            inputMode="tel"
          />
          <button type="submit">Начать чат</button>
        </form>
      </div>

      <div className="chat-list">
        {chats.length === 0 && (
          <div className="chat-list__empty">
            Пока нет чатов. Введите номер телефона выше, чтобы начать переписку.
          </div>
        )}
        {chats.map((chat) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          return (
            <div
              key={chat.chatId}
              className={
                'chat-list-item' +
                (chat.chatId === activeChatId ? ' chat-list-item--active' : '')
              }
              onClick={() => onSelectChat(chat.chatId)}
            >
              <div className="avatar">{chat.phone.slice(-2)}</div>
              <div className="chat-list-item__body">
                <div className="chat-list-item__title">{chat.phone}</div>
                <div className="chat-list-item__preview">
                  {lastMessage ? lastMessage.text : 'Нет сообщений'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
