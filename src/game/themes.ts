import type { ThemeId } from "./store";

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  // world
  sky: string; // scene background
  fog: { color: string; near: number; far: number };
  ground: string; // terrain outside the court apron
  apron: string; // painted area around the playing lines
  court: string; // inside the lines
  line: string;
  net: { mesh: string; band: string; post: string };
  stand: string; // stadium/stand structures
  // lighting
  ambient: { color: string; intensity: number };
  sun: { color: string; intensity: number; position: [number, number, number] };
  // flourishes
  props: {
    floodlights?: boolean; // US Open night session
    ivy?: boolean; // Wimbledon
    dust?: boolean; // clay bounce puffs
    neon?: boolean; // synthwave emissive lines + grid horizon
    stars?: boolean;
  };
  ball: { color: string; emissive?: string; trail: string };
  crowd: string[]; // spectator palette
  bloom: boolean;
}

export const THEMES: Record<ThemeId, Theme> = {
  usopen: {
    id: "usopen",
    label: "US Open",
    emoji: "🌃",
    sky: "#0b1226",
    fog: { color: "#0b1226", near: 30, far: 95 },
    ground: "#101a30",
    apron: "#1d4f43",
    court: "#2e6bc4",
    line: "#f4f6fb",
    net: { mesh: "#1c2434", band: "#e8ecf4", post: "#0f1420" },
    stand: "#151d31",
    ambient: { color: "#8fa7d9", intensity: 0.9 },
    sun: { color: "#cfe0ff", intensity: 2.6, position: [14, 22, 10] },
    props: { floodlights: true, stars: true },
    ball: { color: "#d9f24b", trail: "#d9f24b" },
    crowd: ["#e8ecf4", "#7ab4ff", "#d94f5c", "#f2c14e", "#9aa7c4"],
    bloom: false,
  },
  wimbledon: {
    id: "wimbledon",
    label: "Wimbledon",
    emoji: "🌱",
    sky: "#bcd6ea",
    fog: { color: "#c8dcea", near: 35, far: 110 },
    ground: "#4d7c44",
    apron: "#3f6d3c",
    court: "#4f8a4a",
    line: "#f6f3e6",
    net: { mesh: "#2f3a2e", band: "#f6f3e6", post: "#2a332a" },
    stand: "#274d33",
    ambient: { color: "#dcecd9", intensity: 0.75 },
    sun: { color: "#fff4d6", intensity: 2.4, position: [-16, 26, 14] },
    props: { ivy: true },
    ball: { color: "#e8f24b", trail: "#f6f3e6" },
    crowd: ["#f6f3e6", "#a3c585", "#d9a441", "#7c9ec9", "#c98d8d"],
    bloom: false,
  },
  clay: {
    id: "clay",
    label: "Clay",
    emoji: "🧱",
    sky: "#e8c9a8",
    fog: { color: "#e3bd96", near: 32, far: 100 },
    ground: "#8a4a2e",
    apron: "#9c5330",
    court: "#b45f33",
    line: "#f2e6d4",
    net: { mesh: "#3a2c22", band: "#f2e6d4", post: "#2e241c" },
    stand: "#6e3a24",
    ambient: { color: "#ffd9b0", intensity: 0.7 },
    sun: { color: "#ffe3bd", intensity: 2.3, position: [18, 20, -8] },
    props: { dust: true },
    ball: { color: "#e8f24b", trail: "#f2e6d4" },
    crowd: ["#f2e6d4", "#d97941", "#8c5e3c", "#e8c14e", "#6e8fb3"],
    bloom: false,
  },
  synthwave: {
    id: "synthwave",
    label: "Synthwave",
    emoji: "🌆",
    sky: "#0d0418",
    fog: { color: "#150726", near: 26, far: 85 },
    ground: "#0d0418",
    apron: "#160a2a",
    court: "#1d0f38",
    line: "#ff4fd8",
    net: { mesh: "#120b22", band: "#4bf2e8", post: "#0d0418" },
    stand: "#170b2c",
    ambient: { color: "#7a4fff", intensity: 0.85 },
    sun: { color: "#ff4fd8", intensity: 1.4, position: [0, 24, -30] },
    props: { neon: true, stars: true },
    ball: { color: "#4bf2e8", emissive: "#4bf2e8", trail: "#ff4fd8" },
    crowd: ["#ff4fd8", "#4bf2e8", "#9d5cff", "#ff8a5c", "#f4f6fb"],
    bloom: true,
  },
};
