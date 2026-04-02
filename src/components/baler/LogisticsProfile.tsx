import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLogisticsMode } from '../../context/LogisticsModeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function LogisticsProfile() {
  const { isDemoMode, profile, setProfile, toggleAvailability } = useLogisticsMode();
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [equipment, setEquipment] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isBaler = profile?.type === 'baler';
  const maskedUpi = profile?.upiId
    ? profile.upiId.substring(0, 4) + '***@' + profile.upiId.split('@')[1]
    : '—';

  function startEdit() {
    setUpiId(profile?.upiId ?? '');
    setPhone(profile?.phone ?? '');
    setEquipment(profile?.equipment ?? '');
    setEditing(true);
  }

  async function handleSave() {
    if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return; }
    if (phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid 10-digit phone'); return; }
    setSaving(true);
    try {
      const updated = { ...profile, upiId, phone, equipment };
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 600));
        setProfile(updated);
        toast.success('Profile updated (Demo Mode)');
      } else if (currentUser) {
        await updateDoc(doc(db, 'logistics', currentUser.uid), { upiId, phone, equipment });
        setProfile(updated);
        toast.success('Profile saved!');
      }
      setEditing(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleToggle() {
    setToggling(true);
    await toggleAvailability();
    toast.success(profile?.available ? 'Status: Busy' : 'Status: Available for jobs!');
    setToggling(false);
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>👤</span>My Profile</h1>
        <p className="text-[#6b7280] text-sm mt-1">Your logistics operator details and availability.</p>
      </motion.div>

      {/* Availability toggle — most prominent */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className={`rounded-2xl border-2 p-6 mb-5 text-center transition-all ${
          profile?.available ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-gray-300 bg-gray-50'
        }`}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6b7280] mb-3">Availability Status</p>
        <div className="flex items-center justify-center gap-5 mb-4">
          <span className={`text-sm font-bold ${!profile?.available ? 'text-[#6b7280]' : 'text-gray-300'}`}>BUSY</span>
          <button onClick={handleToggle} disabled={toggling}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
              profile?.available ? 'bg-green-500' : 'bg-gray-300'
            }`}>
            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
              profile?.available ? 'translate-x-9' : 'translate-x-1'
            }`}/>
          </button>
          <span className={`text-sm font-bold ${profile?.available ? 'text-green-700' : 'text-gray-300'}`}>AVAILABLE</span>
        </div>
        <p className={`text-sm font-semibold ${profile?.available ? 'text-green-700' : 'text-[#6b7280]'}`}>
          {profile?.available
            ? '🟢 You are accepting jobs right now'
            : '⚪ You won\'t receive job requests until you go available'}
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between ${isBaler ? 'bg-gradient-to-r from-[#1d4ed8] to-[#2563eb]' : 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]'}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">{isBaler ? '🚜' : '🚛'}</div>
            <div>
              <h2 className="text-white font-display text-xl font-bold">{profile?.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {isBaler ? 'Baler Operator' : 'Tractor Transport'}
                </span>
                <span className="text-white/70 text-xs">{profile?.district}, Punjab</span>
              </div>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl border border-white/30 transition-colors">
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Detail fields */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {[
            { label: 'Equipment',    value: profile?.equipment,   icon: '🔧', span: true },
            { label: 'Phone',        value: profile?.phone,       icon: '📞' },
            { label: 'UPI ID',       value: maskedUpi,            icon: '💳' },
            { label: 'Vehicle Reg',  value: profile?.vehicleReg || 'Not added', icon: '🔖' },
            { label: 'Rating',       value: `⭐ ${profile?.rating ?? 4.8} / 5.0`, icon: '⭐' },
            { label: 'Type',         value: isBaler ? 'Short-distance (<15km)' : 'Long-distance (>15km)', icon: '📍' },
          ].map((f, i) => (
            <div key={f.label} className={`bg-[#fafaf7] rounded-xl p-3 border border-[#e8e5de] ${f.span ? 'col-span-2' : ''}`}>
              <p className="text-xs text-[#6b7280] mb-0.5">{f.icon} {f.label}</p>
              <p className="text-sm font-semibold text-[#1c1c1a]">{f.value}</p>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-6 pb-6 border-t border-[#e8e5de] pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1c1c1a]">✏️ Edit Details</h3>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765-43210"
                className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Equipment Description</label>
              <input value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="e.g. John Deere 5310 + Square Baler"
                className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"/>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#1d4ed8] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2.5 border border-[#e8e5de] text-sm rounded-xl hover:bg-[#f5f5f2] transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
