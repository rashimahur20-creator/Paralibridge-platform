// Core calculation functions for ParaliBridge

export function estimateTonnes(landAcres: number): number {
  return Math.round(landAcres * 2.5 * 10) / 10;
}

export function calcCO2Saved(tonnes: number): number {
  return Math.round(tonnes * 1.5 * 10) / 10;
}

export function calcCreditValue(co2Tonnes: number): number {
  return Math.round(co2Tonnes * 133);
}

export function calcTotalPayment(tonnes: number, pricePerTonne: number): number {
  return Math.round(tonnes * pricePerTonne);
}

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function generateCertificateId(district: string): string {
  const year = new Date().getFullYear();
  const code = district.substring(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PB-${year}-${code}-${rand}`;
}

export const PUNJAB_DISTRICTS = [
  'Ludhiana',
  'Amritsar',
  'Patiala',
  'Sangrur',
  'Bathinda',
  'Moga',
  'Ferozepur',
  'Rupnagar',
];

export const BUYER_DISTRICTS = [
  ...PUNJAB_DISTRICTS,
  'Karnal (Haryana)',
  'Ambala (Haryana)',
  'Sirsa (Haryana)',
  'Kurukshetra (Haryana)',
  'Sri Ganganagar (Rajasthan)',
  'Hanumangarh (Rajasthan)',
];

export const DISTRICT_DATA = [
  { district: "Ludhiana",  paddyAreaHectares: 185000, avgYieldTonnesPerHectare: 4.2, strawRatio: 1.4, estimatedStrawTonnes: 1088400 },
  { district: "Amritsar",  paddyAreaHectares: 142000, avgYieldTonnesPerHectare: 4.0, strawRatio: 1.4, estimatedStrawTonnes: 795200  },
  { district: "Patiala",   paddyAreaHectares: 163000, avgYieldTonnesPerHectare: 4.1, strawRatio: 1.4, estimatedStrawTonnes: 937240  },
  { district: "Sangrur",   paddyAreaHectares: 128000, avgYieldTonnesPerHectare: 3.9, strawRatio: 1.4, estimatedStrawTonnes: 698880  },
  { district: "Bathinda",  paddyAreaHectares: 156000, avgYieldTonnesPerHectare: 3.8, strawRatio: 1.4, estimatedStrawTonnes: 829920  },
  { district: "Moga",      paddyAreaHectares: 98000,  avgYieldTonnesPerHectare: 4.0, strawRatio: 1.4, estimatedStrawTonnes: 548800  },
  { district: "Ferozepur", paddyAreaHectares: 174000, avgYieldTonnesPerHectare: 3.9, strawRatio: 1.4, estimatedStrawTonnes: 950040  },
  { district: "Rupnagar",  paddyAreaHectares: 67000,  avgYieldTonnesPerHectare: 4.2, strawRatio: 1.4, estimatedStrawTonnes: 395640  },
];
