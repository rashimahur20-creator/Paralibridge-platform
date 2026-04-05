import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useLogisticsMode } from '../../context/LogisticsModeContext';

const NAV = [
  { to: '/logistics',          end: true,  icon: '👤', label: 'My Profile'       },
  { to: '/logistics/jobs',     end: false, icon: '📋', label: 'Available Jobs'   },
  { to: '/logistics/current',  end: false, icon: '🚜', label: 'Current Job'      },
  { to: '/logistics/earnings', end: false, icon: '💰', label: 'Earnings'         },
  { to: '/logistics/history',  end: false, icon: '💳', label: 'Payment History'  },
  { to: '/fire-alerts',        end: false, icon: '🔥', label: 'Fire Alerts'        },
  { to: '/map-3d',             end: false, icon: '🗺️', label: '3D Map'             },
];

export default function LogisticsDashboard() {
  const { userProfile, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDemoMode, setIsDemoMode, profile } = useLogisticsMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.name || userProfile?.name || 'Operator';
  const isAvailable = profile?.available ?? true;
  const isBaler = profile?.type === 'baler';

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e8e5de] fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-[#e8e5de]">
          <div className="flex items-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1d4ed8"/>
              <text x="16" y="22" textAnchor="middle" fontSize="16">🚜</text>
            </svg>
            <span className="font-display text-lg font-bold text-[#1d4ed8]">
              {isBaler ? 'Baler Operator' : 'Tractor Operator'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
              {displayName[0] || 'R'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1c1c1a] truncate">{displayName}</p>
              <p className="text-xs text-[#6b7280]">{profile?.district ?? 'Punjab'}</p>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex bg-[#f5f5f2] rounded-xl p-0.5 gap-0.5">
            <button onClick={() => setIsDemoMode(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${isDemoMode ? 'bg-[#1d4ed8] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#1c1c1a]'}`}>
              🎭 Demo
            </button>
            <button onClick={() => setIsDemoMode(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${!isDemoMode ? 'bg-[#1d4ed8] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#1c1c1a]'}`}>
              🔒 Real
            </button>
          </div>
        </div>

        {/* Availability status widget */}
        <div className={`mx-4 mt-4 px-4 py-3 rounded-xl border text-center ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`inline-block w-2.5 h-2.5 rounded-full mb-1 ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>
          <p className={`text-xs font-bold ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
            {isAvailable ? '🟢 Available for Jobs' : '⚪ Currently Busy'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-50 text-[#1d4ed8]' : 'text-[#6b7280] hover:bg-[#f5f5f2] hover:text-[#1c1c1a]'
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

        {/* Rating widget */}
        <div className="mx-4 mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Your Rating</p>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-display font-black text-blue-700">{profile?.rating ?? 4.8}</span>
            <div>
              <div className="text-amber-400 text-sm">{'★'.repeat(5)}</div>
              <p className="text-xs text-blue-600">{DEMO_REVIEWS} reviews</p>
            </div>
          </div>
        </div>

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

      {/* ── Mobile header ─────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-[#e8e5de] px-4 py-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-[#1d4ed8]">{isBaler ? '🚜 Baler' : '🚛 Transport'}</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#e8e5de] overflow-hidden text-[10px]">
            <button onClick={() => setIsDemoMode(true)} className={`px-2 py-1 font-semibold ${isDemoMode ? 'bg-[#1d4ed8] text-white' : 'text-[#6b7280]'}`}>Demo</button>
            <button onClick={() => setIsDemoMode(false)} className={`px-2 py-1 font-semibold ${!isDemoMode ? 'bg-[#1d4ed8] text-white' : 'text-[#6b7280]'}`}>Real</button>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>
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
                <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-blue-50 text-[#1d4ed8]' : 'text-[#6b7280]'}`}>
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>{item.label}
                  </div>
                  {item.to === '/fire-alerts' && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">5 active</span>
                  )}
                </NavLink>
              ))}
              <button onClick={async () => { await logout(); navigate('/'); }}
                className="w-full text-left flex items-center gap-3 px-3 py-3 text-sm text-[#dc2626]">↩ Logout</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ──────────────────────────────────── */}
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

const DEMO_REVIEWS = 23;
