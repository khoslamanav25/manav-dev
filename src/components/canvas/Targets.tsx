"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { TARGETS, TARGET_HALF } from "@/game/targets";
import { useGame } from "@/game/store";
import type { Theme } from "@/game/themes";

function Board({
  itemId,
  label,
  pos,
  theme,
}: {
  itemId: string;
  label: string;
  pos: [number, number, number];
  theme: Theme;
}) {
  const visited = useGame((s) => s.hitTargets.has(itemId));
  const aimed = useGame((s) => s.aimTargetId === itemId);
  const face = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (face.current) {
      const pulse = aimed ? 0.75 + Math.sin(clock.elapsedTime * 6) * 0.35 : visited ? 0.06 : 0.22;
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
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.235}
        color={visited ? "#8b93a3" : "#f4f6fb"}
        anchorX="center"
        anchorY="middle"
        maxWidth={TARGET_HALF.x * 2 - 0.1}
      >
        {label}
      </Text>
      {visited ? (
        <Text position={[0.42, 0.26, 0.061]} fontSize={0.16} color="#7de29a" anchorX="center">
          ✓
        </Text>
      ) : null}
    </group>
  );
}

export default function Targets({ theme }: { theme: Theme }) {
  return (
    <group>
      {TARGETS.map((t) => (
        <Board key={t.itemId} itemId={t.itemId} label={t.label} pos={t.pos} theme={theme} />
      ))}
    </group>
  );
}
