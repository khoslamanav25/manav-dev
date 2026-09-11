"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COURT, PLAYER, LAUNCHER_POS } from "@/game/dims";
import { bindInput, consumeSwing, getTouchTarget, isDown } from "@/game/input";
import { BALL_RADIUS, BallSim, flightTime, solveArc, stepBall } from "@/game/physics";
import { emit } from "@/game/events";
import { onKonami } from "@/game/input";
import { useGame } from "@/game/store";
import type { GameMode } from "@/game/store";
import { TARGETS, TARGET_HALF } from "@/game/targets";
import type { TargetDef } from "@/game/targets";
import type { Theme } from "@/game/themes";

const MAX_BALLS = 8;
const SWING_DURATION = 0.32; // full animation
const CONTACT_HEIGHT = 1.05;

interface ModeParams {
  cadence: number; // seconds between launches
  pace: number; // flightTime divisor — higher = faster incoming balls
  spread: number; // lateral band the launcher aims into
  swingWindow: number; // seconds after press during which contact counts
  aimAssist: boolean; // highlighted board + solved-to-hit returns
}

// Per-mode difficulty tuning. Pro is a real jump: faster balls on a quicker
// cadence across the full court, a tight contact window, and no aim assist —
// shot direction comes entirely from swing timing.
const MODES: Record<GameMode, ModeParams> = {
  easy: { cadence: 3.6, pace: 1, spread: 8, swingWindow: 0.2, aimAssist: true },
  pro: { cadence: 2, pace: 1.5, spread: 11, swingWindow: 0.11, aimAssist: false },
};

interface SwingState {
  t: number; // time since press; Infinity = idle
  connected: boolean;
}

