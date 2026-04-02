import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLogisticsMode } from '../../context/LogisticsModeContext';
import { DEMO_CURRENT_JOB } from '../../utils/logisticsDemoData';
import { haversineDistance } from '../../utils/distance';

// ── Map icons ───────────────────────────────────────────────────────────────
const mk = (html: string, w = 38, h = 38) =>
  L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h] });

const farmerPin = mk(`<svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="17" r="15" fill="#1a5c2e" stroke="white" stroke-width="2"/><text x="19" y="23" text-anchor="middle" font-size="14">🌾</text></svg>`);
const buyerPin  = mk(`<svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="17" r="15" fill="#dc2626" stroke="white" stroke-width="2"/><text x="19" y="23" text-anchor="middle" font-size="14">🏭</text></svg>`);

function youPin(phase: Phase) {
  const color = phase === 2 ? '#2563eb' : '#f59e0b';
  return L.divIcon({
    html: `<div style="position:relative;width:42px;height:42px">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.3;animation:ping 1.2s infinite"></div>
      <svg width="42" height="42" viewBox="0 0 42 42" style="position:relative">
        <circle cx="21" cy="21" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="21" y="27" text-anchor="middle" font-size="16">${phase === 1 ? '🚜' : '🚛'}</text>
      </svg>
    </div>`,
    className: '', iconSize: [42, 42], iconAnchor: [21, 42],
  });
}

function MapFit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length >= 2) { try { map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 13 }); } catch {} }
  }, []);
  return null;
}

type Phase = 1 | 2 | 3;

