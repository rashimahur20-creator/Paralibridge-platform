// ── Demo data for Logistics/Baler Dashboard ─────────────────────────────────

export const DEMO_LOGISTICS_PROFILE = {
  uid: 'demo_baler_1',
  name: 'Rajvir Singh Agro',
  type: 'baler' as 'baler' | 'tractor',
  district: 'Ludhiana',
  equipment: 'John Deere 5310 + Square Baler',
  upiId: 'rajvir@upi',
  phone: '98765-43210',
  rating: 4.8,
  available: true,
  currentLat: 30.95,
  currentLng: 75.92,
  vehicleReg: 'PB-10-AB-1234',
};

export const DEMO_CURRENT_JOB = {
  id: 'txn_demo_1',
  farmerName: 'Gurpreet Singh',
  farmerDistrict: 'Ludhiana',
  farmerLat: 30.85,
  farmerLng: 75.80,
  buyerName: 'Haryana Biomass Energy',
  buyerLat: 30.90,
  buyerLng: 75.85,
  tonnes: 20,
  pricePerTonne: 1750,
  totalAmount: 35000,
  commission: 7000,
  status: 'baler_assigned',
  balerAccepted: true,
};

export const DEMO_AVAILABLE_JOB = {
  id: 'txn_avail_1',
  farmerName: 'Harjinder Kaur',
  farmerDistrict: 'Ludhiana',
  farmerLat: 30.87,
  farmerLng: 75.82,
  buyerName: 'GreenFuel Industries',
  buyerLat: 30.34,
  buyerLng: 76.37,
  tonnes: 15,
  pricePerTonne: 1720,
  totalAmount: 25800,
  commission: 5160,
  status: 'requested',
  balerAccepted: false,
};

export const DEMO_COMPLETED_JOBS = [
  { id: 'cj1', farmerName: 'Harjinder Kaur',   tonnes: 15, totalAmount: 26250, commission: 5250, date: 'Oct 22, 2024', status: 'paid' },
  { id: 'cj2', farmerName: 'Balwinder Singh',   tonnes: 10, totalAmount: 17500, commission: 3500, date: 'Oct 19, 2024', status: 'paid' },
  { id: 'cj3', farmerName: 'Paramjit Gill',     tonnes: 18, totalAmount: 31500, commission: 6300, date: 'Oct 15, 2024', status: 'paid' },
];

export const DEMO_WEEKLY_EARNINGS = [
  { week: 'Oct W1', earned: 3200 },
  { week: 'Oct W2', earned: 5250 },
  { week: 'Oct W3', earned: 6300 },
  { week: 'Oct W4', earned: 3500 },
  { week: 'Nov W1', earned: 1800 },
];
