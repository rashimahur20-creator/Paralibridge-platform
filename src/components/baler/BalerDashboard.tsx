import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

const NAV_ITEMS = [
  { to: '/baler',          label: 'My Jobs',     icon: '📋', end: true },
  { to: '/baler/current',  label: 'Current Job', icon: '🚜' },
  { to: '/baler/earnings', label: 'Earnings',    icon: '₹' },
];

export default function BalerDashboard() {
  const { userProfile, logout } = useAuth();
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e8e5de] min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-[#e8e5de]">
          <div className="flex items-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1a5c2e" />
              <path d="M16 6C13 6 10 9 10 13c0 3 1.5 5.5 4 7v6h4v-6c2.5-1.5 4-4 4-7 0-4-3-7-6-7z" fill="#2d8a47" />
              <rect x="10" y="24" width="12" height="2" rx="1" fill="#f59e0b" />
            </svg>
            <span className="font-display text-lg font-bold text-[#1a5c2e]">ParaliBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
              {userProfile?.name?.[0] || 'B'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1c1c1a]">{userProfile?.name}</p>
              <div className="text-xs text-[#6b7280]">{userProfile?.phoneNumber}</div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">Baler Operator</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-50 text-blue-800' : 'text-[#6b7280] hover:bg-[#f5f5f2] hover:text-[#1c1c1a]'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e8e5de] space-y-2">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#6b7280] hover:bg-[#f5f5f2] transition-colors">
            🌐 {lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#dc2626] hover:bg-red-50 transition-colors">
            → Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e8e5de] px-4 py-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-[#1a5c2e]">ParaliBridge</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[#f5f5f2]">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-16 p-4">
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-800' : 'text-[#6b7280]'}`}>
                  <span>{item.icon}</span>{item.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-3 text-sm text-[#dc2626]">
                → Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="p-6 md:p-8 max-w-5xl">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
