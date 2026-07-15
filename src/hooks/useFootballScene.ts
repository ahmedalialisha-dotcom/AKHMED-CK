import { useEffect } from "react";
import * as THREE from "three";
import { createGameSounds } from "../lib/footballAudio";
import { addEveningStadium, createFootballer } from "../lib/footballStadium";

type SceneEvents = {
  onGoal: () => void;
  onMiss: () => void;
  onTackle: () => void;
  onAttempt: (scored: boolean) => void;
  onStats: (power: number) => void;
  onStamina: (stamina: number) => void;
};

export function useFootballScene(
  mountRef: React.RefObject<HTMLDivElement>,
  events: SceneEvents,
  penalty = false,
  canShoot = true,
  resetKey = 0,
) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    addEveningStadium(scene);
    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    const player = createFootballer("star", "10");
    player.position.set(0, 0.1, penalty ? -3 : 14);
    scene.add(player);
    const teammates = [createFootballer("star", "7"), createFootballer("star", "11")];
    if (!penalty) {
      teammates[0].position.set(-7, 0.1, 7);
      teammates[1].position.set(7, 0.1, 0);
      scene.add(...teammates);
    }
    const goalkeeper = createFootballer("keeper");
    goalkeeper.position.set(0, 0.1, -19.5);
    scene.add(goalkeeper);
    const defenders = penalty ? [] : [-4, 4].map((x, index) => {
      const defender = createFootballer("defender", String(index + 4));
      defender.position.set(x, 0.1, 2 - index * 6);
      scene.add(defender);
      return defender;
    });
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 18, 14),
      new THREE.MeshStandardMaterial({
        color: "#fffdf4",
        emissive: "#26332b",
        emissiveIntensity: 0.35,
      }),
    );
    ball.castShadow = true;
    scene.add(ball);
    const ballVelocity = new THREE.Vector3();
    const sounds = createGameSounds();
    const keys = new Set<string>();
    let hasBall = true;
    let activePlayer = player;
    let passTarget: THREE.Group | undefined;
    let feintUntil = 0;
    let feintStyle = 0;
    let chargeStarted = 0;
    let finished = false;
    let goalHandled = false;
    let celebrationUntil = 0;
    let curvedShot = false;
    let stamina = 100;
    let statsTimer = 0;
    const reset = () => {
      player.position.set(0, 0.1, penalty ? -3 : 14);
      player.rotation.set(0, 0, 0);
      ballVelocity.set(0, 0, 0);
      hasBall = true;
      activePlayer = player;
      passTarget = undefined;
      chargeStarted = 0;
      feintStyle = 0;
      finished = false;
      goalHandled = false;
      celebrationUntil = 0;
      curvedShot = false;
      defenders.forEach((defender, index) =>
        defender.position.set(index ? 4 : -4, 0.1, 2 - index * 6),
      );
      if (!penalty) { teammates[0].position.set(-7, 0.1, 7); teammates[1].position.set(7, 0.1, 0); }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["Space", "KeyF", "KeyG", "KeyH", "KeyQ", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyR", "Digit1", "Digit2", "Digit3"].includes(event.code)
      )
        event.preventDefault();
      sounds.startCrowd();
      keys.add(event.code);
      if (event.code === "KeyR" && canShoot) reset();
      if (["Digit1", "Digit2", "Digit3"].includes(event.code) && hasBall) { feintStyle = Number(event.code.charAt(event.code.length - 1)); feintUntil = performance.now() + 460; }
      if (event.code === "KeyE" && hasBall) {
        const target = teammates.filter((teammate) => teammate !== activePlayer).sort((first, second) => first.position.distanceTo(activePlayer.position) - second.position.distanceTo(activePlayer.position))[0];
        if (target) { passTarget = target; hasBall = false; ballVelocity.copy(target.position.clone().sub(activePlayer.position).setY(0).normalize().multiplyScalar(0.55)); sounds.playKick(); }
      }
      if (["KeyF", "KeyG", "KeyH"].includes(event.code) && hasBall && !finished && canShoot) {
        const style = event.code;
        curvedShot = style === "KeyF";
        hasBall = false;
        const side = style === "KeyF" ? .38 : 0;
        const lift = style === "KeyG" ? .26 : style === "KeyH" ? .16 : .25;
        const speed = style === "KeyH" ? 1.75 : style === "KeyG" ? .82 : 1.12;
        ballVelocity.set(side, lift, -speed).applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        sounds.playKick();
      }
      if (event.code === "Space" && hasBall && !finished && !chargeStarted && canShoot) chargeStarted = performance.now();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
      if (event.code === "Space" && chargeStarted && hasBall && !finished && canShoot) {
        const power = THREE.MathUtils.clamp((performance.now() - chargeStarted) / 900, .2, 1);
        hasBall = false;
        ballVelocity.set(0, .07 + power * .28, -(.55 + power * 1.25)).applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        chargeStarted = 0; sounds.playKick();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const clock = new THREE.Clock();
    const forward = new THREE.Vector3();
    let animationId = 0;
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      scene.traverse((item) => {
        if (item.userData.fanBaseY !== undefined) {
          item.position.y = item.userData.fanBaseY + Math.max(0, Math.sin(performance.now() / 240 + item.userData.fanPhase)) * .22;
        }
      });
      if (!finished) {
        const sprinting = keys.has("KeyQ") && keys.has("KeyW") && stamina > 0;
        stamina = THREE.MathUtils.clamp(stamina + (sprinting ? -15 : 7) * delta, 0, 100);
        if (performance.now() - statsTimer > 80) { events.onStats(chargeStarted ? THREE.MathUtils.clamp((performance.now() - chargeStarted) / 9, 0, 100) : 0); events.onStamina(stamina); statsTimer = performance.now(); }
        if (keys.has("KeyA")) activePlayer.rotation.y += 2.5 * delta;
        if (keys.has("KeyD")) activePlayer.rotation.y -= 2.5 * delta;
        if (performance.now() < feintUntil && feintStyle === 1) activePlayer.rotation.y += Math.sin(performance.now() / 45) * 0.12;
        forward
          .set(0, 0, -1)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        if (!penalty && keys.has("KeyW"))
          activePlayer.position.addScaledVector(forward, (sprinting ? 8.4 : 5.6) * delta);
        if (!penalty && keys.has("KeyS"))
          activePlayer.position.addScaledVector(forward, -3.8 * delta);
        activePlayer.position.x = THREE.MathUtils.clamp(activePlayer.position.x, -10, 10);
        activePlayer.position.z = THREE.MathUtils.clamp(activePlayer.position.z, -19, 19);
        if (hasBall) {
          const baseFoot = keys.has("KeyA") ? -0.27 : keys.has("KeyD") ? 0.27 : Math.sin(performance.now() / 110) * 0.16;
          const feintOffset = performance.now() < feintUntil && feintStyle === 2 ? Math.sin(performance.now() / 35) * .55 : 0;
          if (performance.now() < feintUntil && feintStyle === 3) activePlayer.position.addScaledVector(forward, -.9 * delta);
          const footOffset = baseFoot + feintOffset;
          ball.position
            .copy(activePlayer.position)
            .addScaledVector(forward, 0.9)
            .add(new THREE.Vector3(footOffset, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y))
            .setY(0.35);
        }
        else {
          ball.position.add(ballVelocity);
          ballVelocity.y -= 0.012;
          if (ball.position.y < 0.31) {
            ball.position.y = 0.31;
            ballVelocity.y *= -0.45;
          }
          ball.rotation.x += 0.22;
          if (passTarget && ball.position.distanceTo(passTarget.position) < 0.9) { activePlayer = passTarget; hasBall = true; passTarget = undefined; }
        }
        defenders.forEach((defender) => {
          const target = hasBall ? activePlayer.position : ball.position;
          const chase = target.clone().sub(defender.position).setY(0);
          if (chase.length() > 0.1)
            defender.position.addScaledVector(chase.normalize(), 2.2 * delta);
          defender.lookAt(target.x, defender.position.y, target.z);
          if (hasBall && defender.position.distanceTo(activePlayer.position) < 0.82) {
            hasBall = false;
            ballVelocity.copy(chase.normalize().multiplyScalar(0.38));
            sounds.playTackle();
            events.onTackle();
            events.onAttempt(false);
            reset();
          }
        });
        goalkeeper.position.x = THREE.MathUtils.clamp(
          ball.position.x * 0.55,
          -2.6,
          2.6,
        );
        goalkeeper.position.y = !hasBall && ball.position.z < -12 ? 0.1 + Math.sin(performance.now() / 80) * 0.55 : 0.1;
        const lowDive = !hasBall && ball.position.z < -12 && ball.position.y < 1.1;
        goalkeeper.rotation.z = lowDive ? THREE.MathUtils.clamp(-ball.position.x * .22, -.75, .75) : 0;
        goalkeeper.lookAt(
          ball.position.x,
          goalkeeper.position.y,
          ball.position.z,
        );
        if (!hasBall && ball.position.z < -20.8 && !goalHandled) {
          goalHandled = true;
          finished = true;
          const saved = !curvedShot && Math.abs(ball.position.x - goalkeeper.position.x) < .55;
          const onTarget = curvedShot || Math.random() < .8;
          if (onTarget && Math.abs(ball.position.x) < 4.5 && !saved) {
            sounds.playGoal();
            events.onGoal();
            events.onAttempt(true);
            celebrationUntil = performance.now() + 5000;
          } else events.onMiss();
          if (!(onTarget && Math.abs(ball.position.x) < 4.5 && !saved)) events.onAttempt(false);
          if (!penalty) {
            if (celebrationUntil) window.setTimeout(reset, 5000); else reset();
          }
        }
      } else if (celebrationUntil > performance.now()) {
        activePlayer.position.y = 0.1 + Math.abs(Math.sin(performance.now() / 120)) * .7;
      } else {
        activePlayer.position.y = .1;
      }
      const cameraTarget = activePlayer.position
        .clone()
        .add(
          new THREE.Vector3(0, 8.5, 12.5).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            activePlayer.rotation.y,
          ),
        );
      camera.position.lerp(cameraTarget, 0.09);
      camera.lookAt(activePlayer.position.x, 1.1, activePlayer.position.z - 7.5);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      sounds.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [canShoot, events, mountRef, penalty, resetKey]);
}
