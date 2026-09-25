import { FormEvent, useState } from 'react';
import type { GreenApiCredentials } from '../types';
import { getStateInstance } from '../api/greenApi';

interface Props {
  onLogin: (creds: GreenApiCredentials) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните оба поля');
      return;
    }
    setLoading(true);
    setError(null);
    const creds = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };
    try {
      const state = await getStateInstance(creds);
      if (state !== 'authorized') {
        setError(
          `Инстанс не авторизован (статус: ${state}). Отсканируйте QR-код в личном кабинете GREEN-API.`
        );
        setLoading(false);
        return;
      }
      onLogin(creds);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось подключиться к GREEN-API. Проверьте данные.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-screen__logo">💬</div>
      <h1>WhatsApp Chat</h1>
      <p>Войдите с учётными данными вашего инстанса GREEN-API</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="idInstance">idInstance</label>
          <input
            id="idInstance"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101234567"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="apiTokenInstance">apiTokenInstance</label>
          <input
            id="apiTokenInstance"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
            autoComplete="off"
          />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
