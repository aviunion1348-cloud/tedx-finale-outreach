// Travel / distance model. Campus fixed at BIT Mesra, Jaipur Campus.

export const CAMPUS = { lat: 26.9001, lng: 75.7813, label: "BIT Mesra, Jaipur Campus (Chitrakoot)" };

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type FeasibilityLabel =
  | "Walk-in"
  | "Same-day"
  | "Day-trip"
  | "Overnight"
  | "Virtual-only";

export function feasibilityOf(distanceKm: number): FeasibilityLabel {
  if (distanceKm <= 15) return "Walk-in";
  if (distanceKm <= 30) return "Same-day";
  if (distanceKm <= 120) return "Day-trip";
  if (distanceKm <= 400) return "Overnight";
  return "Virtual-only";
}

export function travelTimeHrs(distanceKm: number): number {
  return Math.round((distanceKm / 55) * 10) / 10;
}

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km)} km`;
}
