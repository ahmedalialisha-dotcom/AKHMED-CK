import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Вход и регистрация по email + паролю. Это пример — Codex поможет улучшить (Google-вход и т.д.).
type AuthProps = { initialMode?: 'signin' | 'signup'; onAuthenticated?: () => void };

export function Auth({ initialMode = 'signin', onAuthenticated }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const fn =
        mode === 'signup'
          ? supabase.auth.signUp({ email, password })
          : supabase.auth.signInWithPassword({ email, password });
      const { data, error } = await fn;
      if (error) setMessage(error.message);
      else if (mode === 'signup') {
        if (data.session) {
          setMessage('Аккаунт создан — ты уже вошёл в игру.');
          window.setTimeout(() => onAuthenticated?.(), 500);
        } else {
          setMode('signin');
          setMessage('Аккаунт создан! Теперь войди с этим email и паролем.');
        }
      }
      else {
        setMessage('Ты успешно вошёл в аккаунт.');
        window.setTimeout(() => onAuthenticated?.(), 500);
      }
    } catch {
      setMessage('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setMessage('');
  };

  return (
    <section className="auth-card">
      <div className="auth-tabs">
        <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} onClick={() => switchMode('signup')}>Регистрация</button>
        <button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} onClick={() => switchMode('signin')}>Вход</button>
      </div>
      <h2>{mode === 'signin' ? 'С возвращением!' : 'Создай игровую учётную запись'}</h2>
      <p className="auth-subtitle">{mode === 'signin' ? 'Продолжи карьеру и бей новые рекорды.' : 'Это займёт меньше минуты.'}</p>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Твой email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Придумай пароль — 6+ символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      <div className="auth-divider"><span>или</span></div>
      <button type="button" className="google-button" onClick={signInWithGoogle} disabled={busy}>G&nbsp;&nbsp; Продолжить с Google</button>
      {message && <p className="message">{message}</p>}
      <button
        className="ghost"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войти'}
      </button>
    </section>
  );
}
