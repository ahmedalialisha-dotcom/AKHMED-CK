import type { CSSProperties } from "react";

const positions = [
  [50, 91],
  [18, 75], [39, 76], [61, 76], [82, 75],
  [25, 56], [50, 58], [75, 56],
  [35, 36], [65, 36],
  [50, 15],
];
const shirtNumbers = ["1", "2", "3", "4", "5", "6", "8", "10", "7", "9", "11"];

type Props = {
  teamName?: string;
  opponent?: boolean;
};

export default function FormationPreview({ teamName = "FOOTBALL 3D", opponent = false }: Props) {
  return (
    <div className={opponent ? "formation-card formation-card--opponent" : "formation-card"}>
      <div className="formation-card__heading">
        <span>{opponent ? "СОПЕРНИК" : "ВАША КОМАНДА"}</span>
        <strong>4–3–2–1</strong>
      </div>
      <h3>{teamName}</h3>
      <div className="formation-preview" aria-label="Схема команды 4-3-2-1">
      {positions.map(([left, top], index) => (
        <span
          className={index === 0 ? "formation-preview__keeper" : index === 10 ? "formation-preview__captain" : ""}
          key={`${left}-${top}`}
          style={{ left: `${left}%`, top: `${top}%`, "--player-delay": `${0.75 + index * 0.08}s` } as CSSProperties}
        >
          {shirtNumbers[index]}
        </span>
      ))}
      </div>
      <small>{opponent ? "СОСТАВ СОПЕРНИКА" : "КАПИТАН · №11"}</small>
    </div>
  );
}
