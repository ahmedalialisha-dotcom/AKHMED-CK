import { useEffect, useMemo, useState } from "react";
import { SHOP_ITEMS } from "./menu/ShopScreen";
import "./../open-world.css";

type Props = {
  coins: number;
  ownedItems: string[];
  equippedItems: string[];
  onEquip: (itemId: string) => void;
  onEat: () => boolean;
  onOpenShop: () => void;
  onExit: () => void;
};

const places = [
  { id: "cafe", icon: "🍔", name: "Кафе", x: 18, y: 22 },
  { id: "tech", icon: "📱", name: "Техника", x: 76, y: 18 },
  { id: "fashion", icon: "👕", name: "Мода", x: 78, y: 72 },
  { id: "sport", icon: "⚽", name: "Спорт", x: 20, y: 76 },
];

export default function OpenWorldMode(props: Props) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [hunger, setHunger] = useState(72);
  const inventory = useMemo(() => SHOP_ITEMS.filter((item) => props.ownedItems.includes(item.id)), [props.ownedItems]);
  const nearby = places.find((place) => Math.hypot(position.x - place.x, position.y - place.y) < 13);
  const move = (x: number, y: number) => {
    setPosition((current) => ({ x: Math.min(94, Math.max(6, current.x + x)), y: Math.min(92, Math.max(8, current.y + y)) }));
    setHunger((value) => Math.max(0, value - .4));
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") move(0, -3);
      if (event.code === "KeyS" || event.code === "ArrowDown") move(0, 3);
      if (event.code === "KeyA" || event.code === "ArrowLeft") move(-3, 0);
      if (event.code === "KeyD" || event.code === "ArrowRight") move(3, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const interact = () => {
    if (nearby?.id === "cafe") {
      if (props.onEat()) setHunger(100);
    } else if (nearby) props.onOpenShop();
  };

  return (
    <main className="open-world">
      <header><button onClick={props.onExit}>← Главное меню</button><div><p>ОТКРЫТЫЙ МИР</p><h1>Football City</h1></div><strong>● {props.coins}</strong></header>
      <section className="world-status"><div><span>СЫТОСТЬ</span><i><b style={{ width: `${hunger}%` }} /></i></div><p>{nearby ? `Рядом: ${nearby.name}` : "Исследуй город и найди магазины"}</p></section>
      <div className="world-layout">
        <section className="world-map">
          <div className="world-road world-road--horizontal" /><div className="world-road world-road--vertical" />
          {places.map((place) => <div className="world-place" key={place.id} style={{ left: `${place.x}%`, top: `${place.y}%` }}><b>{place.icon}</b><span>{place.name}</span></div>)}
          <div className="world-avatar" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
            <span className="avatar-head">🙂</span><i className="avatar-body" />
            {props.equippedItems.map((id, index) => <em key={id} style={{ transform: `translate(${index * 15 - 20}px,-${index % 2 * 10}px)` }}>{SHOP_ITEMS.find((item) => item.id === id)?.icon}</em>)}
          </div>
          <div className="world-controls"><button onClick={() => move(0, -3)}>↑</button><button onClick={() => move(-3, 0)}>←</button><button onClick={() => move(0, 3)}>↓</button><button onClick={() => move(3, 0)}>→</button></div>
          {nearby && <button className="world-interact" onClick={interact}>{nearby.id === "cafe" ? "Купить еду · 30 ●" : `Войти: ${nearby.name}`}</button>}
        </section>
        <aside className="world-wardrobe"><p>ГАРДЕРОБ</p><h2>Твои вещи</h2>{inventory.length ? inventory.map((item) => { const equipped = props.equippedItems.includes(item.id); return <button className={equipped ? "equipped" : ""} onClick={() => props.onEquip(item.id)} key={item.id}><b>{item.icon}</b><span>{item.name}</span><i>{equipped ? "Снять" : "Надеть"}</i></button>; }) : <span>Купи аксессуары в магазине — они появятся здесь.</span>}</aside>
      </div>
    </main>
  );
}
