// Tiny keyboard singleton shared by the sim (read in useFrame, no re-renders).

const keys = new Set<string>();
let swingQueued = false;

// ↑↑↓↓←→←→BA — "MANAV 3000" turbo mode
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA",
];
let konamiAt = 0;
let onKonamiCb: (() => void) | null = null;

export function onKonami(cb: () => void) {
  onKonamiCb = cb;
}

function trackKonami(code: string) {
  konamiAt = code === KONAMI[konamiAt] ? konamiAt + 1 : code === KONAMI[0] ? 1 : 0;
  if (konamiAt === KONAMI.length) {
    konamiAt = 0;
    onKonamiCb?.();
  }
}

export function bindInput() {
  const down = (e: KeyboardEvent) => {
    // Don't steal keys while the user is typing or a panel is focused elsewhere.
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      return;
    keys.add(e.code);
    trackKonami(e.code);
    if (e.code === "Space") {
      swingQueued = true;
      e.preventDefault(); // stop page scroll
    }
  };
  const up = (e: KeyboardEvent) => keys.delete(e.code);
  const blur = () => keys.clear();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", blur);
    keys.clear();
  };
}

export function isDown(...codes: string[]) {
  return codes.some((c) => keys.has(c));
}

/** Returns true once per Space press (consumed). */
export function consumeSwing() {
  const s = swingQueued;
  swingQueued = false;
  return s;
}

export function queueSwing() {
  swingQueued = true; // tap-to-swing on touch
}

// Touch steering: drag sets a court-x target the player runs toward.
let touchX: number | null = null;

export function setTouchTarget(x: number | null) {
  touchX = x;
}

export function getTouchTarget() {
  return touchX;
}
