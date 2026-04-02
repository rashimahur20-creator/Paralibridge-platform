export function simulateMovement(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  speedKmh: number = 25
) {
  if (currentLat === targetLat && currentLng === targetLng) {
    return { newLat: currentLat, newLng: currentLng, distanceRemaining: 0, etaMinutes: 0 };
  }

  const R = 6371; // Earth radius in km
  const dLat = (targetLat - currentLat) * Math.PI / 180;
  const dLng = (targetLng - currentLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(currentLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  if (distance < 0.1) {
    return { newLat: targetLat, newLng: targetLng, distanceRemaining: 0, etaMinutes: 0 };
  }

  const y = Math.sin(dLng) * Math.cos(targetLat * Math.PI / 180);
  const x = Math.cos(currentLat * Math.PI / 180) * Math.sin(targetLat * Math.PI / 180) -
            Math.sin(currentLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.cos(dLng);
  const bearing = Math.atan2(y, x);

  const distanceToMove = speedKmh * (3 / 3600); // 3 seconds worth of travel in km

  const lat1 = currentLat * Math.PI / 180;
  const lng1 = currentLng * Math.PI / 180;
  
  const lat2 = Math.asin(Math.sin(lat1)*Math.cos(distanceToMove/R) + Math.cos(lat1)*Math.sin(distanceToMove/R)*Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(Math.sin(bearing)*Math.sin(distanceToMove/R)*Math.cos(lat1), Math.cos(distanceToMove/R)-Math.sin(lat1)*Math.sin(lat2));

  const newLat = lat2 * 180 / Math.PI;
  const newLng = lng2 * 180 / Math.PI;

  const etaMinutes = Math.ceil((distance / speedKmh) * 60);

  return { newLat, newLng, distanceRemaining: distance, etaMinutes };
}
