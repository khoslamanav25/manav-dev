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

  back.forEach((t, i) => {
    const x = -4.6 + (9.2 / (back.length - 1)) * i;
    defs.push({
      itemId: t.id,
      section: t.section,
      label: SHORT_LABELS[t.id] ?? t.id,
      pos: [x, 1.05, -10.6],
    });
  });
  front.forEach((t, i) => {
    const x = -2.6 + (5.2 / Math.max(front.length - 1, 1)) * i;
    defs.push({
      itemId: t.id,
      section: t.section,
      label: SHORT_LABELS[t.id] ?? t.id,
      pos: [x, 0.95, -7.6],
    });
  });
  return defs;
}

export const TARGETS: TargetDef[] = layout();

export const TARGET_HALF = { x: 0.62, y: 0.42, z: 0.18 }; // hit box half-extents
