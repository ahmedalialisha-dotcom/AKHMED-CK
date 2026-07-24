import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createGameSounds } from "../lib/footballAudio";
import { addDayStadium, createFootballer } from "../lib/footballStadium";
import { FIELD_HALF_LENGTH, FIELD_HALF_WIDTH, GOAL_Z, HOME_GOAL_Z, HOME_KEEPER_Z, KEEPER_Z, OPPONENT_FORMATION, PENALTY_START_Z, PLAYER_START_Z, TEAM_FORMATION } from "../lib/footballField";
import { coverPosition, moveToPosition, opponentAttackPosition, opponentDefensePosition, teamAttackPosition, teamDefensePosition } from "../lib/footballPositioning";
import { findTeam } from "../lib/footballTeams";
import { getCareerStats } from "../lib/careerPlayer";
import type { TrainingType } from "../lib/careerPlayer";

type SceneEvents = {
  onGoal: () => void;
  onMiss: () => void;
  onTackle: (distance: "ближней" | "средней" | "дальней") => void;
  onOpponentDribble: (fromRestart: boolean) => void;
  onBallWon: () => void;
  onOpponentPass: () => void;
  onPrematch: (active: boolean) => void;
  onConcede: (scored: boolean) => void;
  onAttempt: (scored: boolean) => void;
  onOpponentPenalty: (scored: boolean) => void;
  onTrainingAction: (action: TrainingType) => void;
  onStats: (power: number) => void;
  onStamina: (stamina: number) => void;
};

