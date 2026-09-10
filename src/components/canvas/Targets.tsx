"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TARGETS, TARGET_HALF } from "@/game/targets";
import { useGame } from "@/game/store";
import type { SectionId } from "@/game/content";
import type { Theme } from "@/game/themes";

// Board labels are drawn to canvas textures synchronously — no font fetch,
// nothing suspends (drei's <Text> suspends on a remote font load, which
// blanked the whole scene).

function makeLabelTexture(label: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 84;
  g.font = `800 ${size}px ui-monospace, Menlo, monospace`;
  while (g.measureText(label.toUpperCase()).width > c.width - 60 && size > 30) {
    size -= 6;
    g.font = `800 ${size}px ui-monospace, Menlo, monospace`;
  }
  g.fillText(label.toUpperCase(), c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Board({
  id,
  label,
  pos,
  theme,
}: {
  id: SectionId;
  label: string;
  pos: [number, number, number];
  theme: Theme;
}) {
  const visited = useGame((s) => s.hitTargets.has(id));
  const aimed = useGame((s) => s.aimTargetId === id);
  const face = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const labelTex = useMemo(() => makeLabelTexture(label), [label]);

  useFrame(({ clock }) => {
    if (face.current) {
      const pulse = aimed
        ? 0.75 + Math.sin(clock.elapsedTime * 6) * 0.35
        : visited
          ? 0.06
          : 0.22;
      face.current.emissiveIntensity = pulse;
    }
    if (group.current) {
      const target = aimed ? 1.08 : 1;
      group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, target, 0.15);
      group.current.scale.y = group.current.scale.x;
      group.current.scale.z = group.current.scale.x;
    }
  });

  const accent = theme.props.neon ? theme.line : theme.ball.color;

  return (
    <group ref={group} position={pos}>
      {/* post */}
      <mesh position={[0, -(pos[1] - 0.25) / 2 - 0.25 + 0.02, 0]}>
        <cylinderGeometry args={[0.04, 0.05, pos[1] - 0.21, 8]} />
        <meshStandardMaterial color="#20242e" />
      </mesh>
      {/* board */}
      <mesh>
        <boxGeometry args={[TARGET_HALF.x * 2, TARGET_HALF.y * 2, 0.09]} />
        <meshStandardMaterial
          ref={face}
          color={visited ? "#3a3f4a" : "#171b24"}
          emissive={accent}
          emissiveIntensity={0.22}
        />
      </mesh>
      {/* frame */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[TARGET_HALF.x * 2 + 0.1, TARGET_HALF.y * 2 + 0.1, 0.07]} />
        <meshStandardMaterial color={visited ? "#2a2e38" : accent} />
      </mesh>
      {/* label */}
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[TARGET_HALF.x * 2 - 0.08, (TARGET_HALF.x * 2 - 0.08) * 0.375]} />
        <meshBasicMaterial
          map={labelTex}
          transparent
          color={visited ? "#8b93a3" : "#ffffff"}
          toneMapped={false}
        />
      </mesh>
      {/* visited badge */}
      {visited ? (
        <mesh position={[TARGET_HALF.x - 0.1, TARGET_HALF.y - 0.1, 0.06]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color="#7de29a" toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export default function Targets({ theme }: { theme: Theme }) {
  return (
    <group>
      {TARGETS.map((t) => (
        <Board key={t.id} id={t.id} label={t.label} pos={t.pos} theme={theme} />
      ))}
    </group>
  );
}
