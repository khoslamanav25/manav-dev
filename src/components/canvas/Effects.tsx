"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { onGameEvent } from "@/game/events";
import type { Theme } from "@/game/themes";

// One pooled instanced-mesh particle system for everything: hit bursts,
// clay dust, ball trails, and streak fireworks.

const MAX = 320;
const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

interface Particle {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  gravity: number;
  color: THREE.Color;
}

const pool: Particle[] = Array.from({ length: MAX }, () => ({
  alive: false,
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  life: 0,
  maxLife: 1,
  size: 0.06,
  gravity: 0,
  color: new THREE.Color(),
}));
let cursor = 0;

export default function Effects({ theme }: { theme: Theme }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const spawn = (
      n: number,
      at: [number, number, number],
      opts: {
        color: string | string[];
        speed?: number;
        up?: number;
        life?: number;
        size?: number;
        gravity?: number;
      },
    ) => {
      for (let i = 0; i < n; i++) {
        const p = pool[cursor];
        cursor = (cursor + 1) % MAX;
        p.alive = true;
        p.pos.set(at[0], at[1], at[2]);
        const sp = (opts.speed ?? 3) * (0.4 + Math.random() * 0.8);
        p.vel
          .set(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5)
          .normalize()
          .multiplyScalar(sp);
        p.vel.y += opts.up ?? 0;
        p.life = 0;
        p.maxLife = (opts.life ?? 0.6) * (0.7 + Math.random() * 0.6);
        p.size = (opts.size ?? 0.07) * (0.7 + Math.random() * 0.7);
        p.gravity = opts.gravity ?? -6;
        const c = Array.isArray(opts.color)
          ? opts.color[Math.floor(Math.random() * opts.color.length)]
          : opts.color;
        p.color.set(c);
      }
    };

    return onGameEvent((e) => {
      const th = themeRef.current;
      const scale = reduced ? 0.3 : 1;
      switch (e.type) {
        case "pop":
          spawn(Math.round(8 * scale), [e.x, e.y, e.z], { color: th.ball.color, speed: 2.5, life: 0.4 });
          break;
        case "bounce":
          if (th.props.dust)
            spawn(Math.round(7 * scale), [e.x, 0.06, e.z], {
              color: "#d9a06b", speed: 1.1, up: 0.7, life: 0.7, size: 0.09, gravity: -1.5,
            });
          break;
        case "targetHit":
          spawn(Math.round(26 * scale), [e.x, e.y, e.z], {
            color: [th.ball.color, "#ffffff", th.line], speed: 4.5, life: 0.7, size: 0.08,
          });
          break;
        case "trail":
          spawn(1, [e.x, e.y, e.z], {
            color: th.ball.trail, speed: 0.01, life: 0.32, size: 0.05, gravity: 0,
          });
          break;
        case "launcherHit":
          spawn(Math.round(22 * scale), [0, 1, -13], {
            color: ["#ffb84d", "#ff6b4d", "#ffffff"], speed: 4, life: 0.8,
          });
          break;
        case "streak": {
          // fireworks over the far stands
          for (let k = 0; k < 4; k++) {
            const at: [number, number, number] = [
              -8 + Math.random() * 16, 7 + Math.random() * 4, -18 - Math.random() * 4,
            ];
            setTimeout(
              () =>
                spawn(Math.round(30 * scale), at, {
                  color: themeRef.current.crowd, speed: 5, life: 1.1, size: 0.1, gravity: -2.5,
                }),
              k * 260,
            );
          }
          break;
        }
      }
    });
  }, [reduced]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < MAX; i++) {
      const p = pool[i];
      if (p.alive) {
        p.life += dt;
        if (p.life >= p.maxLife) p.alive = false;
        p.vel.y += p.gravity * dt;
        p.pos.addScaledVector(p.vel, dt);
      }
      const k = p.alive ? 1 - p.life / p.maxLife : 0;
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.alive ? p.size * (0.5 + k) : 0.0001);
      dummy.rotation.set(p.life * 7, p.life * 5, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      tmpColor.copy(p.color).multiplyScalar(p.alive ? 0.4 + k : 0);
      m.setColorAt(i, tmpColor);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
