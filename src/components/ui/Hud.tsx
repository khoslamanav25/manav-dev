"use client";

import { useGame } from "@/game/store";
import { THEMES } from "@/game/themes";

// Bottom-right chrome: theme switcher now; score/mode/mute join in later milestones.
export default function Hud() {
  const theme = useGame((s) => s.theme);
  const cycleTheme = useGame((s) => s.cycleTheme);

  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-30 flex items-center gap-3">
      <button
        onClick={cycleTheme}
        title="Switch court"
        className="pointer-events-auto rounded-full border border-current/25 bg-[var(--panel-bg)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--panel-fg)] shadow-lg transition hover:scale-105 active:scale-95"
      >
        {THEMES[theme].emoji} {THEMES[theme].label}
      </button>
    </div>
  );
}
