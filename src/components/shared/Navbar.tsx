import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { isFirebaseConfigured } from '../../firebase/config';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 ${isLanding
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-md border-b border-[#e8e5de]'
        }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#1a5c2e" />
          <path d="M16 6C13 6 10 9 10 13c0 3 1.5 5.5 4 7v6h4v-6c2.5-1.5 4-4 4-7 0-4-3-7-6-7z" fill="#2d8a47" />
          <path d="M16 24v-4" stroke="#e8f5ec" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="10" y="24" width="12" height="2" rx="1" fill="#f59e0b" />
        </svg>
        <span className={`font-display font-bold text-xl ${isLanding ? 'text-white' : 'text-[#1a5c2e]'}`}>
          {t('appName')}
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6">
        {!currentUser ? (
          <>
            <NavLink to="/map-3d" label=" 3D Map" light={isLanding} />
            <NavLink to="/fire-alerts" label=" Fire Alerts" light={isLanding} />
            <NavLink to="/auth?role=farmer" label="Farmer" light={isLanding} />
            <NavLink to="/auth?role=buyer" label="Buyer" light={isLanding} />
            <NavLink to="/auth?role=baler" label="Baler" light={isLanding} />
          </>
        ) : (
          <>
            {userProfile?.role === 'farmer' && (
              <>
                <NavLink to="/farmer" label={t('registerStraw')} light={false} />
                <NavLink to="/farmer/buyers" label={t('findBuyers')} light={false} />
                <NavLink to="/farmer/transactions" label={t('myTransactions')} light={false} />
                <NavLink to="/farmer/certificates" label={t('greenCertificates')} light={false} />
                <NavLink to="/farmer/alerts" label={t('alerts')} light={false} />
              </>
            )}
            {userProfile?.role === 'buyer' && (
              <>
                <NavLink to="/buyer" label={t('postDemand')} light={false} />
                <NavLink to="/buyer/requests" label={t('incomingRequests')} light={false} />
                <NavLink to="/buyer/transactions" label={t('activeTransactions')} light={false} />
                <NavLink to="/buyer/compliance" label={t('complianceReport')} light={false} />
              </>
            )}
            {userProfile?.role === 'baler' && (
              <>
                <NavLink to="/logistics" label="Profile" light={false} />
                <NavLink to="/logistics/jobs" label="Available Jobs" light={false} />
                <NavLink to="/logistics/current" label="Current Job" light={false} />
                <NavLink to="/logistics/earnings" label="Earnings" light={false} />
              </>
            )}
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className={`text-sm font-medium px-3 py-1 rounded-full border transition-all ${isLanding
              ? 'border-white/40 text-white hover:bg-white/10'
              : 'border-[#e8e5de] text-[#1c1c1a] hover:border-[#1a5c2e]'
            }`}
        >
          {lang === 'en' ? 'हिंदी' : 'EN'}
        </button>

        <button onClick={toggleDark}
          className={`text-sm w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isLanding ? 'border-white/40 text-white hover:bg-white/10' : 'border-[#e8e5de] text-[#1c1c1a] hover:border-[#1a5c2e]'
            }`}>
          {isDark ? '☀️' : '🌙'}
        </button>

        {!isFirebaseConfigured() && !currentUser && (
          <span className="hidden md:block text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
            Demo Mode
          </span>
        )}

        {currentUser && userProfile ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-[#6b7280]">{userProfile.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${userProfile.role === 'farmer'
                  ? 'bg-[#e8f5ec] text-[#1a5c2e]'
                  : 'bg-amber-100 text-amber-800'
                }`}>
                {userProfile.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-[#6b7280] hover:text-[#dc2626] transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        ) : (
          <Link
            to="/auth?role=farmer"
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${isLanding
                ? 'bg-[#f59e0b] text-white hover:bg-amber-500'
                : 'bg-[#1a5c2e] text-white hover:bg-[#2d8a47]'
              }`}
          >
            Get started
          </Link>
        )}
      </div>
    </motion.nav>
  );
}

function NavLink({ to, label, light }: { to: string; label: string; light: boolean }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${light
          ? 'text-white/80 hover:text-white'
          : 'text-[#6b7280] hover:text-[#1a5c2e]'
        }`}
    >
      {label}
    </Link>
  );
}
