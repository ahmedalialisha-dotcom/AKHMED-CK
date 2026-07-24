export type CareerStats = {
  overall: number;
  speed: number;
  technique: number;
  stamina: number;
};

const clampStat = (value: number) => Math.round(Math.min(95, Math.max(62, value)));

export function getCareerStats(age: number): CareerStats {
  const experience = Math.min(12, Math.max(0, age - 16));
  const decline = Math.max(0, age - 30);
  const speed = clampStat(83 + Math.min(8, experience) - decline * 2.1);
  const technique = clampStat(72 + experience * 1.55 - decline * 0.8);
  const stamina = clampStat(84 + Math.min(6, experience) - Math.max(0, age - 28) * 1.7);
  return {
    speed,
    technique,
    stamina,
    overall: Math.round((speed + technique + stamina) / 3),
  };
}
