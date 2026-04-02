// All TypeScript interfaces for ParaliBridge

export type TransactionStatus = 'requested' | 'baler_assigned' | 'pickup_done' | 'in_transit' | 'delivered' | 'paid';

export interface User {
  uid: string;
  name: string;
  role: 'farmer' | 'buyer' | 'baler';
  district: string;
  email?: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface Farmer {
  uid: string;
  name: string;
  district: string;
  phoneNumber?: string;
  email?: string;
  landAcres: number;
  upiId: string;
  estimatedTonnes: number;
}

export interface Buyer {
  id: string;
  companyName: string;
  district: string;
  phoneNumber?: string;
  email?: string;
  requiredTonnes: number;
  pricePerTonne: number;
  location: { lat: number; lng: number };
  verified: boolean;
}

export interface Transaction {
  id: string;
  farmerId: string;
  buyerId: string;
  farmerName: string;
  buyerName: string;
  tonnes: number;
  pricePerTonne: number;
  totalAmount: number;
  status: TransactionStatus;
  balerId?: string;
  balerName?: string;
  balerAccepted?: boolean;
  statusHistory?: { status: string; timestamp: Date }[];
  inTransitStartedAt?: Date;
  upiId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Baler {
  id: string;
  name: string;
  district: string;
  phoneNumber?: string;
  email?: string;
  equipment: string;
  available: boolean;
  rating: number;
  currentLat?: number;
  currentLng?: number;
  completedJobs?: string[];
  totalEarnings?: number;
  pendingEarnings?: number;
  paidEarnings?: number;
  upiId?: string;
}

export interface Payment {
  id: string;
  type: 'baler_commission';
  transactionId: string;
  balerId: string;
  balerName: string;
  balerUpiId: string;
  amount: number;
  tonnes: number;
  pricePerTonne: number;
  commissionRate: number;
  status: 'processing' | 'paid';
  createdAt: Date;
}

export interface FireAlert {
  id: string;
  district: string;
  lat: number;
  lng: number;
  detectedAt: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface Certificate {
  transactionId: string;
  farmerName: string;
  district: string;
  tonnes: number;
  co2Saved: number;
  creditValue: number;
  date: Date;
  certificateId: string;
}

export interface DistrictData {
  district: string;
  paddyAreaHectares: number;
  avgYieldTonnesPerHectare: number;
  strawRatio: number;
  estimatedStrawTonnes: number;
}
