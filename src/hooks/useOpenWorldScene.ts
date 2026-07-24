import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createFootballer } from "../lib/footballStadium";
import type { HairStyle } from "../lib/footballHair";

type Position = { x: number; z: number; heading: number };
const shopSigns = [
  ["🍔 GOAL CAFÉ", -18, -11], ["📱 F3 TECH", 18, -11], ["👕 STYLE 11", 18, 11],
  ["⚽ PRO SPORT", -18, 11], ["✂ BARBER CUT", 0, -18], ["🚗 F3 MOTORS", 19, 0],
] as const;

const createSign = (text: string) => {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 100;
  const context = canvas.getContext("2d");
  if (context) { context.fillStyle = "#102c24"; context.roundRect(0, 0, 512, 100, 18); context.fill(); context.fillStyle = "#f4d36b"; context.font = "bold 38px Arial"; context.textAlign = "center"; context.fillText(text, 256, 64); }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
  sprite.scale.set(6.6, 1.3, 1); return sprite;
};

const addAccessories = (player: THREE.Group, equipped: string[]) => {
  const dark = new THREE.MeshStandardMaterial({ color: "#171b20" });
  if (equipped.includes("headphones")) { const item = new THREE.Mesh(new THREE.TorusGeometry(.38, .07, 8, 18, Math.PI), dark); item.position.set(0, 2.34, 0); item.rotation.z = Math.PI / 2; player.add(item); }
  if (equipped.includes("glasses")) [-.15, .15].forEach((x) => { const item = new THREE.Mesh(new THREE.TorusGeometry(.12, .025, 6, 14), dark); item.position.set(x, 2.25, -.28); item.rotation.x = Math.PI / 2; player.add(item); });
  if (equipped.includes("backpack")) { const item = new THREE.Mesh(new THREE.BoxGeometry(.7, .85, .28), new THREE.MeshStandardMaterial({ color: "#b26a35" })); item.position.set(0, 1.35, .5); player.add(item); }
  if (equipped.includes("phone")) { const item = new THREE.Mesh(new THREE.BoxGeometry(.18, .35, .05), dark); item.position.set(.62, 1.25, -.25); player.add(item); }
  if (equipped.includes("cap")) { const item = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .14, 16), new THREE.MeshStandardMaterial({ color: "#d8a938" })); item.position.set(0, 2.58, 0); player.add(item); }
};

const createCar = (color: string) => {
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, .9, 1.8), new THREE.MeshStandardMaterial({ color, metalness: .55, roughness: .28 }));
  body.position.y = .75;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, .65, 1.55), new THREE.MeshStandardMaterial({ color: "#b9dbe6", metalness: .2 }));
  cabin.position.set(0, 1.45, .05); car.add(body, cabin); return car;
};

export function useOpenWorldScene(mountRef: React.RefObject<HTMLDivElement>, position: Position, hairStyle: HairStyle, equipped: string[], cutting: boolean, driving: boolean) {
  const positionRef = useRef(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color("#9ed8f0"); scene.fog = new THREE.Fog("#bfe2ef", 45, 100);
    const camera = new THREE.PerspectiveCamera(58, 1, .1, 170);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; mount.appendChild(renderer.domElement);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshStandardMaterial({ color: "#72aa62" })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: "#4d5655" });
    [-48, -24, 0, 24, 48].forEach((offset) => {
      const horizontal = new THREE.Mesh(new THREE.PlaneGeometry(130, 7), roadMaterial); horizontal.rotation.x = -Math.PI / 2; horizontal.position.set(0, .02, offset);
      const vertical = new THREE.Mesh(new THREE.PlaneGeometry(7, 130), roadMaterial); vertical.rotation.x = -Math.PI / 2; vertical.position.set(offset, .021, 0); scene.add(horizontal, vertical);
    });
    const colors = ["#d79658", "#6aa5c8", "#d88a9b", "#d6bd5c", "#8c78bd"];
    for (let x = -48; x <= 48; x += 24) for (let z = -48; z <= 48; z += 24) {
      if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
      const height = 5 + (Math.abs(x + z) % 9);
      const house = new THREE.Mesh(new THREE.BoxGeometry(13, height, 13), new THREE.MeshStandardMaterial({ color: colors[(Math.abs(x / 24) + Math.abs(z / 24)) % colors.length], roughness: .8 }));
      house.position.set(x + 10, height / 2, z + 10); house.castShadow = true; scene.add(house);
    }
    shopSigns.forEach(([name, x, z]) => { const sign = createSign(name); sign.position.set(x, 5.5, z); scene.add(sign); });
    const displayCars = [createCar("#dc2929"), createCar("#2468c9")]; displayCars[0].position.set(18, 0, -3); displayCars[1].position.set(18, 0, 3); scene.add(...displayCars);
    const playerCar = createCar("#d8a938"); playerCar.visible = driving; scene.add(playerCar);
    const scissors = new THREE.Group();
    [-.15, .15].forEach((rotation) => { const blade = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1.1), new THREE.MeshStandardMaterial({ color: "#e7ecec", metalness: .8 })); blade.rotation.y = rotation; scissors.add(blade); });
    scissors.position.set(0, 2.8, -20); scissors.visible = cutting; scene.add(scissors);
    const player = createFootballer("star", "11", ["#193c31", "#d8a938"], hairStyle); addAccessories(player, equipped); player.visible = !driving; scene.add(player);
    const npcs = Array.from({ length: 7 }, (_, index) => { const npc = createFootballer(index % 2 ? "star" : "defender", String(index + 2), index % 2 ? ["#d96945", "#eee8d7"] : ["#5084bb", "#202d47"]); scene.add(npc); return npc; });
    scene.add(new THREE.HemisphereLight("#ffffff", "#315f39", 2.2)); const sun = new THREE.DirectionalLight("#fff4d5", 3); sun.position.set(-15, 28, 12); sun.castShadow = true; scene.add(sun);
    let animation = 0;
    const render = () => {
      const target = positionRef.current; const actor = driving ? playerCar : player;
      if (Math.abs(actor.position.x - target.x) > 60) actor.position.x = target.x;
      if (Math.abs(actor.position.z - target.z) > 60) actor.position.z = target.z;
      actor.position.x = THREE.MathUtils.lerp(actor.position.x, target.x, .16); actor.position.z = THREE.MathUtils.lerp(actor.position.z, target.z, .16); actor.rotation.y = target.heading;
      player.visible = !driving; playerCar.visible = driving;
      const time = performance.now() / 1000;
      npcs.forEach((npc, index) => { const lane = (index - 3) * 7; npc.position.set(Math.sin(time * (.25 + index * .025)) * 48, .1, lane); npc.rotation.y = Math.cos(time * (.25 + index * .025)) > 0 ? Math.PI / 2 : -Math.PI / 2; });
      if (cutting) scissors.rotation.y += .16;
      const cameraTarget = new THREE.Vector3(actor.position.x - Math.sin(target.heading) * 9, driving ? 6 : 5, actor.position.z + Math.cos(target.heading) * 11);
      camera.position.lerp(cameraTarget, .1); camera.lookAt(actor.position.x, 1, actor.position.z); renderer.render(scene, camera); animation = requestAnimationFrame(render);
    };
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize(); render();
    return () => { cancelAnimationFrame(animation); observer.disconnect(); renderer.dispose(); renderer.domElement.remove(); };
  }, [cutting, driving, equipped, hairStyle, mountRef]);
}
