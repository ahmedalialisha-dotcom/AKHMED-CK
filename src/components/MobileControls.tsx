type Props = { penalty: boolean };

const sendKey = (code: string, pressed: boolean) => {
  window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", { code }));
};

type ControlButtonProps = {
  code: string;
  label: string;
  className?: string;
};

function ControlButton({ code, label, className = "" }: ControlButtonProps) {
  const release = () => sendKey(code, false);
  return (
    <button
      className={className}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={release}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        sendKey(code, true);
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
      <div className="mobile-controls__move">
        {!penalty && <ControlButton code="KeyW" label="▲" className="move-up" />}
        <ControlButton code="KeyA" label="◀" className="move-left" />
        <ControlButton code="KeyD" label="▶" className="move-right" />
        {!penalty && <ControlButton code="KeyS" label="▼" className="move-down" />}
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
