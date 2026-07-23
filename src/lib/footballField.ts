export const FIELD_WIDTH = 44;
export const FIELD_LENGTH = 80;
export const FIELD_HALF_WIDTH = FIELD_WIDTH / 2;
export const FIELD_HALF_LENGTH = FIELD_LENGTH / 2;
export const GOAL_Z = -39.6;
export const KEEPER_Z = GOAL_Z + 1.1;
export const HOME_GOAL_Z = -GOAL_Z;
export const HOME_KEEPER_Z = -KEEPER_Z;
export const PLAYER_START_Z = 12;
export const PENALTY_START_Z = -24;

export const TEAM_FORMATION: Array<[number, number]> = [
  [-14, 30], [-5, 32], [5, 32], [14, 30],
  [-12, 19], [0, 22], [12, 19],
  [-8, 7], [8, 7],
];

export const OPPONENT_FORMATION: Array<[number, number]> = [
  [-14, -28], [-5, -30], [5, -30], [14, -28],
  [-12, -17], [0, -20], [12, -17],
  [-9, -6], [0, -9], [9, -6],
];
