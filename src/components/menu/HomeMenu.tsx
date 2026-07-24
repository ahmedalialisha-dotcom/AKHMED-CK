import neymarHero from "../../assets/neymar-hero.png";
import type { NavigateScreen } from "../MainMenu";

type Props = {
  userEmail?: string;
  onScreen: (screen: NavigateScreen) => void;
};

const actions = [
  { icon: "⚡", title: "Быстрый матч", text: "Выбрать клуб и выйти на поле", action: "quick" },
  { icon: "◎", title: "Серия пенальти", text: "Выбрать команды и пробить", action: "penaltySelect" },
  { icon: "★", title: "Карьера", text: "Создать своего игрока", action: "career" },
  { icon: "◆", title: "Турниры", text: "Выбрать большое событие", action: "settings" },
  { icon: "▣", title: "Магазин", text: "Телефоны, бутсы и аксессуары", action: "shop" },
  { icon: "⌂", title: "Открытый мир", text: "Город, кафе и твои вещи", action: "openWorld" },
];

export default function HomeMenu({ userEmail, onScreen }: Props) {
  const selectAction = (action: string) => {
    if (action === "quick") onScreen("quick");
    else onScreen(action as "penaltySelect" | "career" | "settings" | "shop" | "openWorld");
  };

  return (
    <main className="home-menu" style={{ backgroundImage: `url(${neymarHero})` }}>
      <div className="home-menu__shade" />
      <header className="home-menu__topbar">
        <a className="brand" href="#top" aria-label="FOOTBALL 3D">
          <span>F3</span><strong>FOOTBALL 3D</strong>
        </a>
        <button className="profile-chip" onClick={() => onScreen(userEmail ? "profile" : "auth")}>
          <span>{userEmail ? userEmail[0].toUpperCase() : "○"}</span>
          {userEmail ?? "Войти"}
        </button>
      </header>
      <section className="home-menu__content" id="top">
        <div className="home-menu__intro">
          <p className="eyebrow">ТВОЙ МОМЕНТ НА ПОЛЕ</p>
          <h1>Футбол начинается с одного удара.</h1>
          <p className="lead">Выбери режим, почувствуй стадион и создай момент, который хочется повторить.</p>
        </div>
        <nav className="mode-grid" aria-label="Режимы игры">
          {actions.map((item, index) => (
            <button className={index === 0 ? "mode-card mode-card--featured" : "mode-card"} onClick={() => selectAction(item.action)} key={item.action}>
              <span className="mode-card__icon">{item.icon}</span>
              <span><strong>{item.title}</strong><small>{item.text}</small></span>
              <i>→</i>
            </button>
          ))}
        </nav>
      </section>
      <footer className="home-menu__footer"><span>3D FOOTBALL EXPERIENCE</span><span>КЛАВИАТУРА · СЕНСОРНЫЙ ЭКРАН</span></footer>
    </main>
  );
}
