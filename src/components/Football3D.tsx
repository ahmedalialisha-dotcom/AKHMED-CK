import { useCallback, useMemo, useRef, useState } from "react";
import { useFootballScene } from "../hooks/useFootballScene";
import "../football3d.css";

type Props = { onExit: () => void; tournament: string };
export default function Football3D({ onExit, tournament }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(
    "Веди мяч, не подпускай защитников и пробей мимо вратаря.",
  );
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [power, setPower] = useState(0);
  const [stamina, setStamina] = useState(100);
  const onGoal = useCallback(() => {
    setGoals((current) => current + 1);
    setMessage("ГОООЛ! Нажми R и повтори момент ещё раз.");
  }, []);
  const onMiss = useCallback(
    () => setMessage("Мимо ворот. Нажми R и выбери угол точнее."),
    [],
  );
  const onTackle = useCallback(
    () => setMessage("Защитник отобрал мяч! Нажми R и попробуй обойти его."),
    [],
  );
  const onAttempt = useCallback(() => { setAttempts((value) => Math.min(5, value + 1)); }, []);
  const sceneEvents = useMemo(
    () => ({ onGoal, onMiss, onTackle, onAttempt, onStats: setPower, onStamina: setStamina }),
    [onGoal, onMiss, onTackle, onAttempt],
  );

  useFootballScene(mountRef, sceneEvents);

  return (
    <main className="three-game">
      <header className="three-game__header">
        <div>
          <p>{tournament} · FOOTBALL MOMENTS 3D</p>
          <h1>Повтори гол</h1>
        </div>
        <div className="goal-counter">
          <span>СЧЁТ {goals} · ПОПЫТКА {Math.min(attempts + 1, 5)}/5</span>
          <strong>{goals >= 3 ? '🏆' : goals}</strong>
        </div>
      </header>
      <section className="three-game__brief">
        <span>ВЕЧЕРНИЙ СТАДИОН · КАМЕРА ОТ ТРЕТЬЕГО ЛИЦА</span>
        <p>{message}</p>
      </section>
      <div
        ref={mountRef}
        className="three-game__canvas"
        aria-label="3D футбольное поле"
      ><span className="shot-aim" aria-label="Прицел удара" /></div>
      <div className="match-hud"><div><span>СИЛА УДАРА</span><i><b style={{ width: `${power}%` }} /></i></div><div><span>ВЫНОСЛИВОСТЬ</span><i className="stamina"><b style={{ width: `${stamina}%` }} /></i></div></div>
      <section className="how-to">
        <h2>Управление</h2>
        <div className="how-to__keys">
          <p>
            <kbd>W</kbd> бежать вперёд <kbd>S</kbd> назад
          </p>
          <p>
            <kbd>A</kbd> <kbd>D</kbd> поворачивать игрока
          </p>
          <p>
            держи <kbd>Space</kbd> сила удара · <kbd>E</kbd> пас · <kbd>R</kbd> заново
          </p>
          <p>
            <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> три разных финта
          </p>
          <p><kbd>Q</kbd> + <kbd>W</kbd> быстрый бег</p>
          <p><kbd>F</kbd> кручёный · <kbd>G</kbd> паненка · <kbd>H</kbd> силовой удар</p>
        </div>
        <small>
          Чем дольше держишь Space, тем сильнее удар. После паса управление перейдёт к принявшему партнёру.
        </small>
      </section>
      <button className="text-button" onClick={onExit}>← В главное меню</button>
    </main>
  );
}
