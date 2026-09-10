import type { SectionId } from "./content";

// Four section-level target boards on the far court, flanking a clear
// center lane so the ball machine stays visible. Hitting a board opens
// that section's match report. (About lives in the nav, not on a board.)

export interface TargetDef {
  id: SectionId;
  label: string;
  pos: [number, number, number]; // board center
}

export const TARGETS: TargetDef[] = [
  { id: "experience", label: "Experience", pos: [-5.1, 1.15, -9.6] },
  { id: "projects", label: "Projects", pos: [-2.5, 1.15, -9.6] },
  { id: "education", label: "Education", pos: [2.5, 1.15, -9.6] },
  { id: "skills", label: "Skills", pos: [5.1, 1.15, -9.6] },
];

export const TARGET_HALF = { x: 0.98, y: 0.58, z: 0.2 }; // hit box half-extents
