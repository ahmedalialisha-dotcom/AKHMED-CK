import * as THREE from "three";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH, HOME_GOAL_Z, OPPONENT_FORMATION, TEAM_FORMATION } from "./footballField";

export function moveToPosition(
  player: THREE.Group,
  target: THREE.Vector3,
  speed: number,
  delta: number,
) {
  const movement = target.clone().sub(player.position).setY(0);
  if (movement.length() < 0.18) return;
  player.position.addScaledVector(movement.normalize(), speed * delta);
  player.lookAt(target.x, player.position.y, target.z);
}

export function teamAttackPosition(index: number, carrier: THREE.Group) {
  const base = TEAM_FORMATION[Math.max(0, index - 1)] ?? [0, 7];
  const isDefender = index >= 1 && index <= 4;
  const teamShift = THREE.MathUtils.clamp((carrier.position.z - 12) * 0.48, -24, 8);
  const targetZ = THREE.MathUtils.clamp(base[1] + teamShift, -FIELD_HALF_LENGTH + 4, FIELD_HALF_LENGTH - 3);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(base[0] + carrier.position.x * 0.22, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    isDefender ? Math.max(1, targetZ) : targetZ,
  );
}

export function teamDefensePosition(index: number, ballX: number, ballZ = 0) {
  const lane = (index % 5 - 2) * 7;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + ballX * 0.12, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    THREE.MathUtils.clamp(22 + row * 9 + ballZ * 0.16, 10, FIELD_HALF_LENGTH - 8),
  );
}

export function opponentAttackPosition(index: number, carrier: THREE.Group) {
  const base = OPPONENT_FORMATION[index] ?? [0, -6];
  const teamShift = THREE.MathUtils.clamp((carrier.position.z + 8) * 0.46, -7, 25);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(base[0] + carrier.position.x * 0.22, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    Math.min(HOME_GOAL_Z - 4, base[1] + teamShift),
  );
}

export function opponentDefensePosition(index: number, ballX: number) {
  const lane = (index % 5 - 2) * 7;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + ballX * 0.12, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    -7 - row * 10,
  );
}

export function coverPosition(target: THREE.Vector3, ownGoalZ: number) {
  const towardGoal = Math.sign(ownGoalZ - target.z);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(target.x * 0.72, -FIELD_HALF_WIDTH + 3, FIELD_HALF_WIDTH - 3),
    0.1,
    target.z + towardGoal * 5.5,
  );
}
