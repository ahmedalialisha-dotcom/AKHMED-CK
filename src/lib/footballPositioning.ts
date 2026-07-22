import * as THREE from "three";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH, HOME_GOAL_Z } from "./footballField";

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
  const side = index % 2 ? 1 : -1;
  return new THREE.Vector3(
    THREE.MathUtils.clamp(carrier.position.x + side * 7, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    THREE.MathUtils.clamp(carrier.position.z - 5 - index * 1.5, -FIELD_HALF_LENGTH + 4, FIELD_HALF_LENGTH - 3),
  );
}

export function teamDefensePosition(index: number, ballX: number) {
  const side = index % 2 ? 1 : -1;
  return new THREE.Vector3(
    THREE.MathUtils.clamp(side * 5.5 + ballX * 0.22, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    12 + index * 4,
  );
}

export function opponentAttackPosition(index: number, carrier: THREE.Group) {
  const side = index % 2 ? 1 : -1;
  return new THREE.Vector3(
    THREE.MathUtils.clamp(carrier.position.x + side * 5.5, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    Math.min(HOME_GOAL_Z - 4, carrier.position.z + (index % 2 ? 3.5 : -1.5)),
  );
}

export function opponentDefensePosition(index: number, ballX: number) {
  const formation = [[-6, -4], [5, -9], [-2, -14]][index];
  return new THREE.Vector3(
    THREE.MathUtils.clamp(formation[0] + ballX * 0.2, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    formation[1],
  );
}
