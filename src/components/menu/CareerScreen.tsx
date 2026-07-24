import type { NavigateScreen } from "../MainMenu";
import TeamPicker from "../TeamPicker";
import { CLUB_TEAMS } from "../../lib/footballTeams";

type Props = { player: string; playerAge: number; selectedTeam: string; onCareer: () => void; onScreen: (screen: NavigateScreen) => void; onPlayer: (name: string) => void; onPlayerAge: (age: number) => void; onTeam: (team: string) => void };
const players = [
  { name: "Rayan", age: 18, height: "175 см", role: "Дриблёр", number: "10" },
  { name: "Arman", age: 24, height: "182 см", role: "Нападающий", number: "09" },
  { name: "Daniyar", age: 31, height: "170 см", role: "Плеймейкер", number: "08" },
];

export default function CareerScreen({ player, playerAge, selectedTeam, onCareer, onScreen, onPlayer, onPlayerAge, onTeam }: Props) {
  return (
    <main className="surface-page">
      <header className="surface-page__bar"><button className="back-button" onClick={() => onScreen("menu")}>← Назад</button><span className="brand brand--dark"><i>F3</i><strong>FOOTBALL 3D</strong></span></header>
      <section className="page-heading"><p className="eyebrow">КАРЬЕРА ИГРОКА</p><h1>Создай героя поля</h1><span>Выбери основу и настрой детали. Всё можно изменить позже.</span></section>
      <section className="player-grid">
        {players.map((item) => <button className={player === item.name ? "player-card selected" : "player-card"} onClick={() => { onPlayer(item.name); onPlayerAge(item.age); }} key={item.name}><b>{item.number}</b><span><strong>{item.name}</strong><small>{item.age} лет · {item.height} · {item.role}</small></span><i>{player === item.name ? "✓" : ""}</i></button>)}
      </section>
      <section className="career-form">
        <div><p className="section-label">ДЕТАЛИ ИГРОКА</p><h2>Твой стиль</h2></div>
        <div className="career-options">
          <label>Имя<input value={player} onChange={(event) => onPlayer(event.target.value)} /></label>
          <label>Возраст<select value={playerAge} onChange={(event) => onPlayerAge(Number(event.target.value))}>{Array.from({ length: 25 }, (_, index) => index + 16).map((age) => <option value={age} key={age}>{age} лет</option>)}</select></label>
          <label>Рост<select defaultValue="175"><option value="170">170 см</option><option value="175">175 см</option><option value="182">182 см</option></select></label>
          <label>Вес<select defaultValue="74"><option value="68">68 кг</option><option value="74">74 кг</option><option value="80">80 кг</option></select></label>
          <label>Прическа<select><option>Короткая</option><option>Кудри</option><option>Ирокез</option></select></label>
          <label>Форма лица<select><option>Овальная</option><option>Квадратная</option></select></label>
          <label>Цвет кожи<select><option>Смуглый</option><option>Светлый</option><option>Тёмный</option></select></label>
        </div>
      </section>
      <section className="career-team">
        <div><p className="section-label">ТВОЙ КЛУБ</p><h2>Выбери команду карьеры</h2></div>
        <TeamPicker teams={CLUB_TEAMS} selected={selectedTeam} onSelect={onTeam} />
      </section>
      <button className="primary-action" onClick={onCareer}>Начать карьеру за {selectedTeam} <span>→</span></button>
    </main>
  );
}
