import { useMemo, useState } from "react";
import { CLUB_TEAMS } from "../lib/footballTeams";
import Football3D from "./Football3D";
import { getCareerStats } from "../lib/careerPlayer";
import "../career-mode.css";

type Props = {
  player: string;
  playerAge: number;
  team: string;
  onExit: () => void;
};

const drills = [
  { icon: "◎", title: "Точность удара", text: "Работа над завершением атак" },
  { icon: "↗", title: "Короткий пас", text: "Быстрые комбинации команды" },
  { icon: "⚡", title: "Скорость", text: "Рывки и выходы один на один" },
];

export default function CareerMode({ player, playerAge, team, onExit }: Props) {
  const fixtures = useMemo(() => CLUB_TEAMS.filter((item) => item.name !== team).slice(0, 8), [team]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [activeDrill, setActiveDrill] = useState<string>();
  const [record, setRecord] = useState({ wins: 0, losses: 0 });
  const opponent = fixtures[matchIndex % fixtures.length].name;
  const stats = getCareerStats(playerAge);

  const finishMatch = (won: boolean) => {
    setPlaying(false);
    setRecord((current) => ({
      wins: current.wins + Number(won),
      losses: current.losses + Number(!won),
    }));
    setMatchIndex((index) => index + 1);
    setCompletedDrills([]);
  };
  if (activeDrill) {
    const finishTraining = (won: boolean) => {
      if (won) setCompletedDrills((current) => [...current, activeDrill]);
      setActiveDrill(undefined);
    };
    return <Football3D tournament={`Тренировка · ${activeDrill}`} homeTeam={team} awayTeam={opponent} playerAge={playerAge} targetGoals={1} onMatchEnd={finishTraining} onExit={() => setActiveDrill(undefined)} />;
  }
  if (playing) {
    return <Football3D tournament={`Карьера · Тур ${matchIndex + 1} · ${team} vs ${opponent}`} homeTeam={team} awayTeam={opponent} playerAge={playerAge} targetGoals={3} onMatchEnd={finishMatch} onExit={() => setPlaying(false)} />;
  }

  return (
    <main className="career-mode">
      <header><button onClick={onExit}>← Главное меню</button><div><p>КАРЬЕРА · СЕЗОН 1</p><h1>{player}, {playerAge} лет · {team}</h1></div><strong>{record.wins}В · {record.losses}П</strong></header>
      <section className="career-stats">
        <div><span>ОБЩИЙ</span><b>{stats.overall}</b></div><div><span>СКОРОСТЬ</span><b>{stats.speed}</b></div>
        <div><span>ТЕХНИКА</span><b>{stats.technique}</b></div><div><span>ВЫНОСЛИВОСТЬ</span><b>{stats.stamina}</b></div>
      </section>
      <section className="career-fixture">
        <div><span>СЛЕДУЮЩИЙ МАТЧ · ТУР {matchIndex + 1}</span><h2>{team} <i>vs</i> {opponent}</h2></div>
        <b>{fixtures[matchIndex % fixtures.length].rating}</b>
      </section>
      <section className="training-panel">
        <p>ОБЯЗАТЕЛЬНАЯ ТРЕНИРОВКА</p>
        <h2>Подготовка к матчу</h2>
        <span>Выполни все три упражнения, чтобы выйти на поле.</span>
        <div className="training-grid">
          {drills.map((drill) => {
            const completed = completedDrills.includes(drill.title);
            return <button className={completed ? "training-card completed" : "training-card"} disabled={completed} key={drill.title} onClick={() => setActiveDrill(drill.title)}><b>{completed ? "✓" : drill.icon}</b><span><strong>{drill.title}</strong><small>{completed ? "Выполнено" : `${drill.text} · Играть`}</small></span></button>;
          })}
        </div>
      </section>
      <button className="career-play" disabled={completedDrills.length < drills.length} onClick={() => setPlaying(true)}>
        {completedDrills.length < drills.length ? `Выполни упражнения: ${completedDrills.length}/3` : `Играть против ${opponent} →`}
      </button>
    </main>
  );
}
