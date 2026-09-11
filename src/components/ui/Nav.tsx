"use client";

import Link from "next/link";
import { SECTIONS } from "@/game/content";
import { useGame } from "@/game/store";

// Section chips (top-right): separate scorebug-style buttons so they read as
// clickable, with a completion tick per section. Scrolls sideways when narrow.
export default function Nav() {
  const openPanel = useGame((s) => s.openPanel);
  const panel = useGame((s) => s.panel);
  const hitTargets = useGame((s) => s.hitTargets);

  return (
    <nav className="pointer-events-auto flex min-w-0 items-stretch gap-1.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]">
      <div className="flex min-w-0 items-stretch gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTIONS.map((section) => {
        const done = hitTargets.has(section.id);
        const activeNow = panel?.section === section.id;
        return (
          <button
            key={section.id}
            onClick={() => openPanel({ section: section.id })}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-current/25 px-3.5 py-2 text-[var(--panel-fg)] shadow-lg backdrop-blur-sm transition hover:bg-[var(--accent)]/25 active:scale-95 ${
              activeNow ? "bg-[var(--accent)]/25" : "bg-[var(--panel-bg)]/90"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-[#7de29a]" : "bg-[var(--accent)]"}`} />
            <span>{section.label}</span>
          </button>
        );
      })}
      </div>
      {/* pinned outside the scroll area so it stays visible on phones */}
      <Link
        href="/text"
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-[var(--accent)]/60 bg-[var(--panel-bg)]/90 px-3.5 py-2 font-bold text-[var(--accent)] shadow-lg backdrop-blur-md transition hover:bg-[var(--accent)]/25 active:scale-95"
      >
        TXT
      </Link>
    </nav>
  );
}
