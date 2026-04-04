import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useBuyerMode } from '../../context/BuyerModeContext';

const STEPS = [
  { key: 'requested',      label: 'Requested',     icon: '📋' },
  { key: 'baler_assigned', label: 'Baler Assigned', icon: '🚜' },
  { key: 'pickup_done',    label: 'Pickup Done',    icon: '✅' },
  { key: 'in_transit',     label: 'In Transit',     icon: '🚛' },
  { key: 'delivered',      label: 'Delivered',      icon: '🏭' },
  { key: 'paid',           label: 'Paid',           icon: '💸' },
] as const;

function stepIdx(s: string) { return STEPS.findIndex(x => x.key === s); }

const mk = (html: string, w = 38, h = 38) =>
  L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h] });

const facilityPin = mk(`<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="18" r="16" fill="#92400e" stroke="white" stroke-width="2"/><text x="20" y="24" text-anchor="middle" font-size="15">🏭</text></svg>`, 40, 40);
const balerPin = L.divIcon({
  html: `<div style="position:relative;width:38px;height:38px"><div style="position:absolute;inset:0;border-radius:50%;background:#2563eb;opacity:.3;animation:ping 1.2s infinite"></div><svg width="38" height="38" viewBox="0 0 38 38" style="position:relative"><circle cx="19" cy="17" r="15" fill="#2563eb" stroke="white" stroke-width="2"/><text x="19" y="23" text-anchor="middle" font-size="14">🚜</text></svg></div>`,
  className: '', iconSize: [38, 38], iconAnchor: [19, 38],
});

function MapFit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length >= 2) { try { map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 12 }); } catch {} }
  }, []);
  return null;
}

export default function TrackDeliveries() {
  const { isDemoMode, buyerProfile, localTransactions, setLocalTransactions } = useBuyerMode();
  const [payModal, setPayModal] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  const buyerLat = buyerProfile?.lat ?? 30.90;
  const buyerLng = buyerProfile?.lng ?? 75.85;

  const active = localTransactions.filter((t: any) =>
    ['baler_assigned', 'pickup_done', 'in_transit', 'delivered', 'paid'].includes(t.status)
  );

  async function confirmPay(txn: any) {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1800));
    const farmerAmt = Math.round(txn.totalAmount * 0.8);
    const logisticsAmt = txn.totalAmount - farmerAmt;
    setLocalTransactions((prev: any) => prev.map((t: any) =>
      t.id === txn.id ? { ...t, status: 'paid', paidAt: new Date().toISOString(), farmerAmount: farmerAmt, logisticsAmount: logisticsAmt } : t
    ));
    toast.success(`✅ ₹${txn.totalAmount.toLocaleString('en-IN')} paid successfully!`);
    setPaying(false);
    setPayModal(null);
  }

  if (!active.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No active deliveries</p>
        <p className="text-sm text-[#6b7280] mt-2">Accept farmer requests to start tracking deliveries.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🗺️</span>Track Deliveries</h1>
        <p className="text-[#6b7280] text-sm mt-1">{active.length} active delivery{active.length !== 1 ? 's' : ''} in progress.</p>
      </motion.div>

      <div className="space-y-5">
        {active.map((txn: any, i: number) => (
          <TransactionTracker key={txn.id} txn={txn} index={i} buyerLat={buyerLat} buyerLng={buyerLng} isDemoMode={isDemoMode} setPayModal={setPayModal} setLocalTransactions={setLocalTransactions} />
        ))}
      </div>

      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !paying && setPayModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-display text-lg font-bold text-[#1c1c1a] mb-4">Confirm Payment</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#6b7280]">Total Amount:</span><strong>₹{payModal.totalAmount.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span className="text-[#6b7280]">Farmer receives (80%):</span><strong className="text-[#1a5c2e]">₹{Math.round(payModal.totalAmount * 0.8).toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span className="text-[#6b7280]">Logistics (20%):</span><strong className="text-amber-600">₹{Math.round(payModal.totalAmount * 0.2).toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between border-t border-amber-200 pt-2"><span className="text-[#6b7280]">Paid from:</span><strong>{buyerProfile?.upiId ?? 'haryanabio@upi'}</strong></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => confirmPay(payModal)} disabled={paying}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Processing…
                    </span>
                  ) : '💳 Confirm Payment'}
                </button>
                <button onClick={() => setPayModal(null)} disabled={paying}
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

