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
  const lane = (index % 5 - 2) * 7.5;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + carrier.position.x * 0.28, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    THREE.MathUtils.clamp(carrier.position.z - 6 + row * 8, -FIELD_HALF_LENGTH + 4, FIELD_HALF_LENGTH - 3),
  );
}

export function teamDefensePosition(index: number, ballX: number) {
  const lane = (index % 5 - 2) * 7;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + ballX * 0.18, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    25 + row * 8,
  );
}

export function opponentAttackPosition(index: number, carrier: THREE.Group) {
  const lane = (index % 5 - 2) * 7.5;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + carrier.position.x * 0.28, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    Math.min(HOME_GOAL_Z - 4, carrier.position.z + 6 - row * 8),
  );
}

export function opponentDefensePosition(index: number, ballX: number) {
  const lane = (index % 5 - 2) * 7;
  const row = Math.floor(index / 5);
  return new THREE.Vector3(
    THREE.MathUtils.clamp(lane + ballX * 0.18, -FIELD_HALF_WIDTH + 2, FIELD_HALF_WIDTH - 2),
    0.1,
    -7 - row * 10,
  );
}