export default function CurrentJob() {
  const { isDemoMode, activeJob, setActiveJob, profile, setProfile, currentPos, setCurrentPos, setCompletedJobs } = useLogisticsMode();
  const navigate = useNavigate();

  if (!isDemoMode && !activeJob) {
    return (
      <div className="text-center py-20 max-w-2xl">
        <div className="text-6xl mb-4">🚜</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No Active Job</p>
        <p className="text-sm text-[#6b7280] mt-2">You don't have any ongoing deliveries. Browse the available requests to start earning.</p>
        <button onClick={() => navigate('/logistics')} className="mt-5 px-6 py-2.5 bg-[#1d4ed8] text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition">
          Find Available Jobs
        </button>
      </div>
    );
  }

  const job = activeJob ?? DEMO_CURRENT_JOB;

  const [phase, setPhase] = useState<Phase>(1);
  const [phaseFlash, setPhaseFlash] = useState(false);
  const [distToTarget, setDistToTarget] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<'pickup' | 'delivery' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetLat = phase === 1 ? job.farmerLat : job.buyerLat;
  const targetLng = phase === 1 ? job.farmerLng : job.buyerLng;

  // ── ETA calc ────────────────────────────────────────────────────────────────
  const etaMin = Math.max(1, Math.round((distToTarget / 25) * 60));

  // ── Simulation ──────────────────────────────────────────────────────────────
  const posRef = useRef({ lat: currentPos.lat, lng: currentPos.lng });

  useEffect(() => {
    posRef.current = currentPos;
  }, [currentPos]);

  useEffect(() => {
    if (isDemoMode && phase < 3) startSim();
    return () => clearSim();
  }, [phase, isDemoMode]);

  useEffect(() => {
    const d = haversineDistance(currentPos.lat, currentPos.lng, targetLat, targetLng);
    setDistToTarget(d);
  }, [currentPos, phase]);

  function clearSim() {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
  }

  function startSim() {
    clearSim();
    simRef.current = setInterval(() => {
      const prev = posRef.current;
      const dLat = targetLat - prev.lat, dLng = targetLng - prev.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < 0.015) return;
      const step = 0.018 / dist;
      const next = { lat: prev.lat + dLat * step, lng: prev.lng + dLng * step };
      posRef.current = next;
      setCurrentPos(next);
    }, 3000);
  }

  // ── Auto-delivery & Instant Payment ─────────────────────────────────────────
  async function confirmPickup() {
    clearSim();
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    setConfirming(false);
    setConfirmModal(null);
    toast.success(`✅ Farm reached and delivered! Payment processing...`);
    
    // Jump straight to Phase 3 (Payment) instantly
    setPhase(3);
    setActiveJob((j: any) => j ? { ...j, status: 'paid' } : null);
    setPaySuccess(true);
    
    const { default: confetti } = await import('canvas-confetti');
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#1d4ed8', '#f59e0b', '#ffffff', '#1a5c2e'] });
    setCompletedJobs(prev => [{ id: job.id, farmerName: job.farmerName, tonnes: job.tonnes, totalAmount: job.totalAmount, commission: job.commission, date: new Date().toLocaleDateString('en-IN'), status: 'paid' }, ...prev]);
  }

  // ── Delivery confirm ────────────────────────────────────────────────────────
  async function confirmDelivery() {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 800));
    setConfirming(false);
    setConfirmModal(null);
    toast.success(`✅ Delivery confirmed at ${new Date().toLocaleTimeString()}`);
    setActiveJob((j: any) => ({ ...j, status: 'delivered' }));
    setPhase(3);

    // Auto-pay after 3 seconds in demo
    if (isDemoMode) {
      setTimeout(async () => {
        setPaySuccess(true);
        setActiveJob((j: any) => ({ ...j, status: 'paid' }));
        const { default: confetti } = await import('canvas-confetti');
        confetti({ particleCount: 140, spread: 75, origin: { y: 0.5 }, colors: ['#1d4ed8', '#f59e0b', '#ffffff', '#1a5c2e'] });
        setCompletedJobs(prev => [{ id: job.id, farmerName: job.farmerName, tonnes: job.tonnes, totalAmount: job.totalAmount, commission: job.commission, date: new Date().toLocaleDateString('en-IN'), status: 'paid' }, ...prev]);
      }, 3000);
    }
  }

  function resetAndFindJobs() {
    setPhase(1);
    setPaySuccess(false);
    setActiveJob(null);
    setProfile((p: any) => ({ ...p, available: true }));
    navigate('/logistics/jobs');
  }

  const allPts: [number, number][] = [
    [currentPos.lat, currentPos.lng],
    [job.farmerLat, job.farmerLng],
    [job.buyerLat, job.buyerLng],
  ];

  return (
    <div className="max-w-3xl">
      {/* Phase flash overlay */}
      <AnimatePresence>
        {phaseFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-green-500"
            style={{ pointerEvents: 'none' }}>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-white">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="font-display text-3xl font-bold">Pickup Complete!</h2>
              <p className="text-xl mt-2">Now heading to Buyer Facility 🏭</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🚜</span>Current Job</h1>
        <p className="text-[#6b7280] text-sm mt-1">You are in control of this delivery.</p>
      </motion.div>

      {/* Phase banner */}
      <motion.div key={phase} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 mb-5 flex items-center gap-4 ${
          phase === 1 ? 'bg-amber-50 border-2 border-amber-400' :
          phase === 2 ? 'bg-blue-50 border-2 border-blue-400' :
                        'bg-green-50 border-2 border-green-400'
        }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          phase === 1 ? 'bg-amber-400' : phase === 2 ? 'bg-blue-500' : 'bg-green-500'
        }`}>
          {phase === 1 ? '📍' : phase === 2 ? '🏭' : '✓'}
        </div>
        <div>
          <p className={`text-sm font-bold uppercase tracking-wide ${phase === 1 ? 'text-amber-700' : phase === 2 ? 'text-blue-700' : 'text-green-700'}`}>
            {phase === 1 ? 'Phase 1: Head to Farmer' : phase === 2 ? 'Phase 2: Head to Buyer' : 'Phase 3: Complete'}
          </p>
          <p className={`text-sm ${phase === 1 ? 'text-amber-800' : phase === 2 ? 'text-blue-800' : 'text-green-800'}`}>
            {phase === 1 ? `📍 Head to ${job.farmerName}'s farm — ETA ~${etaMin} min` :
             phase === 2 ? `🏭 Deliver to ${job.buyerName} — ETA ~${etaMin} min` :
             '✓ Job Complete — Payment Processing'}
          </p>
        </div>
      </motion.div>

      {/* Job summary */}
      <div className="bg-white border border-[#e8e5de] rounded-2xl p-5 mb-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-[#6b7280]">Farmer</p>
            <p className="font-semibold">{job.farmerName}</p>
            <p className="text-xs text-[#6b7280]">{job.farmerDistrict}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#6b7280]">Tonnes</p>
            <p className="text-xl font-display font-bold text-[#1d4ed8]">{job.tonnes}T</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b7280]">Your Commission</p>
            <p className="text-xl font-display font-bold text-amber-600">₹{job.commission.toLocaleString('en-IN')}</p>
            <p className="text-xs text-[#6b7280]">20% of ₹{job.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {phase < 3 ? (
        <>
          {/* Map */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden mb-4">
            {/* Info bar */}
            <div className={`px-4 py-2.5 flex items-center justify-between border-b border-[#e8e5de] ${phase === 1 ? 'bg-amber-50' : 'bg-blue-50'}`}>
              <p className={`text-xs font-semibold ${phase === 1 ? 'text-amber-700' : 'text-blue-700'}`}>
                Distance to {phase === 1 ? 'farm' : 'buyer'}: <strong>{distToTarget} km</strong>
              </p>
              <p className={`text-xs ${phase === 1 ? 'text-amber-600' : 'text-blue-600'}`}>ETA: ~{etaMin} min</p>
            </div>

            <MapContainer center={[currentPos.lat, currentPos.lng]} zoom={12} style={{ height: 320 }} scrollWheelZoom={false}
              maxBounds={[[6.5, 68.0], [35.5, 97.5]]} minZoom={5}>
              <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en" attribution="Google"/>
              <MapFit pts={allPts}/>

              {/* You */}
              <Marker position={[currentPos.lat, currentPos.lng]} icon={youPin(phase)}>
                <Popup>🚜 You — {profile?.name}</Popup>
              </Marker>

              {/* Farmer */}
              <Marker position={[job.farmerLat, job.farmerLng]} icon={farmerPin}>
                <Popup>🌾 {job.farmerName}</Popup>
              </Marker>

              {/* Buyer */}
              <Marker position={[job.buyerLat, job.buyerLng]} icon={buyerPin}>
                <Popup>🏭 {job.buyerName}</Popup>
              </Marker>

              {/* Dashed full route */}
              <Polyline positions={[[job.farmerLat, job.farmerLng], [job.buyerLat, job.buyerLng]]}
                pathOptions={{ color: '#9ca3af', dashArray: '6 6', weight: 2 }}/>

              {/* Animated route: you → target */}
              <Polyline positions={[[currentPos.lat, currentPos.lng], [targetLat, targetLng]]}
                pathOptions={{ color: phase === 1 ? '#f59e0b' : '#2563eb', weight: 3.5 }}/>
            </MapContainer>
          </motion.div>

          {/* Action button */}
          <div className="bg-white border border-[#e8e5de] rounded-2xl p-5 shadow-sm">
            {phase === 1 ? (
               <button onClick={() => setConfirmModal('pickup')}
                 className="w-full py-4 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                 <span>✓</span> Complete Delivery & Receive Payment
               </button>
            ) : (
                <div className="w-full py-4 bg-[#f0faf3] text-[#1a5c2e] font-bold text-lg rounded-xl border border-[#b3dcbc] flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Delivering to Buyer...
                </div>
            )}
          </div>
        </>
      ) : paySuccess ? (
        /* Payment success */
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#f0faf3] to-[#e8f5ec] border-2 border-[#1a5c2e] rounded-2xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="w-20 h-20 bg-[#1a5c2e] rounded-full mx-auto flex items-center justify-center text-4xl mb-4 shadow-lg shadow-green-300">
            🎉
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-[#1a5c2e] mb-2">Payment Received!</h2>
          <p className="text-3xl font-display font-black text-[#1c1c1a] mb-1">₹{job.commission.toLocaleString('en-IN')}</p>
          <p className="text-sm text-[#6b7280] mb-1">Your commission (20%) sent to <strong>{profile?.upiId ?? 'rajvir@upi'}</strong></p>
          <div className="mt-5 p-4 bg-white rounded-xl border border-[#e8e5de] text-sm text-left space-y-2">
            <div className="flex justify-between"><span className="text-[#6b7280]">Total deal:</span><span>₹{job.totalAmount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold"><span className="text-[#6b7280]">Your commission:</span><span className="text-[#1a5c2e]">₹{job.commission.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => navigate('/logistics/earnings')}
              className="flex-1 py-2.5 border border-[#1a5c2e] text-[#1a5c2e] text-sm font-semibold rounded-xl hover:bg-[#f0faf3] transition-colors">
              View in Earnings →
            </button>
            <button onClick={resetAndFindJobs}
              className="flex-1 py-2.5 bg-[#1d4ed8] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Accept New Jobs 🚜
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl mb-3 animate-pulse">⏳</div>
          <p className="font-semibold text-[#1c1c1a]">Delivery confirmed!</p>
          <p className="text-sm text-[#6b7280] mt-1">Payment processing… (takes a few seconds)</p>
        </div>
      )}

      {/* Confirm modals */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !confirming && setConfirmModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-display text-lg font-bold text-[#1c1c1a] mb-3">
                {confirmModal === 'pickup' ? 'Complete Delivery & Payment' : 'Confirm Delivery'}
              </h3>
              <p className="text-sm text-[#6b7280] mb-5">
                {confirmModal === 'pickup'
                  ? `Finish your delivery and instantly receive your commision in your account?`
                  : `Confirm delivery to ${job.buyerName}? ${job.tonnes} tonnes delivered.`}
              </p>
              <div className="flex gap-3">
                <button onClick={confirmModal === 'pickup' ? confirmPickup : confirmDelivery} disabled={confirming}
                  className={`flex-1 py-3 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 ${confirmModal === 'pickup' ? 'bg-[#1a5c2e] hover:bg-[#2d8a47]' : 'bg-[#1d4ed8] hover:bg-blue-700'}`}>
                  {confirming ? 'Confirming…' : '✓ Confirm'}
                </button>
                <button onClick={() => setConfirmModal(null)} disabled={confirming}
                  className="px-4 py-3 border border-[#e8e5de] text-sm rounded-xl hover:bg-[#f5f5f2] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
