import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import type { User } from '../types';
import { districtCoords } from '../utils/distance';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (phone: string, password: string, email: string, name: string, role: 'farmer' | 'buyer' | 'baler', district: string, equipment: string, upiId: string, logisticsType?: 'baler' | 'tractor', vehicleReg?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    if (!isFirebaseConfigured()) return;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as User);
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(phone: string, password: string) {
    const fakeEmail = `${phone}@paralibridge.com`;
    const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
    const snap = await getDoc(doc(db, 'users', result.user.uid));
    if (snap.exists()) {
      const p = snap.data() as User;
      setUserProfile(p);
      localStorage.setItem('pb_role', p.role);
    }
  }

  async function signup(phone: string, password: string, email: string, name: string, role: 'farmer' | 'buyer' | 'baler', district: string, equipment: string, upiId: string = '', logisticsType: 'baler' | 'tractor' = 'baler', vehicleReg: string = '') {
    const fakeEmail = `${phone}@paralibridge.com`;
    const result = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const profile: any = {
      uid: result.user.uid,
      name,
      role,
      district,
      phoneNumber: phone,
      createdAt: new Date(),
    };
    if (role === 'buyer') {
      profile.companyName = name;
    }
    if (email) profile.email = email;
    if (role === 'baler') {
      const coords = districtCoords[district] || { lat: 30.9, lng: 75.85 };
      profile.type = logisticsType;
      profile.equipment = equipment || 'Standard Equipment';
      profile.vehicleReg = vehicleReg;
      profile.upiId = upiId;
      profile.available = true;
      profile.rating = 5.0;
      profile.currentLat = coords.lat;
      profile.currentLng = coords.lng;
      profile.totalEarnings = 0;
      profile.pendingEarnings = 0;
      profile.paidEarnings = 0;
      await setDoc(doc(db, 'logistics', result.user.uid), { id: result.user.uid, ...profile });
    }
    
    await setDoc(doc(db, 'users', result.user.uid), profile as User);
    setUserProfile(profile as User);
    localStorage.setItem('pb_role', role);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
    localStorage.removeItem('pb_role');
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
