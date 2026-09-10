import * as THREE from "three";
import { COURT, GRAVITY } from "./dims";

export type BallPhase = "incoming" | "returning" | "dead";

export interface BallSim {
  id: number;
  phase: BallPhase;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: number; // cosmetic roll
  bounces: number;
  age: number;
  targetId: string | null; // aim-assisted destination (returning balls)
}

export const BALL_RADIUS = 0.17; // oversized for game readability

const RESTITUTION = 0.68;
const FRICTION = 0.78;

/**
 * Advance one ball by dt seconds. Mutates in place.
 * Handles gravity, ground bounce, and a crude net block at z=0.
 */
export function stepBall(b: BallSim, dt: number) {
  if (b.phase === "dead") return;
  b.age += dt;

  const prevZ = b.pos.z;
  b.vel.y += GRAVITY * dt;
  b.pos.addScaledVector(b.vel, dt);

  // Ground bounce
  if (b.pos.y < BALL_RADIUS && b.vel.y < 0) {
    b.pos.y = BALL_RADIUS;
    b.vel.y *= -RESTITUTION;
    b.vel.x *= FRICTION;
    b.vel.z *= FRICTION;
    b.bounces += 1;
    if (Math.abs(b.vel.y) < 0.9) b.vel.y = 0;
  }

  // Net block: crossing the z=0 plane below net height kills the shot.
  if (prevZ !== b.pos.z && Math.sign(prevZ) !== Math.sign(b.pos.z)) {
    const t = Math.abs(prevZ) / Math.abs(b.pos.z - prevZ);
    const yAtNet = b.pos.y - b.vel.y * dt * (1 - t); // approximation is fine here
    const xAtNet = b.pos.x - b.vel.x * dt * (1 - t);
    const withinNet =
      Math.abs(xAtNet) < COURT.halfWidthDoubles + COURT.netOverhang;
    if (withinNet && yAtNet < COURT.netHeightCenter + 0.02) {
      b.pos.z = Math.sign(prevZ) * 0.06;
      b.vel.set(b.vel.x * 0.1, Math.min(b.vel.y, 0.5), -Math.sign(prevZ) * 0.4);
      b.bounces += 1;
    }
  }

  // Retire balls that stop moving or leave the world
  const speed = b.vel.length();
  if (
    b.age > 12 ||
    b.pos.y < -2 ||
    Math.abs(b.pos.z) > 40 ||
    Math.abs(b.pos.x) > 40 ||
    (speed < 0.35 && b.pos.y <= BALL_RADIUS + 0.01)
  ) {
    b.phase = "dead";
  }
}

/**
 * Solve the initial velocity for a ballistic arc from `from` to `to` in T seconds.
 */
export function solveArc(
  from: THREE.Vector3,
  to: THREE.Vector3,
  T: number,
): THREE.Vector3 {
  return new THREE.Vector3(
    (to.x - from.x) / T,
    (to.y - from.y) / T - 0.5 * GRAVITY * T,
    (to.z - from.z) / T,
  );
}

/**
 * Pick a flight time that clears the net comfortably for a given arc length.
 * Longer shots get a bit more air.
 */
export function flightTime(from: THREE.Vector3, to: THREE.Vector3, pace = 1) {
  const dist = from.distanceTo(to);
  return THREE.MathUtils.clamp((0.72 + dist * 0.038) / pace, 0.7, 2.2);
}
