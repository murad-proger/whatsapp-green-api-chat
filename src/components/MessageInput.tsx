import { FormEvent, useState } from 'react';

interface Props {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export default function MessageInput({ disabled, onSend }: Props) {
  const [text, setText] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение"
          disabled={disabled}
          autoFocus
        />
        <button className="send-btn" type="submit" disabled={disabled || !text.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}
