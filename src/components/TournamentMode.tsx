import { useMemo, useState } from "react";
import { CLUB_TEAMS, NATIONAL_TEAMS, type FootballTeam } from "../lib/footballTeams";
import Football3D from "./Football3D";
import TeamPicker from "./TeamPicker";
import "../tournament-mode.css";

type Props = { tournament: string; onExit: () => void };
type Stage = "groups" | "semifinal" | "final" | "champion" | "eliminated";
type Result = { opponent: string; playerGoals: number; opponentGoals: number };

export default function TournamentMode({ tournament, onExit }: Props) {
  const teams = tournament === "Чемпионат мира" ? NATIONAL_TEAMS : CLUB_TEAMS;
  const [selectedTeam, setSelectedTeam] = useState(teams[0].name);
  const [confirmed, setConfirmed] = useState(false);
  if (confirmed) return <Competition tournament={tournament} selectedTeam={selectedTeam} teams={teams} onExit={onExit} />;
  return (
    <main className="tournament-mode team-select">
      <header><button onClick={onExit}>← Главное меню</button><div><p>{tournament}</p><h1>Выбери {tournament === "Чемпионат мира" ? "сборную" : "клуб"}</h1></div><span>🏆</span></header>
      <TeamPicker teams={teams} selected={selectedTeam} onSelect={setSelectedTeam} />
      <button className="confirm-team" onClick={() => setConfirmed(true)}>Продолжить за {selectedTeam} →</button>
    </main>
  );
}

function Competition({ tournament, selectedTeam, teams, onExit }: Props & { selectedTeam: string; teams: FootballTeam[] }) {
  const rivals = teams.filter((team) => team.name !== selectedTeam).map((team) => team.name);
  const opponents = rivals.slice(0, 3);
  const semifinalOpponent = rivals[3];
  const finalOpponent = rivals[4];
  const groupTeams = [selectedTeam, ...opponents];
  const createScores = () => Object.fromEntries(groupTeams.map((team) => [team, 0]));
  const [stage, setStage] = useState<Stage>("groups");
  const [groupRound, setGroupRound] = useState(0);
  const [points, setPoints] = useState<Record<string, number>>(createScores);
  const [games, setGames] = useState<Record<string, number>>(createScores);
  const [results, setResults] = useState<Result[]>([]);
  const [playing, setPlaying] = useState(false);
  const table = useMemo(() => Object.entries(points).map(([team, score]) => ({ team, score })).sort((a, b) => b.score - a.score), [points]);
  const currentOpponent = stage === "groups" ? opponents[groupRound] : stage === "semifinal" ? semifinalOpponent : finalOpponent;

  const finishMatch = (won: boolean, playerGoals: number, opponentGoals: number) => {
    setPlaying(false);
    if (stage === "semifinal") return setStage(won ? "final" : "eliminated");
    if (stage === "final") return setStage(won ? "champion" : "eliminated");
    const opponent = opponents[groupRound];
    const nextPoints = { ...points };
    nextPoints[won ? selectedTeam : opponent] += 3;
    const others = opponents.filter((team) => team !== opponent);
    nextPoints[others[Math.random() < 0.5 ? 0 : 1]] += 3;
    setPoints(nextPoints);
    setGames((current) => ({ ...current, [selectedTeam]: current[selectedTeam] + 1, [opponent]: current[opponent] + 1, [others[0]]: current[others[0]] + 1, [others[1]]: current[others[1]] + 1 }));
    setResults((current) => [...current, { opponent, playerGoals, opponentGoals }]);
    if (groupRound < 2) return setGroupRound((round) => round + 1);
    const ranking = Object.entries(nextPoints).sort((a, b) => b[1] - a[1]);
    setStage(ranking.findIndex(([team]) => team === selectedTeam) < 2 ? "semifinal" : "eliminated");
  };
  const restart = () => { setStage("groups"); setGroupRound(0); setPoints(createScores()); setGames(createScores()); setResults([]); setPlaying(false); };
  if (playing) return <Football3D tournament={`${tournament} · ${selectedTeam} vs ${currentOpponent}`} onExit={() => setPlaying(false)} targetGoals={3} onMatchEnd={finishMatch} />;

  return (
    <main className="tournament-mode">
      <header><button onClick={onExit}>← Главное меню</button><div><p>{tournament}</p><h1>{stage === "groups" ? "Групповой этап" : stage === "semifinal" ? "Полуфинал" : stage === "final" ? "Финал" : "Турнир завершён"}</h1></div><span>🏆</span></header>
      {stage === "groups" && <section className="standings"><div className="tournament-title"><p>ГРУППА A</p><h2>Турнирная таблица</h2></div><div className="table-head"><span>#</span><span>Команда</span><span>И</span><span>О</span></div>{table.map((item, index) => <div className={item.team === selectedTeam ? "table-row player-team" : "table-row"} key={item.team}><b>{index + 1}</b><strong>{item.team}</strong><span>{games[item.team]}</span><b>{item.score}</b></div>)}</section>}
      <section className="playoff-grid"><div className={stage === "semifinal" ? "stage-card active" : "stage-card"}><span>1/2</span><strong>{selectedTeam}</strong><small>против {semifinalOpponent}</small></div><div className={stage === "final" ? "stage-card active" : "stage-card"}><span>ФИНАЛ</span><strong>{stage === "final" || stage === "champion" ? selectedTeam : "Победитель 1/2"}</strong><small>против {finalOpponent}</small></div></section>
      {results.length > 0 && <section className="match-history"><h2>Результаты</h2>{results.map((result) => <p key={result.opponent}><span>{selectedTeam} — {result.opponent}</span><b>{result.playerGoals}:{result.opponentGoals}</b></p>)}</section>}
      {stage === "champion" ? <section className="tournament-result"><strong>🏆</strong><h2>{selectedTeam} — чемпион!</h2><button onClick={restart}>Сыграть ещё раз</button></section> : stage === "eliminated" ? <section className="tournament-result"><strong>👏</strong><h2>Турнир окончен</h2><button onClick={restart}>Попробовать снова</button></section> : <section className="next-match"><div><p>СЛЕДУЮЩИЙ МАТЧ</p><h2>{selectedTeam} <span>vs</span> {currentOpponent}</h2><small>Матч до трёх голов</small></div><button onClick={() => setPlaying(true)}>Играть матч →</button></section>}
    </main>
  );
}
