import { useMemo, useState } from "react";
import { CLUB_TEAMS } from "../lib/footballTeams";
import Football3D from "./Football3D";
import "../career-mode.css";

type Props = {
  player: string;
  team: string;
  onExit: () => void;
};

const drills = [
  { icon: "◎", title: "Точность удара", text: "Работа над завершением атак" },
  { icon: "↗", title: "Короткий пас", text: "Быстрые комбинации команды" },
  { icon: "⚡", title: "Скорость", text: "Рывки и выходы один на один" },
];

export default function CareerMode({ player, team, onExit }: Props) {
  const fixtures = useMemo(() => CLUB_TEAMS.filter((item) => item.name !== team).slice(0, 8), [team]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [record, setRecord] = useState({ wins: 0, losses: 0 });
  const opponent = fixtures[matchIndex % fixtures.length].name;

  const finishMatch = (won: boolean) => {
    setPlaying(false);
    setRecord((current) => ({
      wins: current.wins + Number(won),
      losses: current.losses + Number(!won),
    }));
    setMatchIndex((index) => index + 1);
    setCompletedDrills([]);
  };
  if (playing) {
    return <Football3D tournament={`Карьера · Тур ${matchIndex + 1} · ${team} vs ${opponent}`} homeTeam={team} awayTeam={opponent} targetGoals={3} onMatchEnd={finishMatch} onExit={() => setPlaying(false)} />;
  }

  return (
    <main className="career-mode">
      <header><button onClick={onExit}>← Главное меню</button><div><p>КАРЬЕРА · СЕЗОН 1</p><h1>{player} · {team}</h1></div><strong>{record.wins}В · {record.losses}П</strong></header>
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
            return <button className={completed ? "training-card completed" : "training-card"} key={drill.title} onClick={() => setCompletedDrills((current) => completed ? current : [...current, drill.title])}><b>{completed ? "✓" : drill.icon}</b><span><strong>{drill.title}</strong><small>{completed ? "Выполнено" : drill.text}</small></span></button>;
          })}
        </div>
      </section>
      <button className="career-play" disabled={completedDrills.length < drills.length} onClick={() => setPlaying(true)}>
        {completedDrills.length < drills.length ? `Выполни упражнения: ${completedDrills.length}/3` : `Играть против ${opponent} →`}
      </button>
    </main>
  );
}
