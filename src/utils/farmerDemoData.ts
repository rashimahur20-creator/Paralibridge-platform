// ── Demo data for Farmer Dashboard ─────────────────────────────────────────

export const DEMO_PROFILE = {
  uid: 'demo_farmer_1',
  name: 'Gurpreet Singh',
  district: 'Ludhiana',
  landAcres: 8,
  upiId: 'gurpreet@upi',
  estimatedTonnes: 20,
};

export const DEMO_BUYERS = [
  { id: 'b1', companyName: 'Haryana Biomass Energy',  district: 'Ludhiana', pricePerTonne: 1750, requiredTonnes: 500, lat: 30.90, lng: 75.85, verified: true },
  { id: 'b2', companyName: 'Punjab Bricks & Ceramics', district: 'Amritsar', pricePerTonne: 1680, requiredTonnes: 300, lat: 31.63, lng: 74.87, verified: true },
  { id: 'b3', companyName: 'GreenFuel Industries',     district: 'Patiala',  pricePerTonne: 1720, requiredTonnes: 420, lat: 30.34, lng: 76.37, verified: true },
];

export const DEMO_LOGISTICS = [
  { id: 'bl1', name: 'Rajvir Singh Agro', type: 'baler',   district: 'Ludhiana', equipment: 'John Deere + Square Baler', available: true, rating: 4.8, lat: 30.95, lng: 75.92 },
  { id: 't1',  name: 'Sukha Transport',   type: 'tractor', district: 'Ludhiana', equipment: 'Mahindra 575 Tractor',      available: true, rating: 4.5, lat: 30.88, lng: 75.78 },
];

export const DEMO_TRANSACTION = {
  id: 'txn_demo_1',
  farmerId: 'demo_farmer_1',
  farmerName: 'Gurpreet Singh',
  buyerId: 'b1',
  buyerName: 'Haryana Biomass Energy',
  buyerLat: 30.90,
  buyerLng: 75.85,
  tonnes: 20,
  pricePerTonne: 1750,
  totalAmount: 35000,
  status: 'baler_assigned',
  balerId: 'bl1',
  balerName: 'Rajvir Singh Agro',
  balerEquipment: 'John Deere + Square Baler',
  balerRating: 4.8,
  balerPhone: '+91 98140 00001',
  balerLat: 30.95,
  balerLng: 75.92,
  createdAt: new Date().toISOString(),
};
