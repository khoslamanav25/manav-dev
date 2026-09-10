// Real tennis-court dimensions in meters (ITF), used by scene + physics alike.
// Coordinate system: origin at court center, +z toward the player (near side),
// -z toward the launcher/targets (far side), +x to the player's right, +y up.

export const COURT = {
  halfLength: 11.885, // baseline z = ±11.885
  halfWidthDoubles: 5.485,
  halfWidthSingles: 4.115,
  serviceLineZ: 6.4, // service line distance from net
  netHeightCenter: 0.914,
  netHeightPost: 1.07,
  netOverhang: 0.914, // posts sit outside the doubles line
  lineWidth: 0.08, // slightly wider than regulation 0.05 for readability
} as const;

export const PLAYER = {
  baselineZ: COURT.halfLength + 0.6, // stands just behind the baseline
  minX: -6.2,
  maxX: 6.2,
  reach: 1.55, // lateral reach of a swing, meters
} as const;

export const LAUNCHER_POS: [number, number, number] = [
  0,
  0.55,
  -COURT.halfLength - 1.2,
];

export const GRAVITY = -9.81;
