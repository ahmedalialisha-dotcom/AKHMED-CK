import * as THREE from "three";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH } from "./footballField";

const colors = ["#db3f4f", "#f1c04b", "#e7ecee", "#4e86c7"];

export function addEndCrowds(scene: THREE.Scene) {
  const fanShape = new THREE.BoxGeometry(0.34, 0.52, 0.34);
  colors.forEach((color, colorIndex) => {
    const positions: THREE.Matrix4[] = [];
    for (let row = 0; row < 9; row += 1)
      for (let column = 0; column < 44; column += 1)
        [-1, 1].forEach((end) => {
          if ((row + column) % colors.length !== colorIndex) return;
          positions.push(new THREE.Matrix4().makeTranslation(
            -FIELD_HALF_WIDTH + 1 + column * ((FIELD_HALF_WIDTH * 2 - 2) / 43),
            0.9 + row * 0.68,
            end * (FIELD_HALF_LENGTH + 1.4 + row * 0.6),
          ));
        });
    const fans = new THREE.InstancedMesh(
      fanShape,
      new THREE.MeshStandardMaterial({ color }),
      positions.length,
    );
    positions.forEach((matrix, index) => fans.setMatrixAt(index, matrix));
    fans.instanceMatrix.needsUpdate = true;
    scene.add(fans);
  });
}
