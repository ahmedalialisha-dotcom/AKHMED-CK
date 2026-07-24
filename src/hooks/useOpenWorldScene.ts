import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createFootballer } from "../lib/footballStadium";
import type { HairStyle } from "../lib/footballHair";

type Position = { x: number; z: number };

const building = (scene: THREE.Scene, x: number, z: number, color: string, height: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(7, height, 6), new THREE.MeshStandardMaterial({ color, roughness: .8 }));
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  scene.add(mesh);
};

const addAccessories = (player: THREE.Group, equipped: string[]) => {
  const dark = new THREE.MeshStandardMaterial({ color: "#171b20" });
  if (equipped.includes("headphones")) {
    const headphones = new THREE.Mesh(new THREE.TorusGeometry(.38, .07, 8, 18, Math.PI), dark);
    headphones.position.set(0, 2.34, 0);
    headphones.rotation.z = Math.PI / 2;
    player.add(headphones);
  }
  if (equipped.includes("glasses")) {
    [-.15, .15].forEach((x) => { const lens = new THREE.Mesh(new THREE.TorusGeometry(.12, .025, 6, 14), dark); lens.position.set(x, 2.25, -.28); lens.rotation.x = Math.PI / 2; player.add(lens); });
  }
  if (equipped.includes("backpack")) {
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(.7, .85, .28), new THREE.MeshStandardMaterial({ color: "#b26a35" }));
    backpack.position.set(0, 1.35, .5); player.add(backpack);
  }
  if (equipped.includes("phone")) {
    const phone = new THREE.Mesh(new THREE.BoxGeometry(.18, .35, .05), dark);
    phone.position.set(.62, 1.25, -.25); player.add(phone);
  }
  if (equipped.includes("cap")) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .14, 16), new THREE.MeshStandardMaterial({ color: "#d8a938" }));
    cap.position.set(0, 2.58, 0); player.add(cap);
  }
};

export function useOpenWorldScene(
  mountRef: React.RefObject<HTMLDivElement>,
  position: Position,
  hairStyle: HairStyle,
  equipped: string[],
  cutting: boolean,
) {
  const positionRef = useRef(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#9ed8f0");
    scene.fog = new THREE.Fog("#bfe2ef", 38, 72);
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 120);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(52, 52), new THREE.MeshStandardMaterial({ color: "#72aa62" }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: "#4d5655" });
    const roadA = new THREE.Mesh(new THREE.PlaneGeometry(52, 7), roadMaterial);
    const roadB = new THREE.Mesh(new THREE.PlaneGeometry(7, 52), roadMaterial);
    [roadA, roadB].forEach((road) => { road.rotation.x = -Math.PI / 2; road.position.y = .02; scene.add(road); });
    building(scene, -15, -15, "#d79658", 6); building(scene, 15, -15, "#6aa5c8", 8);
    building(scene, 15, 15, "#d88a9b", 7); building(scene, -15, 15, "#d6bd5c", 6);
    building(scene, 0, -19, "#966fc1", 5); building(scene, 19, 0, "#d54d42", 7);
    const carMaterial = new THREE.MeshStandardMaterial({ color: "#e12727", metalness: .55, roughness: .3 });
    [-2.2, 2.2].forEach((offset) => { const car = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 1.8), carMaterial); car.position.set(16 + offset / 3, .65, offset); car.castShadow = true; scene.add(car); });
    const scissors = new THREE.Group();
    [-.15, .15].forEach((rotation) => { const blade = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1.1), new THREE.MeshStandardMaterial({ color: "#e7ecec", metalness: .8 })); blade.rotation.y = rotation; scissors.add(blade); });
    scissors.position.set(0, 2.8, -16.5); scissors.visible = cutting; scene.add(scissors);
    const player = createFootballer("star", "11", ["#193c31", "#d8a938"], hairStyle);
    addAccessories(player, equipped);
    player.position.set(position.x, .1, position.z); scene.add(player);
    scene.add(new THREE.HemisphereLight("#ffffff", "#315f39", 2.2));
    const sun = new THREE.DirectionalLight("#fff4d5", 3); sun.position.set(-12, 25, 8); sun.castShadow = true; scene.add(sun);
    let animation = 0;
    const render = () => {
      player.position.x = THREE.MathUtils.lerp(player.position.x, positionRef.current.x, .14);
      player.position.z = THREE.MathUtils.lerp(player.position.z, positionRef.current.z, .14);
      if (cutting) scissors.rotation.y += .16;
      camera.position.lerp(new THREE.Vector3(player.position.x + 10, 9, player.position.z + 12), .08);
      camera.lookAt(player.position.x, 1, player.position.z);
      renderer.render(scene, camera);
      animation = requestAnimationFrame(render);
    };
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize(); render();
    return () => { cancelAnimationFrame(animation); observer.disconnect(); renderer.dispose(); renderer.domElement.remove(); };
  }, [cutting, equipped, hairStyle, mountRef]);
}
