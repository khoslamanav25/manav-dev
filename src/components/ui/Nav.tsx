"use client";

import { SECTIONS } from "@/game/content";
import { useGame } from "@/game/store";

// Scorebug-style section chips (top-right during play). Numbered segments
// with an accent tick, not plain text links.
export default function Nav() {
  const openPanel = useGame((s) => s.openPanel);
  const panel = useGame((s) => s.panel);
  const hitTargets = useGame((s) => s.hitTargets);

  return (
    <nav className="pointer-events-auto scorebug flex items-stretch overflow-hidden font-mono text-[11px] uppercase tracking-[0.14em]">
      {SECTIONS.map((section, i) => {
        const done = hitTargets.has(section.id);
        const activeNow = panel?.section === section.id;
        return (
          <button
            key={section.id}
            onClick={() => openPanel({ section: section.id })}
            className={`flex items-center gap-1.5 border-r border-current/15 px-3.5 py-2 transition last:border-r-0 hover:bg-[var(--accent)]/20 ${
              activeNow ? "bg-[var(--accent)]/25" : ""
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-[#7de29a]" : "bg-[var(--accent)]"}`} />
            <span className="hidden sm:inline">{section.label}</span>
            <span className="sm:hidden">{String(i + 1).padStart(2, "0")}</span>
          </button>
        );
      })}
    </nav>
  );
}
