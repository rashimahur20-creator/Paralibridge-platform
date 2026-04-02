import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useBuyerMode } from '../../context/BuyerModeContext';
import { haversineDistance, districtCoords } from '../../utils/distance';

const mk = (html: string, w = 36, h = 36) =>
  L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h] });

const farmerPin = mk(`<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="16" r="14" fill="#1a5c2e" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">🌾</text></svg>`);
const buyerPin  = mk(`<svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="16" r="14" fill="#92400e" stroke="white" stroke-width="2"/><text x="18" y="22" text-anchor="middle" font-size="13">🏭</text></svg>`);

const BADGE: Record<string, string> = {
  requested:      'bg-blue-50 text-blue-700 border-blue-200',
  baler_assigned: 'bg-amber-50 text-amber-700 border-amber-200',
  pickup_done:    'bg-sky-50 text-sky-700 border-sky-200',
  in_transit:     'bg-purple-50 text-purple-700 border-purple-200',
  delivered:      'bg-green-50 text-green-700 border-green-200',
  paid:           'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABEL: Record<string, string> = {
  requested: '📋 Requested', baler_assigned: '🚜 Baler Assigned',
  pickup_done: '✅ Pickup Done', in_transit: '🚛 In Transit',
  delivered: '🏭 Delivered', paid: '💸 Paid',
};

export default function IncomingRequests() {
  const { isDemoMode, localTransactions, setLocalTransactions, buyerProfile } = useBuyerMode();
  const [mapModal, setMapModal] = useState<any>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const active = localTransactions.filter(t => ['requested', 'baler_assigned', 'pickup_done', 'in_transit'].includes(t.status));

  const buyerLat = buyerProfile?.lat ?? districtCoords['Ludhiana']?.lat ?? 30.9;
  const buyerLng = buyerProfile?.lng ?? districtCoords['Ludhiana']?.lng ?? 75.85;

  async function acceptRequest(txn: any) {
    setAccepting(txn.id);
    await new Promise(r => setTimeout(r, 800));
    setLocalTransactions(prev =>
      prev.map(t => t.id === txn.id ? { ...t, status: 'baler_assigned', balerName: 'Rajvir Singh Agro', balerLat: 30.92, balerLng: 75.88 } : t)
    );
    toast.success('Request accepted! Baler is being assigned.');
    setAccepting(null);
  }

  if (!active.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🌾</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No incoming requests</p>
        <p className="text-sm text-[#6b7280] mt-2">Post your demand to start receiving farmer listings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🌾</span>Incoming Requests</h1>
        <p className="text-[#6b7280] text-sm mt-1">{active.length} farmer{active.length !== 1 ? 's' : ''} waiting for your response.</p>
      </motion.div>

      <div className="space-y-4">
        {active.map((txn, i) => {
          const distKm = haversineDistance(txn.farmerLat ?? 30.85, txn.farmerLng ?? 75.80, buyerLat, buyerLng);
          const accepted = txn.status !== 'requested';

          return (
            <motion.div key={txn.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-[#e8e5de] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#1c1c1a]">{txn.farmerName}</p>
                    {accepted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Accepted ✓</span>}
                  </div>
                  <p className="text-xs text-[#6b7280]">📍 {txn.district} · {distKm} km from your facility</p>
                  {txn.balerName && (
                    <p className="text-xs text-[#1a5c2e] mt-0.5 font-medium">🚜 Baler: {txn.balerName}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${BADGE[txn.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {STATUS_LABEL[txn.status]}
                  </span>
                  <p className="text-xl font-display font-bold text-amber-600 mt-2">₹{txn.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-[#6b7280]">{txn.tonnes}T · ₹{txn.pricePerTonne}/T</p>
                </div>
              </div>

              <div className="flex gap-3">
                {!accepted ? (
                  <button onClick={() => acceptRequest(txn)} disabled={accepting === txn.id}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                    {accepting === txn.id ? 'Accepting…' : '✓ Accept Request'}
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl text-center">
                    Accepted ✓
                  </div>
                )}
                <button onClick={() => setMapModal(txn)}
                  className="px-4 py-2.5 border border-[#e8e5de] text-sm font-medium text-[#6b7280] rounded-xl hover:bg-[#f5f5f2] transition-colors">
                  🗺 View on Map
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Map modal */}
      <AnimatePresence>
        {mapModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setMapModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg">
              <div className="px-5 py-4 flex items-center justify-between border-b border-[#e8e5de]">
                <p className="font-semibold text-sm text-[#1c1c1a]">🗺 {mapModal.farmerName} → Your Facility</p>
                <button onClick={() => setMapModal(null)} className="text-[#6b7280] hover:text-[#1c1c1a] text-lg">✕</button>
              </div>
              <MapContainer
                center={[(mapModal.farmerLat + buyerLat) / 2, (mapModal.farmerLng + buyerLng) / 2]}
                zoom={11} style={{ height: 300 }} scrollWheelZoom={false}
                maxBounds={[[6.5, 68.0], [35.5, 97.5]]} minZoom={5}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en" attribution="Google Maps"/>
                <Marker position={[mapModal.farmerLat ?? 30.85, mapModal.farmerLng ?? 75.80]} icon={farmerPin}>
                  <Popup>🌾 {mapModal.farmerName}</Popup>
                </Marker>
                <Marker position={[buyerLat, buyerLng]} icon={buyerPin}>
                  <Popup>🏭 Your Facility</Popup>
                </Marker>
                <Polyline
                  positions={[[mapModal.farmerLat ?? 30.85, mapModal.farmerLng ?? 75.80], [buyerLat, buyerLng]]}
                  pathOptions={{ color: '#f59e0b', weight: 2.5, dashArray: '6 5' }}/>
              </MapContainer>
              <div className="px-5 py-3 border-t border-[#e8e5de] flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">{haversineDistance(mapModal.farmerLat ?? 30.85, mapModal.farmerLng ?? 75.80, buyerLat, buyerLng)} km away</span>
                <span className="font-semibold text-amber-600">{mapModal.tonnes}T · ₹{mapModal.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
