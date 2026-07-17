import { useEffect, useRef, useState } from "react";
import { sendMobileKey } from "../lib/mobileInput";

const MOVE_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD"];
const MAX_DISTANCE = 34;

export default function MobileJoystick() {
  const activeKeys = useRef(new Set<string>());
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const setKey = (code: string, active: boolean) => {
    const isActive = activeKeys.current.has(code);
    if (active === isActive) return;
    if (active) activeKeys.current.add(code);
    else activeKeys.current.delete(code);
    sendMobileKey(code, active);
  };

  const release = () => {
    MOVE_KEYS.forEach((code) => setKey(code, false));
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => release, []);

  const move = (element: HTMLDivElement, clientX: number, clientY: number) => {
    const bounds = element.getBoundingClientRect();
    const rawX = clientX - (bounds.left + bounds.width / 2);
    const rawY = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > MAX_DISTANCE ? MAX_DISTANCE / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    setPosition({ x, y });
    setKey("KeyA", x < -10);
    setKey("KeyD", x > 10);
    setKey("KeyW", y < -10);
    setKey("KeyS", y > 10);
  };

  return (
    <div
      className="mobile-joystick"
      aria-label="Стик движения"
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={release}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          move(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerUp={release}
    >
      <span style={{ transform: `translate(${position.x}px, ${position.y}px)` }} />
    </div>
  );
}
