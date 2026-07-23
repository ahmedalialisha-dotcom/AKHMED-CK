import type { CSSProperties } from "react";

const positions = [
  [50, 91],
  [18, 75], [39, 76], [61, 76], [82, 75],
  [25, 56], [50, 58], [75, 56],
  [35, 36], [65, 36],
  [50, 15],
];

export default function FormationPreview() {
  return (
    <div className="formation-card">
      <div className="formation-card__heading">
        <span>СТАРТОВЫЙ СОСТАВ</span>
        <strong>4–3–2–1</strong>
      </div>
      <div className="formation-preview" aria-label="Схема команды 4-3-2-1">
      {positions.map(([left, top], index) => (
        <span
          className={index === 0 ? "formation-preview__keeper" : index === 10 ? "formation-preview__captain" : ""}
          key={`${left}-${top}`}
          style={{ left: `${left}%`, top: `${top}%`, "--player-delay": `${0.75 + index * 0.08}s` } as CSSProperties}
        >
          {index === 10 ? "11" : index === 0 ? "В" : ""}
        </span>
      ))}
      </div>
      <small>КАПИТАН · №11</small>
    </div>
  );
}
