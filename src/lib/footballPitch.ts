import * as THREE from "three";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH, FIELD_LENGTH, FIELD_WIDTH } from "./footballField";

const lineMaterial = new THREE.LineBasicMaterial({ color: "#eef8ed" });

const rectangle = (left: number, right: number, near: number, far: number) =>
  new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(left, 0.17, near),
      new THREE.Vector3(right, 0.17, near),
      new THREE.Vector3(right, 0.17, far),
      new THREE.Vector3(left, 0.17, far),
    ]),
    lineMaterial,
  );

const addSpot = (scene: THREE.Scene, z: number) => {
  const spot = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 16),
    new THREE.MeshBasicMaterial({ color: "#eef8ed" }),
  );
  spot.rotation.x = -Math.PI / 2;
  spot.position.set(0, 0.18, z);
  scene.add(spot);
};

export function addFootballPitch(scene: THREE.Scene) {
  const stripeLength = FIELD_LENGTH / 10;
  for (let index = 0; index < 10; index += 1) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_WIDTH, stripeLength),
      new THREE.MeshStandardMaterial({
        color: index % 2 ? "#237e48" : "#2b9052",
        roughness: 1,
      }),
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.14, -FIELD_HALF_LENGTH + stripeLength * (index + 0.5));
    stripe.receiveShadow = true;
    scene.add(stripe);
  }

  scene.add(rectangle(
    -FIELD_HALF_WIDTH + 0.3, FIELD_HALF_WIDTH - 0.3,
    -FIELD_HALF_LENGTH + 0.3, FIELD_HALF_LENGTH - 0.3,
  ));
  const halfway = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-FIELD_HALF_WIDTH + 0.3, 0.17, 0),
      new THREE.Vector3(FIELD_HALF_WIDTH - 0.3, 0.17, 0),
    ]),
    lineMaterial,
  );
  const centerCircle = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 40 }, (_, index) => {
      const angle = index / 40 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 3.2, 0.17, Math.sin(angle) * 3.2);
    })),
    lineMaterial,
  );
  scene.add(halfway, centerCircle);
  [-1, 1].forEach((side) => {
    const goalLine = side * (FIELD_HALF_LENGTH - 0.3);
    scene.add(
      rectangle(-8, 8, goalLine, goalLine - side * 7),
      rectangle(-4.5, 4.5, goalLine, goalLine - side * 3),
    );
    addSpot(scene, goalLine - side * 5.8);
  });
  addSpot(scene, 0);
}
