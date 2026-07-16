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
  const timers = useRef<number[]>([]);
  const score = useRef({ opponentAttempts, opponentGoals, playerAttempts, playerGoals, turn });
  score.current = { opponentAttempts, opponentGoals, playerAttempts, playerGoals, turn };

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const recordPlayerShot = useCallback((scored: boolean) => {
    const current = score.current;
    if (current.turn !== "player") return;
    const nextPlayerGoals = current.playerGoals + Number(scored);
    const nextPlayerAttempts = current.playerAttempts + 1;
    setPlayerGoals(nextPlayerGoals);
    setPlayerAttempts(nextPlayerAttempts);
    setTurn("opponent");
    setMessage(`${scored ? "ГОООЛ!" : "Не забили."} Через 3 секунды бьёт соперник…`);

    timers.current.push(window.setTimeout(() => {
      const opponentScored = Math.random() < 0.65;
      const nextOpponentGoals = current.opponentGoals + Number(opponentScored);
      const nextOpponentAttempts = current.opponentAttempts + 1;
      setOpponentGoals(nextOpponentGoals);
      setOpponentAttempts(nextOpponentAttempts);

      const pairComplete = nextPlayerAttempts === nextOpponentAttempts;
      const minimumFinished = nextPlayerAttempts >= 5 && nextOpponentAttempts >= 5;
      if (pairComplete && minimumFinished && nextPlayerGoals !== nextOpponentGoals) {
        const won = nextPlayerGoals > nextOpponentGoals;
        setTurn("finished");
        setMessage(`${opponentScored ? "Соперник забил." : "Соперник не забил."} ${won ? "Вы победили! 🏆" : "Победил соперник."}`);
        return;
      }

      const suddenDeath = minimumFinished && nextPlayerGoals === nextOpponentGoals;
      setMessage(`${opponentScored ? "Соперник забил." : "Соперник не забил."} ${suddenDeath ? "Ничья — дополнительный удар через 3 секунды…" : "Ваш следующий удар через 3 секунды…"}`);
      timers.current.push(window.setTimeout(() => {
        setTurn("player");
        setRoundKey((value) => value + 1);
        setMessage(suddenDeath ? "Дополнительный удар. Забейте!" : "Ваш удар!");
      }, NEXT_SHOT_DELAY));
    }, NEXT_SHOT_DELAY));
  }, []);

  return {
    message, opponentAttempts, opponentGoals, playerAttempts, playerGoals,
    recordPlayerShot, roundKey, turn,
  };
}
