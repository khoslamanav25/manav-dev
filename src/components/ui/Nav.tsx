"use client";

import { SECTIONS } from "@/game/content";
import { useGame } from "@/game/store";

// Always-visible top nav — opens content panels directly so nobody is forced
// to play the game to read the resume.
export default function Nav() {
  const openPanel = useGame((s) => s.openPanel);
  const panel = useGame((s) => s.panel);

  return (
    <nav className="pointer-events-auto flex items-center gap-5 sm:gap-7">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => openPanel({ section: section.id })}
          className={`text-sm tracking-wide transition hover:opacity-100 ${
            panel?.section === section.id
              ? "opacity-100 underline underline-offset-8"
              : "opacity-80"
          }`}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
