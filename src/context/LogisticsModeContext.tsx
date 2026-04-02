import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEMO_LOGISTICS_PROFILE, DEMO_CURRENT_JOB, DEMO_COMPLETED_JOBS } from '../utils/logisticsDemoData';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface LogisticsModeCtx {
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
  profile: any;
  setProfile: (p: any) => void;
  activeJob: any;
  setActiveJob: React.Dispatch<React.SetStateAction<any>>;
  completedJobs: any[];
  setCompletedJobs: React.Dispatch<React.SetStateAction<any[]>>;
  currentPos: { lat: number; lng: number };
  setCurrentPos: (pos: { lat: number; lng: number }) => void;
  toggleAvailability: () => Promise<void>;
}

const Ctx = createContext<LogisticsModeCtx | null>(null);

export function useLogisticsMode() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLogisticsMode must be inside LogisticsModeProvider');
  return c;
}

export function LogisticsModeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const initialDemo = localStorage.getItem('pb_logistics_mode') !== 'false';
  const [isDemoMode, setIsDemoModeState] = useState(initialDemo);
  const [profile, setProfile] = useState<any>(initialDemo ? DEMO_LOGISTICS_PROFILE : null);
  const [activeJob, setActiveJob] = useState<any>(initialDemo ? DEMO_CURRENT_JOB : null);
  const [completedJobs, setCompletedJobs] = useState<any[]>(initialDemo ? DEMO_COMPLETED_JOBS : []);
  const [currentPos, setCurrentPos] = useState({ lat: initialDemo ? DEMO_LOGISTICS_PROFILE.currentLat : 30.9, lng: initialDemo ? DEMO_LOGISTICS_PROFILE.currentLng : 75.85 });

  function setIsDemoMode(v: boolean) {
    setIsDemoModeState(v);
    localStorage.setItem('pb_logistics_mode', String(v));
  }

  useEffect(() => {
    if (isDemoMode) {
      setProfile(DEMO_LOGISTICS_PROFILE);
      setActiveJob(DEMO_CURRENT_JOB);
      setCompletedJobs(DEMO_COMPLETED_JOBS);
      setCurrentPos({ lat: DEMO_LOGISTICS_PROFILE.currentLat, lng: DEMO_LOGISTICS_PROFILE.currentLng });
    } else {
      setActiveJob(null);
      setCompletedJobs([]);
      if (currentUser) {
        getDoc(doc(db, 'logistics', currentUser.uid)).then(snap => {
          if (snap.exists()) {
            const d = snap.data();
            setProfile({ uid: currentUser.uid, ...d });
            setCurrentPos({ lat: d.currentLat ?? 30.9, lng: d.currentLng ?? 75.85 });
          }
        }).catch(() => {});
      } else {
        setProfile(null);
      }
    }
  }, [isDemoMode, currentUser]);

  async function toggleAvailability() {
    const next = !profile.available;
    setProfile((p: any) => ({ ...p, available: next }));
    if (!isDemoMode && currentUser) {
      try { await updateDoc(doc(db, 'logistics', currentUser.uid), { available: next }); } catch {}
    }
  }

  return (
    <Ctx.Provider value={{ isDemoMode, setIsDemoMode, profile, setProfile, activeJob, setActiveJob, completedJobs, setCompletedJobs, currentPos, setCurrentPos, toggleAvailability }}>
      {children}
    </Ctx.Provider>
  );
}
