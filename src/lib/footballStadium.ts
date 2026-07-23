import * as THREE from "three";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH, FIELD_LENGTH, FIELD_WIDTH, GOAL_Z } from "./footballField";
import { addFootballPitch } from "./footballPitch";

const createNumber = (value: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const drawing = canvas.getContext("2d");
  if (drawing) {
    drawing.fillStyle = "#ffffff";
    drawing.font = "bold 92px Arial";
    drawing.textAlign = "center";
    drawing.fillText(value, 64, 94);
  }
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
    }),
  );
  sprite.position.set(0, 1.45, 0.6);
  sprite.scale.set(0.82, 0.82, 1);
  return sprite;
};

export const createFootballer = (
  kind: "star" | "defender" | "keeper",
  number?: string,
) => {
  const player = new THREE.Group();
  const colors =
    kind === "star"
      ? ["#f4d33b", "#168b64"]
      : kind === "keeper"
        ? ["#f2b632", "#1d2532"]
        : ["#e9ece8", "#304070"];
  const shirt = new THREE.MeshStandardMaterial({
    color: colors[0],
    roughness: 0.7,
  });
  const stripe = new THREE.MeshStandardMaterial({
    color: colors[1],
    roughness: 0.7,
  });
  const skin = new THREE.MeshStandardMaterial({
    color: kind === "star" ? "#a65f42" : "#8c543d",
  });
  const shorts = new THREE.MeshStandardMaterial({ color: kind === "star" ? "#244fa4" : "#10172e" });
  const boot = new THREE.MeshStandardMaterial({ color: "#111218" });
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.43, 0.78, 5, 10),
    shirt,
  );
  body.position.y = 1.35;
  const chestStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.9, 0.9),
    stripe,
  );
  chestStripe.position.set(0, 1.35, -0.42);
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.82, 0.08),
    stripe,
  );
  backPanel.position.set(0, 1.35, 0.43);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 16), skin);
  head.position.y = 2.25;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: kind === "star" ? "#d8d2bc" : "#161515" }),
  );
  hair.position.y = 2.39;
  player.add(body, chestStripe, backPanel, head, hair);
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.56, 4, 8),
      skin,
    );
    arm.position.set(side * 0.53, 1.43, 0);
    arm.rotation.z = side * -0.18;
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.68, 4, 8),
      shorts,
    );
    leg.position.set(side * 0.22, 0.48, 0);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.44), boot);
    shoe.position.set(side * 0.22, 0.12, -0.1);
    player.add(arm, leg, shoe);
  });
  if (number) {
    player.add(createNumber(number));
  }
  player.traverse((item) => {
    if (item instanceof THREE.Mesh) {
      item.castShadow = true;
      item.receiveShadow = true;
    }
  });
  return player;
};

const addGoal = (scene: THREE.Scene, z: number, facesNorth = true) => {
  const material = new THREE.MeshStandardMaterial({ color: "#f5f4e9" });
  [-5, 5].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.2), material);
    post.position.set(x, 2, z);
    scene.add(post);
  });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 0.2), material);
  bar.position.set(0, 3.95, z);
  scene.add(bar);
  const net = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 3.8, 10, 6),
    new THREE.MeshBasicMaterial({
      color: "#dbe9ec",
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    }),
  );
  net.position.set(0, 1.4, z + (facesNorth ? -0.25 : 0.25));
  if (!facesNorth) net.rotation.y = Math.PI;
  scene.add(net);
};

export const addDayStadium = (scene: THREE.Scene) => {
  scene.background = new THREE.Color("#78bde7");
  scene.fog = new THREE.Fog("#b9dded", 48, 92);
  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(FIELD_WIDTH, 0.25, FIELD_LENGTH),
    new THREE.MeshStandardMaterial({ color: "#278a50", roughness: 1 }),
  );
  grass.receiveShadow = true;
  scene.add(grass);
  addFootballPitch(scene);
  scene.add(new THREE.HemisphereLight("#e7f6ff", "#28613e", 1.8));
  scene.add(new THREE.AmbientLight("#ffffff", 1.25));
  const sunlight = new THREE.DirectionalLight("#fff2cf", 3.4);
  sunlight.position.set(-12, 22, 10);
  scene.add(sunlight);
  addGoal(scene, GOAL_Z);
  addGoal(scene, -GOAL_Z, false);
  const standMaterial = new THREE.MeshStandardMaterial({
    color: "#142337",
    roughness: 0.9,
  });
  for (let part = 0; part < 8; part += 1) {
    const angle = Math.PI * .15 + (part / 7) * Math.PI * .5;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 8), standMaterial);
    stand.position.set(Math.cos(angle) * 52, 3.2, -Math.abs(Math.sin(angle) * 52) - 8);
    stand.rotation.y = -angle;
    scene.add(stand);
  }
  const fanColors = ["#db3f4f", "#f1c04b", "#e7ecee", "#4e86c7"];
  for (let row = 0; row < 8; row += 1)
    for (let column = 0; column < 20; column += 1)
      [-1, 1].forEach((side) => {
        if (column > 15) return;
        const fan = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.55, 0.35),
          new THREE.MeshStandardMaterial({
            color: fanColors[(row + column) % fanColors.length],
          }),
        );
        fan.position.set(
          side * (FIELD_HALF_WIDTH + 1 + row * 0.65),
          1 + row * 0.72,
          -FIELD_HALF_LENGTH - 1 + column * .9,
        );
        fan.userData.fanBaseY = fan.position.y;
        fan.userData.fanPhase = (row * 7 + column * 3 + side) * .45;
        scene.add(fan);
      });
  const sideFanShape = new THREE.BoxGeometry(0.34, 0.52, 0.34);
  fanColors.forEach((color, colorIndex) => {
    const positions: THREE.Matrix4[] = [];
    for (let row = 0; row < 7; row += 1)
      for (let column = 0; column < 60; column += 1)
        [-1, 1].forEach((side) => {
          if ((row + column) % fanColors.length !== colorIndex) return;
          positions.push(new THREE.Matrix4().makeTranslation(
            side * (FIELD_HALF_WIDTH + 1.2 + row * 0.62),
            0.9 + row * 0.7,
            -FIELD_HALF_LENGTH + 2 + column * 1.28,
          ));
        });
    const sideFans = new THREE.InstancedMesh(
      sideFanShape,
      new THREE.MeshStandardMaterial({ color }),
      positions.length,
    );
    positions.forEach((matrix, index) => sideFans.setMatrixAt(index, matrix));
    sideFans.instanceMatrix.needsUpdate = true;
    scene.add(sideFans);
  });
  [
    [-24.5, -37],
    [24.5, -37],
    [-24.5, 37],
    [24.5, 37],
  ].forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 11),
      new THREE.MeshStandardMaterial({ color: "#52606f" }),
    );
    pole.position.set(x, 5.5, z);
    const lamp = new THREE.PointLight("#fff4d6", 25, 46, 2);
    lamp.position.set(x, 10.5, z);
    scene.add(pole, lamp);
    const spotlight = new THREE.SpotLight("#fff6df", 180, 55, Math.PI / 6, 0.45, 1.5);
    spotlight.position.copy(lamp.position);
    spotlight.target.position.set(0, 0, 0);
    scene.add(spotlight, spotlight.target);
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.3),
      new THREE.MeshBasicMaterial({ color: "#f5f0ce" }),
    );
    glow.position.copy(lamp.position);
    scene.add(glow);
  });
};
