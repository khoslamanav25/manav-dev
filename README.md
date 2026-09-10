# manav-dev

My personal website — a playable tennis court.

A ball machine on the far side feeds you balls. Move along the baseline, time your
swing, and return them at the four target boards standing across the net — Experience,
Projects, Education, and Skills. Hit one and its match report opens. Prefer reading?
The nav opens everything directly, and
[`/text`](https://manav-dev.vercel.app/text) is a zero-JS plain version.

## Details worth finding

- **4 courts**, switchable live: US Open night session, Wimbledon grass, Roland Garros
  clay, and a synthwave grid with bloom
- **Easy mode** aim-assists every clean swing into the highlighted target; **Pro mode**
  makes timing control direction, with streak multipliers and a saved best score
- A bouncing crowd, synthesized WebAudio sound (muted by default), particle bursts,
  ball trails, fireworks at 10-streak — and a couple of secrets (the machine holds
  grudges; old cheat codes still work)

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · three.js via
@react-three/fiber + drei · zustand · custom closed-form ballistics (no physics engine)

## Develop

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
npm run lint
```

## Layout

```
src/app/          routes (/ game shell, /text plain resume)
src/game/         content data, themes, store, physics, input, audio, events
src/components/   GameRoot shell, canvas/ (scene, engine, court, targets,
                  effects, crowd), ui/ (hero, nav, hud, panel, help)
```
