"use client";

import { useGame } from "@/game/store";

function Key({ k }: { k: string }) {
  return (
    <kbd className="rounded-md border border-current/25 bg-black/5 px-2.5 py-1 font-mono text-xs font-bold">
      {k}
    </kbd>
  );
}

// First-entry controls card, varchas-style.
export default function HelpModal() {
  const phase = useGame((s) => s.phase);
  const helpSeen = useGame((s) => s.helpSeen);
  const markHelpSeen = useGame((s) => s.markHelpSeen);

  if (phase !== "playing" || helpSeen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-[var(--panel-bg)] p-8 text-[var(--panel-fg)] shadow-2xl backdrop-blur-md">
        <h2 className="font-display mb-6 text-3xl font-extrabold lowercase tracking-tight">
          how to play
        </h2>
        <div className="space-y-4 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest opacity-70">Move</span>
            <span className="flex gap-1.5">
              <Key k="A" /> <Key k="D" /> <span className="opacity-50">or</span> <Key k="←" />{" "}
              <Key k="→" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest opacity-70">Swing</span>
            <Key k="Space" />
          </div>
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest opacity-70">Sprint</span>
            <Key k="Shift" />
          </div>
        </div>
        <p className="mt-6 border-t border-current/15 pt-5 text-sm leading-relaxed opacity-85">
          The launcher feeds you balls — return them at the{" "}
          <span className="font-bold text-[var(--accent)]">glowing target</span> to open it.
          Every target is a piece of my resume. Smash them all.
        </p>
        <button
          onClick={markHelpSeen}
          className="mt-6 w-full rounded-lg bg-[var(--panel-fg)] py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--panel-bg)] transition hover:opacity-90 active:scale-[0.98]"
        >
          got it
        </button>
      </div>
    </div>
  );
}
