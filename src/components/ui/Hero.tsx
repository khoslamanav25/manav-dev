"use client";

import Link from "next/link";
import { IDENTITY } from "@/game/content";
import { useGame } from "@/game/store";

// Landing overlay shown over the scene before the visitor enters the court.
export default function Hero() {
  const enterCourt = useGame((s) => s.enterCourt);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-7xl font-extrabold lowercase leading-none tracking-tight text-[var(--hero-fg)] sm:text-8xl">
          manav
        </h1>
        <p className="mt-3 font-mono text-sm tracking-wide text-[var(--hero-fg)] opacity-80">
          {IDENTITY.tagline}
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={enterCourt}
            className="rounded-md bg-[var(--hero-fg)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--hero-bg)] transition hover:scale-[1.03] active:scale-95"
          >
            ↓ step on court
          </button>
          <Link
            href="/text"
            className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--hero-fg)] opacity-60 underline-offset-4 transition hover:opacity-100 hover:underline"
          >
            view as text
          </Link>
        </div>
      </div>
    </div>
  );
}
