import { useState } from 'react';
import Football3D from './components/Football3D';
import MainMenu from './components/MainMenu';
import './menu.css';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'match' | 'penalty' | 'career' | 'settings'>('menu');
  const [player, setPlayer] = useState('Rayan');
  const [tournament, setTournament] = useState('Быстрый матч');
  if (screen === 'match') return <Football3D onExit={() => setScreen('menu')} tournament={tournament} />;
  if (screen === 'penalty') return <Football3D onExit={() => setScreen('menu')} tournament="Режим пенальти · 3D" />;
  return <MainMenu screen={screen} player={player} onStart={(mode) => { setTournament(mode); setScreen('match'); }} onScreen={setScreen} onPlayer={setPlayer} />;
}
