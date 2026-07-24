import { CLUB_TEAMS } from "../../lib/footballTeams";
import TeamPicker from "../TeamPicker";
import type { NavigateScreen } from "../MainMenu";

type Props = {
  selectedTeam: string;
  opponentTeam: string;
  onTeam: (team: string) => void;
  onOpponent: (team: string) => void;
  onStart: (mode: string, homeTeam?: string, awayTeam?: string) => void;
  onScreen: (screen: NavigateScreen) => void;
};

export default function QuickMatchScreen({ selectedTeam, opponentTeam, onTeam, onOpponent, onStart, onScreen }: Props) {
  const opponents = CLUB_TEAMS.filter((team) => team.name !== selectedTeam);
  const safeOpponent = opponents.some((team) => team.name === opponentTeam) ? opponentTeam : opponents[0].name;
  return (
    <main className="surface-page">
      <header className="surface-page__bar">
        <button className="back-button" onClick={() => onScreen("menu")}>← Назад</button>
        <span className="brand brand--dark"><i>F3</i><strong>FOOTBALL 3D</strong></span>
      </header>
      <section className="page-heading team-heading">
        <p className="eyebrow">БЫСТРЫЙ МАТЧ</p>
        <h1>Выбери команду</h1>
        <span>16 клубов готовы выйти на поле.</span>
      </section>
      <TeamPicker teams={CLUB_TEAMS} selected={selectedTeam} onSelect={onTeam} />
      <section className="opponent-select"><p className="section-label">СОПЕРНИК</p><h2>Выбери команду соперника</h2></section>
      <TeamPicker teams={opponents} selected={safeOpponent} onSelect={onOpponent} />
      <button className="primary-action" onClick={() => onStart(`Быстрый матч · ${selectedTeam} vs ${safeOpponent}`, selectedTeam, safeOpponent)}>
        {selectedTeam} vs {safeOpponent} <span>→</span>
      </button>
    </main>
  );
}
