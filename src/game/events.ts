// Tiny event bus decoupling the sim (GameEngine) from effects and audio.

export type GameEvent =
  | { type: "launch" }
  | { type: "swing" }
  | { type: "pop"; x: number; y: number; z: number } // racquet contact
  | { type: "bounce"; x: number; y: number; z: number }
  | { type: "net" }
  | { type: "targetHit"; x: number; y: number; z: number }
  | { type: "miss" }
  | { type: "streak"; count: number }
  | { type: "launcherHit" }
  | { type: "trail"; x: number; y: number; z: number }
  | { type: "turbo" };

type Listener = (e: GameEvent) => void;
const listeners = new Set<Listener>();

export function onGameEvent(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emit(e: GameEvent) {
  for (const fn of listeners) fn(e);
}
