import { useEffect, useMemo, useRef, useState } from "react";
import { HAIR_STYLES, type HairStyle } from "../lib/footballHair";
import { useOpenWorldScene } from "../hooks/useOpenWorldScene";
import { sendMobileKey } from "../lib/mobileInput";
import MobileJoystick from "./MobileJoystick";
import { SHOP_ITEMS } from "./menu/ShopScreen";
import "../open-world.css";

type Props = {
  coins: number; ownedItems: string[]; equippedItems: string[]; hairStyle: HairStyle;
  onEquip: (itemId: string) => void; onHair: (style: HairStyle) => void;
  onEat: () => boolean; onOpenShop: () => void; onExit: () => void;
};
type WorldPosition = { x: number; z: number; heading: number };

const places = [
  { id: "cafe", icon: "🍔", name: "GOAL CAFÉ", x: -18, z: -15 },
  { id: "tech", icon: "📱", name: "F3 TECH", x: 18, z: -15 },
  { id: "fashion", icon: "👕", name: "STYLE 11", x: 18, z: 15 },
  { id: "sport", icon: "⚽", name: "PRO SPORT", x: -18, z: 15 },
  { id: "barber", icon: "✂️", name: "BARBER CUT", x: 0, z: -22 },
  { id: "cars", icon: "🚗", name: "F3 MOTORS", x: 23, z: 0 },
];
const wrap = (value: number) => value > 58 ? -58 : value < -58 ? 58 : value;

export default function OpenWorldMode(props: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const movementSpeed = useRef(0);
  const [position, setPosition] = useState<WorldPosition>({ x: 0, z: 0, heading: 0 });
  const [hunger, setHunger] = useState(72);
  const [cutting, setCutting] = useState(false);
  const [choosingHair, setChoosingHair] = useState(false);
  const [driving, setDriving] = useState(false);
  const inventory = useMemo(() => SHOP_ITEMS.filter((item) => props.ownedItems.includes(item.id)), [props.ownedItems]);
  const nearby = places.find((place) => Math.hypot(position.x - place.x, position.z - place.z) < 6);
  const ownsCar = props.ownedItems.some((item) => item === "city-car" || item === "sport-car");
  useOpenWorldScene(mountRef, position, props.hairStyle, props.equippedItems, cutting, driving);

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.code);
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    const timer = window.setInterval(() => {
      setPosition((current) => {
        const turn = Number(keys.current.has("KeyA")) - Number(keys.current.has("KeyD"));
        const direction = Number(keys.current.has("KeyW")) - Number(keys.current.has("KeyS"));
        const boost = keys.current.has("KeyQ") ? 1.65 : 1;
        const maximumSpeed = (driving ? .78 : .28) * boost;
        const desiredSpeed = cutting ? 0 : direction * maximumSpeed;
        movementSpeed.current += (desiredSpeed - movementSpeed.current) * (direction ? .18 : .12);
        const steering = driving ? .048 * Math.min(1, Math.abs(movementSpeed.current) * 2.2) : .078;
        const heading = current.heading + turn * steering * (movementSpeed.current < 0 ? -1 : 1);
        if (Math.abs(movementSpeed.current) < .006) return { ...current, heading };
        const speed = movementSpeed.current;
        setHunger((value) => Math.max(0, value - (driving ? .01 : .025)));
        return { x: wrap(current.x + Math.sin(heading) * speed), z: wrap(current.z - Math.cos(heading) * speed), heading };
      });
    }, 32);
    return () => { window.clearInterval(timer); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [cutting, driving]);

  const chooseHair = (style: HairStyle) => {
    setChoosingHair(false); setCutting(true); setPosition({ x: 0, z: -22, heading: 0 });
    window.setTimeout(() => { props.onHair(style); setCutting(false); }, 2600);
  };
  const interact = () => {
    if (nearby?.id === "cafe") { if (props.onEat()) setHunger(100); }
    else if (nearby?.id === "barber") setChoosingHair(true);
    else if (nearby) props.onOpenShop();
  };

  return (
    <main className="open-world">
      <header><button onClick={props.onExit}>← Главное меню</button><div><p>ОТКРЫТЫЙ МИР · 3D</p><h1>Football City</h1></div><strong>● {props.coins}</strong></header>
      <section className="world-status"><div><span>СЫТОСТЬ</span><i><b style={{ width: `${hunger}%` }} /></i></div><p>{driving ? "🚗 Режим вождения · Q ускорение" : cutting ? "✂️ Идёт стрижка…" : nearby ? `Рядом: ${nearby.name}` : "W/S движение · A/D поворот · Q бег"}</p></section>
      <div className="world-layout">
        <section className="world-stage">
          <div ref={mountRef} className="world-canvas" />
          <div className="world-legend">{places.map((place) => <span key={place.id}>{place.icon} {place.name}</span>)}</div>
          <div className="world-mobile"><MobileJoystick /><button onPointerDown={() => sendMobileKey("KeyQ", true)} onPointerUp={() => sendMobileKey("KeyQ", false)} onPointerCancel={() => sendMobileKey("KeyQ", false)} onPointerLeave={() => sendMobileKey("KeyQ", false)}>{driving ? "ТУРБО" : "БЕГ"}</button></div>
          {nearby && !cutting && <button className="world-interact" onClick={interact}>{nearby.id === "cafe" ? "Поесть · 30 ●" : nearby.id === "barber" ? "Выбрать стрижку ✂️" : `Войти: ${nearby.name}`}</button>}
          {(ownsCar || nearby?.id === "cars" || driving) && <button className="world-drive" onClick={() => setDriving((value) => !value)}>{driving ? "Выйти из машины" : ownsCar ? "Сесть в машину" : "Тест-драйв"}</button>}
          {choosingHair && <div className="barber-menu"><h2>Выбери причёску</h2>{HAIR_STYLES.map((style) => <button onClick={() => chooseHair(style.value)} key={style.value}><b>{style.icon}</b>{style.label}</button>)}<button onClick={() => setChoosingHair(false)}>Отмена</button></div>}
          {cutting && <div className="barber-animation"><b>✂️</b><span>Мастер создаёт новую причёску…</span></div>}
        </section>
        <aside className="world-wardrobe"><p>ГАРДЕРОБ</p><h2>Твои вещи</h2>{inventory.length ? inventory.map((item) => { const equipped = props.equippedItems.includes(item.id); return <button className={equipped ? "equipped" : ""} onClick={() => props.onEquip(item.id)} key={item.id}><b>{item.icon}</b><span>{item.name}</span><i>{equipped ? "Снять" : "Надеть"}</i></button>; }) : <span>Купи аксессуары в магазине — они появятся здесь.</span>}</aside>
      </div>
    </main>
  );
}
