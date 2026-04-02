// Haversine distance formula — returns distance in km
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// District center coordinates for Punjab
export const districtCoords: Record<string, { lat: number; lng: number }> = {
  Ludhiana:  { lat: 30.9, lng: 75.85 },
  Amritsar:  { lat: 31.63, lng: 74.87 },
  Patiala:   { lat: 30.34, lng: 76.37 },
  Sangrur:   { lat: 30.24, lng: 75.84 },
  Bathinda:  { lat: 30.21, lng: 74.94 },
  Moga:      { lat: 30.81, lng: 75.17 },
  Ferozepur: { lat: 30.92, lng: 74.62 },
  Rupnagar:  { lat: 30.96, lng: 76.52 },
  // Inter-state export fallbacks
  Panipat:   { lat: 29.39, lng: 76.97 },
  Ambala:    { lat: 30.37, lng: 76.77 },
  Jaipur:    { lat: 26.91, lng: 75.78 },
  Bikaner:   { lat: 28.02, lng: 73.31 },
  Noida:     { lat: 28.53, lng: 77.39 },
  Meerut:    { lat: 28.98, lng: 77.70 },
};
