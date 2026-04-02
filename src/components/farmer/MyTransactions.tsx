import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFarmerMode } from '../../context/FarmerModeContext';
import { DEMO_TRANSACTION } from '../../utils/farmerDemoData';

// ── Status config ────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'requested',      label: 'Requested',      icon: '📋' },
  { key: 'baler_assigned', label: 'Baler Assigned',  icon: '🚜' },
  { key: 'pickup_done',    label: 'Pickup Done',     icon: '✅' },
  { key: 'in_transit',     label: 'In Transit',      icon: '🚛' },
  { key: 'delivered',      label: 'Delivered',       icon: '🏭' },
  { key: 'paid',           label: 'Paid',            icon: '💸' },
] as const;

type Status = typeof STEPS[number]['key'];

function stepIdx(s: string) { return STEPS.findIndex(st => st.key === s); }

// ── Custom Leaflet markers ────────────────────────────────────────────────────
const mk = (html: string, w = 38, h = 38) =>
  L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h] });

const farmPin  = mk(`<svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="17" r="15" fill="#1a5c2e" stroke="white" stroke-width="2"/><text x="19" y="23" text-anchor="middle" font-size="14">🌾</text></svg>`);
const buyerPin = mk(`<svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="17" r="15" fill="#dc2626" stroke="white" stroke-width="2"/><text x="19" y="23" text-anchor="middle" font-size="14">🏭</text></svg>`);

function balerPin() {
  return L.divIcon({
    html: `<div style="position:relative;width:38px;height:38px">
      <div style="position:absolute;inset:0;border-radius:50%;background:#2563eb;opacity:.3;animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite"></div>
      <svg width="38" height="38" viewBox="0 0 38 38" style="position:relative">
        <circle cx="19" cy="17" r="15" fill="#2563eb" stroke="white" stroke-width="2"/>
        <text x="19" y="23" text-anchor="middle" font-size="14">🚜</text>
      </svg></div>`,
    className: '', iconSize: [38, 38], iconAnchor: [19, 38],
  });
}

function MapFit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length >= 2) { try { map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 12 }); } catch {} }
  }, []);
  return null;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return <span className="text-amber-400">{'★'.repeat(Math.floor(n))}{'☆'.repeat(5 - Math.floor(n))}<span className="text-[#9ca3af] ml-1 text-xs">{n.toFixed(1)}</span></span>;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const BADGE: Record<string, string> = {
  requested:      'bg-blue-50 text-blue-700',
  baler_assigned: 'bg-amber-50 text-amber-700',
  pickup_done:    'bg-sky-50 text-sky-700',
  in_transit:     'bg-purple-50 text-purple-700',
  delivered:      'bg-green-50 text-green-700',
  paid:           'bg-emerald-100 text-emerald-800',
};

