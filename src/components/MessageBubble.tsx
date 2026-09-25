import type { ChatMessage } from '../types';

function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isOut = message.direction === 'outgoing';
  return (
    <div className={'message-row' + (isOut ? ' message-row--outgoing' : '')}>
      <div
        className={
          'message-bubble ' +
          (isOut ? 'message-bubble--outgoing' : 'message-bubble--incoming')
        }
      >
        <div className="message-bubble__text">{message.text}</div>
        <div className="message-bubble__meta">
          <span>{formatTime(message.timestamp)}</span>
          {isOut && (
            <span>
              {message.status === 'failed'
                ? '⚠️'
                : message.status === 'sending'
                ? '🕓'
                : '✓✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
