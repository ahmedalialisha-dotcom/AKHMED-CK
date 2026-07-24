import { useCallback, useEffect, useRef, useState } from "react";

const NEXT_SHOT_DELAY = 3000;

export function usePenaltyShootout() {
  const [playerGoals, setPlayerGoals] = useState(0);
  const [opponentGoals, setOpponentGoals] = useState(0);
  const [playerAttempts, setPlayerAttempts] = useState(0);
  const [opponentAttempts, setOpponentAttempts] = useState(0);
  const [turn, setTurn] = useState<"player" | "opponent" | "finished">("player");
  const [message, setMessage] = useState("Ваш удар. Выберите угол и силу.");
  const [roundKey, setRoundKey] = useState(0);
  const [opponentShotKey, setOpponentShotKey] = useState(0);
  const timers = useRef<number[]>([]);
  const score = useRef({ opponentAttempts, opponentGoals, playerAttempts, playerGoals, turn });
  score.current = { opponentAttempts, opponentGoals, playerAttempts, playerGoals, turn };
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const recordPlayerShot = useCallback((scored: boolean) => {
    const current = score.current;
    if (current.turn !== "player") return;
    setPlayerGoals(current.playerGoals + Number(scored));
    setPlayerAttempts(current.playerAttempts + 1);
    setTurn("opponent");
    setMessage(`${scored ? "ГОООЛ!" : "Не забили."} Вы в воротах: выберите угол — 3…`);
    setOpponentShotKey((value) => value + 1);
    timers.current.push(
      window.setTimeout(() => setMessage("Выберите угол прыжка — 2…"), 1000),
      window.setTimeout(() => setMessage("Последняя секунда — 1…"), 2000),
      window.setTimeout(() => setMessage("УДАР! Вратарь прыгает в выбранный угол!"), 3000),
    );
  }, []);

  const recordOpponentShot = useCallback((scored: boolean) => {
    const current = score.current;
    if (current.turn !== "opponent") return;
    const nextPlayerGoals = current.playerGoals;
    const nextPlayerAttempts = current.playerAttempts;
    const nextOpponentGoals = current.opponentGoals + Number(scored);
    const nextOpponentAttempts = current.opponentAttempts + 1;
    setOpponentGoals(nextOpponentGoals);
    setOpponentAttempts(nextOpponentAttempts);
    const minimumFinished = nextPlayerAttempts >= 11 && nextOpponentAttempts >= 11;
    if (minimumFinished && nextPlayerGoals !== nextOpponentGoals) {
      const won = nextPlayerGoals > nextOpponentGoals;
      setTurn("finished");
      setMessage(`${scored ? "Соперник забил." : "Вратарь отбил!"} ${won ? "Вы победили! 🏆" : "Победил соперник."}`);
      return;
    }
    const suddenDeath = minimumFinished && nextPlayerGoals === nextOpponentGoals;
    setMessage(`${scored ? "Соперник забил." : "Вратарь отбил!"} ${suddenDeath ? "Ничья — дополнительный удар…" : "Готовьтесь к следующему удару…"}`);
    timers.current.push(window.setTimeout(() => {
      setTurn("player");
      setRoundKey((value) => value + 1);
      setMessage(suddenDeath ? "Дополнительный удар. Забейте!" : "Ваш удар!");
    }, NEXT_SHOT_DELAY));
  }, []);

  return {
    message, opponentAttempts, opponentGoals, opponentShotKey, playerAttempts,
    playerGoals, recordOpponentShot, recordPlayerShot, roundKey, turn,
  };
}
