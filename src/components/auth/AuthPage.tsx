import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { PUNJAB_DISTRICTS, BUYER_DISTRICTS } from '../../utils/calculations';
import { isFirebaseConfigured } from '../../firebase/config';

export default function AuthPage() {
  const [params] = useSearchParams();
  const defaultRole = (params.get('role') as 'farmer' | 'buyer') || 'farmer';
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [role, setRole] = useState<'farmer' | 'buyer' | 'baler'>(defaultRole as any);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [equipment, setEquipment] = useState('');
  const [upiId, setUpiId] = useState('');
  const [logisticsType, setLogisticsType] = useState<'baler' | 'tractor'>('baler');
  const [vehicleReg, setVehicleReg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFirebaseConfigured()) {
      toast.error('Firebase not configured. Please add your Firebase credentials to src/firebase/config.ts');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        if (!phone) { toast.error('Phone number required'); setLoading(false); return; }
        await login(phone, password);
        toast.success('Welcome back!');
      } else {
        if (!name || !district || !phone) { toast.error('Please fill required fields'); setLoading(false); return; }
        if (role === 'baler' && !upiId.includes('@')) { toast.error('Valid UPI ID is required for Logistics'); setLoading(false); return; }
        await signup(phone, password, email, name, role, district, equipment, upiId, logisticsType, vehicleReg);
        toast.success('Account created! Welcome to ParaliBridge 🌾');
      }
      navigate(role === 'farmer' ? '/farmer' : role === 'buyer' ? '/buyer' : '/baler');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center px-4 py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#e8f5ec] opacity-60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-50 opacity-60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1a5c2e" />
              <path d="M16 6C13 6 10 9 10 13c0 3 1.5 5.5 4 7v6h4v-6c2.5-1.5 4-4 4-7 0-4-3-7-6-7z" fill="#2d8a47" />
              <rect x="10" y="24" width="12" height="2" rx="1" fill="#f59e0b" />
            </svg>
            <span className="font-display text-2xl font-bold text-[#1a5c2e]">ParaliBridge</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1c1c1a]">
            {mode === 'login' ? t('loginTitle') : t('signupTitle')}
          </h1>
          <p className="mt-2 text-[#6b7280]">
            {mode === 'login' ? 'Sign in to your account' : 'Join 2,400+ farmers & buyers'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#e8e5de] shadow-xl shadow-black/5 p-8"
        >
          {/* Firebase banner */}
          {!isFirebaseConfigured() && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              ⚠️ <strong>Demo Mode</strong> — Firebase not configured. Add your credentials to{' '}
              <code className="bg-amber-100 px-1 rounded">src/firebase/config.ts</code> to enable data persistence.
            </div>
          )}

          {/* Role toggle (signup only) */}
          {mode === 'signup' && (
            <div className="flex gap-2 mb-6 p-1 bg-[#f5f5f2] rounded-xl overflow-x-auto scroolbar-hide">
              {(['farmer', 'buyer', 'baler'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                    role === r
                      ? 'bg-white text-[#1a5c2e] shadow-sm border border-[#e8e5de]'
                      : 'text-[#6b7280] hover:text-[#1c1c1a]'
                  }`}
                >
                  {r === 'farmer' ? '🌾' : r === 'buyer' ? '🏭' : '🚜'} {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <InputField label={role === 'buyer' ? 'Company Name' : t('fullName')} value={name} onChange={setName} placeholder={role === 'baler' ? "Baler Service Name" : role === 'buyer' ? "e.g. Haryana Biomass Energy" : "Gurpreet Singh"} required />
                  <div>
                    <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">{t('district')}</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] bg-white text-[#1c1c1a] text-sm focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"
                    >
                      <option value="">{t('selectDistrict')}</option>
                      {role === 'buyer' 
                        ? BUYER_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)
                        : PUNJAB_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)
                      }
                    </select>
                  </div>
                  {role === 'baler' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* Logistics Type Radio */}
                      <div>
                        <label className="block text-sm font-medium text-[#1c1c1a] mb-2">Service Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'baler', label: 'Baler Operator', desc: 'Short distance < 15km', icon: '🚜' },
                            { id: 'tractor', label: 'Tractor Transport', desc: 'Long distance > 15km', icon: '🚛' }
                          ].map(t => (
                            <div key={t.id} onClick={() => setLogisticsType(t.id as any)}
                              className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center text-center transition-all ${
                                logisticsType === t.id ? 'border-blue-500 bg-blue-50' : 'border-[#e8e5de] bg-white hover:border-blue-300'
                              }`}>
                              <span className="text-2xl mb-1">{t.icon}</span>
                              <span className={`text-sm font-bold ${logisticsType === t.id ? 'text-blue-700' : 'text-[#1c1c1a]'}`}>{t.label}</span>
                              <span className="text-[10px] text-[#6b7280]">{t.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <InputField label="Equipment Description" value={equipment} onChange={setEquipment} placeholder="e.g. John Deere 5310 + Square Baler" required />
                      <InputField label="Vehicle Registration No. (Optional)" value={vehicleReg} onChange={setVehicleReg} placeholder="PB-10-AB-1234" />
                      <InputField label="UPI ID (for payments)" value={upiId} onChange={setUpiId} placeholder="yourname@upi" pattern=".*@.*" required />
                    </motion.div>
                  )}
                  <InputField label={t('email') + " (Optional)"} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="9876543210" pattern="\d{10}" required />
            <InputField label={t('password')} type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                mode === 'login' ? t('login') : t('signup')
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6b7280]">
            {mode === 'login' ? (
              <button onClick={() => setMode('signup')} className="text-[#1a5c2e] font-medium hover:underline">
                {t('switchToSignup')}
              </button>
            ) : (
              <button onClick={() => setMode('login')} className="text-[#1a5c2e] font-medium hover:underline">
                {t('switchToLogin')}
              </button>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, required, pattern }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; pattern?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1c1c1a] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        className="w-full px-4 py-3 rounded-xl border border-[#e8e5de] bg-white text-[#1c1c1a] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1a5c2e] focus:ring-2 focus:ring-[#1a5c2e]/10 transition-all"
      />
    </div>
  );
}
