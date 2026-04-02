import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, getDocs, doc, setDoc, increment, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// --- DATA ---
const HARDCODED_ALERTS = [
  { id: "f1", district: "Sangrur", lat: 30.24, lng: 75.84, detectedAt: "2024-10-28T06:14:00Z", intensity: "high", acresAffected: 340, unregisteredFarmers: 23, location: "Block Dhuri, near Lehragaga" },
  { id: "f2", district: "Moga", lat: 30.81, lng: 75.17, detectedAt: "2024-10-28T07:02:00Z", intensity: "medium", acresAffected: 180, unregisteredFarmers: 14, location: "Block Nihal Singhwala" },
  { id: "f3", district: "Bathinda", lat: 30.21, lng: 74.94, detectedAt: "2024-10-28T05:45:00Z", intensity: "high", acresAffected: 260, unregisteredFarmers: 10, location: "Block Goniana, near Talwandi Sabo" },
  { id: "f4", district: "Ludhiana", lat: 30.91, lng: 75.85, detectedAt: "2024-10-28T08:30:00Z", intensity: "low", acresAffected: 120, unregisteredFarmers: 8, location: "Block Jagraon" },
  { id: "f5", district: "Amritsar", lat: 31.63, lng: 74.87, detectedAt: "2024-10-28T04:55:00Z", intensity: "medium", acresAffected: 200, unregisteredFarmers: 12, location: "Block Majitha" }
];

const FARMERS = [
  [30.85, 75.80], [30.92, 75.88], [30.78, 75.72],
  [31.60, 74.82], [30.32, 76.30], [30.18, 74.88]
];

const BUYERS = [
  [30.90, 75.85], [31.63, 74.87], [30.34, 76.37], [30.21, 74.94]
];

// --- ICONS ---
const createFireIcon = () => L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#dc2626;box-shadow:0 0 0 0 rgba(220,38,38,0.5);animation:fireRing 1.8s ease-out infinite;position:relative;"><div style="position:absolute;inset:3px;border-radius:50%;background:#fca5a5;"></div></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7]
});

const createBuyerIcon = () => L.divIcon({
  html: `<div style="width:28px;height:28px;background:#1a5c2e;border:2px solid #fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;">🏭</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14]
});

// Needed for global animations of leaflet markers
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes fireRing { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.6); } 100% { box-shadow: 0 0 0 20px rgba(220,38,38,0); } }
  .anim-circle-high path { animation: pulseHigh 1.5s infinite alternate; }
  .anim-circle-med path { animation: pulseMed 1.5s infinite alternate; }
  .anim-circle-low path { animation: pulseLow 1.5s infinite alternate; }
  @keyframes pulseHigh { 0% { fill-opacity: 0.15; } 100% { fill-opacity: 0.35; } }
  @keyframes pulseMed  { 0% { fill-opacity: 0.10; } 100% { fill-opacity: 0.25; } }
  @keyframes pulseLow  { 0% { fill-opacity: 0.05; } 100% { fill-opacity: 0.20; } }
`;
document.head.appendChild(styleTag);

// --- HELPER COMPONENT TO FLY MAP ---
function MapController({ selectedId, alerts }: { selectedId: string | null, alerts: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const alert = alerts.find(a => a.id === selectedId);
      if (alert) map.flyTo([alert.lat, alert.lng], 11, { duration: 1.5 });
    }
  }, [selectedId, alerts, map]);
  return null;
}

