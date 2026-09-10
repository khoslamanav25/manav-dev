"use client";

import { useEffect, useRef } from "react";
import { getSection } from "@/game/content";
import { useGame } from "@/game/store";

// "Match report" bottom sheet: slides up like a broadcast stats graphic,
// with a scorebug header band. Plain DOM — selectable, accessible.
export default function Panel() {
  const panel = useGame((s) => s.panel);
  const closePanel = useGame((s) => s.closePanel);
  const hitTargets = useGame((s) => s.hitTargets);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  useEffect(() => {
    if (!panel?.itemId || !ref.current) return;
    const el = ref.current.querySelector(`[data-item="${panel.itemId}"]`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [panel]);

  if (!panel) return null;
  const section = getSection(panel.section);
  const sectionHit = hitTargets.has(section.id);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:p-6" role="dialog" aria-modal="true">
      <button
        aria-label="Close panel"
        className="absolute inset-0 cursor-default bg-black/25"
        onClick={closePanel}
      />
      <aside
        ref={ref}
        className="panel-rise relative flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-[var(--panel-bg)] text-[var(--panel-fg)] shadow-2xl backdrop-blur-md sm:rounded-2xl"
      >
        {/* scorebug header band */}
        <header className="flex items-center gap-4 border-b border-current/10 px-6 py-4 sm:px-8">
          <span className="h-8 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] opacity-60">
              match report
            </p>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              {section.label}
            </h2>
          </div>
          {sectionHit ? (
            <span className="scorebug hidden px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#7de29a] sm:block">
              ✓ target hit
            </span>
          ) : null}
          <button
            onClick={closePanel}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-current/20 text-lg opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </header>

        <div className="space-y-8 overflow-y-auto px-6 py-6 sm:px-8">
          {section.items.map((item, idx) => (
            <article
              key={item.id}
              data-item={item.id}
              className="grid scroll-mt-4 grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    panel.itemId === item.id
                      ? "bg-[var(--accent)] text-[var(--hero-bg)]"
                      : "border border-current/25 opacity-70"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {idx < section.items.length - 1 ? (
                  <span className="mt-2 w-px flex-1 bg-current/10" aria-hidden />
                ) : null}
              </div>
              <div className="pb-2">
                <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
                {item.subtitle ? (
                  <p className="font-semibold text-[var(--accent)]">{item.subtitle}</p>
                ) : null}
                {item.meta ? (
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] opacity-60">
                    {item.meta}
                  </p>
                ) : null}
                <p className="mt-2.5 text-[15px] leading-relaxed opacity-90">
                  {item.summary}
                </p>
                {item.tags && item.tags.length > 0 ? (
                  <p className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] opacity-70"
                      >
                        {t}
                      </span>
                    ))}
                  </p>
                ) : null}
                {item.link ? (
                  <p className="mt-3 font-mono text-sm">
                    <a
                      className="text-[var(--accent)] underline underline-offset-4 opacity-90 hover:opacity-100"
                      href={item.link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.link.label} ↗
                    </a>
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