export function useFootballScene(
  mountRef: React.RefObject<HTMLDivElement>,
  events: SceneEvents,
  penalty = false,
  canShoot = true,
  resetKey = 0,
  homeTeam?: string,
  awayTeam?: string,
  opponentShotKey = 0,
  playerAge?: number,
  trainingType?: TrainingType,
) {
  const canShootRef = useRef(canShoot);
  const opponentShotKeyRef = useRef(opponentShotKey);
  useEffect(() => { canShootRef.current = canShoot; }, [canShoot]);
  useEffect(() => { opponentShotKeyRef.current = opponentShotKey; }, [opponentShotKey]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    addDayStadium(scene);
    const homeData = findTeam(homeTeam);
    const awayData = findTeam(awayTeam);
    const homeColors = homeData?.colors;
    const awayColors = awayData?.colors;
    const homeStrength = (homeData?.rating ?? 82) / 85;
    const awayStrength = (awayData?.rating ?? 82) / 85;
    const careerStats = getCareerStats(playerAge ?? 24);
    const careerSpeed = playerAge ? careerStats.speed / 85 : 1;
    const careerTechnique = playerAge ? careerStats.technique / 85 : 1;
    const careerStamina = playerAge ? careerStats.stamina / 85 : 1;
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    const player = createFootballer("star", "11", homeColors);
    player.position.set(0, 0.1, penalty ? PENALTY_START_Z : PLAYER_START_Z);
    scene.add(player);
    const teammates = penalty ? [] : TEAM_FORMATION.map(([x, z], index) => {
      const teammate = createFootballer("star", String(index + 2), homeColors);
      teammate.position.set(x, 0.1, z);
      return teammate;
    });
    if (!penalty) {
      scene.add(...teammates);
    }
    const teamPlayers = [player, ...teammates];
    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(0.58, 0.76, 28),
      new THREE.MeshBasicMaterial({ color: "#f6d447", side: THREE.DoubleSide }),
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.18;
    scene.add(selectionRing);
    const goalkeeper = createFootballer("keeper", "1", awayColors);
    goalkeeper.position.set(0, 0.1, KEEPER_Z);
    scene.add(goalkeeper);
    const homeGoalkeeper = createFootballer("keeper", "1", homeColors);
    homeGoalkeeper.position.set(0, 0.1, HOME_KEEPER_Z);
    homeGoalkeeper.rotation.y = Math.PI;
    scene.add(homeGoalkeeper);
    const penaltyOpponent = createFootballer("defender", "11", awayColors);
    penaltyOpponent.visible = false;
    scene.add(penaltyOpponent);
    const defenders = penalty || trainingType ? [] : OPPONENT_FORMATION.map(([x, z], index) => {
      const defender = createFootballer("defender", String(index + 2), awayColors);
      defender.position.set(x, 0.1, z);
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
    let enemyShot = false;
    let enemyCarrier: THREE.Group | undefined;
    let enemyDribbleStarted = 0;
    let enemyShotTargetZ = 0;
    let enemyDribbleDuration = 950;
    let nextEnemyFeint = 0;
    let enemyFeintUntil = 0;
    let enemyFeintDirection = 1;
    let enemyPassTarget: THREE.Group | undefined;
    let nextEnemyPass = 0;
    let stamina = 100;
    let statsTimer = 0;
    let resetTimer = 0;
    let protectedUntil = 0;
    let handledOpponentShot = opponentShotKeyRef.current;
    let penaltyOpponentActive = false;
    let penaltyOpponentKicked = false;
    let penaltyOpponentStarted = 0;
    let penaltyOpponentWillScore = false;
    let penaltyOpponentTargetX = 0;
    let matchStarted = penalty || Boolean(trainingType);
    let sprintTrainingTime = 0;
    let sprintTrainingDone = false;
    const entranceStarted = performance.now();
    const entranceDuration = 5500;
    const teamEntranceTargets = teamPlayers.map((footballer) => footballer.position.clone());
    const opponentEntranceTargets = defenders.map((footballer) => footballer.position.clone());
    const teamEntranceStarts = teamPlayers.map((_, index) =>
      new THREE.Vector3(-FIELD_HALF_WIDTH - 4, 0.1, 16 - index * 2.5),
    );
    const opponentEntranceStarts = defenders.map((_, index) =>
      new THREE.Vector3(FIELD_HALF_WIDTH + 4, 0.1, -16 + index * 2.5),
    );
    if (!penalty && !trainingType) {
      teamPlayers.forEach((footballer, index) => footballer.position.copy(teamEntranceStarts[index]));
      defenders.forEach((footballer, index) => footballer.position.copy(opponentEntranceStarts[index]));
      events.onPrematch(true);
    }
    const planEnemyShot = (carrierZ: number) => {
      const roll = Math.random();
      if (roll < 0.05) {
        enemyShotTargetZ = carrierZ;
        enemyDribbleDuration = 280;
        return;
      }
      const desiredDistance = roll < 0.18
        ? THREE.MathUtils.randFloat(16, 21)
        : THREE.MathUtils.randFloat(7, 11);
      const plannedZ = HOME_GOAL_Z - desiredDistance;
      enemyShotTargetZ = Math.min(HOME_GOAL_Z - 3, Math.max(carrierZ + 1.5, plannedZ));
      enemyDribbleDuration = 950;
    };
    const winBall = (carrier: THREE.Group) => {
      activePlayer.position.lerp(carrier.position, 0.45);
      carrier.rotation.z = 0;
      enemyCarrier = undefined;
      enemyPassTarget = undefined;
      enemyShot = false;
      hasBall = true;
      ballVelocity.set(0, 0, 0);
      protectedUntil = performance.now() + 1200;
      sounds.playTackle();
      events.onBallWon();
    };
    const reset = () => {
      player.position.set(0, 0.1, penalty ? PENALTY_START_Z : PLAYER_START_Z);
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
      enemyShot = false;
      enemyCarrier = undefined;
      enemyDribbleStarted = 0;
      nextEnemyFeint = 0;
      nextEnemyPass = 0;
      enemyFeintUntil = 0;
      defenders.forEach((defender, index) => {
        defender.position.set(OPPONENT_FORMATION[index][0], 0.1, OPPONENT_FORMATION[index][1]);
        defender.rotation.set(0, 0, 0);
      });
      teammates.forEach((teammate, index) => {
        teammate.position.set(TEAM_FORMATION[index][0], 0.1, TEAM_FORMATION[index][1]);
        teammate.rotation.set(0, 0, 0);
      });
    };
    const startOpponentPossession = () => {
      player.position.set(0, 0.1, PLAYER_START_Z);
      player.rotation.set(0, 0, 0);
      teammates.forEach((teammate, index) => {
        teammate.position.set(TEAM_FORMATION[index][0], 0.1, TEAM_FORMATION[index][1]);
        teammate.rotation.set(0, 0, 0);
      });
      defenders.forEach((defender, index) => {
        defender.position.set(OPPONENT_FORMATION[index][0], 0.1, OPPONENT_FORMATION[index][1]);
        defender.rotation.set(0, 0, 0);
      });
      const carrier = defenders[6];
      carrier.position.set(0, 0.1, -2);
      ballVelocity.set(0, 0, 0);
      ball.position.set(0, 0.35, -1.1);
      hasBall = false;
      activePlayer = player;
      enemyCarrier = carrier;
      enemyDribbleStarted = performance.now();
      nextEnemyFeint = performance.now() + THREE.MathUtils.randFloat(700, 1300);
      nextEnemyPass = performance.now() + THREE.MathUtils.randFloat(1100, 1900);
      planEnemyShot(carrier.position.z);
      enemyShot = false;
      finished = false;
      goalHandled = false;
      celebrationUntil = 0;
      events.onOpponentDribble(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["Space", "KeyF", "KeyG", "KeyH", "KeyQ", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyC", "KeyR", "Digit1", "Digit2", "Digit3"].includes(event.code)
      )
        event.preventDefault();
      sounds.startCrowd();
      keys.add(event.code);
      if (event.code === "KeyR" && canShootRef.current && matchStarted) reset();
      if (event.code === "KeyC" && !penalty && (enemyCarrier || enemyShot)) {
        const currentIndex = teamPlayers.indexOf(activePlayer);
        activePlayer = teamPlayers[(currentIndex + 1) % teamPlayers.length];
      }
      if (["Digit1", "Digit2", "Digit3"].includes(event.code) && hasBall && matchStarted) { feintStyle = Number(event.code.charAt(event.code.length - 1)); feintUntil = performance.now() + 460; }
      if (event.code === "KeyE" && hasBall && !penalty && matchStarted) {
        const target = teamPlayers.filter((teammate) => teammate !== activePlayer).sort((first, second) => first.position.distanceTo(activePlayer.position) - second.position.distanceTo(activePlayer.position))[0];
        if (target) { passTarget = target; hasBall = false; ballVelocity.copy(target.position.clone().sub(activePlayer.position).setY(0).normalize().multiplyScalar(0.68 * homeStrength)); sounds.playKick(); }
      }
      if (["KeyF", "KeyG", "KeyH"].includes(event.code) && hasBall && !finished && canShootRef.current && matchStarted) {
        const style = event.code;
        curvedShot = style === "KeyF";
        hasBall = false;
        const side = 0;
        const lift = style === "KeyG" ? .26 : style === "KeyH" ? .16 : .25;
        const speed = style === "KeyH" ? 1.75 : style === "KeyG" ? .82 : 1.12;
        ballVelocity.set(side, lift, -speed).applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        sounds.playKick();
      }
      if (event.code === "Space" && hasBall && !finished && !chargeStarted && canShootRef.current && matchStarted) chargeStarted = performance.now();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
      if (event.code === "Space" && chargeStarted && hasBall && !finished && canShootRef.current) {
        const power = THREE.MathUtils.clamp((performance.now() - chargeStarted) / 900, .2, 1);
        hasBall = false;
        ballVelocity.set(0, .07 + power * .28, -(.55 + power * 1.25)).applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        chargeStarted = 0; sounds.playKick();
      }
    };
    const releaseControls = () => {
      keys.clear();
      chargeStarted = 0;
      events.onStats(0);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseControls);
    const clock = new THREE.Clock();
    const forward = new THREE.Vector3();
    const cameraTargetPosition = new THREE.Vector3();
    let cameraFocusZ = PLAYER_START_Z;
    let cameraHeight = 22;
    let cameraDistance = 42;
    let animationId = 0;
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      scene.traverse((item) => {
        if (item.userData.fanBaseY !== undefined) {
          item.position.y = item.userData.fanBaseY + Math.max(0, Math.sin(performance.now() / 240 + item.userData.fanPhase)) * .22;
        }
      });
      if (!matchStarted) {
        const progress = THREE.MathUtils.clamp((performance.now() - entranceStarted) / entranceDuration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        teamPlayers.forEach((footballer, index) =>
          footballer.position.lerpVectors(teamEntranceStarts[index], teamEntranceTargets[index], eased),
        );
        defenders.forEach((footballer, index) =>
          footballer.position.lerpVectors(opponentEntranceStarts[index], opponentEntranceTargets[index], eased),
        );
        ball.position.set(0, 0.31, 0);
        if (progress >= 1) {
          matchStarted = true;
          events.onPrematch(false);
        }
      }
      selectionRing.position.x = activePlayer.position.x;
      selectionRing.position.z = activePlayer.position.z;
      if (penalty && opponentShotKeyRef.current > handledOpponentShot) {
        handledOpponentShot = opponentShotKeyRef.current;
        penaltyOpponentActive = true;
        penaltyOpponentKicked = false;
        penaltyOpponentStarted = performance.now();
        penaltyOpponentTargetX = THREE.MathUtils.randFloat(-3.3, 3.3);
        const scoringChance = THREE.MathUtils.clamp(0.68 + (awayStrength - homeStrength) * 0.45, 0.42, 0.86);
        penaltyOpponentWillScore = Math.random() < scoringChance;
        penaltyOpponent.position.set(0, 0.1, 22);
        penaltyOpponent.rotation.y = Math.PI;
        penaltyOpponent.visible = true;
        player.visible = false;
        goalkeeper.visible = false;
        ball.position.set(0, 0.31, 23);
        ballVelocity.set(0, 0, 0);
        homeGoalkeeper.position.set(0, 0.1, HOME_KEEPER_Z);
        finished = false;
      }
      if (penaltyOpponentActive) {
        const elapsed = performance.now() - penaltyOpponentStarted;
        if (!penaltyOpponentKicked) {
          penaltyOpponent.position.z = Math.min(25.5, 22 + elapsed * 0.0045);
          ball.position.set(0, 0.31, 26.1);
          if (elapsed > 780) {
            penaltyOpponentKicked = true;
            const targetX = penaltyOpponentWillScore ? penaltyOpponentTargetX : THREE.MathUtils.randFloat(-1.2, 1.2);
            ballVelocity.set(targetX - ball.position.x, 0.1, HOME_GOAL_Z - ball.position.z).normalize().multiplyScalar(1.25 * awayStrength);
            ballVelocity.y = 0.12;
            sounds.playKick();
          }
        } else {
          ball.position.add(ballVelocity);
          ballVelocity.y -= 0.01;
          const keeperTarget = penaltyOpponentWillScore ? -Math.sign(penaltyOpponentTargetX || 1) * 2.2 : penaltyOpponentTargetX;
          homeGoalkeeper.position.x = THREE.MathUtils.lerp(homeGoalkeeper.position.x, keeperTarget, 0.09 * homeStrength);
          homeGoalkeeper.position.y = 0.1 + Math.abs(homeGoalkeeper.position.x) * 0.16;
          homeGoalkeeper.rotation.z = -homeGoalkeeper.position.x * 0.22;
          if (ball.position.z >= HOME_GOAL_Z - 0.2) {
            penaltyOpponentActive = false;
            finished = true;
            events.onOpponentPenalty(penaltyOpponentWillScore);
          }
        }
      } else if (!finished && matchStarted) {
        const sprinting = keys.has("KeyQ") && keys.has("KeyW") && stamina > 0;
        if (trainingType === "sprint" && sprinting && !sprintTrainingDone) {
          sprintTrainingTime += delta;
          if (sprintTrainingTime >= 5) {
            sprintTrainingDone = true;
            events.onTrainingAction("sprint");
          }
        }
        stamina = THREE.MathUtils.clamp(stamina + (sprinting ? -15 / careerStamina : 7 * careerStamina) * delta, 0, 100);
        if (performance.now() - statsTimer > 80) { events.onStats(chargeStarted ? THREE.MathUtils.clamp((performance.now() - chargeStarted) / 9, 0, 100) : 0); events.onStamina(stamina); statsTimer = performance.now(); }
        if (keys.has("KeyA")) activePlayer.rotation.y += 2.5 * delta;
        if (keys.has("KeyD")) activePlayer.rotation.y -= 2.5 * delta;
        if (performance.now() < feintUntil && feintStyle === 1) activePlayer.rotation.y += Math.sin(performance.now() / 45) * 0.12;
        forward
          .set(0, 0, -1)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), activePlayer.rotation.y);
        if (!penalty && keys.has("KeyW"))
          activePlayer.position.addScaledVector(forward, (sprinting ? 8.4 : 5.6) * homeStrength * careerSpeed * delta);
        if (!penalty && keys.has("KeyS"))
          activePlayer.position.addScaledVector(forward, -3.8 * delta);
        activePlayer.position.x = THREE.MathUtils.clamp(activePlayer.position.x, -FIELD_HALF_WIDTH + 1.5, FIELD_HALF_WIDTH - 1.5);
        activePlayer.position.z = THREE.MathUtils.clamp(activePlayer.position.z, -FIELD_HALF_LENGTH + 2, FIELD_HALF_LENGTH - 2);
        const opponentPossession = Boolean(enemyCarrier || enemyPassTarget || enemyShot);
        const defendingTarget = enemyCarrier?.position ?? ball.position;
        const availableTeamDefenders = teamPlayers.filter((footballer, index) =>
          footballer !== activePlayer && index > 4,
        );
        const teamPressingPlayer = availableTeamDefenders.reduce<THREE.Group | undefined>((nearest, footballer) =>
          !nearest || footballer.position.distanceTo(defendingTarget) < nearest.position.distanceTo(defendingTarget)
            ? footballer : nearest, undefined);
        const teamCoverPlayer = availableTeamDefenders
          .filter((footballer) => footballer !== teamPressingPlayer)
          .sort((first, second) => first.position.distanceTo(defendingTarget) - second.position.distanceTo(defendingTarget))[0];
        teamPlayers.forEach((teammate, index) => {
          if (teammate === activePlayer || penalty) return;
          if (hasBall) moveToPosition(teammate, teamAttackPosition(index, activePlayer), 3.8, delta);
          else if (opponentPossession) {
            if (teammate === teamPressingPlayer && enemyCarrier) {
              moveToPosition(teammate, defendingTarget, 4.15, delta);
            } else if (teammate === teamCoverPlayer) {
              moveToPosition(teammate, coverPosition(defendingTarget, HOME_GOAL_Z), 3.8, delta);
            } else {
              moveToPosition(teammate, teamDefensePosition(index, defendingTarget.x, defendingTarget.z), 3.5, delta);
            }
          }
        });
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
        else if (enemyCarrier) {
          const carrier = enemyCarrier;
          if (activePlayer.position.distanceTo(carrier.position) < 1.05) {
            winBall(carrier);
          } else {
            const now = performance.now();
            if (now > nextEnemyFeint) {
              enemyFeintUntil = now + 430;
              enemyFeintDirection = Math.random() < 0.5 ? -1 : 1;
              nextEnemyFeint = now + THREE.MathUtils.randFloat(1200, 2200);
            }
            if (now > nextEnemyPass) {
              if (Math.random() < 0.62) {
                const options = defenders.filter((defender) => defender !== carrier);
                const target = options.sort((first, second) =>
                  first.position.distanceTo(carrier.position) - second.position.distanceTo(carrier.position),
                )[0];
                if (target) {
                  enemyPassTarget = target;
                  enemyCarrier = undefined;
                  ballVelocity.copy(target.position.clone().sub(ball.position).normalize().multiplyScalar(0.72 * awayStrength));
                  ballVelocity.y = 0.035;
                  carrier.rotation.z = 0;
                  sounds.playKick();
                  events.onOpponentPass();
                }
              }
              nextEnemyPass = now + THREE.MathUtils.randFloat(1300, 2400);
            }
            const feinting = now < enemyFeintUntil;
            const weave = Math.sin(now / 230) * 1.8 + (feinting ? enemyFeintDirection * 2.3 : 0);
            carrier.position.z += (feinting ? 4.1 : 5.4) * awayStrength * delta;
            carrier.position.x += (weave - carrier.position.x) * 1.9 * delta;
            carrier.rotation.y = Math.PI + (feinting ? enemyFeintDirection * 0.32 : 0);
            carrier.rotation.z = feinting ? enemyFeintDirection * 0.13 : 0;
            ball.position.set(
              carrier.position.x + Math.sin(now / 75) * (feinting ? 0.55 : 0.28),
              0.35,
              carrier.position.z + 0.9,
            );
          }
          const dribbledLongEnough = performance.now() - enemyDribbleStarted > enemyDribbleDuration;
          if (enemyCarrier && dribbledLongEnough && enemyCarrier.position.z >= enemyShotTargetZ) {
            const distance = HOME_GOAL_Z - enemyCarrier.position.z;
            const targetX = THREE.MathUtils.randFloat(-3.2, 3.2);
            enemyCarrier.rotation.z = 0;
            enemyCarrier = undefined;
            enemyShot = true;
            ballVelocity.set(targetX - ball.position.x, 0, distance).normalize().multiplyScalar(distance > 24 ? 1.3 : distance > 13 ? 1.2 : 1.08);
            ballVelocity.y = distance > 24 ? 0.21 : distance > 13 ? 0.17 : 0.13;
            sounds.playKick();
            events.onTackle(distance > 24 ? "дальней" : distance > 13 ? "средней" : "ближней");
          }
        } else {
          const receivingPlayer = passTarget ?? enemyPassTarget;
          if (receivingPlayer) {
            const direction = receivingPlayer.position.clone().sub(ball.position).setY(0).normalize();
            const speed = passTarget ? 0.72 * homeStrength : 0.74 * awayStrength;
            ballVelocity.x = THREE.MathUtils.lerp(ballVelocity.x, direction.x * speed, 0.18);
            ballVelocity.z = THREE.MathUtils.lerp(ballVelocity.z, direction.z * speed, 0.18);
          }
          ball.position.add(ballVelocity);
          ballVelocity.y -= 0.012;
          if (ball.position.y < 0.31) {
            ball.position.y = 0.31;
            ballVelocity.y *= -0.45;
          }
          ball.rotation.x += 0.22;
          if (passTarget && ball.position.distanceTo(passTarget.position) < 1.25) {
            ball.position.copy(passTarget.position).setY(0.35);
            ballVelocity.set(0, 0, 0);
            activePlayer = passTarget;
            hasBall = true;
            passTarget = undefined;
            if (trainingType === "passing") events.onTrainingAction("passing");
          }
          if (enemyPassTarget && activePlayer.position.distanceTo(ball.position) < 0.82) {
            enemyPassTarget = undefined;
            ballVelocity.set(0, 0, 0);
            hasBall = true;
            protectedUntil = performance.now() + 1000;
            events.onBallWon();
          } else if (enemyPassTarget && ball.position.distanceTo(enemyPassTarget.position) < 1.25) {
            enemyCarrier = enemyPassTarget;
            enemyPassTarget = undefined;
            ballVelocity.set(0, 0, 0);
            enemyDribbleStarted = performance.now();
            nextEnemyFeint = performance.now() + THREE.MathUtils.randFloat(700, 1300);
            nextEnemyPass = performance.now() + THREE.MathUtils.randFloat(1100, 1900);
            planEnemyShot(enemyCarrier.position.z);
          }
        }
        const pressingDefender = defenders.reduce<THREE.Group | undefined>((nearest, defender) => {
          if (!nearest) return defender;
          const target = hasBall ? activePlayer.position : ball.position;
          return defender.position.distanceTo(target) < nearest.position.distanceTo(target) ? defender : nearest;
        }, undefined);
        const coveringDefender = defenders
          .filter((defender) => defender !== pressingDefender)
          .sort((first, second) => first.position.distanceTo(activePlayer.position) - second.position.distanceTo(activePlayer.position))[0];
        defenders.forEach((defender, defenderIndex) => {
          if (enemyShot || enemyPassTarget) return;
          if (enemyCarrier) {
            if (defender !== enemyCarrier) {
              moveToPosition(defender, opponentAttackPosition(defenderIndex, enemyCarrier), 3.5, delta);
            }
            return;
          }
          const target = hasBall ? activePlayer.position : ball.position;
          const chase = target.clone().sub(defender.position).setY(0);
          if (defender === pressingDefender && chase.length() > 0.1)
            defender.position.addScaledVector(chase.normalize(), 3.25 * awayStrength * delta);
          else if (defender === coveringDefender)
            moveToPosition(defender, coverPosition(target, GOAL_Z), 3.1, delta);
          else moveToPosition(defender, opponentDefensePosition(defenderIndex, target.x), 3, delta);
          defender.lookAt(target.x, defender.position.y, target.z);
          if (hasBall && performance.now() > protectedUntil && defender.position.distanceTo(activePlayer.position) < 0.86) {
            hasBall = false;
            enemyCarrier = defender;
            enemyDribbleStarted = performance.now();
            nextEnemyFeint = performance.now() + THREE.MathUtils.randFloat(700, 1300);
            nextEnemyPass = performance.now() + THREE.MathUtils.randFloat(1100, 1900);
            planEnemyShot(defender.position.z);
            sounds.playTackle();
            events.onOpponentDribble(false);
          }
        });
        const nearestOpponent = defenders.reduce((distance, defender) =>
          Math.min(distance, defender.position.distanceTo(activePlayer.position)), Number.POSITIVE_INFINITY);
        const playerOneOnOne = hasBall && activePlayer.position.z < GOAL_Z + 15 && nearestOpponent > 3.8;
        const goalkeeperTargetZ = playerOneOnOne ? GOAL_Z + 6.5 : KEEPER_Z;
        goalkeeper.position.z = THREE.MathUtils.lerp(goalkeeper.position.z, goalkeeperTargetZ, 0.055);
        goalkeeper.position.x = THREE.MathUtils.lerp(goalkeeper.position.x, THREE.MathUtils.clamp(ball.position.x * (playerOneOnOne ? .82 : .55), -3.4, 3.4), .12);
        goalkeeper.position.y = !hasBall && ball.position.z < GOAL_Z + 8 ? 0.1 + Math.sin(performance.now() / 80) * 0.55 : 0.1;
        const lowDive = !hasBall && ball.position.z < GOAL_Z + 8 && ball.position.y < 1.1;
        goalkeeper.rotation.z = lowDive ? THREE.MathUtils.clamp(-ball.position.x * .22, -.75, .75) : 0;
        goalkeeper.lookAt(
          ball.position.x,
          goalkeeper.position.y,
          ball.position.z,
        );
        if (enemyShot) {
          homeGoalkeeper.position.x = THREE.MathUtils.clamp(ball.position.x * 0.55, -2.6, 2.6);
          homeGoalkeeper.lookAt(ball.position.x, homeGoalkeeper.position.y, ball.position.z);
          if (ball.position.z > HOME_GOAL_Z + 0.2 && !goalHandled) {
            goalHandled = true;
            finished = true;
            const saved = Math.abs(ball.position.x - homeGoalkeeper.position.x) < 0.55 * homeStrength;
            const scored = Math.abs(ball.position.x) < 4.5 && ball.position.y < 4 && !saved;
            events.onConcede(scored);
            resetTimer = window.setTimeout(reset, 2000);
          }
        }
        if (enemyCarrier && !enemyShot) {
          const nearestHomeDefender = teamPlayers.reduce((distance, footballer) =>
            Math.min(distance, footballer.position.distanceTo(enemyCarrier!.position)), Number.POSITIVE_INFINITY);
          const enemyOneOnOne = enemyCarrier.position.z > HOME_GOAL_Z - 15 && nearestHomeDefender > 3.8;
          homeGoalkeeper.position.z = THREE.MathUtils.lerp(
            homeGoalkeeper.position.z,
            enemyOneOnOne ? HOME_GOAL_Z - 6.5 : HOME_KEEPER_Z,
            .055,
          );
          homeGoalkeeper.position.x = THREE.MathUtils.lerp(
            homeGoalkeeper.position.x,
            THREE.MathUtils.clamp(ball.position.x * (enemyOneOnOne ? .82 : .55), -3.4, 3.4),
            .12,
          );
        }
        if (!enemyShot && !hasBall && ball.position.z < GOAL_Z - 0.2 && !goalHandled) {
          goalHandled = true;
          finished = true;
          const saved = !curvedShot && Math.abs(ball.position.x - goalkeeper.position.x) < .55 * awayStrength;
          const onTarget = curvedShot
            ? Math.random() < .9
            : Math.random() < THREE.MathUtils.clamp(.58 + homeStrength * .15 + careerTechnique * .1, .7, .9);
          if (onTarget && Math.abs(ball.position.x) < 4.5 && !saved) {
            sounds.playGoal();
            events.onGoal();
            events.onAttempt(true);
            celebrationUntil = performance.now() + 2000;
          } else events.onMiss();
          if (!(onTarget && Math.abs(ball.position.x) < 4.5 && !saved)) events.onAttempt(false);
          if (!penalty) {
            resetTimer = window.setTimeout(trainingType ? reset : startOpponentPossession, 2000);
          }
        }
      } else if (celebrationUntil > performance.now()) {
        activePlayer.position.y = 0.1 + Math.abs(Math.sin(performance.now() / 120)) * .7;
      } else {
        activePlayer.position.y = .1;
      }
      cameraFocusZ = THREE.MathUtils.lerp(
        cameraFocusZ,
        THREE.MathUtils.clamp(ball.position.z, -FIELD_HALF_LENGTH + 10, FIELD_HALF_LENGTH - 10),
        0.035,
      );
      cameraTargetPosition.set(0, cameraHeight, cameraFocusZ + cameraDistance);
      camera.position.lerp(cameraTargetPosition, 0.06);
      camera.lookAt(0, 0, cameraFocusZ - 8);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      if (camera.aspect < 0.8) {
        cameraHeight = 36;
        cameraDistance = 54;
      } else {
        cameraHeight = 22;
        cameraDistance = 42;
      }
      camera.position.set(0, cameraHeight, cameraFocusZ + cameraDistance);
      camera.lookAt(0, 0, cameraFocusZ - 8);
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
      window.removeEventListener("blur", releaseControls);
      window.clearTimeout(resetTimer);
      events.onStats(0);
      sounds.dispose();
      scene.traverse((item) => {
        if (!(item instanceof THREE.Mesh)) return;
        item.geometry.dispose();
        const materials = Array.isArray(item.material) ? item.material : [item.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) value.dispose();
          });
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [awayTeam, events, homeTeam, mountRef, penalty, playerAge, resetKey, trainingType]);
}
