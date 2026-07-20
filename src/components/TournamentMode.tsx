import { useMemo, useState } from "react";
import Football3D from "./Football3D";
import "../tournament-mode.css";

type Props = { tournament: string; onExit: () => void };
type Stage = "groups" | "semifinal" | "final" | "champion" | "eliminated";
type Result = { opponent: string; playerGoals: number; opponentGoals: number };

const opponents = ["FC Astana", "Almaty United", "Shymkent City"];
const initialPoints: Record<string, number> = {
  "Football Moments": 0, "FC Astana": 0, "Almaty United": 0, "Shymkent City": 0,
};
const initialGames = { ...initialPoints };

export default function TournamentMode({ tournament, onExit }: Props) {
  const [stage, setStage] = useState<Stage>("groups");
  const [groupRound, setGroupRound] = useState(0);
  const [points, setPoints] = useState(initialPoints);
  const [games, setGames] = useState(initialGames);
  const [results, setResults] = useState<Result[]>([]);
  const [playing, setPlaying] = useState(false);

  const table = useMemo(() => Object.entries(points)
    .map(([team, score]) => ({ team, score }))
    .sort((a, b) => b.score - a.score), [points]);

  const currentOpponent = stage === "groups"
    ? opponents[groupRound]
    : stage === "semifinal" ? "Nomad FC" : "Capital Stars";

  const finishMatch = (won: boolean, playerGoals: number, opponentGoals: number) => {
    setPlaying(false);
    if (stage === "semifinal") return setStage(won ? "final" : "eliminated");
    if (stage === "final") return setStage(won ? "champion" : "eliminated");
    const opponent = opponents[groupRound];
    const nextPoints = { ...points };
    nextPoints[won ? "Football Moments" : opponent] += 3;
    const otherTeams = opponents.filter((team) => team !== opponent);
    nextPoints[otherTeams[Math.random() < 0.5 ? 0 : 1]] += 3;
    setPoints(nextPoints);
    setGames((current) => ({
      ...current,
      "Football Moments": current["Football Moments"] + 1,
      [opponent]: current[opponent] + 1,
      [otherTeams[0]]: current[otherTeams[0]] + 1,
      [otherTeams[1]]: current[otherTeams[1]] + 1,
    }));
    setResults((current) => [...current, {
      opponent, playerGoals, opponentGoals,
    }]);
    if (groupRound < 2) return setGroupRound((round) => round + 1);
    const ranking = Object.entries(nextPoints).sort((a, b) => b[1] - a[1]);
    setStage(ranking.findIndex(([team]) => team === "Football Moments") < 2 ? "semifinal" : "eliminated");
  };

  const restart = () => {
    setStage("groups"); setGroupRound(0); setPoints(initialPoints); setGames(initialGames); setResults([]); setPlaying(false);
  };

  if (playing) return <Football3D tournament={`${tournament} · ${stage === "groups" ? `Группа, тур ${groupRound + 1}` : stage === "semifinal" ? "Полуфинал" : "Финал"}`} onExit={() => setPlaying(false)} targetGoals={3} onMatchEnd={finishMatch} />;

  return (
    <main className="tournament-mode">
      <header><button onClick={onExit}>← Главное меню</button><div><p>{tournament}</p><h1>{stage === "groups" ? "Групповой этап" : stage === "semifinal" ? "Полуфинал" : stage === "final" ? "Финал" : "Турнир завершён"}</h1></div><span>🏆</span></header>
      {stage === "groups" && <section className="standings"><div className="tournament-title"><p>ГРУППА A</p><h2>Турнирная таблица</h2></div><div className="table-head"><span>#</span><span>Команда</span><span>И</span><span>О</span></div>{table.map((item, index) => <div className={item.team === "Football Moments" ? "table-row player-team" : "table-row"} key={item.team}><b>{index + 1}</b><strong>{item.team}</strong><span>{games[item.team]}</span><b>{item.score}</b></div>)}</section>}
      <section className="playoff-grid"><div className={stage === "semifinal" ? "stage-card active" : "stage-card"}><span>1/2</span><strong>Football Moments</strong><small>против Nomad FC</small></div><div className={stage === "final" ? "stage-card active" : "stage-card"}><span>ФИНАЛ</span><strong>{stage === "final" || stage === "champion" ? "Football Moments" : "Победитель 1/2"}</strong><small>против Capital Stars</small></div></section>
      {results.length > 0 && <section className="match-history"><h2>Результаты</h2>{results.map((result) => <p key={result.opponent}><span>Football Moments — {result.opponent}</span><b>{result.playerGoals}:{result.opponentGoals}</b></p>)}</section>}
      {stage === "champion" ? <section className="tournament-result"><strong>🏆</strong><h2>Вы — чемпионы!</h2><button onClick={restart}>Сыграть ещё раз</button></section> : stage === "eliminated" ? <section className="tournament-result"><strong>👏</strong><h2>Турнир окончен</h2><button onClick={restart}>Попробовать снова</button></section> : <section className="next-match"><div><p>СЛЕДУЮЩИЙ МАТЧ</p><h2>Football Moments <span>vs</span> {currentOpponent}</h2><small>Матч до трёх голов</small></div><button onClick={() => setPlaying(true)}>Играть матч →</button></section>}
    </main>
  );
}
