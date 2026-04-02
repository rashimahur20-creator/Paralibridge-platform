import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

// ── Animated stat counter ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const frame = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [start, target, duration]);
  return value;
}

// ── Feature cards data ───────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🌾', title: 'List Your Straw', desc: 'Register your parali availability in 60 seconds with field size, location, and UPI ID.' },
  { icon: '🏭', title: 'Smart Matching', desc: 'AI matches your parali with verified buyers — brick kilns, biomass plants — at the best price.' },
  { icon: '🚜', title: 'Baler Network', desc: 'We dispatch the nearest registered baler to your field. No logistics hassle.' },
  { icon: '💸', title: 'Instant UPI Payment', desc: 'Funds land in your UPI account within 24 hours of delivery confirmation.' },
  { icon: '🌿', title: 'Green Certificates', desc: 'Every sale generates a verified CO₂ offset certificate tradable on India\'s CCTS.' },
  { icon: '🔥', title: 'Fire Alert System', desc: 'NASA FIRMS-powered alerts notify un-registered farmers when burning is detected nearby.' },
];

// ── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t } = useLang();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const { scrollY } = useScroll();
  const canvasY = useTransform(scrollY, [0, 600], [0, -180]);

  // Intersection Observer for stats counters
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c1 = useCountUp(35,   2000, statsVisible);
  const c2 = useCountUp(40000, 2200, statsVisible);
  const c3 = useCountUp(15,   1800, statsVisible);

  return (
    <div className="bg-[#0a1a0d] min-h-screen">
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden">
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
            src="https://www.pexels.com/download/video/11335244/"
          />
        </div>

        {/* Light overlay to ensure text is readable, fading into the dark background at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a1a0d]" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9 }}
          >
            <span className="inline-block bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-semibold px-3 py-1 rounded-full mb-6">
              🌱 Punjab's Climate Marketplace
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-[1.08] max-w-4xl mx-auto">
              {t('tagline')}
            </h1>
            <p className="mt-6 text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              ParaliBridge connects paddy farmers directly with industrial buyers — turning agricultural waste into income, and smoke into clean energy.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/auth?role=farmer"
              className="px-8 py-4 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5 active:translate-y-0"
            >
              🌾 {t('iAmFarmer')}
            </Link>
            <Link
              to="/auth?role=buyer"
              className="px-8 py-4 bg-[#f59e0b] hover:bg-amber-400 text-[#1c1c1a] font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              🏭 {t('iAmBuyer')}
            </Link>
            <Link
              to="/auth?role=baler"
              className="px-8 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5 active:translate-y-0"
            >
              🚜 I'm a Baler
            </Link>
          </motion.div>

          {/* Fire Alerts CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mt-6"
          >
            <Link
              to="/fire-alerts"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.4)] hover:bg-[rgba(220,38,38,0.25)] text-red-100 font-semibold rounded-xl text-md transition-all duration-200"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              View Live Fire Alerts →
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-xs">Scroll to explore</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* ── STAT COUNTERS ─────────────────────────────────────── */}
      <div ref={statsRef} className="bg-[#0f2516] border-y border-white/10 py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: c1,    suffix: 'M tonnes', label: 'Burned every year in Punjab', color: '#f59e0b' },
            { value: c2,    suffix: ' Cr', prefix: '₹', label: 'Addressable market', color: '#2d8a47' },
            { value: c3,    suffix: ' days', label: "Farmer's window to act", color: '#dc2626' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="font-display text-5xl font-bold" style={{ color: s.color }}>
                {s.prefix}{s.value.toLocaleString('en-IN')}{s.suffix}
              </div>
              <div className="mt-2 text-white/50 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <div id="features" className="bg-[#fafaf7] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-[#1c1c1a] font-bold">How ParaliBridge works</h2>
            <p className="mt-4 text-[#6b7280] text-lg max-w-2xl mx-auto">
              A complete supply chain — from field registration to payment — built for the 15-day parali season.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-white border border-[#e8e5de] rounded-2xl p-6 hover:border-[#1a5c2e]/30 hover:shadow-lg hover:shadow-green-50 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-semibold text-[#1c1c1a] mb-2 group-hover:text-[#1a5c2e] transition-colors">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <div className="bg-[#1a5c2e] py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl text-white font-bold mb-6">
            This October, don't burn it. Sell it.
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join 2,400+ farmers already registered on ParaliBridge. Every tonne sold is ₹1,700 earned and one less day of Delhi smog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link to="/auth?role=farmer" className="px-8 py-4 bg-[#f59e0b] hover:bg-amber-400 text-[#1c1c1a] font-bold rounded-xl text-lg transition-all hover:-translate-y-0.5">
              Register your field →
            </Link>
            <Link to="/auth?role=buyer" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg border border-white/20 transition-all">
              Source biomass supply
            </Link>
            <Link to="/auth?role=baler" className="px-8 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold rounded-xl text-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-900/30">
              Join Baler Network
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f2516] text-white/40 text-sm py-8 text-center">
        <p>© 2024 ParaliBridge Technologies Pvt Ltd · Chandigarh, Punjab</p>
        <p className="mt-1">Solving India's 20 million tonne agricultural waste problem, one transaction at a time.</p>
      </footer>
    </div>
  );
}
