import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFootballScene } from "../hooks/useFootballScene";
import { usePenaltyShootout } from "../hooks/usePenaltyShootout";
import { useDeviceMode } from "../hooks/useDeviceMode";
import MobileControls from "./MobileControls";
import "../football3d.css";

type Props = { onExit: () => void; tournament: string; penalty?: boolean; targetGoals?: number; onMatchEnd?: (won: boolean, playerGoals: number, opponentGoals: number) => void };
export default function Football3D({ onExit, tournament, penalty = false, targetGoals, onMatchEnd }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(
    "Веди мяч, не подпускай защитников и пробей мимо вратаря.",
  );
  const [goals, setGoals] = useState(0);
  const [opponentGoals, setOpponentGoals] = useState(0);
  const goalsRef = useRef(0);
  const opponentGoalsRef = useRef(0);
  const [attempts, setAttempts] = useState(0);
  const [power, setPower] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [prematch, setPrematch] = useState(false);
  const isPhone = useDeviceMode();
  const shootout = usePenaltyShootout();
  const matchFinished = useRef(false);
  const matchTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(matchTimer.current), []);
  const onGoal = useCallback(() => {
    setGoals((current) => {
      const next = current + 1;
      goalsRef.current = next;
      if (targetGoals && next >= targetGoals && !matchFinished.current) {
        matchFinished.current = true;
        matchTimer.current = window.setTimeout(() => onMatchEnd?.(true, next, opponentGoalsRef.current), 2000);
      }
      return next;
    });
    setMessage("ГОООЛ! Через 2 секунды атаку начнёт соперник.");
  }, [onMatchEnd, targetGoals]);
  const onMiss = useCallback(
    () => setMessage("Мимо ворот. Через 2 секунды соперник начнёт атаку."),
    [],
  );
  const onTackle = useCallback((distance: string) => {
    setMessage(`Соперник завершил обводку и бьёт с ${distance} дистанции!`);
  }, []);
  const onOpponentDribble = useCallback((fromRestart: boolean) => {
    setMessage(fromRestart ? "Соперник получил мяч и начинает атаку!" : "Соперник отобрал мяч, ускорился и идёт в обводку!");
  }, []);
  const onBallWon = useCallback(() => {
    setMessage("Автоматический отбор! Мяч снова у вашей команды.");
  }, []);
  const onOpponentPass = useCallback(() => {
    setMessage("Соперники разыгрывают мяч в пас — попробуйте перехватить!");
  }, []);
  const onPrematch = useCallback((active: boolean) => setPrematch(active), []);
  const onConcede = useCallback((scored: boolean) => {
    setMessage(scored ? "Соперник забил. Возвращаем мяч в игру…" : "Ваш вратарь спас ворота!");
    if (scored) setOpponentGoals((current) => {
      const next = current + 1;
      opponentGoalsRef.current = next;
      if (targetGoals && next >= targetGoals && !matchFinished.current) {
        matchFinished.current = true;
        matchTimer.current = window.setTimeout(() => onMatchEnd?.(false, goalsRef.current, next), 2000);
      }
      return next;
    });
  }, [onMatchEnd, targetGoals]);
  const onAttempt = useCallback((scored: boolean) => {
    if (penalty) shootout.recordPlayerShot(scored);
    else setAttempts((value) => value + 1);
  }, [penalty, shootout.recordPlayerShot]);
  const sceneEvents = useMemo(
    () => ({ onGoal, onMiss, onTackle, onOpponentDribble, onBallWon, onOpponentPass, onPrematch, onConcede, onAttempt, onStats: setPower, onStamina: setStamina }),
    [onGoal, onMiss, onTackle, onOpponentDribble, onBallWon, onOpponentPass, onPrematch, onConcede, onAttempt],
  );

  useFootballScene(mountRef, sceneEvents, penalty, !penalty || shootout.turn === "player", shootout.roundKey);

  const shownMessage = penalty ? shootout.message : message;
  const shownGoals = penalty ? shootout.playerGoals : goals;
  const attemptLabel = shootout.playerAttempts < 5
    ? `${shootout.playerAttempts + 1}/5`
    : `доп. ${shootout.playerAttempts - 4}`;

  return (
    <main className={`three-game ${isPhone ? "three-game--phone" : "three-game--desktop"}`}>
      <header className="three-game__header">
        <div>
          <p>{tournament} · FOOTBALL 3D</p>
          <h1>{penalty ? 'Пенальти' : 'Повтори гол'}</h1>
        </div>
        <div className="goal-counter">
          <span>{penalty ? `ВЫ ${shootout.playerGoals}:${shootout.opponentGoals} СОПЕРНИК · ${shootout.turn === "finished" ? "МАТЧ ОКОНЧЕН" : `ПОПЫТКА ${attemptLabel}`}` : `СЧЁТ ${goals}:${opponentGoals}${targetGoals ? ` · ДО ${targetGoals} ГОЛОВ` : ` · ПОПЫТКА ${attempts + 1}`}`}</span>
          <strong>{shootout.turn === "finished" && shootout.playerGoals > shootout.opponentGoals ? '🏆' : shownGoals}</strong>
        </div>
      </header>
      <section className="three-game__brief">
        <span>БОЛЬШОЙ ДНЕВНОЙ СТАДИОН · 11 НА 11 · ДИНАМИЧЕСКАЯ КАМЕРА</span>
        <p>{shownMessage}</p>
      </section>
      <div className="three-game__stage">
        <div ref={mountRef} className="three-game__canvas" aria-label="3D футбольное поле" />
        {prematch && <div className="prematch-show"><span>FOOTBALL 3D</span><h2>КОМАНДЫ ВЫХОДЯТ НА ПОЛЕ</h2><p>{tournament} · 11 НА 11</p><i /></div>}
      </div>
      <div className="match-hud"><div><span>СИЛА УДАРА</span><i><b style={{ width: `${power}%` }} /></i></div><div><span>ВЫНОСЛИВОСТЬ</span><i className="stamina"><b style={{ width: `${stamina}%` }} /></i></div></div>
      {penalty && <div className="penalty-timing"><span>СЛИШКОМ СЛАБО</span><b>50 / 50</b><strong>ТОЧНО</strong></div>}
      {isPhone && <MobileControls penalty={penalty} />}
      <section className={`how-to ${isPhone ? "how-to--phone" : ""}`}>
        <h2>Управление</h2>
        {isPhone ? <p>Отклоняй стик для движения и удерживай отдельную кнопку «БЕГ» для ускорения. Кнопку «УДАР» удерживай для выбора силы и отпусти, чтобы пробить.</p> : <>
        <div className="how-to__keys">
          <p>{penalty ? <><kbd>A</kbd> <kbd>D</kbd> выбрать угол · удерживай <kbd>Space</kbd> и отпусти в зелёной зоне</> : <><kbd>W</kbd> бежать вперёд <kbd>S</kbd> назад</>}</p>
          <p>
            <kbd>A</kbd> <kbd>D</kbd> поворачивать игрока
          </p>
          <p>
            держи <kbd>Space</kbd> сила удара · <kbd>E</kbd> пас · <kbd>R</kbd> заново
          </p>
          {!penalty && <p><kbd>C</kbd> переключить игрока в защите</p>}
          <p>
            <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> три разных финта
          </p>
          <p><kbd>Q</kbd> + <kbd>W</kbd> быстрый бег</p>
          <p><kbd>F</kbd> кручёный · <kbd>G</kbd> паненка · <kbd>H</kbd> силовой удар</p>
        </div>
        <small>
          Чем дольше держишь Space, тем сильнее удар. После паса управление перейдёт к принявшему партнёру.
        </small>
        </>}
      </section>
      <button className="text-button" onClick={onExit}>← В главное меню</button>
    </main>
  );
}
