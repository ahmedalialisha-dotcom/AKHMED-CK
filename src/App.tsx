import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Football3D from './components/Football3D';
import MainMenu from './components/MainMenu';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import TournamentMode from './components/TournamentMode';
import { CLUB_TEAMS } from './lib/footballTeams';
import CareerMode from './components/CareerMode';
import './menu.css';
import './auth.css';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'quick' | 'penaltySelect' | 'match' | 'penalty' | 'career' | 'careerPlay' | 'settings' | 'tournament' | 'auth' | 'profile'>('menu');
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState('Rayan');
  const [playerAge, setPlayerAge] = useState(18);
  const [tournament, setTournament] = useState('Быстрый матч');
  const [selectedTeam, setSelectedTeam] = useState(CLUB_TEAMS[0].name);
  const [opponentTeam, setOpponentTeam] = useState(CLUB_TEAMS[1].name);
  const [matchTeams, setMatchTeams] = useState<[string, string]>([CLUB_TEAMS[0].name, CLUB_TEAMS[1].name]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)); return () => listener.subscription.unsubscribe(); }, []);
  if (screen === 'match') return <Football3D onExit={() => setScreen('menu')} tournament={tournament} homeTeam={matchTeams[0]} awayTeam={matchTeams[1]} />;
  if (screen === 'penalty') return <Football3D onExit={() => setScreen('menu')} tournament={`${matchTeams[0]} vs ${matchTeams[1]} · Пенальти`} homeTeam={matchTeams[0]} awayTeam={matchTeams[1]} penalty />;
  if (screen === 'tournament') return <TournamentMode tournament={tournament} onExit={() => setScreen('menu')} />;
  if (screen === 'careerPlay') return <CareerMode player={player} playerAge={playerAge} team={selectedTeam} onExit={() => setScreen('menu')} />;
  if (screen === 'auth') return <main className="auth-page"><button className="auth-page__back" onClick={() => setScreen('menu')}>← В главное меню</button><div className="auth-layout"><section className="auth-page__intro"><p>FOOTBALL 3D</p><h1>Твоя футбольная история начинается здесь</h1><span>Создай аккаунт, чтобы позже сохранять карьеру и рекорды.</span><div className="auth-page__pitch"><i /><i /><i /></div></section><Auth initialMode="signup" onAuthenticated={() => setScreen('menu')} /></div></main>;
  if (screen === 'profile' && user) return <main className="auth-page profile-page"><section className="profile-panel"><div className="profile-avatar">{user.email?.[0].toUpperCase()}</div><p>ТВОЙ ПРОФИЛЬ</p><h1>{user.email}</h1><p>Аккаунт подключён. Скоро здесь появятся рекорды и прогресс карьеры.</p><button onClick={() => supabase.auth.signOut()}>Выйти из аккаунта</button><button className="ghost" onClick={() => setScreen('menu')}>Вернуться в меню</button></section></main>;
  const menuScreen = screen === 'profile' ? 'menu' : screen;
  return <MainMenu screen={menuScreen} player={player} playerAge={playerAge} selectedTeam={selectedTeam} opponentTeam={opponentTeam} userEmail={user?.email} onStart={(mode, home = selectedTeam, away = opponentTeam) => { setTournament(mode); setMatchTeams([home, away]); setScreen('match'); }} onPenalty={(home, away) => { setMatchTeams([home, away]); setScreen('penalty'); }} onCareer={() => setScreen('careerPlay')} onTournament={(name) => { setTournament(name); setScreen('tournament'); }} onScreen={setScreen} onPlayer={setPlayer} onPlayerAge={setPlayerAge} onTeam={setSelectedTeam} onOpponent={setOpponentTeam} />;
}
