import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useFarmerMode } from '../../context/FarmerModeContext';

const NAV = [
  { to: '/farmer',              end: true, icon: '👤', label: 'My Profile'         },
  { to: '/farmer/register',     end: false, icon: '🌾', label: 'Register Straw'     },
  { to: '/farmer/buyers',       end: false, icon: '🏭', label: 'Find Buyers'        },
  { to: '/farmer/transactions', end: false, icon: '📋', label: 'My Transactions'    },
  { to: '/farmer/certificates', end: false, icon: '🏆', label: 'Green Certificates' },
  { to: '/fire-alerts',         end: false, icon: '🔥', label: 'Fire Alerts'        },
  { to: '/map-3d',              end: false, icon: '🗺️', label: '3D Map'             },
];

export default function FarmerDashboard() {
  const { userProfile, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDemoMode, setIsDemoMode, farmerProfile } = useFarmerMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = farmerProfile?.name || userProfile?.name || 'Farmer';
  const displayDistrict = farmerProfile?.district || userProfile?.district || 'Punjab';

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e8e5de] fixed inset-y-0 left-0 z-40">

        {/* Logo + user */}
        <div className="p-5 border-b border-[#e8e5de]">
          <div className="flex items-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1a5c2e"/>
              <path d="M16 6C13 6 10 9 10 13c0 3 1.5 5.5 4 7v6h4v-6c2.5-1.5 4-4 4-7 0-4-3-7-6-7z" fill="#2d8a47"/>
              <rect x="10" y="24" width="12" height="2" rx="1" fill="#f59e0b"/>
            </svg>
            <span className="font-display text-lg font-bold text-[#1a5c2e]">ParaliBridge</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#e8f5ec] flex items-center justify-center text-[#1a5c2e] font-bold text-sm flex-shrink-0">
              {displayName[0] || 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1c1c1a] truncate">{displayName}</p>
              <p className="text-xs text-[#6b7280]">{displayDistrict}</p>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex bg-[#f5f5f2] rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setIsDemoMode(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${isDemoMode ? 'bg-[#1a5c2e] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#1c1c1a]'}`}
            >🎭 Demo</button>
            <button
              onClick={() => setIsDemoMode(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${!isDemoMode ? 'bg-[#1a5c2e] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#1c1c1a]'}`}
            >🔒 Real</button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-[#e8f5ec] text-[#1a5c2e]' : 'text-[#6b7280] hover:bg-[#f5f5f2] hover:text-[#1c1c1a]'
                }`}>
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>{item.label}
              </div>
              {item.to === '/fire-alerts' && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">5 active</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 15-day urgency widget */}
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 text-5xl opacity-10 pointer-events-none">⏱️</div>
          <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Urgent Window</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-display font-black text-red-700 leading-none">12</span>
            <span className="text-sm font-semibold text-red-800/80 mb-0.5">Days Left</span>
          </div>
          <p className="text-xs text-red-900/70 leading-tight">Must clear fields before winter sowing.</p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#e8e5de] space-y-1">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#6b7280] hover:bg-[#f5f5f2] transition-colors">
            🌐 {lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
          </button>
          <button onClick={async () => { await logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#dc2626] hover:bg-red-50 transition-colors">
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile header ───────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-[#e8e5de] px-4 py-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-[#1a5c2e]">ParaliBridge</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#e8e5de] overflow-hidden text-[10px]">
            <button onClick={() => setIsDemoMode(true)} className={`px-2 py-1 font-semibold ${isDemoMode ? 'bg-[#1a5c2e] text-white' : 'text-[#6b7280]'}`}>Demo</button>
            <button onClick={() => setIsDemoMode(false)} className={`px-2 py-1 font-semibold ${!isDemoMode ? 'bg-[#1a5c2e] text-white' : 'text-[#6b7280]'}`}>Real</button>
          </div>
          <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-lg hover:bg-[#f5f5f2]">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-16 p-4">
            <nav className="space-y-1">
              {NAV.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-[#e8f5ec] text-[#1a5c2e]' : 'text-[#6b7280]'}`}>
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>{item.label}
                  </div>
                  {item.to === '/fire-alerts' && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">5 active</span>
                  )}
                </NavLink>
              ))}
              <button onClick={async () => { await logout(); navigate('/'); }}
                className="w-full text-left flex items-center gap-3 px-3 py-3 text-sm text-[#dc2626]">
                ↩ Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────── */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="p-5 md:p-8 max-w-5xl">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
