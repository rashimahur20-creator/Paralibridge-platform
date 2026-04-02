import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEMO_BUYER_PROFILE, DEMO_INCOMING } from '../utils/buyerDemoData';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface BuyerModeCtx {
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
  buyerProfile: any;
  setBuyerProfile: (p: any) => void;
  localTransactions: any[];
  setLocalTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

const Ctx = createContext<BuyerModeCtx | null>(null);

export function useBuyerMode() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useBuyerMode must be inside BuyerModeProvider');
  return c;
}

export function BuyerModeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const isDemoModeInitial = localStorage.getItem('pb_buyer_mode') !== 'false';
  const [isDemoMode, setIsDemoModeState] = useState(isDemoModeInitial);
  const [buyerProfile, setBuyerProfile] = useState<any>(isDemoModeInitial ? DEMO_BUYER_PROFILE : null);
  const [localTransactions, setLocalTransactions] = useState<any[]>(isDemoModeInitial ? DEMO_INCOMING : []);

  function setIsDemoMode(v: boolean) {
    setIsDemoModeState(v);
    localStorage.setItem('pb_buyer_mode', String(v));
  }

  useEffect(() => {
    if (isDemoMode) {
      setBuyerProfile(DEMO_BUYER_PROFILE);
      setLocalTransactions(DEMO_INCOMING);
    } else {
      setLocalTransactions([]);
      if (currentUser) {
        getDoc(doc(db, 'buyers', currentUser.uid)).then(snap => {
          if (snap.exists()) setBuyerProfile({ uid: currentUser.uid, ...snap.data() });
        }).catch(() => {});
      } else {
        setBuyerProfile(null);
      }
    }
  }, [isDemoMode, currentUser]);

  return (
    <Ctx.Provider value={{ isDemoMode, setIsDemoMode, buyerProfile, setBuyerProfile, localTransactions, setLocalTransactions }}>
      {children}
    </Ctx.Provider>
  );
}
