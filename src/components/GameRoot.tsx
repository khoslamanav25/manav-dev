"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { bindAudio } from "@/game/audio";
import { queueSwing, setTouchTarget } from "@/game/input";
import { useRef } from "react";
import { useGame, hydrateGameFromStorage } from "@/game/store";
import { TARGETS } from "@/game/targets";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/ui/Hero";
import Panel from "@/components/ui/Panel";
import HelpModal from "@/components/ui/HelpModal";
import Hud from "@/components/ui/Hud";
import { IDENTITY } from "@/game/content";

// The 3D scene is client-only and heavy — load it lazily, never on the server.
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, var(--hero-bg) 0%, var(--accent) 140%)",
      }}
    />
  ),
});

// In-flow score strip (row 2 of the header while playing) — living in the
// header stack means it can never collide with the nav chips.
function ScoreStrip() {
  const score = useGame((s) => s.score);
  const streak = useGame((s) => s.streak);
  const best = useGame((s) => s.best);
  const mode = useGame((s) => s.mode);
  const hitCount = useGame((s) => s.hitTargets.size);

  return (
    <div className="pointer-events-none flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-current/25 bg-[var(--panel-bg)] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-[var(--panel-fg)] shadow-lg sm:gap-x-5 sm:px-6">
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
  );
}

// Client shell that owns the whole interactive site: scene, overlays, panels.
// The 3D canvas itself is added in the next milestone; until then the scene
// area renders a styled placeholder so the shell is fully wired end-to-end.
export default function GameRoot() {
  const phase = useGame((s) => s.phase);
  const drag = useRef<{ x0: number; t0: number; moved: boolean } | null>(null);

  const toCourtX = (clientX: number) =>
    ((clientX / window.innerWidth) - 0.5) * 15;

  const onPointerDown = (e: React.PointerEvent) => {
    if (useGame.getState().phase !== "playing") return;
    drag.current = { x0: e.clientX, t0: performance.now(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    if (Math.abs(e.clientX - drag.current.x0) > 12) drag.current.moved = true;
    if (drag.current.moved) setTouchTarget(toCourtX(e.clientX));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    // quick tap without a drag = swing
    if (!drag.current.moved && performance.now() - drag.current.t0 < 350) queueSwing();
    setTouchTarget(null);
    drag.current = null;
  };
  const theme = useGame((s) => s.theme);
  const leaveCourt = useGame((s) => s.leaveCourt);

  useEffect(() => {
    hydrateGameFromStorage();
    return bindAudio();
  }, []);

  // Reflect theme onto <html> so CSS vars (accent, hero/panel colors) follow.
  useEffect(() => {
    document.documentElement.dataset.mkTheme = theme;
    return () => {
      delete document.documentElement.dataset.mkTheme;
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--hero-bg)] text-[var(--hero-fg)]">
      {/* 3D scene layer; pointer = drag to run, tap to swing */}
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Scene />
      </div>

      {/* Top chrome: row 1 = monogram + nav, row 2 = score strip (in flow,
          so the two can never overlap at any width) */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col p-4 sm:p-6 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="pointer-events-auto shrink-0">
            <div className="scorebug flex items-stretch overflow-hidden font-mono text-[11px] uppercase tracking-[0.15em]">
              <span className="flex items-center bg-[var(--accent)] px-3 font-bold text-[var(--hero-bg)]">
                MK
              </span>
              {phase === "playing" ? (
                <button
                  onClick={leaveCourt}
                  className="cursor-pointer px-3.5 py-2 opacity-80 transition hover:bg-[var(--accent)]/20 hover:opacity-100"
                >
                  ← exit rally
                </button>
              ) : (
                <span className="hidden items-center px-3.5 py-2 opacity-80 sm:flex">
                  {IDENTITY.name}
                </span>
              )}
            </div>
          </div>
          <Nav />
        </div>
        {phase === "playing" ? (
          <div className="mt-2 flex justify-center">
            <ScoreStrip />
          </div>
        ) : null}
      </header>

      {phase === "hero" ? <Hero /> : null}
      <Hud />
      <HelpModal />
      <Panel />
    </div>
  );
}
