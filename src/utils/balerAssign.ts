import { haversineDistance } from './distance';

export function assignLogistics(
  _farmerDistrict: string,
  farmerLat: number,
  farmerLng: number,
  allLogistics: any[]
): any | null {
  // 1. Only available
  const available = allLogistics.filter(l => l.available === true);
  if (available.length === 0) return null;

  // 2. Calculate distances
  const withDist = available.map(l => ({
    ...l,
    distanceKm: haversineDistance(farmerLat, farmerLng, l.lat, l.lng),
  }));
  withDist.sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = withDist[0];

  // 3 & 4. Prefer baler <15km, tractor >15km
  if (nearest.distanceKm < 15) {
    const nearestBaler = withDist.find(l => l.type === 'baler');
    if (nearestBaler) return nearestBaler;
  } else {
    const nearestTractor = withDist.find(l => l.type === 'tractor');
    if (nearestTractor) return nearestTractor;
  }

  // 6. Fallback: nearest available of any type
  return nearest;
}