export default function GameEngine({ theme }: { theme: Theme }) {
  const phase = useGame((s) => s.phase);
  const mode = useGame((s) => s.mode);
  const panelOpen = useGame((s) => s.panel !== null);
  const registerMiss = useGame((s) => s.registerMiss);

  // ---- mutable sim state (never triggers React renders) ----
  const playerX = useRef(0);
  const swing = useRef<SwingState>({ t: Infinity, connected: false });
  const balls = useRef<BallSim[]>([]);
  const nextId = useRef(1);
  const launchTimer = useRef(2.2);

  // ---- scene object refs ----
  const playerGroup = useRef<THREE.Group>(null);
  const armGroup = useRef<THREE.Group>(null);
  const launcherGroup = useRef<THREE.Group>(null);
  const barrelGlow = useRef<THREE.MeshStandardMaterial>(null);
  const ballMeshes = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    (window as unknown as { __mkCommitted?: boolean }).__mkCommitted = true;
  }, []);
  useEffect(() => bindInput(), []);
  useEffect(() => {
    onKonami(() => {
      useGame.getState().startTurbo(20000);
      emit({ type: "turbo" });
    });
  }, []);
  const wobble = useRef(0);
  const rapidShots = useRef(0);
  const trailClock = useRef(0);

  const active = phase === "playing" && !panelOpen;

  const fireBall = () => {
    if (balls.current.length >= MAX_BALLS) return;
    const M = MODES[mode];
    const from = new THREE.Vector3(...LAUNCHER_POS);
    // aim at a reachable contact point near the baseline
    const to = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(M.spread),
      CONTACT_HEIGHT,
      PLAYER.baselineZ - 0.35,
    );
    const T = flightTime(from, to, M.pace);
    balls.current.push({
      id: nextId.current++,
      phase: "incoming",
      pos: from.clone(),
      vel: solveArc(from, to, T),
      spin: 0,
      bounces: 0,
      age: 0,
      targetId: null,
    });
    emit({ type: "launch" });
  };

  const returnBall = (b: BallSim) => {
    emit({ type: "pop", x: b.pos.x, y: b.pos.y, z: b.pos.z });
    const M = MODES[mode];
    const { hitTargets, aimTargetId } = useGame.getState();

    let target: TargetDef | undefined;
    if (M.aimAssist) {
      target = TARGETS.find((t) => t.id === aimTargetId);
    } else {
      // no highlight in pro, but the direction calc still needs a reference
      // board: nearest unvisited board to the player's x
      let bestDist = Infinity;
      for (const t of TARGETS) {
        if (hitTargets.has(t.id)) continue;
        const d = Math.abs(t.pos[0] - playerX.current);
        if (d < bestDist) {
          bestDist = d;
          target = t;
        }
      }
    }

    // all boards cleared → revenge mode: fire back at the machine itself
    if (!target) {
      const to = new THREE.Vector3(LAUNCHER_POS[0], LAUNCHER_POS[1] + 0.15, LAUNCHER_POS[2] + 0.4);
      const T = flightTime(b.pos, to, 1.5);
      b.vel = solveArc(b.pos, to, T);
      b.phase = "returning";
      b.targetId = null;
      b.bounces = 0;
      return;
    }
    const to = new THREE.Vector3(...target.pos);

    if (!M.aimAssist) {
      // Timing controls direction: sweet spot ≈ 55ms after the press.
      const err = THREE.MathUtils.clamp((swing.current.t - 0.055) * 48, -9, 9);
      to.x += err + THREE.MathUtils.randFloatSpread(0.5);
      // late shots drop low enough to clip the net (stepBall handles the block)
      to.y += THREE.MathUtils.randFloatSpread(0.3) - err * 0.45;
      to.z += THREE.MathUtils.randFloatSpread(1.8);
      b.targetId = null; // pro shots have to actually connect
    } else {
      b.targetId = target.id; // aim assist: solved to hit
    }

    const T = flightTime(b.pos, to, 1.45);
    b.vel = solveArc(b.pos, to, T);
    b.phase = "returning";
    b.bounces = 0;
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30); // clamp tab-switch spikes

    // -------- player movement --------
    if (active) {
      const left = isDown("KeyA", "ArrowLeft");
      const right = isDown("KeyD", "ArrowRight");
      const sprint = isDown("ShiftLeft", "ShiftRight");
      const speed = sprint ? 10.5 : 7;
      if (left && !right) playerX.current -= speed * dt;
      if (right && !left) playerX.current += speed * dt;
      const tx = getTouchTarget();
      if (tx !== null && !left && !right) {
        const d = tx - playerX.current;
        playerX.current += THREE.MathUtils.clamp(d, -10.5 * dt, 10.5 * dt);
      }
      playerX.current = THREE.MathUtils.clamp(playerX.current, PLAYER.minX, PLAYER.maxX);
    }

    // -------- swing --------
    if (active && consumeSwing() && swing.current.t > SWING_DURATION) {
      swing.current = { t: 0, connected: false };
    }
    swing.current.t += dt;

    // -------- launcher --------
    const incoming = balls.current.filter((b) => b.phase === "incoming").length;
    if (active && incoming < 2) {
      launchTimer.current -= dt;
      if (launchTimer.current <= 0) {
        fireBall();
        let cadence = MODES[mode].cadence;
        if (Date.now() < useGame.getState().turboUntil) cadence *= 0.35;
        if (rapidShots.current > 0) {
          rapidShots.current -= 1;
          cadence = 0.9;
        }
        launchTimer.current = cadence;
      }
    }
    if (barrelGlow.current) {
      const telegraphing = active && launchTimer.current < 0.6 && incoming < 2;
      barrelGlow.current.emissiveIntensity = telegraphing
        ? 1.6 + Math.sin(performance.now() / 60) * 0.8
        : 0.25;
    }

    // -------- aim-assist selection: nearest unvisited board --------
    {
      const { hitTargets, aimTargetId, setAimTarget } = useGame.getState();
      if (!MODES[mode].aimAssist) {
        // pro: no hint — the Board glow keys off aimTargetId
        if (aimTargetId !== null) setAimTarget(null);
      } else {
        let best: string | null = null;
        let bestDist = Infinity;
        for (const t of TARGETS) {
          if (hitTargets.has(t.id)) continue;
          const d = Math.abs(t.pos[0] - playerX.current);
          if (d < bestDist) {
            bestDist = d;
            best = t.id;
          }
        }
        if (best !== aimTargetId) setAimTarget(best);
      }
    }

    // -------- ball simulation --------
    const contact = new THREE.Vector3(playerX.current, CONTACT_HEIGHT, PLAYER.baselineZ - 0.35);
    for (const b of balls.current) {
      const wasIncoming = b.phase === "incoming";
      const bouncesBefore = b.bounces;
      stepBall(b, dt);
      if (b.bounces > bouncesBefore && b.pos.y <= BALL_RADIUS + 0.05) {
        emit({ type: "bounce", x: b.pos.x, y: b.pos.y, z: b.pos.z });
      }

      // contact check while the swing window is open
      if (
        wasIncoming &&
        b.phase === "incoming" &&
        swing.current.t <= MODES[mode].swingWindow &&
        !swing.current.connected &&
        b.pos.distanceTo(contact) < PLAYER.reach
      ) {
        swing.current.connected = true;
        returnBall(b);
      }

      // ball got past the player → streak reset
      if (wasIncoming && b.phase === "incoming" && b.pos.z > PLAYER.baselineZ + 1.6) {
        b.phase = "dead";
        registerMiss();
        emit({ type: "miss" });
      }

      // returning ball vs the launcher (easter egg / revenge mode)
      if (
        b.phase === "returning" &&
        Math.abs(b.pos.x - LAUNCHER_POS[0]) < 0.62 &&
        Math.abs(b.pos.y - LAUNCHER_POS[1]) < 0.62 &&
        Math.abs(b.pos.z - LAUNCHER_POS[2]) < 0.75
      ) {
        b.phase = "dead";
        wobble.current = 1;
        rapidShots.current = 3;
        launchTimer.current = Math.min(launchTimer.current, 0.8);
        emit({ type: "launcherHit" });
      }

      // returning ball vs target boards
      if (b.phase === "returning" && b.pos.z < -COURT.serviceLineZ + 1.5) {
        for (const t of TARGETS) {
          if (b.targetId && b.targetId !== t.id) continue;
          const g = useGame.getState();
          if (g.hitTargets.has(t.id)) continue;
          if (
            Math.abs(b.pos.x - t.pos[0]) < TARGET_HALF.x + BALL_RADIUS &&
            Math.abs(b.pos.y - t.pos[1]) < TARGET_HALF.y + BALL_RADIUS &&
            Math.abs(b.pos.z - t.pos[2]) < TARGET_HALF.z + BALL_RADIUS
          ) {
            b.phase = "dead";
            g.registerHit(t.id, mode === "pro" ? 100 : 50);
            emit({ type: "targetHit", x: b.pos.x, y: b.pos.y, z: b.pos.z });
            const streakNow = useGame.getState().streak;
            if (streakNow > 0 && streakNow % 10 === 0) emit({ type: "streak", count: streakNow });
            g.openPanel({ section: t.id });
            break;
          }
        }
        // pro-mode spray that bounces twice on the far side counts as a miss
        if (b.phase === "returning" && b.bounces >= 2) {
          b.phase = "dead";
          if (mode === "pro") registerMiss();
        }
      }
    }
    balls.current = balls.current.filter((b) => b.phase !== "dead");

    // debug probe for playtesting
    (window as unknown as { __mkSim?: object }).__mkSim = {
      playerX: playerX.current,
      active,
      launchIn: launchTimer.current,
      balls: balls.current.map((b) => ({
        phase: b.phase,
        x: +b.pos.x.toFixed(2),
        y: +b.pos.y.toFixed(2),
        z: +b.pos.z.toFixed(2),
      })),
    };

    // -------- write sim → scene graph --------
    if (playerGroup.current) {
      playerGroup.current.position.x = playerX.current;
      const lean =
        (isDown("KeyD", "ArrowRight") ? 1 : 0) - (isDown("KeyA", "ArrowLeft") ? 1 : 0);
      playerGroup.current.rotation.z = THREE.MathUtils.lerp(
        playerGroup.current.rotation.z,
        active ? -lean * 0.12 : 0,
        0.2,
      );
    }
    if (armGroup.current) {
      // idle at -0.7; swing sweeps to +1.6 with an eased pop, then returns
      const st = swing.current.t;
      let angle = -0.7;
      if (st < SWING_DURATION) {
        const k = st / SWING_DURATION;
        angle = -0.7 + Math.sin(k * Math.PI) * 2.3;
      }
      armGroup.current.rotation.y = THREE.MathUtils.lerp(armGroup.current.rotation.y, angle, 0.55);
    }
    trailClock.current += dt;
    const emitTrail = trailClock.current > 0.045;
    if (emitTrail) trailClock.current = 0;
    const turbo = Date.now() < useGame.getState().turboUntil;
    balls.current.forEach((b, i) => {
      const m = ballMeshes.current[i];
      if (!m) return;
      m.visible = b.phase !== "dead";
      if (m.visible) {
        m.position.copy(b.pos);
        b.spin += dt * b.vel.length() * 3;
        m.rotation.set(b.spin, b.spin * 0.6, 0);
        if (emitTrail && b.vel.lengthSq() > 16) {
          emit({ type: "trail", x: b.pos.x, y: b.pos.y, z: b.pos.z });
        }
        const mat = m.material as THREE.MeshStandardMaterial;
        if (turbo) {
          mat.color.setHSL((performance.now() / 900 + i * 0.13) % 1, 0.9, 0.6);
          mat.emissive.copy(mat.color);
          mat.emissiveIntensity = 1.2;
        }
      }
    });
    if (launcherGroup.current) {
      if (wobble.current > 0.001) {
        wobble.current = Math.max(0, wobble.current - dt * 1.6);
        launcherGroup.current.rotation.z =
          Math.sin(wobble.current * 22) * 0.28 * wobble.current;
        launcherGroup.current.rotation.x =
          Math.sin(wobble.current * 17) * 0.15 * wobble.current;
      } else {
        launcherGroup.current.rotation.z = 0;
        launcherGroup.current.rotation.x = 0;
      }
    }
    for (let i = balls.current.length; i < MAX_BALLS; i++) {
      const m = ballMeshes.current[i];
      if (m) m.visible = false;
    }
  });



  // ---------------- visuals ----------------
  const outfit = useMemo(
    () => ({ shirt: "#f4f2ec", shorts: "#25324a", skin: "#c98d5f", racquet: "#1c1f26" }),
    [],
  );

  return (
    <group>
      {/* player */}
      <group ref={playerGroup} position={[0, 0, PLAYER.baselineZ]}>
        {/* legs */}
        <mesh position={[-0.1, 0.36, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.72, 8]} />
          <meshStandardMaterial color={outfit.skin} />
        </mesh>
        <mesh position={[0.1, 0.36, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.72, 8]} />
          <meshStandardMaterial color={outfit.skin} />
        </mesh>
        {/* torso */}
        <mesh position={[0, 1.0, 0]}>
          <capsuleGeometry args={[0.21, 0.42, 6, 12]} />
          <meshStandardMaterial color={outfit.shirt} />
        </mesh>
        {/* shorts */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.2, 0.17, 0.26, 10]} />
          <meshStandardMaterial color={outfit.shorts} />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.56, 0]}>
          <sphereGeometry args={[0.155, 16, 16]} />
          <meshStandardMaterial color={outfit.skin} />
        </mesh>
        {/* cap */}
        <mesh position={[0, 1.66, 0.02]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.165, 0.08, 12]} />
          <meshStandardMaterial color={outfit.shorts} />
        </mesh>
        {/* racquet arm (pivot at shoulder) */}
        <group ref={armGroup} position={[0.26, 1.18, 0]} rotation={[0, -0.7, 0]}>
          <mesh position={[0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.05, 0.44, 8]} />
            <meshStandardMaterial color={outfit.skin} />
          </mesh>
          <mesh position={[0.52, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
            <meshStandardMaterial color={outfit.racquet} />
          </mesh>
          <mesh position={[0.78, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.022, 8, 20]} />
            <meshStandardMaterial color={outfit.racquet} />
          </mesh>
          <mesh position={[0.78, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.14, 16]} />
            <meshStandardMaterial
              color="#e8e6df"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {/* ball launcher */}
      <group ref={launcherGroup} position={LAUNCHER_POS}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.8, 1.1]} />
          <meshStandardMaterial color="#2a2f3a" />
        </mesh>
        <mesh position={[0, 0.28, 0.62]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.19, 0.7, 14]} />
          <meshStandardMaterial color="#3a4152" />
        </mesh>
        <mesh position={[0, 0.33, 0.9]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
          <torusGeometry args={[0.17, 0.035, 8, 20]} />
          <meshStandardMaterial
            ref={barrelGlow}
            color={theme.ball.color}
            emissive={theme.ball.color}
            emissiveIntensity={0.25}
          />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.5, -0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 14]} />
            <meshStandardMaterial color="#14171e" />
          </mesh>
        ))}
      </group>

      {/* ball pool */}
      {Array.from({ length: MAX_BALLS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ballMeshes.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[BALL_RADIUS, 14, 14]} />
          <meshStandardMaterial
            color={theme.ball.color}
            emissive={theme.ball.emissive ?? theme.ball.color}
            emissiveIntensity={theme.ball.emissive ? 1.4 : 0.25}
          />
        </mesh>
      ))}
    </group>
  );
}
