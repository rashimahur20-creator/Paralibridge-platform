import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { useBuyerMode } from '../../context/BuyerModeContext';
import { DEMO_ANALYTICS, DEMO_MONTHLY, DEMO_CO2_CUMULATIVE } from '../../utils/buyerDemoData';

// ── Count-up hook ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

const PIE_DATA = [
  { name: 'Farmer share (80%)', value: 80, color: '#1a5c2e' },
  { name: 'Logistics (20%)',    value: 20, color: '#f59e0b' },
];

export default function BuyerOverview() {
  const { isDemoMode } = useBuyerMode();

  const tonnes   = useCountUp(isDemoMode ? DEMO_ANALYTICS.totalTonnes : 0);
  const co2      = useCountUp(isDemoMode ? Math.round(DEMO_ANALYTICS.co2Offset) : 0);
  const paid     = useCountUp(isDemoMode ? DEMO_ANALYTICS.totalPaid : 0);
  const farmers  = useCountUp(isDemoMode ? DEMO_ANALYTICS.farmersSupported : 0);
  const mandate  = isDemoMode ? DEMO_ANALYTICS.mandateProgress : 0;

  const monthly  = isDemoMode ? DEMO_MONTHLY.filter(m => m.tonnes > 0) : [];
  const cumCO2   = isDemoMode ? DEMO_CO2_CUMULATIVE.filter(m => m.co2 > 0) : [];

  const metrics = [
    { label: 'Total Tonnes Purchased', value: `${tonnes}T`,                icon: '🌾', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'CO₂ Offset',            value: `${co2}T CO₂e`,             icon: '🌿', color: 'bg-teal-50 border-teal-200 text-teal-700' },
    { label: 'Paid to Farmers',        value: `₹${paid.toLocaleString('en-IN')}`, icon: '💸', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Farmers Supported',      value: `${farmers}`,               icon: '👨‍🌾', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  ];

  if (!isDemoMode) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No data yet</p>
        <p className="text-sm text-[#6b7280] mt-2">Start your first purchase to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>📊</span>Overview</h1>
        <p className="text-[#6b7280] text-sm mt-1">Season analytics for Haryana Biomass Energy Ltd.</p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-white border rounded-2xl p-5 ${m.color}`}>
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="text-2xl font-display font-bold mb-0.5">{m.value}</div>
            <div className="text-xs font-medium opacity-70">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Mandate progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white border border-[#e8e5de] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-[#1c1c1a]">7% Co-Firing Mandate Progress</p>
            <p className="text-xs text-[#6b7280] mt-0.5">375 of 6,000 required annual tonnes</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${mandate >= 7 ? 'bg-green-100 text-green-700' : mandate >= 4 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {mandate >= 7 ? '✅ Compliant' : mandate >= 4 ? '⚠️ At Risk' : '❌ Non-Compliant'}
          </span>
        </div>
        <div className="w-full bg-[#f5f5f2] rounded-full h-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(mandate, 100)}%` }} transition={{ duration: 1.2, delay: 0.5 }}
            className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"/>
        </div>
        <p className="text-xs text-[#6b7280] mt-1.5">{mandate.toFixed(2)}% achieved (target: 7%)</p>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white border border-[#e8e5de] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1c1c1a] mb-4">Monthly Biomass Purchased (tonnes)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v) => [`${v}T`, 'Tonnes']} contentStyle={{ borderRadius: 10, border: '1px solid #e8e5de', fontSize: 12 }}/>
              <Bar dataKey="tonnes" radius={[6, 6, 0, 0]} isAnimationActive>
                {monthly.map((m, i) => (
                  <Cell key={m.month} fill={m.month === 'Oct' ? '#f59e0b' : '#1a5c2e'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          className="bg-white border border-[#e8e5de] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1c1c1a] mb-2">Payment Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" startAngle={90} endAngle={-270} paddingAngle={3} isAnimationActive>
                {PIE_DATA.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>}/>
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ borderRadius: 10, fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-[#6b7280] -mt-4">Total: ₹{DEMO_ANALYTICS.totalPaid.toLocaleString('en-IN')}</p>
        </motion.div>
      </div>

      {/* CO2 area chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="bg-white border border-[#e8e5de] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[#1c1c1a] mb-4">Cumulative CO₂ Offset (tonnes CO₂e)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={cumCO2} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a5c2e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1a5c2e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v) => [`${v}T`, 'CO₂e']} contentStyle={{ borderRadius: 10, border: '1px solid #e8e5de', fontSize: 12 }}/>
            <Area type="monotone" dataKey="co2" stroke="#1a5c2e" strokeWidth={2.5} fill="url(#co2grad)" isAnimationActive/>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
