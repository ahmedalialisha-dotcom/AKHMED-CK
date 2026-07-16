import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Football3D from './components/Football3D';
import MainMenu from './components/MainMenu';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import './menu.css';
import './auth.css';
import './vibrant-theme.css';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'match' | 'penalty' | 'career' | 'settings' | 'auth' | 'profile'>('menu');
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState('Rayan');
  const [tournament, setTournament] = useState('Быстрый матч');
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)); return () => listener.subscription.unsubscribe(); }, []);
  if (screen === 'match') return <Football3D onExit={() => setScreen('menu')} tournament={tournament} />;
  if (screen === 'penalty') return <Football3D onExit={() => setScreen('menu')} tournament="Режим пенальти · 3D" penalty />;
  if (screen === 'auth') return <main className="auth-page"><button className="auth-page__back" onClick={() => setScreen('menu')}>← В главное меню</button><div className="auth-layout"><section className="auth-page__intro"><p>FOOTBALL MOMENTS 3D</p><h1>Твоя футбольная история начинается здесь</h1><span>Создай аккаунт, чтобы позже сохранять карьеру и рекорды.</span><div className="auth-page__pitch"><i /><i /><i /></div></section><Auth initialMode="signup" onAuthenticated={() => setScreen('menu')} /></div></main>;
  if (screen === 'profile' && user) return <main className="auth-page profile-page"><section className="profile-panel"><div className="profile-avatar">{user.email?.[0].toUpperCase()}</div><p>ТВОЙ ПРОФИЛЬ</p><h1>{user.email}</h1><p>Аккаунт подключён. Скоро здесь появятся рекорды и прогресс карьеры.</p><button onClick={() => supabase.auth.signOut()}>Выйти из аккаунта</button><button className="ghost" onClick={() => setScreen('menu')}>Вернуться в меню</button></section></main>;
  const menuScreen = screen === 'profile' ? 'menu' : screen;
  return <MainMenu screen={menuScreen} player={player} userEmail={user?.email} onStart={(mode) => { setTournament(mode); setScreen('match'); }} onScreen={setScreen} onPlayer={setPlayer} />;
}
