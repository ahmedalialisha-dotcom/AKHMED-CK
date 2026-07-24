import * as THREE from "three";

export type HairStyle = "short" | "curls" | "mohawk" | "buzz";

export const HAIR_STYLES: Array<{ value: HairStyle; label: string; icon: string }> = [
  { value: "short", label: "Короткая", icon: "◒" },
  { value: "curls", label: "Кудри", icon: "✺" },
  { value: "mohawk", label: "Ирокез", icon: "▲" },
  { value: "buzz", label: "Ёжик", icon: "◆" },
];

const playerHairColor = (seed: number) => {
  if (seed % 5 !== 0) return "#191515";
  return ["#e2c06d", "#b94b32", "#5a8fd8"][Math.floor(seed / 5) % 3];
};

export function createHair(style: HairStyle, seed: number, selectedColor?: string) {
  const hair = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: selectedColor ?? playerHairColor(seed), roughness: .82 });
  if (style === "curls") {
    const points = [[0, 0], [-.2, 0], [.2, 0], [-.12, -.16], [.12, -.16], [-.12, .16], [.12, .16]];
    points.forEach(([x, z]) => {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 7), material);
      curl.position.set(x, 2.5, z);
      hair.add(curl);
    });
  } else if (style === "mohawk") {
    [-.2, 0, .2].forEach((z) => {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(.13, .48, 7), material);
      spike.position.set(0, 2.68, z);
      hair.add(spike);
    });
  } else {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(style === "buzz" ? .305 : .325, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      material,
    );
    cap.position.y = style === "buzz" ? 2.38 : 2.4;
    hair.add(cap);
  }
  return hair;
}

export const hairForPlayer = (seed: number): HairStyle =>
  HAIR_STYLES[Math.abs(seed) % HAIR_STYLES.length].value;