function TransactionTracker({ txn, index, buyerLat, buyerLng, isDemoMode, setPayModal, setLocalTransactions }: any) {
  const [balerPos, setBalerPos] = useState<[number, number]>([txn.balerLat ?? 30.92, txn.balerLng ?? 75.88]);
  const [phase, setPhase] = useState<'to_farmer' | 'to_buyer' | 'done'>('to_farmer');
  const simRef = useRef<any>(null);

  useEffect(() => {
    if (isDemoMode && stepIdx(txn.status) >= 1 && txn.status !== 'delivered' && txn.status !== 'paid') {
      startSim();
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [txn.id, isDemoMode, txn.status]);

  function updateStatus(status: string) {
    setLocalTransactions((prev: any) => prev.map((t: any) => t.id === txn.id ? { ...t, status } : t));
  }

  function startSim() {
    const FARMER_LAT = txn.farmerLat ?? 30.85;
    const FARMER_LNG = txn.farmerLng ?? 75.80;
    let lat = balerPos[0], lng = balerPos[1];
    let currentPhase = stepIdx(txn.status) >= 3 ? 'to_buyer' : 'to_farmer';
    setPhase(currentPhase as any);

    if (simRef.current) clearInterval(simRef.current);
    simRef.current = setInterval(() => {
      const tLat = currentPhase === 'to_farmer' ? FARMER_LAT : buyerLat;
      const tLng = currentPhase === 'to_farmer' ? FARMER_LNG : buyerLng;
      const dLat = tLat - lat, dLng = tLng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < 0.015) {
        if (currentPhase === 'to_farmer') {
          currentPhase = 'to_buyer';
          setPhase('to_buyer');
          lat = FARMER_LAT; lng = FARMER_LNG;
          updateStatus('pickup_done');
          setTimeout(() => updateStatus('in_transit'), 1500);
        } else {
          currentPhase = 'done';
          setPhase('done');
          if (simRef.current) clearInterval(simRef.current);
          updateStatus('delivered');
        }
        return;
      }
      const step = 0.018 / dist;
      lat += dLat * step;
      lng += dLng * step;
      setBalerPos([lat, lng]);
    }, 3000);
  }

  const idx = stepIdx(txn.status);
  const isPaid = txn.status === 'paid';
  const isDelivered = txn.status === 'delivered';

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
      
      <div className="p-5 border-b border-[#e8e5de] flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-display text-base font-bold text-[#1c1c1a]">{txn.farmerName} → Your Facility</p>
          <p className="text-xs text-[#6b7280] mt-0.5">{txn.tonnes}T · ₹{txn.pricePerTonne}/T</p>
        </div>
        <p className="font-display text-xl font-bold text-amber-600">₹{txn.totalAmount.toLocaleString('en-IN')}</p>
      </div>

      <div className="px-5 py-4 border-b border-[#e8e5de]">
        <div className="flex items-start overflow-x-auto pb-1 gap-0">
          {STEPS.map((step, si) => {
            const done = idx > si, cur = idx === si;
            return (
              <div key={step.key} className="flex flex-col items-center flex-shrink-0 w-20">
                <div className="flex items-center w-full">
                  <div className={`flex-1 h-0.5 ${done || cur ? 'bg-amber-400' : 'bg-[#e8e5de]'} ${si === 0 ? 'opacity-0' : ''}`}/>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                    done ? 'bg-amber-500 border-amber-500 text-white shadow-sm' :
                    cur  ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-sm shadow-amber-200' :
                           'border-[#e8e5de] bg-[#f5f5f2] text-[#6b7280] dark:text-[#9ca3af]'
                  }`}>{done ? '✓' : step.icon}</div>
                  <div className={`flex-1 h-0.5 ${done ? 'bg-amber-400' : 'bg-[#e8e5de]'} ${si === STEPS.length - 1 ? 'opacity-0' : ''}`}/>
                </div>
                <p className={`text-[10px] mt-2 text-center font-bold leading-tight ${cur ? 'text-amber-600' : done ? 'text-amber-500' : 'text-[#6b7280] dark:text-[#9ca3af]'}`}>{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        {isPaid ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-[#1a5c2e]">Payment Complete</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-[#6b7280]">Farmer received</p>
                <p className="font-bold text-[#1a5c2e]">₹{(txn.farmerAmount ?? Math.round(txn.totalAmount * 0.8)).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-[#6b7280]">Logistics received</p>
                <p className="font-bold text-amber-600">₹{(txn.logisticsAmount ?? Math.round(txn.totalAmount * 0.2)).toLocaleString('en-IN')}</p>
              </div>
            </div>
            {txn.certificateId && (
              <p className="text-xs text-[#6b7280] mt-4 font-mono">Cert: {txn.certificateId}</p>
            )}
          </motion.div>

        ) : isDelivered ? (
          <div className="text-center py-6 bg-[#fafaf7] rounded-xl border border-[#e8e5de]">
            <h3 className="text-xl font-display font-bold text-[#1c1c1a] mb-2">Delivery Successfully Arrived</h3>
            <p className="text-[#6b7280] mb-6 text-sm max-w-sm mx-auto">
              Please release the funds to the system to complete the transaction and acquire ownership of the biomass payload.
            </p>
            <button onClick={() => setPayModal(txn)}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 dark:text-white font-bold rounded-lg text-sm transition-all shadow-md w-full max-w-[300px]">
              Release Payment (₹{txn.totalAmount.toLocaleString('en-IN')})
            </button>
          </div>

        ) : (idx >= 1 && idx <= 3) ? (
          <div>
            <div className="rounded-xl overflow-hidden border border-[#e8e5de] mb-3">
              <div className="px-4 py-2 bg-[#fafaf7] border-b border-[#e8e5de] flex items-center justify-between">
                <p className="text-xs font-medium text-[#1a5c2e]">
                  {phase === 'to_farmer' ? '🚜 Heading to farm' : '🚛 In transit to facility'}
                </p>
                <span className="text-xs text-red-500 font-semibold animate-pulse">🔴 Live Track</span>
              </div>
              <MapContainer center={[(balerPos[0] + buyerLat) / 2, (balerPos[1] + buyerLng) / 2]}
                zoom={10} style={{ height: 260 }} scrollWheelZoom={false}
                maxBounds={[[6.5, 68.0], [35.5, 97.5]]} minZoom={5}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en" attribution="Google Maps"/>
                <MapFit pts={[balerPos, [buyerLat, buyerLng], [txn.farmerLat ?? 30.85, txn.farmerLng ?? 75.80]]}/>
                
                <Marker position={[buyerLat, buyerLng]} icon={facilityPin}>
                  <Popup>🏭 Your Facility</Popup>
                </Marker>
                <Marker position={[txn.farmerLat ?? 30.85, txn.farmerLng ?? 75.80]} icon={mk(`<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="15" r="13" fill="#1a5c2e" stroke="white" stroke-width="2"/><text x="17" y="20" text-anchor="middle" font-size="12">🌾</text></svg>`, 34, 34)}>
                  <Popup>🌾 Farmer ({txn.farmerName})</Popup>
                </Marker>
                <Marker position={balerPos} icon={balerPin}>
                  <Popup>🚜 {txn.balerName}</Popup>
                </Marker>
                
                {phase === 'to_farmer' || idx < 3 ? (
                  <Polyline positions={[balerPos, [txn.farmerLat ?? 30.85, txn.farmerLng ?? 75.80]]}
                    pathOptions={{ color: '#2563eb', weight: 4 }}/>
                ) : (
                  <Polyline positions={[balerPos, [buyerLat, buyerLng]]}
                    pathOptions={{ color: '#2563eb', weight: 4 }}/>
                )}
                
                <Polyline positions={[[txn.farmerLat ?? 30.85, txn.farmerLng ?? 75.80], [buyerLat, buyerLng]]}
                    pathOptions={{ color: '#9ca3af', weight: 2, dashArray: '4, 4' }}/>
              </MapContainer>
            </div>
            <div className="flex justify-between items-center px-1">
              <p className="text-sm text-[#6b7280]">
                {phase === 'to_farmer' ? 'Baler heading to pickup payload.' : 'Acquired payload. Heading to facility.'}
              </p>
              {isDemoMode && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Demo Sim</span>}
            </div>
          </div>

        ) : (
          <div className="flex items-center gap-3 p-4 bg-[#fafaf7] rounded-xl border border-[#e8e5de]">
            <span className="text-2xl">⏳</span>
            <p className="text-sm text-[#6b7280]">Waiting for baler assignment...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
