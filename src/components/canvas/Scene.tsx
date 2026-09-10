"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useGame } from "@/game/store";
import { THEMES } from "@/game/themes";
import Court from "./Court";
import GameEngine from "./GameEngine";
import Targets from "./Targets";
import Effects from "./Effects";
import CameraRig from "./CameraRig";

// R3F canvas root. Mounted client-only (dynamic import in GameRoot).
export default function Scene() {
  const themeId = useGame((s) => s.theme);
  const theme = THEMES[themeId];

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 50, near: 0.1, far: 260, position: [15, 8.5, 24] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.fog.color, theme.fog.near, theme.fog.far]} />

      <ambientLight color={theme.ambient.color} intensity={theme.ambient.intensity} />
      <directionalLight
        color={theme.sun.color}
        intensity={theme.sun.intensity}
        position={theme.sun.position}
      />

      <CameraRig />
      <Court theme={theme} />
      <GameEngine theme={theme} />
      <Targets theme={theme} />
      <Effects theme={theme} />

      {theme.props.stars ? (
        <Stars radius={130} depth={40} count={2400} factor={4} fade speed={0.6} />
      ) : null}

      {theme.bloom ? (
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.32} mipmapBlur />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
