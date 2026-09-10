import type { Metadata } from "next";
import Link from "next/link";
import { IDENTITY, SECTIONS } from "@/game/content";

export const metadata: Metadata = {
  title: "Manav Khosla — text version",
  description:
    "Plain-text portfolio of Manav Khosla: experience, projects, education, and skills.",
};

// Server-rendered, zero-JS resume view. This is the accessible / SEO / recruiter-in-a-
// hurry version of the site; the game at / renders the same content interactively.
export default function TextPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-mono text-sm leading-relaxed">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight">{IDENTITY.name}</h1>
        <p className="mt-1 text-neutral-500">{IDENTITY.tagline}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <a className="underline underline-offset-4" href={`mailto:${IDENTITY.email}`}>
            {IDENTITY.email}
          </a>
          <a className="underline underline-offset-4" href={IDENTITY.linkedin}>
            linkedin
          </a>
          <a className="underline underline-offset-4" href={IDENTITY.github}>
            github
          </a>
        </p>
        <p className="mt-6">
          <Link
            href="/"
            className="inline-block border border-current px-3 py-1 uppercase tracking-widest text-xs hover:bg-neutral-900 hover:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-900"
          >
            ← play the tennis version
          </Link>
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.id} className="mb-12">
          <h2 className="mb-4 border-b border-neutral-300 pb-1 text-lg font-bold uppercase tracking-widest dark:border-neutral-700">
            {section.label}
          </h2>
          {section.items.map((item) => (
            <article key={item.id} className="mb-8 last:mb-0">
              <h3 className="font-bold">
                {item.title}
                {item.subtitle ? (
                  <span className="font-normal text-neutral-500"> · {item.subtitle}</span>
                ) : null}
              </h3>
              {item.meta ? (
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  {item.meta}
                </p>
              ) : null}
              <p className="mt-2 leading-relaxed">{item.summary}</p>
              {item.tags && item.tags.length > 0 ? (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-neutral-300 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </p>
              ) : null}
              {item.link ? (
                <p className="mt-2">
                  <a className="underline underline-offset-4" href={item.link.href}>
                    {item.link.label}
                  </a>
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
