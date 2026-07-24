import { useEffect, useMemo, useRef, useState } from "react";
import { HAIR_STYLES, type HairStyle } from "../lib/footballHair";
import { useOpenWorldScene } from "../hooks/useOpenWorldScene";
import { SHOP_ITEMS } from "./menu/ShopScreen";
import "../open-world.css";

type Props = {
  coins: number; ownedItems: string[]; equippedItems: string[]; hairStyle: HairStyle;
  onEquip: (itemId: string) => void; onHair: (style: HairStyle) => void;
  onEat: () => boolean; onOpenShop: () => void; onExit: () => void;
};

const places = [
  { id: "cafe", icon: "🍔", name: "Кафе", x: -15, z: -11 },
  { id: "tech", icon: "📱", name: "Техника", x: 15, z: -11 },
  { id: "fashion", icon: "👕", name: "Мода", x: 15, z: 11 },
  { id: "sport", icon: "⚽", name: "Спорт", x: -15, z: 11 },
  { id: "barber", icon: "✂️", name: "Парикмахерская", x: 0, z: -16 },
  { id: "cars", icon: "🚗", name: "Автосалон", x: 16, z: 0 },
];

export default function OpenWorldMode(props: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [hunger, setHunger] = useState(72);
  const [cutting, setCutting] = useState(false);
  const inventory = useMemo(() => SHOP_ITEMS.filter((item) => props.ownedItems.includes(item.id)), [props.ownedItems]);
  const nearby = places.find((place) => Math.hypot(position.x - place.x, position.z - place.z) < 5);
  useOpenWorldScene(mountRef, position, props.hairStyle, props.equippedItems, cutting);
  const move = (x: number, z: number) => {
    if (cutting) return;
    setPosition((current) => ({ x: Math.min(23, Math.max(-23, current.x + x)), z: Math.min(23, Math.max(-23, current.z + z)) }));
    setHunger((value) => Math.max(0, value - .35));
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") move(0, -1.2);
      if (event.code === "KeyS" || event.code === "ArrowDown") move(0, 1.2);
      if (event.code === "KeyA" || event.code === "ArrowLeft") move(-1.2, 0);
      if (event.code === "KeyD" || event.code === "ArrowRight") move(1.2, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const interact = () => {
    if (nearby?.id === "cafe") {
      if (props.onEat()) setHunger(100);
    } else if (nearby?.id === "barber") {
      setPosition({ x: 0, z: -16 });
      setCutting(true);
      window.setTimeout(() => {
        const index = HAIR_STYLES.findIndex((style) => style.value === props.hairStyle);
        props.onHair(HAIR_STYLES[(index + 1) % HAIR_STYLES.length].value);
        setCutting(false);
      }, 2600);
    } else if (nearby) props.onOpenShop();
  };

  return (
    <main className="open-world">
      <header><button onClick={props.onExit}>← Главное меню</button><div><p>ОТКРЫТЫЙ МИР · 3D</p><h1>Football City</h1></div><strong>● {props.coins}</strong></header>
      <section className="world-status"><div><span>СЫТОСТЬ</span><i><b style={{ width: `${hunger}%` }} /></i></div><p>{cutting ? "✂️ Идёт стрижка…" : nearby ? `Рядом: ${nearby.name}` : "WASD · исследуй город"}</p></section>
      <div className="world-layout">
        <section className="world-stage">
          <div ref={mountRef} className="world-canvas" />
          <div className="world-legend">{places.map((place) => <span key={place.id}>{place.icon} {place.name}</span>)}</div>
          <div className="world-controls"><button onClick={() => move(0, -1.2)}>↑</button><button onClick={() => move(-1.2, 0)}>←</button><button onClick={() => move(0, 1.2)}>↓</button><button onClick={() => move(1.2, 0)}>→</button></div>
          {nearby && !cutting && <button className="world-interact" onClick={interact}>{nearby.id === "cafe" ? "Поесть · 30 ●" : nearby.id === "barber" ? "Подстричься ✂️" : `Войти: ${nearby.name}`}</button>}
          {cutting && <div className="barber-animation"><b>✂️</b><span>Новая причёска через несколько секунд…</span></div>}
        </section>
        <aside className="world-wardrobe"><p>ГАРДЕРОБ</p><h2>Твои вещи</h2>{inventory.length ? inventory.map((item) => { const equipped = props.equippedItems.includes(item.id); return <button className={equipped ? "equipped" : ""} onClick={() => props.onEquip(item.id)} key={item.id}><b>{item.icon}</b><span>{item.name}</span><i>{equipped ? "Снять" : "Надеть"}</i></button>; }) : <span>Купи аксессуары в магазине — они появятся здесь.</span>}</aside>
      </div>
    </main>
  );
}
