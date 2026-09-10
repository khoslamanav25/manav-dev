"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { bindAudio } from "@/game/audio";
import { useGame, hydrateGameFromStorage } from "@/game/store";
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

// Client shell that owns the whole interactive site: scene, overlays, panels.
// The 3D canvas itself is added in the next milestone; until then the scene
// area renders a styled placeholder so the shell is fully wired end-to-end.
export default function GameRoot() {
  const phase = useGame((s) => s.phase);
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
      {/* 3D scene layer */}
      <Scene />

      {/* Top chrome */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-6 sm:px-10">
        <div className="pointer-events-auto">
          <div className="scorebug flex items-stretch overflow-hidden font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="flex items-center bg-[var(--accent)] px-3 font-bold text-[var(--hero-bg)]">
              MK
            </span>
            {phase === "playing" ? (
              <button
                onClick={leaveCourt}
                className="px-3.5 py-2 opacity-80 transition hover:bg-[var(--accent)]/20 hover:opacity-100"
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
      </header>

      {phase === "hero" ? <Hero /> : null}
      <Hud />
      <HelpModal />
      <Panel />
    </div>
  );
}
