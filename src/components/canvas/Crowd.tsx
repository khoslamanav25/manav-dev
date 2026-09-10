"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Theme } from "@/game/themes";

// Rocket League-style spectators: little egg-people in the stands, each
// bouncing on its own phase. One instanced mesh, cheap to animate.

interface Spectator {
  x: number;
  y0: number;
  z: number;
  phase: number;
  speed: number;
  amp: number;
  scale: number;
}

const dummy = new THREE.Object3D();

function buildCrowd(): Spectator[] {
  const rng = mulberry32(20260910);
  const list: Spectator[] = [];
  const spot = (x: number, y0: number, z: number) =>
    list.push({
      x: x + (rng() - 0.5) * 0.5,
      y0,
      z: z + (rng() - 0.5) * 0.4,
      phase: rng() * Math.PI * 2,
      speed: 1.6 + rng() * 2.4,
      // about a third of the crowd sits nearly still; the rest bounce
      amp: rng() < 0.35 ? 0.04 : 0.12 + rng() * 0.3,
      scale: 0.85 + rng() * 0.4,
    });

  // side stands: three raked steps per side (mirrors Stands() in Court.tsx)
  for (const side of [-1, 1]) {
    for (let step = 0; step < 3; step++) {
      const x = side * (10.5 + step * 1.6);
      const top = 0.55 + step * 0.85 + (1.1 + step * 0.6) / 2;
      for (let k = 0; k < 16; k++) {
        const z = -16 + (k / 15) * 28;
        if (rng() < 0.82) spot(x, top + 0.22, z);
      }
    }
  }
  // back wall behind the far court
  for (let k = 0; k < 18; k++) {
    const x = -15 + (k / 17) * 30;
    if (rng() < 0.8) spot(x, 2.2 + 1.1 + 0.22 - 1.1, -17.4); // wall top ≈ 2.2
  }
  return list;
}

// deterministic layout so the crowd doesn't reshuffle on theme change
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Crowd({ theme }: { theme: Theme }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const crowd = useMemo(() => buildCrowd(), []);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // per-instance colors from the theme palette
  useEffect(() => {
    if (!mesh.current) return;
    const rng = mulberry32(7);
    const c = new THREE.Color();
    for (let i = 0; i < crowd.length; i++) {
      c.set(theme.crowd[Math.floor(rng() * theme.crowd.length)]);
      mesh.current.setColorAt(i, c);
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [theme, crowd]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < crowd.length; i++) {
      const s = crowd[i];
      const bounce = reduced ? 0 : Math.abs(Math.sin(s.phase + t * s.speed)) * s.amp;
      dummy.position.set(s.x, s.y0 + bounce, s.z);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, crowd.length]}>
      <capsuleGeometry args={[0.16, 0.18, 4, 8]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}
