import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFarmerMode } from '../../context/FarmerModeContext';
import { DEMO_BUYERS, DEMO_LOGISTICS } from '../../utils/farmerDemoData';
import { matchBuyers } from '../../utils/matching';
import { assignLogistics } from '../../utils/balerAssign';
import { districtCoords } from '../../utils/distance';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

// ── Custom markers ──────────────────────────────────────────────────────────
const mk = (html: string, size = 36) =>
  L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size] });

const buyerMarker   = mk(`<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="16" r="14" fill="#1a5c2e" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">🏭</text></svg>`);
const balerMarker   = mk(`<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="16" r="14" fill="#2563eb" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">🚜</text></svg>`);
const tractorMarker = mk(`<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="16" r="14" fill="#f59e0b" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">🚛</text></svg>`);
const farmerMarker  = mk(`<svg width="36" height="44" viewBox="0 0 36 44"><circle cx="18" cy="16" r="14" fill="#dc2626" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">📍</text><text x="18" y="40" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">You</text></svg>`, 44);

function MapFit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length > 1) { try { map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 11 }); } catch {} }
  }, [pts.length]);
  return null;
}

type Filter = 'buyers' | 'logistics' | 'both';

export default function FindBuyers() {
  const { isDemoMode, farmerProfile, setLocalTransactions } = useFarmerMode();
  const navigate = useNavigate();

  const farmerLat = districtCoords[farmerProfile?.district ?? 'Ludhiana']?.lat ?? 30.9;
  const farmerLng = districtCoords[farmerProfile?.district ?? 'Ludhiana']?.lng ?? 75.85;
  const farmerTonnes = farmerProfile?.estimatedTonnes ?? 20;

  const [filter, setFilter]     = useState<Filter>('both');
  const [buyers, setBuyers]     = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [highlightId, setHighlightId] = useState<string|null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 500));
        setBuyers(matchBuyers(farmerTonnes, farmerLat, farmerLng, DEMO_BUYERS));
        setLogistics(DEMO_LOGISTICS);
      } else {
        try {
          const [bs, ls] = await Promise.all([getDocs(collection(db, 'buyers')), getDocs(collection(db, 'logistics'))]);
          setBuyers(matchBuyers(farmerTonnes, farmerLat, farmerLng, bs.docs.map(d => ({ id: d.id, ...d.data() }))));
          setLogistics(ls.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          toast.error('Could not load from Firestore — showing demo data');
          setBuyers(matchBuyers(farmerTonnes, farmerLat, farmerLng, DEMO_BUYERS));
          setLogistics(DEMO_LOGISTICS);
        }
      }
      setLoading(false);
    })();
  }, [isDemoMode, farmerProfile?.district]);

  async function handleConfirm() {
    if (!selected) return;
    setConfirming(true);
    const assigned = assignLogistics(farmerProfile?.district ?? 'Ludhiana', farmerLat, farmerLng, isDemoMode ? DEMO_LOGISTICS : logistics);
    const txn = {
      id: `txn_${Date.now()}`,
      farmerId: farmerProfile?.uid,
      farmerName: farmerProfile?.name,
      buyerId: selected.id,
      buyerName: selected.companyName,
      buyerLat: selected.lat,
      buyerLng: selected.lng,
      tonnes: farmerTonnes,
      pricePerTonne: selected.pricePerTonne,
      totalAmount: farmerTonnes * selected.pricePerTonne,
      status: 'baler_assigned',
      balerId: assigned?.id,
      balerName: assigned?.name ?? 'Rajvir Singh Agro',
      balerEquipment: assigned?.equipment,
      balerRating: assigned?.rating ?? 4.8,
      balerPhone: '+91 98140 00001',
      balerLat: assigned?.lat ?? 30.95,
      balerLng: assigned?.lng ?? 75.92,
      createdAt: new Date().toISOString(),
    };
    await new Promise(r => setTimeout(r, 700));
    setLocalTransactions(prev => [txn, ...prev]);
    toast.success(`✅ Transaction created! Baler assigned: ${txn.balerName}`);
    setConfirming(false);
    setSelected(null);
    navigate('/farmer/transactions');
  }

  const mapPts: [number, number][] = [[farmerLat, farmerLng],
    ...(filter !== 'logistics' ? buyers.map((b): [number, number] => [b.lat, b.lng]) : []),
    ...(filter !== 'buyers'   ? logistics.map((l): [number, number] => [l.lat, l.lng]) : []),
  ];

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🏭</span>Find Buyers</h1>
        <p className="text-[#6b7280] text-sm mt-1">Industrial buyers and logistics operators near you.</p>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-2xl overflow-hidden border border-[#e8e5de] mb-5 relative">
        {/* Filter toggle */}
        <div className="absolute top-3 right-3 z-[1000] flex rounded-xl overflow-hidden shadow border border-white bg-white text-xs font-semibold">
          {(['buyers', 'logistics', 'both'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition-colors capitalize ${filter === f ? 'bg-[#1a5c2e] text-white' : 'text-[#6b7280] hover:bg-[#f5f5f2]'}`}>
              {f === 'buyers' ? '🏭 Buyers' : f === 'logistics' ? '🚜 Logistics' : '🗺 Both'}
            </button>
          ))}
        </div>
        <MapContainer center={[farmerLat, farmerLng]} zoom={9} style={{ height: 280 }} scrollWheelZoom={false}
          maxBounds={[[6.5, 68.0], [35.5, 97.5]]} minZoom={5}>
          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en" attribution="Google Maps"/>
          <MapFit pts={mapPts}/>
          <Marker position={[farmerLat, farmerLng]} icon={farmerMarker}>
            <Popup><strong>📍 Your Farm</strong><br/>{farmerProfile?.district}</Popup>
          </Marker>
          {filter !== 'logistics' && buyers.map(b => (
            <Marker key={b.id} position={[b.lat, b.lng]} icon={buyerMarker}
              eventHandlers={{ click: () => setHighlightId(b.id) }}>
              <Popup><strong>{b.companyName}</strong><br/>₹{b.pricePerTonne}/T · {b.distanceKm} km</Popup>
            </Marker>
          ))}
          {filter !== 'buyers' && logistics.map(l => (
            <Marker key={l.id} position={[l.lat, l.lng]} icon={l.type === 'baler' ? balerMarker : tractorMarker}>
              <Popup><strong>{l.name}</strong><br/>{l.equipment}<br/>⭐ {l.rating} · {l.available ? '✅ Available' : '❌ Busy'}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>

      {/* Buyer cards */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#1c1c1a]">
          {loading ? 'Loading buyers…' : `${buyers.length} verified buyer${buyers.length !== 1 ? 's' : ''} found`}
        </p>
        <p className="text-xs text-[#6b7280]">Sorted: highest price first</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-[#e8e5de] animate-pulse"/>)}
        </div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🏭</div>
          <p className="font-semibold text-[#1c1c1a]">No buyers found</p>
          <p className="text-sm text-[#6b7280] mt-1">No buyers require ≥ {farmerTonnes} tonnes currently.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {buyers.map((b, i) => (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-white border rounded-2xl p-5 transition-all ${highlightId === b.id ? 'border-[#1a5c2e] shadow-md shadow-green-50' : 'border-[#e8e5de] hover:border-[#d0d0c8]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[#1c1c1a] text-sm">{b.companyName}</span>
                    {b.verified && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0">✓ Verified</span>}
                  </div>
                  <p className="text-xs text-[#6b7280]">📍 {b.district} · {b.distanceKm} km away</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Min. required: {b.requiredTonnes} tonnes</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-[#1a5c2e] font-display">₹{b.pricePerTonne.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-[#6b7280]">per tonne</div>
                  <div className="text-xs text-[#1a5c2e] font-medium mt-0.5">
                    You earn: ₹{(farmerTonnes * b.pricePerTonne).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(b)}
                className="mt-3 w-full py-2 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white text-xs font-semibold rounded-xl transition-all">
                Select This Buyer →
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !confirming && setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-display text-lg font-bold text-[#1c1c1a] mb-4">Confirm Sale</h3>
              <div className="bg-[#f0faf3] border border-[#b3dcbc] rounded-xl p-4 mb-5 space-y-1.5 text-sm text-[#1a5c2e]">
                <p>🌾 Sell <strong>{farmerTonnes} tonnes</strong> to <strong>{selected.companyName}</strong></p>
                <p>💰 Price: <strong>₹{selected.pricePerTonne}/tonne</strong></p>
                <p className="text-base font-bold">✅ Total you receive: ₹{(farmerTonnes * selected.pricePerTonne).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleConfirm} disabled={confirming}
                  className="flex-1 py-3 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60">
                  {confirming ? 'Processing…' : '✓ Confirm'}
                </button>
                <button onClick={() => setSelected(null)} disabled={confirming}
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
