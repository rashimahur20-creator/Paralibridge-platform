import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { DEMO_PROFILE } from '../utils/farmerDemoData';

interface FarmerModeCtx {
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
  farmerProfile: any;
  setFarmerProfile: (p: any) => void;
  localTransactions: any[];
  setLocalTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<FarmerModeCtx | null>(null);

export function useFarmerMode() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFarmerMode must be used inside FarmerModeProvider');
  return c;
}

export function FarmerModeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const isDemoInitial = localStorage.getItem('pb_farmer_mode') !== 'false';
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(isDemoInitial);
  const [farmerProfile, setFarmerProfile] = useState<any>(isDemoInitial ? DEMO_PROFILE : null);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);

  function setIsDemoMode(v: boolean) {
    setIsDemoModeState(v);
    localStorage.setItem('pb_farmer_mode', String(v));
  }

  const refreshProfile = async () => {
    if (isDemoMode) { 
      setFarmerProfile(DEMO_PROFILE); 
      return; 
    }
    
    setLocalTransactions([]);
    if (!currentUser) {
      setFarmerProfile(null);
      return;
    }
    
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) setFarmerProfile({ uid: currentUser.uid, ...snap.data() });
      const fsnap = await getDoc(doc(db, 'farmers', currentUser.uid));
      if (fsnap.exists()) setFarmerProfile((p: any) => ({ ...p, ...fsnap.data() }));
    } catch { 
      setFarmerProfile(null);
    }
  };

  useEffect(() => { refreshProfile(); }, [isDemoMode, currentUser]);

  return (
    <Ctx.Provider value={{ isDemoMode, setIsDemoMode, farmerProfile, setFarmerProfile, localTransactions, setLocalTransactions, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}