function StatusBadge({ s }: { s: string }) {
  const step = STEPS.find(x => x.key === s);
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${BADGE[s] ?? 'bg-gray-100 text-gray-600'}`}>{step?.icon} {step?.label ?? s}</span>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyTransactions() {
  const { isDemoMode, farmerProfile, localTransactions, setLocalTransactions } = useFarmerMode();
  const [txns, setTxns] = useState<any[]>([]);
  const [sel, setSel]   = useState<any>(null);
  const [balerPos, setBalerPos] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<'to_farmer' | 'to_buyer' | 'done'>('to_farmer');
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load transactions
  useEffect(() => {
    const all = isDemoMode ? [DEMO_TRANSACTION, ...localTransactions] : [...localTransactions];
    setTxns(all);
    if (all.length > 0 && !sel) setSel(all[0]);
  }, [isDemoMode, localTransactions]);

  // Start sim when selected changes
  useEffect(() => {
    if (!sel) return;
    clearSim();
    setBalerPos([sel.balerLat, sel.balerLng]);
    setPhase('to_farmer');
    if (isDemoMode && stepIdx(sel.status) >= 1 && sel.status !== 'paid') {
      startSim(sel);
    }
    return clearSim;
  }, [sel?.id, isDemoMode]);

  function clearSim() {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
  }

  function updateTxnStatus(id: string, status: string) {
    setTxns(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    setSel((prev: any) => prev?.id === id ? { ...prev, status } : prev);
    if (isDemoMode) setLocalTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  function startSim(txn: any) {
    const FARMER_LAT = 30.9, FARMER_LNG = 75.85;
    const BUYER_LAT = txn.buyerLat ?? 30.90, BUYER_LNG = txn.buyerLng ?? 75.85;
    let lat = txn.balerLat, lng = txn.balerLng;
    let currentPhase: 'to_farmer' | 'to_buyer' | 'done' = 'to_farmer';

    simRef.current = setInterval(() => {
      const tLat = currentPhase === 'to_farmer' ? FARMER_LAT : BUYER_LAT;
      const tLng = currentPhase === 'to_farmer' ? FARMER_LNG : BUYER_LNG;
      const dLat = tLat - lat, dLng = tLng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < 0.015) {
        if (currentPhase === 'to_farmer') {
          currentPhase = 'to_buyer';
          setPhase('to_buyer');
          lat = FARMER_LAT; lng = FARMER_LNG;
          updateTxnStatus(txn.id, 'pickup_done');
          setTimeout(() => updateTxnStatus(txn.id, 'in_transit'), 1500);
        } else {
          currentPhase = 'done';
          setPhase('done');
          clearSim();
          updateTxnStatus(txn.id, 'delivered');
          setTimeout(() => {
            updateTxnStatus(txn.id, 'paid');
            fireConfetti();
          }, 2000);
        }
        return;
      }
      const step = 0.018 / dist;
      lat += dLat * step;
      lng += dLng * step;
      setBalerPos([lat, lng]);
    }, 3000);
  }

  async function fireConfetti() {
    const { default: confetti } = await import('canvas-confetti');
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 }, colors: ['#1a5c2e', '#f59e0b', '#2d8a47', '#ffffff'] });
  }

  if (!txns.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No transactions yet</p>
        <p className="text-sm text-[#6b7280] mt-2">Register your straw and select a buyer to start.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>📋</span>My Transactions</h1>
        <p className="text-[#6b7280] text-sm mt-1">Live tracking of your parali sales.</p>
      </motion.div>

      {/* Tabs */}
      {txns.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {txns.map(t => (
            <button key={t.id} onClick={() => setSel(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${sel?.id === t.id ? 'bg-[#1a5c2e] text-white border-[#1a5c2e]' : 'bg-white border-[#e8e5de] text-[#6b7280]'}`}>
              {t.buyerName}
            </button>
          ))}
        </div>
      )}

      {sel && (
        <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Summary card */}
          <div className="bg-white border border-[#e8e5de] rounded-2xl p-5 flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-[#6b7280] mb-0.5">Selling to</p>
              <p className="font-display text-xl font-bold text-[#1c1c1a]">{sel.buyerName}</p>
              <p className="text-sm text-[#6b7280]">{sel.tonnes} tonnes · ₹{sel.pricePerTonne}/T</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6b7280]">Total Amount</p>
              <p className="font-display text-2xl font-bold text-[#1a5c2e]">₹{sel.totalAmount.toLocaleString('en-IN')}</p>
              <div className="mt-1"><StatusBadge s={sel.status}/></div>
            </div>
          </div>

          {/* Timeline stepper */}
          <div className="bg-white border border-[#e8e5de] rounded-2xl p-5">
            <p className="text-sm font-semibold text-[#1c1c1a] mb-5">Status Timeline</p>
            <div className="flex items-start overflow-x-auto pb-1 gap-0">
              {STEPS.map((step, i) => {
                const idx = stepIdx(sel.status);
                const done = idx > i, cur = idx === i;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-shrink-0 w-[72px]">
                    <div className="flex items-center w-full">
                      {i > 0 && <div className={`flex-1 h-0.5 ${done || cur ? 'bg-[#1a5c2e]' : 'bg-[#e8e5de]'}`}/>}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                        done ? 'bg-[#1a5c2e] border-[#1a5c2e] text-white' :
                        cur  ? 'border-[#f59e0b] bg-amber-50 animate-pulse' :
                               'border-[#e8e5de] bg-white text-[#9ca3af]'
                      }`}>
                        {done ? '✓' : step.icon}
                      </div>
                      {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${done ? 'bg-[#1a5c2e]' : 'bg-[#e8e5de]'}`}/>}
                    </div>
                    <p className={`text-[9px] mt-1.5 text-center font-medium leading-tight ${cur ? 'text-[#f59e0b]' : done ? 'text-[#1a5c2e]' : 'text-[#9ca3af]'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAID — Success state */}
          {sel.status === 'paid' ? (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#f0faf3] to-[#e8f5ec] border-2 border-[#1a5c2e] rounded-2xl p-7 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                className="w-20 h-20 bg-[#1a5c2e] rounded-full mx-auto flex items-center justify-center text-4xl mb-4 shadow-lg shadow-green-300">
                ✅
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-[#1a5c2e] mb-2">Payment Received!</h2>
              <p className="text-xl font-bold text-[#1c1c1a]">₹{sel.totalAmount.toLocaleString('en-IN')} via UPI</p>
              <p className="text-sm text-[#6b7280] mt-1">Sent to: <strong>{farmerProfile?.upiId ?? 'gurpreet@upi'}</strong></p>
              <div className="mt-5 p-4 bg-white rounded-xl border border-[#e8e5de] text-sm text-left space-y-2">
                <div className="flex justify-between"><span className="text-[#6b7280]">Buyer paid:</span><span>₹{sel.totalAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold"><span className="text-[#6b7280]">Your share (80%):</span><span className="text-[#1a5c2e]">₹{Math.round(sel.totalAmount * 0.8).toLocaleString('en-IN')}</span></div>
                <p className="text-xs text-[#9ca3af]">* 20% covers baler + transport commission</p>
              </div>
              <button onClick={() => window.location.href = '/farmer/certificates'}
                className="mt-5 px-6 py-2.5 bg-[#1a5c2e] text-white text-sm font-semibold rounded-xl hover:bg-[#2d8a47] transition-colors">
                🏆 Download Green Certificate
              </button>
            </motion.div>

          ) : stepIdx(sel.status) >= 1 && balerPos ? (
            /* Live tracking map */
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
              {/* Phase banner */}
              <div className="px-5 py-3 bg-[#f0faf3] border-b border-[#e8e5de] flex items-center justify-between">
                <p className="text-sm font-medium text-[#1a5c2e]">
                  {phase === 'to_farmer' ? '🚜 Baler heading to your farm'
                    : phase === 'to_buyer' ? '🚛 Delivering to buyer facility'
                    : '✅ Delivery complete!'}
                </p>
                <span className="text-xs text-[#6b7280] bg-white border border-[#e8e5de] px-2 py-0.5 rounded-lg">🔴 Live</span>
              </div>

              <MapContainer center={[30.9, 75.85]} zoom={10} style={{ height: 260 }} scrollWheelZoom={false}
                maxBounds={[[6.5, 68.0], [35.5, 97.5]]} minZoom={5}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en" attribution="Google Maps"/>
                <MapFit pts={[[30.9, 75.85], [sel.buyerLat ?? 30.9, sel.buyerLng ?? 75.85], balerPos]}/>

                {/* Farmer */}
                <Marker position={[30.9, 75.85]} icon={farmPin}>
                  <Popup>🌾 Your Farm</Popup>
                </Marker>

                {/* Buyer */}
                <Marker position={[sel.buyerLat ?? 30.9, sel.buyerLng ?? 75.85]} icon={buyerPin}>
                  <Popup>🏭 {sel.buyerName}</Popup>
                </Marker>

                {/* Baler (animated) */}
                <Marker position={balerPos} icon={balerPin()}>
                  <Popup>🚜 {sel.balerName}</Popup>
                </Marker>

                {/* Dashed full route */}
                <Polyline positions={[[30.9, 75.85], [sel.buyerLat ?? 30.9, sel.buyerLng ?? 75.85]]}
                  pathOptions={{ color: '#9ca3af', dashArray: '6 6', weight: 2 }}/>

                {/* Animated blue route: baler → next target */}
                <Polyline
                  positions={[balerPos, phase === 'to_farmer' ? [30.9, 75.85] : [sel.buyerLat ?? 30.9, sel.buyerLng ?? 75.85]]}
                  pathOptions={{ color: '#2563eb', weight: 3 }}/>
              </MapContainer>

              {/* ETA + logistics info */}
              <div className="p-5 border-t border-[#e8e5de]">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-[#6b7280] mb-0.5">Operator</p>
                    <p className="text-sm font-semibold text-[#1c1c1a]">{sel.balerName}</p>
                    <Stars n={sel.balerRating ?? 4.8}/>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6b7280]">ETA</p>
                    <p className="text-lg font-bold text-[#f59e0b]">~{phase === 'to_farmer' ? '12' : '18'} min</p>
                    <p className="text-xs text-[#9ca3af]">{sel.balerEquipment ?? 'John Deere + Square Baler'}</p>
                  </div>
                </div>

                {/* Phone */}
                <a href={`tel:${sel.balerPhone ?? '+919814000001'}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#f0faf3] border border-[#b3dcbc] rounded-xl text-sm text-[#1a5c2e] font-medium hover:bg-[#e8f5ec] transition-colors">
                  📞 {sel.balerPhone ?? '+91 98140 00001'} <span className="text-xs opacity-60">(tap to call)</span>
                </a>

                {isDemoMode && (
                  <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                    🎭 Demo simulation — baler moves every 3 seconds toward your farm, then to buyer!
                  </p>
                )}
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
