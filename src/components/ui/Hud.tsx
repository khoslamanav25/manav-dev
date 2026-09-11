"use client";

import { useGame } from "@/game/store";
import { THEMES } from "@/game/themes";

// Game chrome: controls hint + mode/mute/theme/reset cluster. The score strip
// lives in the GameRoot header stack so it can't collide with the nav.
export default function Hud() {
  const phase = useGame((s) => s.phase);
  const panelOpen = useGame((s) => s.panel !== null);
  const theme = useGame((s) => s.theme);
  const cycleTheme = useGame((s) => s.cycleTheme);
  const mode = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  const resetGame = useGame((s) => s.resetGame);
  const muted = useGame((s) => s.muted);
  const toggleMuted = useGame((s) => s.toggleMuted);

  const chip =
    "pointer-events-auto rounded-full border border-current/25 bg-[var(--panel-bg)] text-[var(--panel-fg)] shadow-lg";

  if (panelOpen) return null;

  return (
    <>
      {phase === "playing" ? (
        /* controls hint: keyboard for fine pointers, touch for coarse ones;
           sits above the bottom-right cluster on phones so they never overlap */
        <div
          className={`pointer-events-none absolute bottom-16 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] opacity-90 sm:bottom-6 sm:px-5 ${chip}`}
        >
          <span className="fine-only">A / D move · Space swing · Shift sprint</span>
          <span className="touch-only">drag to run · tap to swing</span>
        </div>
      ) : null}

      <div className="absolute bottom-4 right-3 z-30 flex flex-wrap items-center justify-end gap-2 sm:bottom-6 sm:right-6 sm:gap-2.5">
        {phase === "playing" ? (
          <>
            <div
              className={`flex overflow-hidden rounded-full font-mono text-[11px] uppercase tracking-[0.15em] ${chip}`}
            >
              {(["easy", "pro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 transition sm:px-4 ${
                    mode === m
                      ? "bg-[var(--panel-fg)] font-bold text-[var(--panel-bg)]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={resetGame}
              title="Reset the rally"
              className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition hover:scale-105 active:scale-95 sm:px-4 ${chip}`}
            >
              ↺ reset
            </button>
          </>
        ) : null}
        <button
          onClick={toggleMuted}
          title={muted ? "Enable sound" : "Mute"}
          aria-label={muted ? "Enable sound" : "Mute"}
          className={`px-2.5 py-2 font-mono text-[13px] transition hover:scale-105 active:scale-95 sm:px-3.5 ${chip}`}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          onClick={cycleTheme}
          title="Switch court"
          className={`px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition hover:scale-105 active:scale-95 sm:px-4 ${chip}`}
        >
          {THEMES[theme].emoji} {THEMES[theme].label}
        </button>
      </div>
    </>
  );
}
