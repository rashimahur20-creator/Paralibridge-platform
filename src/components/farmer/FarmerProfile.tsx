import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useFarmerMode } from '../../context/FarmerModeContext';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function FarmerProfile() {
  const { farmerProfile, setFarmerProfile, isDemoMode } = useFarmerMode();
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [landAcres, setLandAcres] = useState('');
  const [saving, setSaving] = useState(false);

  const p = farmerProfile;
  const estimatedTonnes = p?.estimatedTonnes ?? Math.round((p?.landAcres ?? 0) * 2.5);

  function startEdit() {
    setUpiId(p?.upiId ?? '');
    setLandAcres(String(p?.landAcres ?? ''));
    setEditing(true);
  }

  async function handleSave() {
    if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return; }
    const acres = parseFloat(landAcres);
    if (!acres || acres <= 0) { toast.error('Enter valid land size'); return; }
    setSaving(true);
    const updated = { ...p, upiId, landAcres: acres, estimatedTonnes: Math.round(acres * 2.5) };
    try {
      if (isDemoMode) {
        setFarmerProfile(updated);
        toast.success('Profile updated (Demo Mode)');
      } else if (currentUser) {
        await setDoc(doc(db, 'farmers', currentUser.uid), { upiId, landAcres: acres, estimatedTonnes: Math.round(acres * 2.5) }, { merge: true });
        setFarmerProfile(updated);
        toast.success('Profile saved!');
      }
      setEditing(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const cards = [
    { label: 'Land Size',     value: `${p?.landAcres ?? 0} acres`,        icon: '📐', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
    { label: 'Est. Parali',   value: `${estimatedTonnes} tonnes`,          icon: '🌾', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    { label: 'UPI ID',        value: p?.upiId ?? '—',                      icon: '💳', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
    { label: 'District',      value: `${p?.district ?? '—'}, Punjab`,      icon: '📍', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ];

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>👤</span>My Profile</h1>
        <p className="text-[#6b7280] text-sm mt-1">Your farm details and payment information.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl border border-[#e8e5de] shadow-sm overflow-hidden">

        {/* Profile header */}
        <div className="bg-gradient-to-r from-[#1a5c2e] to-[#2d8a47] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-display text-2xl font-bold">
              {p?.name?.[0] ?? 'G'}
            </div>
            <div>
              <h2 className="text-white font-display text-xl font-bold">{p?.name ?? 'Gurpreet Singh'}</h2>
              <p className="text-white/70 text-sm">🌾 Paddy Farmer · {p?.district ?? 'Ludhiana'}, Punjab</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl border border-white/30 transition-colors">
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
              className={`p-4 rounded-xl border ${c.bg} ${c.border}`}>
              <div className="text-xl mb-1">{c.icon}</div>
              <div className={`text-xs font-medium mb-0.5 ${c.text} opacity-70`}>{c.label}</div>
              <div className={`text-sm font-bold truncate ${c.text}`}>{c.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="px-6 pb-6 border-t border-[#e8e5de] pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1c1c1a]">✏️ Edit Details</h3>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Land Size (acres)</label>
              <input type="number" value={landAcres} onChange={e => setLandAcres(e.target.value)}
                placeholder="e.g. 8" min="0.1" step="0.1"
                className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"/>
              {landAcres && !isNaN(parseFloat(landAcres)) && (
                <p className="text-xs text-[#1a5c2e] font-medium mt-1.5">→ Estimated: <strong>{Math.round(parseFloat(landAcres) * 2.5)} tonnes</strong></p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">UPI ID</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"/>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : '✓ Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2.5 border border-[#e8e5de] text-sm text-[#6b7280] rounded-xl hover:bg-[#f5f5f2] transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {isDemoMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
          <span className="text-amber-400 text-lg">🎭</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Demo Mode Active</p>
            <p className="text-xs text-amber-700 mt-0.5">Showing sample data. Switch to Real Mode and configure Firebase to use live data.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
