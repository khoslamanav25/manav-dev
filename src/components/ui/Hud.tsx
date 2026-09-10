"use client";

import { useGame } from "@/game/store";
import { THEMES } from "@/game/themes";
import { TARGETS } from "@/game/targets";

// Game chrome: score/streak, progress, mode + theme controls.
export default function Hud() {
  const phase = useGame((s) => s.phase);
  const theme = useGame((s) => s.theme);
  const cycleTheme = useGame((s) => s.cycleTheme);
  const mode = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  const score = useGame((s) => s.score);
  const streak = useGame((s) => s.streak);
  const best = useGame((s) => s.best);
  const hitCount = useGame((s) => s.hitTargets.size);

  const chip =
    "pointer-events-auto rounded-full border border-current/25 bg-[var(--panel-bg)] text-[var(--panel-fg)] shadow-lg";

  return (
    <>
      {phase === "playing" ? (
        <>
          {/* score strip */}
          <div
            className={`pointer-events-none absolute left-1/2 top-6 z-30 flex -translate-x-1/2 items-center gap-5 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.15em] ${chip}`}
          >
            <span>
              score <span className="font-bold">{score}</span>
            </span>
            <span className={streak >= 3 ? "text-[var(--accent)]" : ""}>
              streak <span className="font-bold">{streak}</span>
              {mode === "pro" && streak >= 2 ? (
                <span className="font-bold"> ×{Math.min(streak, 5)}</span>
              ) : null}
            </span>
            {best > 0 ? (
              <span className="opacity-70">
                best <span className="font-bold">{best}</span>
              </span>
            ) : null}
            <span className="opacity-70">
              targets{" "}
              <span className="font-bold">
                {hitCount}/{TARGETS.length}
              </span>
            </span>
          </div>

          {/* controls hint */}
          <div
            className={`pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] opacity-90 ${chip}`}
          >
            A / D move · Space swing · Shift sprint
          </div>
        </>
      ) : null}

      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2.5">
        {phase === "playing" ? (
          <div className={`flex overflow-hidden rounded-full font-mono text-[11px] uppercase tracking-[0.15em] ${chip}`}>
            {(["easy", "pro"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 transition ${
                  mode === m
                    ? "bg-[var(--panel-fg)] font-bold text-[var(--panel-bg)]"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        ) : null}
        <button
          onClick={cycleTheme}
          title="Switch court"
          className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition hover:scale-105 active:scale-95 ${chip}`}
        >
          {THEMES[theme].emoji} {THEMES[theme].label}
        </button>
      </div>
    </>
  );
}
