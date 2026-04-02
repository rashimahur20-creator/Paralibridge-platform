import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Buyer, Baler, FireAlert } from '../types';

const buyers: Buyer[] = [
  // Punjab Industrial
  { id: "b1", companyName: "Ludhiana Packaging Board", district: "Ludhiana, PB", phoneNumber: "9876543211", requiredTonnes: 500, pricePerTonne: 1750, location: { lat: 30.9, lng: 75.85 }, verified: true },
  { id: "b2", companyName: "Jalandhar Eco Bricks", district: "Jalandhar, PB", phoneNumber: "9876543212", requiredTonnes: 300, pricePerTonne: 1680, location: { lat: 31.32, lng: 75.57 }, verified: true },
  
  // Haryana (Neighbouring)
  { id: "b3", companyName: "Panipat Biomass Energy", district: "Panipat, HR", phoneNumber: "9876543213", requiredTonnes: 1200, pricePerTonne: 1950, location: { lat: 29.39, lng: 76.97 }, verified: true },
  { id: "b4", companyName: "Ambala Paper Mills", district: "Ambala, HR", phoneNumber: "9876543214", requiredTonnes: 800, pricePerTonne: 1850, location: { lat: 30.37, lng: 76.77 }, verified: true },
  
  // Rajasthan (Out of Burn Zone Export)
  { id: "b5", companyName: "Jaipur Green Fuel Ltd.", district: "Jaipur, RJ", phoneNumber: "9876543215", requiredTonnes: 2000, pricePerTonne: 2100, location: { lat: 26.91, lng: 75.78 }, verified: true },
  { id: "b6", companyName: "Bikaner Ceramic Kilns", district: "Bikaner, RJ", phoneNumber: "9876543216", requiredTonnes: 600, pricePerTonne: 1900, location: { lat: 28.02, lng: 73.31 }, verified: false },
  
  // Delhi NCR / UP
  { id: "b7", companyName: "Noida Bio-Coal Co.", district: "Noida, UP", phoneNumber: "9876543217", requiredTonnes: 1500, pricePerTonne: 2050, location: { lat: 28.53, lng: 77.39 }, verified: true },
  { id: "b8", companyName: "Meerut Agro Boards", district: "Meerut, UP", phoneNumber: "9876543218", requiredTonnes: 400, pricePerTonne: 1710, location: { lat: 28.98, lng: 77.70 }, verified: true },
];

const balers: Baler[] = [
  { id: "bl1", name: "Rajvir Singh Agro", district: "Ludhiana", phoneNumber: "9876543221", equipment: "John Deere 5310 + Square Baler", available: true, rating: 4.8, currentLat: 30.95, currentLng: 75.92 },
  { id: "bl2", name: "Sukhdev Tractor Works", district: "Amritsar", phoneNumber: "9876543222", equipment: "Mahindra 575 + Round Baler", available: true, rating: 4.6, currentLat: 31.68, currentLng: 74.92 },
  { id: "bl3", name: "Happy Agro Services", district: "Patiala", phoneNumber: "9876543223", equipment: "Swaraj 735 + Square Baler", available: true, rating: 4.9, currentLat: 30.38, currentLng: 76.42 },
  { id: "bl4", name: "Bikramjit Farm Equipment", district: "Sangrur", phoneNumber: "9876543224", equipment: "New Holland 3630 + Baler", available: true, rating: 4.5, currentLat: 30.28, currentLng: 75.89 },
  { id: "bl5", name: "Gill Brothers Agri", district: "Bathinda", phoneNumber: "9876543225", equipment: "Farmtrac 60 + Baler", available: true, rating: 4.7, currentLat: 30.26, currentLng: 74.98 },
  { id: "bl6", name: "Narinder Tractor Hub", district: "Moga", phoneNumber: "9876543226", equipment: "Eicher 380 + Mini Baler", available: false, rating: 4.4, currentLat: 30.85, currentLng: 75.22 },
];

const fireAlerts: FireAlert[] = [
  { id: "f1", district: "Sangrur", lat: 30.24, lng: 75.84, detectedAt: "2024-10-28T06:14:00Z", intensity: "high" },
  { id: "f2", district: "Moga", lat: 30.81, lng: 75.17, detectedAt: "2024-10-28T07:02:00Z", intensity: "medium" },
  { id: "f3", district: "Bathinda", lat: 30.21, lng: 74.94, detectedAt: "2024-10-28T05:45:00Z", intensity: "high" },
  { id: "f4", district: "Ludhiana", lat: 30.91, lng: 75.85, detectedAt: "2024-10-28T08:30:00Z", intensity: "low" },
  { id: "f5", district: "Amritsar", lat: 31.63, lng: 74.87, detectedAt: "2024-10-28T04:55:00Z", intensity: "medium" },
];

export async function seedData() {
  if (!isFirebaseConfigured()) return;
  try {
    const buyersSnap = await getDocs(collection(db, 'buyers'));
    if (buyersSnap.empty) {
      for (const buyer of buyers) {
        await setDoc(doc(db, 'buyers', buyer.id), buyer);
      }
      console.log('Buyers seeded');
    }

    const balersSnap = await getDocs(collection(db, 'balers'));
    if (balersSnap.empty) {
      for (const baler of balers) {
        await setDoc(doc(db, 'balers', baler.id), baler);
      }
      console.log('Balers seeded');
    }

    const alertsSnap = await getDocs(collection(db, 'fireAlerts'));
    if (alertsSnap.empty) {
      for (const alert of fireAlerts) {
        await setDoc(doc(db, 'fireAlerts', alert.id), alert);
      }
      console.log('Fire alerts seeded');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

export { buyers as mockBuyers, balers as mockBalers, fireAlerts as mockFireAlerts };
