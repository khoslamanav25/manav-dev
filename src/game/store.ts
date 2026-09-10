import { create } from "zustand";
import type { SectionId } from "./content";

export type ThemeId = "usopen" | "wimbledon" | "clay" | "synthwave";
export type GameMode = "easy" | "pro";
export type GamePhase = "hero" | "playing";

export interface PanelTarget {
  section: SectionId;
  itemId?: string; // scroll/highlight a specific item when opened via a target hit
}

interface GameState {
  phase: GamePhase;
  theme: ThemeId;
  mode: GameMode;
  score: number;
  streak: number;
  best: number;
  muted: boolean;
  panel: PanelTarget | null;
  hitTargets: Set<string>; // item ids already smashed
  helpSeen: boolean;

  enterCourt: () => void;
  leaveCourt: () => void;
  setTheme: (t: ThemeId) => void;
  cycleTheme: () => void;
  setMode: (m: GameMode) => void;
  toggleMuted: () => void;
  openPanel: (p: PanelTarget) => void;
  closePanel: () => void;
  registerHit: (itemId: string, points: number) => void;
  registerMiss: () => void;
  markHelpSeen: () => void;
}

const THEME_ORDER: ThemeId[] = ["usopen", "wimbledon", "clay", "synthwave"];

// localStorage can throw (private mode, blocked storage) — never let that break the game.
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const useGame = create<GameState>((set, get) => ({
  phase: "hero",
  theme: "usopen",
  mode: "easy",
  score: 0,
  streak: 0,
  best: 0,
  muted: true,
  panel: null,
  hitTargets: new Set(),
  helpSeen: false,

  enterCourt: () => set({ phase: "playing" }),
  leaveCourt: () => set({ phase: "hero", panel: null }),

  setTheme: (theme) => {
    safeSet("mk-theme", theme);
    set({ theme });
  },
  cycleTheme: () => {
    const next =
      THEME_ORDER[(THEME_ORDER.indexOf(get().theme) + 1) % THEME_ORDER.length];
    get().setTheme(next);
  },
  setMode: (mode) => set({ mode }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),

  registerHit: (itemId, points) =>
    set((s) => {
      const streak = s.streak + 1;
      const score = s.score + points * (s.mode === "pro" ? Math.min(streak, 5) : 1);
      const best = Math.max(s.best, score);
      safeSet("mk-best", String(best));
      const hitTargets = new Set(s.hitTargets);
      hitTargets.add(itemId);
      return { score, streak, best, hitTargets };
    }),
  registerMiss: () => set({ streak: 0 }),
  markHelpSeen: () => set({ helpSeen: true }),
}));

// Hydrate persisted bits on the client after mount (avoids SSR/localStorage mismatch).
export function hydrateGameFromStorage() {
  const theme = safeGet("mk-theme") as ThemeId | null;
  const best = Number(safeGet("mk-best") ?? 0);
  useGame.setState({
    ...(theme && THEME_ORDER.includes(theme) ? { theme } : {}),
    ...(Number.isFinite(best) && best > 0 ? { best } : {}),
  });
}
