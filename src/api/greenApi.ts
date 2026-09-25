import type {
  GreenApiCredentials,
  ReceiveNotificationResponse,
} from '../types';

// Default public GREEN-API host. Works for most instances; GREEN-API also
// exposes instance-specific hosts (e.g. https://7105.api.green-api.com) which
// you can use instead if your console page gives you one.
const DEFAULT_API_URL = 'https://api.green-api.com';

function baseUrl({ idInstance, apiTokenInstance }: GreenApiCredentials) {
  return `${DEFAULT_API_URL}/waInstance${idInstance}`;
}

export class GreenApiError extends Error {}

/** Sanity-checks credentials by asking GREEN-API for the instance state. */
export async function getStateInstance(
  creds: GreenApiCredentials
): Promise<string> {
  const res = await fetch(
    `${baseUrl(creds)}/getStateInstance/${creds.apiTokenInstance}`
  );
  if (!res.ok) {
    throw new GreenApiError(`Не удалось проверить инстанс (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.stateInstance as string;
}

/** Sends a plain text message to a WhatsApp chat. */
export async function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string
): Promise<{ idMessage: string }> {
  const res = await fetch(
    `${baseUrl(creds)}/sendMessage/${creds.apiTokenInstance}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    }
  );
  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new GreenApiError(
      `Не удалось отправить сообщение (HTTP ${res.status}) ${details}`
    );
  }
  return res.json();
}

/** Long-polls the queue for the next incoming notification (waits up to `timeout` seconds). */
export async function receiveNotification(
  creds: GreenApiCredentials,
  timeout = 5
): Promise<ReceiveNotificationResponse | null> {
  const res = await fetch(
    `${baseUrl(creds)}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=${timeout}`
  );
  if (!res.ok) {
    throw new GreenApiError(`Ошибка получения уведомлений (HTTP ${res.status})`);
  }
  const text = await res.text();
  if (!text) return null; // empty response = no notification within timeout
  return JSON.parse(text);
}

/** Removes a processed notification from the queue so it isn't delivered again. */
export async function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number
): Promise<void> {
  await fetch(
    `${baseUrl(creds)}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
    { method: 'DELETE' }
  );
}

/** Turns a phone number (digits only) into a WhatsApp private-chat id. */
export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@c.us`;
}

export function chatIdToPhone(chatId: string): string {
  return chatId.replace('@c.us', '');
}
