import { CLUB_TEAMS } from "../../lib/footballTeams";
import TeamPicker from "../TeamPicker";
import type { NavigateScreen } from "../MainMenu";

type Props = {
  selectedTeam: string;
  opponentTeam: string;
  onTeam: (team: string) => void;
  onOpponent: (team: string) => void;
  onPenalty: (homeTeam: string, awayTeam: string) => void;
  onScreen: (screen: NavigateScreen) => void;
};

export default function PenaltyTeamScreen(props: Props) {
  const opponents = CLUB_TEAMS.filter((team) => team.name !== props.selectedTeam);
  const opponent = opponents.some((team) => team.name === props.opponentTeam)
    ? props.opponentTeam
    : opponents[0].name;

  return (
    <main className="surface-page">
      <header className="surface-page__bar">
        <button className="back-button" onClick={() => props.onScreen("menu")}>← Назад</button>
        <span className="brand brand--dark"><i>F3</i><strong>FOOTBALL 3D</strong></span>
      </header>
      <section className="page-heading team-heading">
        <p className="eyebrow">СЕРИЯ ПЕНАЛЬТИ</p>
        <h1>Выбери команды</h1>
        <span>Пять ударов, а при ничьей — до первой победы.</span>
      </section>
      <p className="section-label">ВАША КОМАНДА</p>
      <TeamPicker teams={CLUB_TEAMS} selected={props.selectedTeam} onSelect={props.onTeam} />
      <div className="opponent-select"><p className="section-label">СОПЕРНИК</p><h2>Кто встанет напротив?</h2></div>
      <TeamPicker teams={opponents} selected={opponent} onSelect={props.onOpponent} />
      <button className="primary-action" onClick={() => props.onPenalty(props.selectedTeam, opponent)}>
        Начать пенальти <span>→</span>
      </button>
    </main>
  );
}
