import { CLUB_TEAMS } from "../../lib/footballTeams";
import TeamPicker from "../TeamPicker";
import type { NavigateScreen } from "../MainMenu";

type Props = {
  selectedTeam: string;
  onTeam: (team: string) => void;
  onStart: (mode: string) => void;
  onScreen: (screen: NavigateScreen) => void;
};

export default function QuickMatchScreen({ selectedTeam, onTeam, onStart, onScreen }: Props) {
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
      <button className="primary-action" onClick={() => onStart(`Быстрый матч · ${selectedTeam}`)}>
        Играть за {selectedTeam} <span>→</span>
      </button>
    </main>
  );
}
