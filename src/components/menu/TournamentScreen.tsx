import type { NavigateScreen } from "../MainMenu";

type Props = { onStart: (mode: string) => void; onScreen: (screen: NavigateScreen) => void };

export default function TournamentScreen({ onStart, onScreen }: Props) {
  return (
    <main className="surface-page tournament-page">
      <header className="surface-page__bar"><button className="back-button" onClick={() => onScreen("menu")}>← Назад</button><span className="brand brand--dark"><i>FM</i><strong>Football Moments</strong></span></header>
      <section className="page-heading"><p className="eyebrow">БОЛЬШАЯ СЦЕНА</p><h1>Выбери турнир</h1><span>Два легендарных пути. Один шанс показать свою лучшую игру.</span></section>
      <div className="tournament-grid">
        <button className="tournament-card" onClick={() => onStart("Лига чемпионов")}><span>01</span><div><i>ЕВРОПА</i><strong>Лига чемпионов</strong><small>Клубы, вечерний стадион и путь к кубку.</small></div><b>→</b></button>
        <button className="tournament-card tournament-card--gold" onClick={() => onStart("Чемпионат мира")}><span>02</span><div><i>МИР</i><strong>Чемпионат мира</strong><small>Сборные, национальная гордость и главный финал.</small></div><b>→</b></button>
      </div>
    </main>
  );
}
