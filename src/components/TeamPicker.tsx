import type { FootballTeam } from "../lib/footballTeams";

type Props = {
  teams: FootballTeam[];
  selected: string;
  onSelect: (team: string) => void;
};

export default function TeamPicker({ teams, selected, onSelect }: Props) {
  return (
    <div className="team-picker" aria-label="Выбор команды">
      {teams.map((team) => (
        <button
          className={selected === team.name ? "team-option selected" : "team-option"}
          key={team.name}
          onClick={() => onSelect(team.name)}
        >
          <b>{team.badge}</b>
          <span>{team.name}</span>
          <i>{selected === team.name ? "✓" : ""}</i>
        </button>
      ))}
    </div>
  );
}
