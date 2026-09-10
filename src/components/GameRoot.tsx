"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useGame, hydrateGameFromStorage } from "@/game/store";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/ui/Hero";
import Panel from "@/components/ui/Panel";
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
          {phase === "playing" ? (
            <button
              onClick={leaveCourt}
              className="rounded-full border border-current/30 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] opacity-80 transition hover:opacity-100"
            >
              leave court
            </button>
          ) : (
            <div className="font-mono text-xs uppercase tracking-[0.2em]">
              <span className="font-bold">{IDENTITY.name}</span>
              <span className="ml-3 hidden opacity-60 sm:inline">
                {IDENTITY.tagline}
              </span>
            </div>
          )}
        </div>
        <Nav />
      </header>

      {phase === "hero" ? <Hero /> : null}
      <Hud />
      <Panel />
    </div>
  );
}
