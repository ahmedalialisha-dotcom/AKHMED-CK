import MobileJoystick from "./MobileJoystick";
import { sendMobileKey } from "../lib/mobileInput";

type Props = { penalty: boolean };

type ControlButtonProps = {
  code: string;
  label: string;
  className?: string;
};

function ControlButton({ code, label, className = "" }: ControlButtonProps) {
  const release = () => sendMobileKey(code, false);
  return (
    <button
      className={className}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={release}
      onPointerLeave={(event) => {
        if (event.buttons) release();
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        sendMobileKey(code, true);
      }}
      onPointerUp={release}
      type="button"
    >
      {label}
    </button>
  );
}

export default function MobileControls({ penalty }: Props) {
  return (
    <section className="mobile-controls" aria-label="Сенсорное управление">
      <div className="mobile-controls__movement">
        <MobileJoystick />
        {!penalty && <ControlButton code="KeyQ" label="БЕГ" className="move-sprint" />}
      </div>
      <div className="mobile-controls__actions">
        {!penalty && <ControlButton code="KeyE" label="ПАС" />}
        <ControlButton code="KeyF" label="КРУЧ." />
        <ControlButton code="KeyG" label="ПАНЕНКА" />
        <ControlButton code="KeyH" label="СИЛА" />
        <ControlButton code="Space" label="УДАР" className="shoot-button" />
      </div>
    </section>
  );
}
