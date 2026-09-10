import { SECTIONS, type SectionId } from "./content";

// Target boards standing on the far court. One board per content item,
// clustered by section. Positions are in court coordinates (see dims.ts).

export interface TargetDef {
  itemId: string;
  section: SectionId;
  label: string; // short text that fits on a board
  pos: [number, number, number]; // board center
}

const SHORT_LABELS: Record<string, string> = {
  autositu: "AutoSitu",
  "blue-origin": "Blue Origin",
  "circular-action": "Circular",
  "recognition-robotics": "Robotics",
  riteoff: "Riteoff",
  "vision-localization": "Vision",
  "gunshot-detection": "Gunshot",
  umich: "Michigan",
  languages: "Skills",
  "about-me": "About",
};

// Two rows on the far court: back row (experience + projects), front row (rest).
// Kept inside the singles lines so every board is reachable over the net.
function layout(): TargetDef[] {
  const defs: TargetDef[] = [];
  const back: { id: string; section: SectionId }[] = [];
  const front: { id: string; section: SectionId }[] = [];

  for (const s of SECTIONS) {
    for (const item of s.items) {
      if (item.id === "technologies") continue; // one Skills board is enough
      (s.id === "experience" || s.id === "projects" ? back : front).push({
        id: item.id,
        section: s.id,
      });
    }
  }

  // Keep a clear center lane (|x| < ~1.5) so the launcher stays visible and
  // its feeds fly through the gap rather than out of a wall of boards.
  const BACK_X = [-5.6, -4.1, -2.6, 2.6, 4.1, 5.6];
  const FRONT_X = [-4.4, -2.4, 2.4, 4.4];
  const slots = [
    ...BACK_X.map((x) => ({ x, z: -10.6, y: 1.05 })),
    ...FRONT_X.map((x) => ({ x, z: -7.8, y: 0.95 })),
  ];
  [...back, ...front].forEach((t, i) => {
    const s = slots[i];
    defs.push({
      itemId: t.id,
      section: t.section,
      label: SHORT_LABELS[t.id] ?? t.id,
      pos: [s.x, s.y, s.z],
    });
  });
  return defs;
}

export const TARGETS: TargetDef[] = layout();

export const TARGET_HALF = { x: 0.62, y: 0.42, z: 0.18 }; // hit box half-extents
