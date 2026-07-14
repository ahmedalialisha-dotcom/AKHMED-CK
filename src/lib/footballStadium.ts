import * as THREE from "three";

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
  sprite.position.set(0, 1.45, 0.52);
  sprite.scale.set(0.65, 0.65, 1);
  return sprite;
};

export const createFootballer = (
  kind: "star" | "defender" | "keeper",
  number?: string,
) => {
  const player = new THREE.Group();
  const colors =
    kind === "star"
      ? ["#101d48", "#d62845"]
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
  const shorts = new THREE.MeshStandardMaterial({ color: "#10172e" });
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
  chestStripe.position.set(0, 1.35, 0.42);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 16), skin);
  head.position.y = 2.25;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#161515" }),
  );
  hair.position.y = 2.39;
  player.add(body, chestStripe, head, hair);
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
  if (number) player.add(createNumber(number));
  player.traverse((item) => {
    if (item instanceof THREE.Mesh) {
      item.castShadow = true;
      item.receiveShadow = true;
    }
  });
  return player;
};

const addGoal = (scene: THREE.Scene) => {
  const material = new THREE.MeshStandardMaterial({ color: "#f5f4e9" });
  [-5, 5].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.2), material);
    post.position.set(x, 2, -20.6);
    scene.add(post);
  });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 0.2), material);
  bar.position.set(0, 3.95, -20.6);
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
  net.position.set(0, 1.4, -20.85);
  scene.add(net);
};

export const addEveningStadium = (scene: THREE.Scene) => {
  scene.background = new THREE.Color("#071221");
  scene.fog = new THREE.Fog("#071221", 30, 62);
  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.25, 42),
    new THREE.MeshStandardMaterial({ color: "#17613f", roughness: 1 }),
  );
  grass.receiveShadow = true;
  scene.add(grass);
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-11.7, 0.14, -20.7),
      new THREE.Vector3(11.7, 0.14, -20.7),
      new THREE.Vector3(11.7, 0.14, 20.7),
      new THREE.Vector3(-11.7, 0.14, 20.7),
    ]),
    new THREE.LineBasicMaterial({ color: "#dbe9d9" }),
  );
  scene.add(line);
  const circle = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 32 }, (_, index) => {
        const angle = (index / 32) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * 3.2,
          0.15,
          Math.sin(angle) * 3.2,
        );
      }),
    ),
    new THREE.LineBasicMaterial({ color: "#dbe9d9" }),
  );
  scene.add(circle, new THREE.HemisphereLight("#7ba5cf", "#0c1f18", 1.4));
  scene.add(new THREE.AmbientLight("#8eb7df", 1.1));
  const moonlight = new THREE.DirectionalLight("#c6e1ff", 2.2);
  moonlight.position.set(0, 18, 4);
  scene.add(moonlight);
  addGoal(scene);
  const standMaterial = new THREE.MeshStandardMaterial({
    color: "#142337",
    roughness: 0.9,
  });
  for (let part = 0; part < 8; part += 1) {
    const angle = Math.PI * .15 + (part / 7) * Math.PI * .5;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 8), standMaterial);
    stand.position.set(Math.cos(angle) * 27, 3.2, Math.sin(angle) * 27 - 4);
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
          side * (12 + row * 0.65),
          1 + row * 0.72,
          -22 + column * 1.6,
        );
        fan.userData.fanBaseY = fan.position.y;
        fan.userData.fanPhase = (row * 7 + column * 3 + side) * .45;
        scene.add(fan);
      });
  [
    [-14, -19],
    [14, -19],
    [-14, 19],
    [14, 19],
  ].forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 11),
      new THREE.MeshStandardMaterial({ color: "#52606f" }),
    );
    pole.position.set(x, 5.5, z);
    const lamp = new THREE.PointLight("#dcefff", 85, 38, 2);
    lamp.position.set(x, 10.5, z);
    scene.add(pole, lamp);
    const spotlight = new THREE.SpotLight("#e8f4ff", 850, 45, Math.PI / 6, 0.45, 1.5);
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
