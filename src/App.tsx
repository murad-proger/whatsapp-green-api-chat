import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chat, ChatMessage, GreenApiCredentials } from './types';
import {
  chatIdToPhone,
  deleteNotification,
  phoneToChatId,
  receiveNotification,
  sendMessage,
} from './api/greenApi';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [creds, setCreds] = useState<GreenApiCredentials | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const credsRef = useRef(creds);
  credsRef.current = creds;
  const stopPollingRef = useRef(false);

  const ensureChat = useCallback((chatId: string) => {
    setChats((prev) => {
      if (prev.some((c) => c.chatId === chatId)) return prev;
      return [...prev, { chatId, phone: chatIdToPhone(chatId), messages: [] }];
    });
  }, []);

  const appendMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chatId ? { ...c, messages: [...c.messages, message] } : c
      )
    );
  }, []);

  // --- Polling loop for incoming messages ---
  useEffect(() => {
    if (!creds) return;
    stopPollingRef.current = false;

    async function pollLoop() {
      while (!stopPollingRef.current) {
        const currentCreds = credsRef.current;
        if (!currentCreds) break;
        try {
          const notification = await receiveNotification(currentCreds, 20);
          if (stopPollingRef.current) break;
          if (notification) {
            const { body, receiptId } = notification;
            if (
              body.typeWebhook === 'incomingMessageReceived' &&
              body.senderData &&
              body.messageData
            ) {
              const text =
                body.messageData.textMessageData?.textMessage ??
                body.messageData.extendedTextMessageData?.text;
              if (text) {
                const chatId = body.senderData.chatId;
                ensureChat(chatId);
                appendMessage(chatId, {
                  id: makeId(),
                  chatId,
                  text,
                  direction: 'incoming',
                  timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
                });
              }
            }
            await deleteNotification(currentCreds, receiptId);
          }
        } catch {
          // Network hiccup or rate limit — brief pause before retrying.
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    pollLoop();
    return () => {
      stopPollingRef.current = true;
    };
  }, [creds, ensureChat, appendMessage]);

  function handleLogin(newCreds: GreenApiCredentials) {
    setCreds(newCreds);
  }

  function handleLogout() {
    stopPollingRef.current = true;
    setCreds(null);
    setChats([]);
    setActiveChatId(null);
  }

  function handleCreateChat(phone: string) {
    const chatId = phoneToChatId(phone);
    ensureChat(chatId);
    setActiveChatId(chatId);
  }

  async function handleSend(text: string) {
    if (!creds || !activeChatId) return;
    const tempId = makeId();
    const timestamp = Math.floor(Date.now() / 1000);
    appendMessage(activeChatId, {
      id: tempId,
      chatId: activeChatId,
      text,
      direction: 'outgoing',
      timestamp,
      status: 'sending',
    });
    setSending(true);
    try {
      await sendMessage(creds, activeChatId, text);
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === activeChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempId ? { ...m, status: 'sent' } : m
                ),
              }
            : c
        )
      );
    } catch {
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === activeChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempId ? { ...m, status: 'failed' } : m
                ),
              }
            : c
        )
      );
    } finally {
      setSending(false);
    }
  }

  if (!creds) {
    return (
      <div className="app-shell">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null;

  return (
    <div className="app-shell">
      <div className="wa-layout">
        <Sidebar
          idInstance={creds.idInstance}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onCreateChat={handleCreateChat}
          onLogout={handleLogout}
        />
        <ChatPanel chat={activeChat} sending={sending} onSend={handleSend} />
      </div>
    </div>
  );
}