export default function FireAlertsPage() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [layers, setLayers] = useState({ fire: true, farmers: false, buyers: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [smsSentCount, setSmsSentCount] = useState(214); // Mock initial stats
  const [regCount, setRegCount] = useState(37);
  
  const [smsActiveId, setSmsActiveId] = useState<string | null>(null);
  const [smsSending, setSmsSending] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, 'fireAlerts'));
        if (!snap.empty) {
          setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setAlerts(HARDCODED_ALERTS);
        }
      } catch (e) {
        setAlerts(HARDCODED_ALERTS);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalUnregistered = alerts.reduce((s, a) => s + (a.unregisteredFarmers || 0), 0);

  const handleSendSMS = async (alert: any) => {
    setSmsSending(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      const count = alert.unregisteredFarmers;
      try {
        await addDoc(collection(db, 'smsLogs'), {
          alertId: alert.id,
          district: alert.district,
          farmerCount: count,
          sentAt: new Date(),
          sentBy: currentUser?.uid || 'anonymous'
        });
        await setDoc(doc(db, 'stats', 'fireAlertStats'), {
          smsSentToday: increment(count)
        }, { merge: true });
      } catch (e) {} // Ignore firestore errors if disconnected

      setSmsSentCount(prev => prev + count);
      toast.success(`SMS sent to ${count} farmers in ${alert.district}`);
      
      // Keep "Sent!" state for 1.5s
      setTimeout(() => {
        setSmsSending(false);
        setSmsActiveId(null);
      }, 1500);

    } catch (e) {
       setSmsSending(false);
       toast.error("Failed to send SMS");
    }
  };

  const getIntensityConfig = (int: string) => {
    if (int === 'high') return { color: '#dc2626', tint: 'rgba(220,38,38,0.25)', radius: 10000, cls: 'anim-circle-high' };
    if (int === 'medium') return { color: '#f59e0b', tint: 'rgba(245,158,11,0.25)', radius: 7000, cls: 'anim-circle-med' };
    return { color: '#eab308', tint: 'rgba(234,179,8,0.25)', radius: 4500, cls: 'anim-circle-low' };
  };

  const timeAgo = (dateStr: string) => {
    const min = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (min < 60) return `${min} min ago`;
    return `${Math.floor(min / 60)} hrs ago`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0a1a0d] text-white">
      {/* TOP NAVIGATION / TICKER */}
      <div className="flex items-center justify-between px-6 px-4 h-14 bg-[#0f2415] border-b border-[rgba(255,255,255,0.08)] flex-shrink-0">
        <div className="flex items-center gap-4 min-w-[240px]">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold text-red-400 tracking-wide uppercase">{alerts.length} Active Zones</span>
          </div>
          <span className="text-[10px] text-[rgba(255,255,255,0.4)]">NASA FIRMS · synced 2 min ago</span>
        </div>

        <div className="flex-1 overflow-hidden mx-6 relative h-full flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2415] via-transparent to-[#0f2415] z-10 pointer-events-none" />
          <motion.div animate={{ x: ['100%', '-100%'] }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="whitespace-nowrap flex gap-4 text-[13px] font-medium text-[rgba(255,255,255,0.7)]">
            {alerts.map(a => (
              <span key={a.id}>
                <span className="text-white">{a.district}:</span> {a.intensity} fire — <span className="text-amber-400">{a.acresAffected} acres</span>
                <span className="mx-3 opacity-30">·</span>
              </span>
            ))}
            <span className="text-red-400">{totalUnregistered} unregistered farmers at risk</span>
            <span className="mx-3 opacity-30">·</span>
            <span>SMS alert system active</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          {[
            { key: 'fire', label: 'Fire Zones' },
            { key: 'farmers', label: 'Registered Farmers' },
            { key: 'buyers', label: 'Buyers' }
          ].map(layer => (
            <button key={layer.key} 
              onClick={() => setLayers(prev => ({ ...prev, [layer.key as keyof typeof layers]: !prev[layer.key as keyof typeof layers] }))}
              className={`px-3 py-1.5 rounded transition-all border ${layers[layer.key as keyof typeof layers] ? 'bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.4)] text-red-200' : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]'}`}>
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT MAP */}
        <div className="flex-1 relative bg-[#000]">
          <MapContainer center={[30.5, 75.5]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false} maxBounds={[[28.0, 73.0], [33.0, 78.0]]}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CARTO" />
            
            <MapController selectedId={selectedId} alerts={alerts} />

            {layers.fire && alerts.map(a => {
              const cfg = getIntensityConfig(a.intensity);
              return (
                <React.Fragment key={a.id}>
                  <Circle center={[a.lat, a.lng]} radius={cfg.radius}
                    pathOptions={{ color: cfg.color, fillColor: cfg.color, weight: 1, dashArray: '' }} className={cfg.cls} interactive={false} />
                  
                  <Marker position={[a.lat, a.lng]} icon={createFireIcon()}
                    eventHandlers={{ click: () => setSelectedId(a.id) }}>
                    <Popup className="dark-mission-popup" 
                       closeButton={false}>
                      <div className="bg-[#0f2415] border border-[rgba(220,38,38,0.3)] rounded-lg p-3 text-white min-w-[200px] shadow-2xl">
                         <div className="flex justify-between items-start mb-2">
                           <p className="font-bold text-sm tracking-wide">{a.district}</p>
                           <span className="text-[10px] uppercase font-bold px-1.5 rounded" style={{ backgroundColor: cfg.tint, color: cfg.color }}>{a.intensity}</span>
                         </div>
                         <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-3 uppercase tracking-wider">{a.location} · {timeAgo(a.detectedAt)}</p>
                         <div className="grid grid-cols-2 gap-2 text-[10px]">
                           <div>
                             <p className="text-[rgba(255,255,255,0.4)] mb-0.5">ACRES</p>
                             <p className="text-xl font-bold text-amber-400">{a.acresAffected}</p>
                           </div>
                           <div>
                             <p className="text-[rgba(255,255,255,0.4)] mb-0.5">FARMERS</p>
                             <p className="text-xl font-bold text-amber-400">{a.unregisteredFarmers}</p>
                           </div>
                         </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

            {layers.farmers && FARMERS.map((f, i) => (
              <CircleMarker key={i} center={f as [number, number]} radius={5} pathOptions={{ fillColor: '#22c55e', color: '#fff', weight: 1.5, fillOpacity: 1 }}>
                <Popup className="dark-mission-popup"><div className="bg-[#0f2415] border border-green-500/30 text-white p-2 rounded text-xs">Registered Farmer</div></Popup>
              </CircleMarker>
            ))}

            {layers.buyers && BUYERS.map((b, i) => (
              <Marker key={i} position={b as [number, number]} icon={createBuyerIcon()}>
                <Popup className="dark-mission-popup"><div className="bg-[#0f2415] border border-green-500/30 text-white p-2 text-xs rounded">Buyer Facility</div></Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute bottom-6 left-6 z-[1000] bg-[#0f2415] border border-[rgba(255,255,255,0.1)] rounded-[10px] p-3 text-[10px] text-[rgba(255,255,255,0.6)] space-y-2 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#dc2626]" /> High intensity fire</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Medium intensity fire</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#eab308]" /> Low intensity fire</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-white bg-[#22c55e]" /> Registered farmer</div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-[#1a5c2e] border border-white rounded-[3px] flex items-center justify-center text-[8px] leading-none">🏭</div> Buyer location</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[300px] flex-shrink-0 bg-[#0f2415] border-l border-[rgba(255,255,255,0.08)] flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
            <h2 className="text-[13px] font-bold text-white mb-0.5 tracking-wide">Active Fire Alerts</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.4)]">Click alert to target SMS to farmers</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 rounded-[10px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] animate-pulse" />)
            ) : alerts.map(a => {
              const cfg = getIntensityConfig(a.intensity);
              const isActive = selectedId === a.id;
              
              return (
                <div key={a.id} id={`alert-${a.id}`}
                  onClick={() => setSelectedId(a.id)}
                  className={`rounded-[10px] p-3 cursor-pointer transition-all border ${isActive ? 'bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.6)]' : 'bg-[rgba(220,38,38,0.07)] border-[rgba(220,38,38,0.2)] hover:bg-[rgba(220,38,38,0.13)]'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[13px] font-bold text-white tracking-wide">{a.district}</h3>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: cfg.tint, color: cfg.color }}>{a.intensity}</span>
                  </div>
                  <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-3 leading-tight">{a.location}<br/>DETECTED {timeAgo(a.detectedAt)}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-[9px] text-[rgba(255,255,255,0.3)] mb-0.5 font-bold uppercase tracking-wider">Acres</p>
                      <p className="text-sm font-bold text-amber-500">{a.acresAffected}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[rgba(255,255,255,0.3)] mb-0.5 font-bold uppercase tracking-wider">Farmers</p>
                      <p className="text-sm font-bold text-amber-500">{a.unregisteredFarmers}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setSmsActiveId(smsActiveId === a.id ? null : a.id); setSelectedId(a.id); }}
                    className="w-full py-1.5 rounded-[7px] text-[11px] font-bold border transition-colors bg-[rgba(220,38,38,0.25)] border-[rgba(220,38,38,0.4)] text-red-400 hover:bg-[rgba(220,38,38,0.35)]">
                    Send SMS Alert to {a.unregisteredFarmers} farmers
                  </button>

                  <AnimatePresence>
                    {smsActiveId === a.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                        <div className="bg-[#0a1a0d] border border-[rgba(255,255,255,0.1)] rounded p-3 mb-2">
                          <p className="font-['Noto_Sans_Devanagari',sans-serif] text-[11px] leading-relaxed text-[rgba(255,255,255,0.85)]">
                            आपके खेत के पास आग detect हुई है। पराली जलाएं नहीं — ParaliBridge पर बेचें और ₹2500/tonne कमाएं।<br/><br/>
                            <span className="text-amber-500 font-bold">अभी call करें: 1800-111-2222</span>
                          </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleSendSMS(a); }} disabled={smsSending}
                          className={`w-full py-2 rounded-[7px] text-[11px] font-bold text-white transition-all ${smsSending && !smsActiveId ? 'bg-green-600' : 'bg-red-600 hover:bg-red-500'}`}>
                          {smsSending ? 'Sending...' : (smsActiveId === null ? 'Sent! ✓' : `Send to ${a.unregisteredFarmers} farmers now`)}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] h-20 grid grid-cols-2 gap-4 flex-shrink-0">
            <div>
              <p className="text-[20px] font-bold text-amber-500 leading-none">{smsSentCount}</p>
              <p className="text-[9px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mt-1">SMS sent today</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-amber-500 leading-none">{regCount}</p>
              <p className="text-[9px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mt-1">New registrations</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STATS BAR */}
      <div className="h-10 bg-[#0a1a0d] border-t border-[rgba(255,255,255,0.08)] px-6 flex items-center justify-between text-[11px] font-medium text-[rgba(255,255,255,0.4)] uppercase tracking-widest flex-shrink-0">
        <div className="flex gap-10">
          <div><span className="text-amber-500 font-bold text-sm mr-2">{alerts.length}</span> Active Fire Zones</div>
          <div><span className="text-amber-500 font-bold text-sm mr-2">{totalUnregistered}</span> Farmers at risk</div>
          <div><span className="text-amber-500 font-bold text-sm mr-2">{smsSentCount}</span> Alerts sent</div>
          <div><span className="text-amber-500 font-bold text-sm mr-2">{regCount}</span> Recovered</div>
        </div>
        <div className="flex gap-4 items-center">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System Operational
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .dark-mission-popup .leaflet-popup-content-wrapper { background: transparent; box-shadow: none; padding: 0; }
        .dark-mission-popup .leaflet-popup-tip { display: none; }
      `}} />
    </div>
  );
}
