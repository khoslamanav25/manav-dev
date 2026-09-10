"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/game/store";

const HERO_POS = new THREE.Vector3(-13.5, 2.1, 9.5);
const HERO_TARGET = new THREE.Vector3(2.5, 1.0, -5);
const PLAY_POS = new THREE.Vector3(0, 7.0, 21.8);
const PLAY_TARGET = new THREE.Vector3(0, 0.6, -3);

// Smoothly moves the camera between the hero overview and the behind-player
// gameplay framing; adds a gentle idle drift in hero mode.
export default function CameraRig() {
  const phase = useGame((s) => s.phase);
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3().copy(HERO_TARGET));
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const playing = phase === "playing";
    const desired = playing
      ? PLAY_POS
      : HERO_POS.clone()
          .add(
            new THREE.Vector3(
              Math.sin(t.current * 0.1) * 0.9,
              Math.sin(t.current * 0.07) * 0.25,
              Math.sin(t.current * 0.05) * 2.4, // slow courtside dolly
            ),
          );
    const desiredTarget = playing ? PLAY_TARGET : HERO_TARGET;

    const k = 1 - Math.exp(-delta * 2.2); // framerate-independent damping
    camera.position.lerp(desired, k);
    target.current.lerp(desiredTarget, k);
    camera.lookAt(target.current);
  });

  return null;
}
