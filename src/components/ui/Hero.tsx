"use client";

import { IDENTITY } from "@/game/content";
import { useGame } from "@/game/store";

// Tournament title-card hero: centered lockup styled like a match intro
// graphic. One CTA; the section chips live in the top bar.
export default function Hero() {
  const enterCourt = useGame((s) => s.enterCourt);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-[var(--hero-fg)]">

      <h1 className="font-display hero-title text-6xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-8xl">
        Manav
        <br />
        Khosla
        <span className="ball-dot ml-3 inline-block align-baseline" aria-hidden />
      </h1>

      <p className="hero-title mt-5 font-mono text-sm font-bold uppercase tracking-[0.3em] sm:text-base">
        {IDENTITY.tagline}
      </p>

      <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={enterCourt}
          className="group rounded-md border-2 border-[var(--accent)] bg-[var(--accent)]/15 px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.25em] backdrop-blur-sm transition hover:bg-[var(--accent)] hover:text-[var(--hero-bg)] active:scale-95"
        >
          ▶ play the point
        </button>
      </div>

    </div>
  );
}
