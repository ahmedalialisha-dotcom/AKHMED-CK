import type { NavigateScreen } from "../MainMenu";

type Props = { onTournament: (name: string) => void; onScreen: (screen: NavigateScreen) => void };

export default function TournamentScreen({ onTournament, onScreen }: Props) {
  return (
    <main className="surface-page tournament-page">
      <header className="surface-page__bar"><button className="back-button" onClick={() => onScreen("menu")}>← Назад</button><span className="brand brand--dark"><i>F3</i><strong>FOOTBALL 3D</strong></span></header>
      <section className="page-heading"><p className="eyebrow">БОЛЬШАЯ СЦЕНА</p><h1>Выбери турнир</h1><span>Два легендарных пути. Один шанс показать свою лучшую игру.</span></section>
      <div className="tournament-grid">
        <button className="tournament-card" onClick={() => onTournament("Лига чемпионов")}><span>01</span><div><i>ЕВРОПА</i><strong>Лига чемпионов</strong><small>Групповой этап, плей-офф и путь к кубку.</small></div><b>→</b></button>
        <button className="tournament-card tournament-card--gold" onClick={() => onTournament("Чемпионат мира")}><span>02</span><div><i>МИР</i><strong>Чемпионат мира</strong><small>Группа, полуфинал и главный финал сборных.</small></div><b>→</b></button>
      </div>
    </main>
  );
}
