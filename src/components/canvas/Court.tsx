"use client";

import { useMemo } from "react";
import { COURT } from "@/game/dims";
import type { Theme } from "@/game/themes";

const { halfLength, halfWidthDoubles, halfWidthSingles, serviceLineZ, lineWidth } =
  COURT;

// [centerX, centerZ, sizeX, sizeZ]
const LINE_RECTS: [number, number, number, number][] = [
  [0, halfLength, halfWidthDoubles * 2 + lineWidth, lineWidth], // near baseline
  [0, -halfLength, halfWidthDoubles * 2 + lineWidth, lineWidth], // far baseline
  [halfWidthDoubles, 0, lineWidth, halfLength * 2 + lineWidth], // doubles sidelines
  [-halfWidthDoubles, 0, lineWidth, halfLength * 2 + lineWidth],
  [halfWidthSingles, 0, lineWidth, halfLength * 2 + lineWidth], // singles sidelines
  [-halfWidthSingles, 0, lineWidth, halfLength * 2 + lineWidth],
  [0, serviceLineZ, halfWidthSingles * 2, lineWidth], // service lines
  [0, -serviceLineZ, halfWidthSingles * 2, lineWidth],
  [0, 0, lineWidth, serviceLineZ * 2], // center service line
  [0, halfLength - 0.2, lineWidth, 0.4], // center marks
  [0, -halfLength + 0.2, lineWidth, 0.4],
];

function Lines({ theme }: { theme: Theme }) {
  const neon = !!theme.props.neon;
  return (
    <group>
      {LINE_RECTS.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            color={theme.line}
            emissive={neon ? theme.line : "#000000"}
            emissiveIntensity={neon ? 2.2 : 0}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function Net({ theme }: { theme: Theme }) {
  const width = (halfWidthDoubles + COURT.netOverhang) * 2;
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[width, 0.9, 0.02]} />
        <meshStandardMaterial color={theme.net.mesh} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[width, 0.07, 0.035]} />
        <meshStandardMaterial
          color={theme.net.band}
          emissive={theme.props.neon ? theme.net.band : "#000000"}
          emissiveIntensity={theme.props.neon ? 1.6 : 0}
        />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (width / 2 + 0.05), 0.53, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 1.07, 10]} />
          <meshStandardMaterial color={theme.net.post} />
        </mesh>
      ))}
    </group>
  );
}

function Stands({ theme }: { theme: Theme }) {
  // Three raked steps per side + a low wall behind the far court: abstract stadium.
  const steps = [0, 1, 2];
  return (
    <group>
      {[-1, 1].map((side) =>
        steps.map((i) => (
          <mesh
            key={`${side}-${i}`}
            position={[side * (10.5 + i * 1.6), 0.55 + i * 0.85, -2]}
          >
            <boxGeometry args={[1.6, 1.1 + i * 0.6, 30]} />
            <meshStandardMaterial color={theme.stand} roughness={1} />
          </mesh>
        )),
      )}
      <mesh position={[0, 1.1, -halfLength - 5.5]}>
        <boxGeometry args={[34, 2.2, 1.2]} />
        <meshStandardMaterial color={theme.stand} roughness={1} />
      </mesh>
      {theme.props.ivy
        ? [-1, 1].map((side) => (
            <mesh key={side} position={[side * 10.5, 1.35, -2]}>
              <boxGeometry args={[1.7, 0.5, 30.2]} />
              <meshStandardMaterial color="#1e3d24" roughness={1} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function Floodlights({ theme }: { theme: Theme }) {
  const posts: [number, number][] = [
    [-16, 14],
    [16, 14],
    [-16, -16],
    [16, -16],
  ];
  return (
    <group>
      {posts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 5.5, 0]}>
            <cylinderGeometry args={[0.14, 0.2, 11, 8]} />
            <meshStandardMaterial color="#212a3d" />
          </mesh>
          <mesh position={[0, 11.2, 0]}>
            <boxGeometry args={[2.6, 1.1, 0.4]} />
            <meshStandardMaterial
              color="#dfe9ff"
              emissive="#dfe9ff"
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 14, 0]} intensity={220} color={theme.sun.color} />
    </group>
  );
}

function SynthwaveExtras({ theme }: { theme: Theme }) {
  return (
    <group>
      {/* horizon sun */}
      <mesh position={[0, 7, -70]}>
        <circleGeometry args={[16, 48]} />
        <meshBasicMaterial color="#ff4fd8" />
      </mesh>
      <mesh position={[0, 2.5, -69.5]}>
        <boxGeometry args={[40, 0.7, 0.1]} />
        <meshBasicMaterial color={theme.sky} />
      </mesh>
      <mesh position={[0, 5, -69.6]}>
        <boxGeometry args={[40, 0.45, 0.1]} />
        <meshBasicMaterial color={theme.sky} />
      </mesh>
      {/* grid floor beyond the apron */}
      <gridHelper
        args={[240, 120, "#ff4fd8", "#3a1a66"]}
        position={[0, -0.04, 0]}
      />
    </group>
  );
}

export default function Court({ theme }: { theme: Theme }) {
  const neon = !!theme.props.neon;
  const surfaces = useMemo(
    () =>
      [
        // [sizeX, sizeZ, y, color] — ground, apron, playing surface
        [320, 320, -0.06, theme.ground],
        [17.4, 31.2, -0.02, theme.apron],
        [halfWidthDoubles * 2, halfLength * 2, 0, theme.court],
      ] as const,
    [theme],
  );

  return (
    <group>
      {surfaces.map(([w, d, y, color], i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            color={color}
            roughness={1}
            emissive={neon && i === 2 ? color : "#000000"}
            emissiveIntensity={neon && i === 2 ? 0.35 : 0}
          />
        </mesh>
      ))}
      <Lines theme={theme} />
      <Net theme={theme} />
      <Stands theme={theme} />
      {theme.props.floodlights ? <Floodlights theme={theme} /> : null}
      {theme.props.neon ? <SynthwaveExtras theme={theme} /> : null}
    </group>
  );
}
