import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBuyerMode } from '../../context/BuyerModeContext';
import { PUNJAB_DISTRICTS } from '../../utils/calculations';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function PostDemand() {
  const { isDemoMode, buyerProfile, setBuyerProfile } = useBuyerMode();
  const { currentUser } = useAuth();
  const [tonnes, setTonnes]   = useState(String(buyerProfile?.requiredTonnes ?? 500));
  const [price, setPrice]     = useState(String(buyerProfile?.pricePerTonne ?? 1750));
  const [district, setDistrict] = useState(buyerProfile?.district ?? 'Ludhiana');
  const [desc, setDesc]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted]   = useState(false);

  const totalBudget = Number(tonnes) * Number(price);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tonnes || !price || !district) { toast.error('Fill all required fields'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      if (isDemoMode) {
        setBuyerProfile((p: any) => ({ ...p, requiredTonnes: Number(tonnes), pricePerTonne: Number(price), district }));
        toast.success('Demand posted! Farmers will see your listing. (Demo)');
      } else if (currentUser) {
        await updateDoc(doc(db, 'buyers', currentUser.uid), { requiredTonnes: Number(tonnes), pricePerTonne: Number(price), district });
        toast.success(`Demand posted — visible to farmers in ${district}!`);
      }
      setPosted(true);
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  }

  if (posted) {
    return (
      <div className="max-w-xl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#e8e5de] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">✅</div>
          <h2 className="font-display text-2xl font-bold text-[#1c1c1a] mb-2">Demand Posted!</h2>
          <p className="text-sm text-[#6b7280] mb-6">
            Farmers in <strong>{district}</strong> with ≥ {tonnes} tonnes will see your listing.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {[
              { label: 'Required', value: `${tonnes} tonnes` },
              { label: 'Price/Tonne', value: `₹${Number(price).toLocaleString('en-IN')}` },
              { label: 'Est. Budget', value: `₹${totalBudget.toLocaleString('en-IN')}` },
              { label: 'District', value: district },
            ].map(s => (
              <div key={s.label} className="bg-[#fafaf7] rounded-xl p-3">
                <p className="text-xs text-[#6b7280]">{s.label}</p>
                <p className="text-sm font-semibold text-[#1c1c1a]">{s.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setPosted(false)}
            className="w-full py-2.5 border border-[#e8e5de] text-sm text-[#6b7280] rounded-xl hover:bg-[#f5f5f2] transition-colors">
            ✏️ Update Demand
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>📋</span>Post Demand</h1>
        <p className="text-[#6b7280] text-sm mt-1">Register your biomass procurement requirements.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          onSubmit={handleSubmit}
          className="md:col-span-3 bg-white border border-[#e8e5de] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1c1c1a]">Procurement Details</h3>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">Required Tonnes *</label>
            <input type="number" value={tonnes} onChange={e => setTonnes(e.target.value)} placeholder="500" min="1"
              className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">Price per Tonne (₹) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="1750" min="1"
              className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">District *</label>
            <select value={district} onChange={e => setDistrict(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all">
              {PUNJAB_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">Company Description (optional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe your facility, usage, etc."
              className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"/>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-amber-200 hover:-translate-y-0.5">
            {submitting
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Posting…</span>
              : '📋 Post Demand →'}
          </button>
        </motion.form>

        {/* Live preview */}
        <AnimatePresence>
          {(tonnes && price && district) && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl p-5 h-fit">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Live Preview</p>
              <p className="text-sm text-amber-900 leading-relaxed">
                Posting demand for <strong>{tonnes} tonnes</strong> at <strong>₹{Number(price).toLocaleString('en-IN')}/T</strong>
              </p>
              <p className="text-sm text-amber-900 mt-1">Farmers in <strong>{district}</strong> will see your listing.</p>
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-xs text-amber-700">Estimated total cost:</p>
                <p className="text-2xl font-display font-bold text-amber-700">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
