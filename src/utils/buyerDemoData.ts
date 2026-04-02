// ── Demo data for Buyer Dashboard ───────────────────────────────────────────

export const DEMO_BUYER_PROFILE = {
  uid: 'demo_buyer_1',
  companyName: 'Haryana Biomass Energy Ltd.',
  district: 'Ludhiana',
  requiredTonnes: 500,
  pricePerTonne: 1750,
  upiId: 'haryanabio@upi',
  lat: 30.90,
  lng: 75.85,
  verified: true,
};

export const DEMO_INCOMING = [
  {
    id: 'txn1',
    farmerName: 'Gurpreet Singh',
    district: 'Ludhiana',
    tonnes: 20,
    pricePerTonne: 1750,
    totalAmount: 35000,
    status: 'baler_assigned',
    balerName: 'Rajvir Singh Agro',
    balerLat: 30.92,
    balerLng: 75.88,
    farmerLat: 30.85,
    farmerLng: 75.80,
    buyerLat: 30.90,
    buyerLng: 75.85,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'txn2',
    farmerName: 'Harjinder Kaur',
    district: 'Ludhiana',
    tonnes: 15,
    pricePerTonne: 1750,
    totalAmount: 26250,
    status: 'requested',
    balerName: null,
    balerLat: null,
    balerLng: null,
    farmerLat: 30.87,
    farmerLng: 75.82,
    buyerLat: 30.90,
    buyerLng: 75.85,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export const DEMO_MONTHLY = [
  { month: 'Jul', tonnes: 0 },
  { month: 'Aug', tonnes: 0 },
  { month: 'Sep', tonnes: 45 },
  { month: 'Oct', tonnes: 180 },
  { month: 'Nov', tonnes: 120 },
  { month: 'Dec', tonnes: 30 },
];

// Cumulative CO2
export const DEMO_CO2_CUMULATIVE = (() => {
  let sum = 0;
  return DEMO_MONTHLY.map(m => {
    sum += m.tonnes * 1.5;
    return { month: m.month, co2: Math.round(sum * 10) / 10 };
  });
})();

export const DEMO_ANALYTICS = {
  totalTonnes: 375,
  co2Offset: 562.5,
  totalPaid: 656250,
  farmersSupported: 18,
  mandateProgress: 6.25,
};

export const DEMO_PAID_TRANSACTIONS = [
  { id: 'ptxn1', date: '2025-10-05', farmerName: 'Balwant Singh', district: 'Ludhiana', tonnes: 30, totalAmount: 52500, status: 'paid' },
  { id: 'ptxn2', date: '2025-10-12', farmerName: 'Sukhwinder Kaur', district: 'Ludhiana', tonnes: 25, totalAmount: 43750, status: 'paid' },
  { id: 'ptxn3', date: '2025-10-18', farmerName: 'Amarjit Singh', district: 'Moga', tonnes: 40, totalAmount: 70000, status: 'paid' },
  { id: 'ptxn4', date: '2025-11-02', farmerName: 'Kulwant Pal', district: 'Ludhiana', tonnes: 35, totalAmount: 61250, status: 'paid' },
  { id: 'ptxn5', date: '2025-11-14', farmerName: 'Parminder Singh', district: 'Sangrur', tonnes: 28, totalAmount: 49000, status: 'paid' },
];
