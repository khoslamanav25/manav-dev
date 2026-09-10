"use client";

import Link from "next/link";
import { SECTIONS, IDENTITY } from "@/game/content";
import { useGame } from "@/game/store";
import { TARGETS } from "@/game/targets";

// Tournament title-card hero: centered lockup styled like a match intro
// graphic, with a live "order of play" strip. Nothing anchored bottom-left.
export default function Hero() {
  const enterCourt = useGame((s) => s.enterCourt);
  const openPanel = useGame((s) => s.openPanel);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-[var(--hero-fg)]">
      <div className="hero-scrim absolute inset-0 -z-10" aria-hidden />
      <p className="scorebug mb-6 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.35em]">
        center court · {TARGETS.length} targets on the line
      </p>

      <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-8xl">
        Manav
        <br />
        Khosla
        <span className="ball-dot ml-3 inline-block align-baseline" aria-hidden />
      </h1>

      <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] opacity-75 sm:text-sm">
        {IDENTITY.tagline}
      </p>

      <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={enterCourt}
          className="group rounded-md border-2 border-[var(--accent)] bg-[var(--accent)]/15 px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.25em] backdrop-blur-sm transition hover:bg-[var(--accent)] hover:text-[var(--hero-bg)] active:scale-95"
        >
          ▶ play the point
        </button>
        <button
          onClick={() => openPanel({ section: "experience" })}
          className="rounded-md border border-current/30 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.25em] opacity-80 backdrop-blur-sm transition hover:opacity-100 active:scale-95"
        >
          straight to the resume
        </button>
      </div>

      <div className="pointer-events-auto mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em] opacity-70">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => openPanel({ section: s.id })}
            className="transition hover:opacity-100 hover:text-[var(--accent)]"
          >
            <span className="opacity-50">{String(i + 1).padStart(2, "0")}</span> {s.label}
            <span className="ml-1 opacity-50">· {s.items.length}</span>
          </button>
        ))}
        <Link href="/text" className="underline underline-offset-4 transition hover:opacity-100">
          txt
        </Link>
      </div>
    </div>
  );
}
