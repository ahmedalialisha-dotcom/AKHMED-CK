import { useCallback, useMemo, useRef, useState } from "react";
import { useFootballScene } from "../hooks/useFootballScene";
import { usePenaltyShootout } from "../hooks/usePenaltyShootout";
import "../football3d.css";

type Props = { onExit: () => void; tournament: string; penalty?: boolean };
export default function Football3D({ onExit, tournament, penalty = false }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(
    "Веди мяч, не подпускай защитников и пробей мимо вратаря.",
  );
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [power, setPower] = useState(0);
  const [stamina, setStamina] = useState(100);
  const shootout = usePenaltyShootout();
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
  const onAttempt = useCallback((scored: boolean) => {
    if (penalty) shootout.recordPlayerShot(scored);
    else setAttempts((value) => value + 1);
  }, [penalty, shootout.recordPlayerShot]);
  const sceneEvents = useMemo(
    () => ({ onGoal, onMiss, onTackle, onAttempt, onStats: setPower, onStamina: setStamina }),
    [onGoal, onMiss, onTackle, onAttempt],
  );

  useFootballScene(mountRef, sceneEvents, penalty, !penalty || shootout.turn === "player", shootout.roundKey);

  const shownMessage = penalty ? shootout.message : message;
  const shownGoals = penalty ? shootout.playerGoals : goals;
  const attemptLabel = shootout.playerAttempts < 5
    ? `${shootout.playerAttempts + 1}/5`
    : `доп. ${shootout.playerAttempts - 4}`;

  return (
    <main className="three-game">
      <header className="three-game__header">
        <div>
          <p>{tournament} · FOOTBALL MOMENTS 3D</p>
          <h1>{penalty ? 'Пенальти' : 'Повтори гол'}</h1>
        </div>
        <div className="goal-counter">
          <span>{penalty ? `ВЫ ${shootout.playerGoals}:${shootout.opponentGoals} СОПЕРНИК · ${shootout.turn === "finished" ? "МАТЧ ОКОНЧЕН" : `ПОПЫТКА ${attemptLabel}`}` : `СЧЁТ ${goals} · ПОПЫТКА ${attempts + 1}`}</span>
          <strong>{shootout.turn === "finished" && shootout.playerGoals > shootout.opponentGoals ? '🏆' : shownGoals}</strong>
        </div>
      </header>
      <section className="three-game__brief">
        <span>ВЕЧЕРНИЙ СТАДИОН · КАМЕРА ОТ ТРЕТЬЕГО ЛИЦА</span>
        <p>{shownMessage}</p>
      </section>
      <div
        ref={mountRef}
        className="three-game__canvas"
        aria-label="3D футбольное поле"
      />
      <div className="match-hud"><div><span>СИЛА УДАРА</span><i><b style={{ width: `${power}%` }} /></i></div><div><span>ВЫНОСЛИВОСТЬ</span><i className="stamina"><b style={{ width: `${stamina}%` }} /></i></div></div>
      {penalty && <div className="penalty-timing"><span>СЛИШКОМ СЛАБО</span><b>50 / 50</b><strong>ТОЧНО</strong></div>}
      <section className="how-to">
        <h2>Управление</h2>
        <div className="how-to__keys">
          <p>{penalty ? <><kbd>A</kbd> <kbd>D</kbd> выбрать угол · удерживай <kbd>Space</kbd> и отпусти в зелёной зоне</> : <><kbd>W</kbd> бежать вперёд <kbd>S</kbd> назад</>}</p>
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
