"use client";

import { useEffect, useRef } from "react";
import { getSection } from "@/game/content";
import { useGame } from "@/game/store";

// Slide-in content panel over the live scene (varchas-style). Plain DOM so the
// content is selectable, zoomable, and readable by assistive tech.
export default function Panel() {
  const panel = useGame((s) => s.panel);
  const closePanel = useGame((s) => s.closePanel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  // Scroll the specific hit item into view when opened from a target.
  useEffect(() => {
    if (!panel?.itemId || !ref.current) return;
    const el = ref.current.querySelector(`[data-item="${panel.itemId}"]`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [panel]);

  if (!panel) return null;
  const section = getSection(panel.section);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      {/* click-away backdrop, transparent so the scene stays visible */}
      <button
        aria-label="Close panel"
        className="absolute inset-0 cursor-default bg-black/10"
        onClick={closePanel}
      />
      <aside
        ref={ref}
        className="panel-slide relative h-full w-full max-w-xl overflow-y-auto bg-[var(--panel-bg)] px-8 py-20 text-[var(--panel-fg)] shadow-2xl backdrop-blur-md sm:px-10"
      >
        <button
          onClick={closePanel}
          aria-label="Close"
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-current/20 text-lg opacity-70 transition hover:opacity-100"
        >
          ×
        </button>
        <h2 className="font-display mb-8 text-6xl font-extrabold lowercase tracking-tight">
          {section.heading}
        </h2>
        <div className="space-y-10">
          {section.items.map((item) => (
            <article
              key={item.id}
              data-item={item.id}
              className={`scroll-mt-20 border-l-2 pl-5 ${
                panel.itemId === item.id
                  ? "border-[var(--accent)]"
                  : "border-current/15"
              }`}
            >
              <header className="mb-2">
                <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
                {item.subtitle ? (
                  <p className="font-semibold text-[var(--accent)]">{item.subtitle}</p>
                ) : null}
                {item.meta ? (
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest opacity-60">
                    {item.meta}
                  </p>
                ) : null}
              </header>
              {item.bullets.length > 0 ? (
                <ul className="space-y-2 text-[15px] leading-relaxed opacity-90">
                  {item.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {item.tags && item.tags.length > 0 ? (
                <p className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70"
                    >
                      {t}
                    </span>
                  ))}
                </p>
              ) : null}
              {item.link ? (
                <p className="mt-3 font-mono text-sm">
                  <a
                    className="underline underline-offset-4 opacity-80 hover:opacity-100"
                    href={item.link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.link.label} ↗
                  </a>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
