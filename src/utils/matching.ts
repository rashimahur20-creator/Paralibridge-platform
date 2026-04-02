import { haversineDistance } from './distance';

export function matchBuyers(
  farmerTonnes: number,
  farmerLat: number,
  farmerLng: number,
  allBuyers: any[]
): any[] {
  // 1. Filter: buyer.requiredTonnes >= farmerTonnes
  const filtered = allBuyers.filter(b => b.requiredTonnes >= farmerTonnes);
  // 2. Calculate distance
  const withDist = filtered.map(b => ({
    ...b,
    distanceKm: haversineDistance(farmerLat, farmerLng, b.lat, b.lng),
  }));
  // 3. Sort by pricePerTonne descending
  withDist.sort((a, b) => b.pricePerTonne - a.pricePerTonne);
  return withDist;
}
