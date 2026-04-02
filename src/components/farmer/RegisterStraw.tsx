import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFarmerMode } from '../../context/FarmerModeContext';
import { useAuth } from '../../context/AuthContext';
import { PUNJAB_DISTRICTS } from '../../utils/calculations';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function RegisterStraw() {
  const { isDemoMode, farmerProfile, setFarmerProfile } = useFarmerMode();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [landAcres, setLandAcres] = useState(String(farmerProfile?.landAcres ?? ''));
  const [district, setDistrict]   = useState(farmerProfile?.district ?? '');
  const [upiId, setUpiId]         = useState(farmerProfile?.upiId ?? '');
  const [submitting, setSubmitting] = useState(false);
  const recogRef = useRef<any>(null);

  const tonnes = landAcres ? Math.round(parseFloat(landAcres) * 2.5) : 0;

  // ── Voice ──────────────────────────────────────────
  function startListen() {
    if (!SR) return;
    const r = new SR();
    recogRef.current = r;
    r.lang = 'en-IN';
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend   = () => setListening(false);
    r.onerror = () => { setListening(false); toast.error('Could not hear. Try again.'); };
    r.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      setTranscript(spoken);
      const num = spoken.match(/(\d+(\.\d+)?)/);
      if (num) setLandAcres(num[1]);
      const hit = PUNJAB_DISTRICTS.find(d => spoken.toLowerCase().includes(d.toLowerCase()));
      if (hit) setDistrict(hit);
    };
    r.start();
  }
  function stopListen() { recogRef.current?.stop(); setListening(false); }

  // ── Submit ─────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!landAcres || parseFloat(landAcres) <= 0) { toast.error('Enter land size'); return; }
    if (!district) { toast.error('Select your district'); return; }
    if (!upiId.includes('@')) { toast.error('Enter valid UPI ID (must contain @)'); return; }
    setSubmitting(true);
    const acres = parseFloat(landAcres);
    try {
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 800));
        setFarmerProfile((p: any) => ({ ...p, landAcres: acres, district, upiId, estimatedTonnes: tonnes }));
        toast.success(`✅ ${tonnes} tonnes listed in Demo Mode`);
      } else if (currentUser) {
        await setDoc(doc(db, 'farmers', currentUser.uid), { landAcres: acres, district, upiId, estimatedTonnes: tonnes }, { merge: true });
        toast.success('Straw registered successfully!');
      }
      navigate('/farmer/buyers');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🌾</span>Register Straw</h1>
        <p className="text-[#6b7280] text-sm mt-1">Tell us about your parali — we'll match you with buyers.</p>
      </motion.div>

      {/* Voice section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-white border border-[#e8e5de] rounded-2xl p-6 mb-4 text-center">
        {SR ? (
          <>
            <p className="text-sm font-semibold text-[#1c1c1a] mb-1">🎙️ Voice Input</p>
            <p className="text-xs text-[#6b7280] mb-5">Say: <em>"I have 8 acres in Ludhiana"</em></p>
            <button onClick={listening ? stopListen : startListen}
              className={`relative w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg transition-all ${
                listening ? 'bg-red-500 text-white shadow-red-300 scale-110' : 'bg-[#1a5c2e] text-white shadow-green-200 hover:bg-[#2d8a47]'
              }`}>
              {listening && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50"/>}
              {listening ? '⏹' : '🎤'}
            </button>
            <p className="mt-3 text-xs text-[#6b7280]">{listening ? 'Listening… speak now' : 'Tap to speak'}</p>
            <AnimatePresence>
              {transcript && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-[#f0faf3] border border-[#b3dcbc] rounded-xl text-sm text-[#1a5c2e] text-left">
                  <span className="font-semibold">Heard:</span> "{transcript}"
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <p className="text-sm text-amber-700">⚠️ Voice input not supported in this browser. Use manual form below.</p>
        )}
      </motion.div>

      {/* Manual form */}
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        onSubmit={handleSubmit}
        className="bg-white border border-[#e8e5de] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#1c1c1a]">📋 Straw Details</h3>

        <div>
          <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">Land Size (acres) *</label>
          <input type="number" value={landAcres} onChange={e => setLandAcres(e.target.value)}
            placeholder="e.g. 8" min="0.1" step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"/>
          <AnimatePresence>
            {tonnes > 0 && (
              <motion.div key={tonnes} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-2 p-3 bg-[#f0faf3] border border-[#b3dcbc] rounded-xl flex items-center gap-2">
                <span className="text-lg">🌾</span>
                <span className="text-sm text-[#1a5c2e]">
                  Your <strong>{landAcres} acres</strong> → <strong className="text-base">{tonnes} tonnes</strong> of parali estimated
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">District *</label>
          <select value={district} onChange={e => setDistrict(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm bg-white focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all">
            <option value="">Select your district</option>
            {PUNJAB_DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">UPI ID *</label>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
            className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"/>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-green-900/20 hover:-translate-y-0.5 active:translate-y-0">
          {submitting
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Registering…</span>
            : '🌾 Register & Find Buyers →'}
        </button>
      </motion.form>
    </div>
  );
}
