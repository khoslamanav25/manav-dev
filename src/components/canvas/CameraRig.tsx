"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/game/store";

const HERO_POS = new THREE.Vector3(-8.2, 2.6, 16.8);
const HERO_TARGET = new THREE.Vector3(1.8, 0.9, -7);
const PLAY_POS = new THREE.Vector3(0, 7.0, 21.8);
const PLAY_TARGET = new THREE.Vector3(0, 0.6, -3);
// three.js cameras are mutable scene objects; retuning projection per
// aspect ratio is the supported pattern.
function syncFov(cam: THREE.PerspectiveCamera, fov: number) {
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
}

// Portrait phones crop the court hard at fov 50 — pull back, rise, widen.
const PLAY_POS_PORTRAIT = new THREE.Vector3(0, 9.0, 26.5);
const HERO_POS_PORTRAIT = new THREE.Vector3(-5.8, 3.4, 20.5);

// Smoothly moves the camera between the hero overview and the behind-player
// gameplay framing; adds a gentle idle drift in hero mode.
export default function CameraRig() {
  const phase = useGame((s) => s.phase);
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3().copy(HERO_TARGET));
  const t = useRef(0);

  const portrait = size.width / size.height < 0.9;

  useFrame((_, delta) => {
    syncFov(camera as THREE.PerspectiveCamera, portrait ? 62 : 50);
    t.current += delta;
    const playing = phase === "playing";
    const desired = playing
      ? (portrait ? PLAY_POS_PORTRAIT : PLAY_POS)
      : (portrait ? HERO_POS_PORTRAIT : HERO_POS).clone()
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
