import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLogisticsMode } from '../../context/LogisticsModeContext';
import { DEMO_WEEKLY_EARNINGS } from '../../utils/logisticsDemoData';

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

export default function LogisticsEarnings() {
  const { isDemoMode, completedJobs, profile } = useLogisticsMode();

  const totalEarned = completedJobs.reduce((s, j) => s + j.commission, 0);
  const paidJobs    = completedJobs.filter(j => j.status === 'paid');
  const paidTotal   = paidJobs.reduce((s, j) => s + j.commission, 0);
  const avgCommission = completedJobs.length ? Math.round(paidTotal / completedJobs.length) : 0;

  const totalCount  = useCountUp(completedJobs.length);
  const totalAmt    = useCountUp(paidTotal);
  const avgAmt      = useCountUp(avgCommission);

  const weeklyData = isDemoMode ? DEMO_WEEKLY_EARNINGS : [];

  const metrics = [
    { label: 'Total Earned',      value: `₹${totalAmt.toLocaleString('en-IN')}`, icon: '💰', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Jobs Completed',    value: String(totalCount),                       icon: '✅', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Avg per Job',       value: `₹${avgAmt.toLocaleString('en-IN')}`,    icon: '📊', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'UPI Account',       value: profile?.upiId ?? 'rajvir@upi',          icon: '💳', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  ];

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>💰</span>Earnings</h1>
        <p className="text-[#6b7280] text-sm mt-1">Your commission income this harvest season.</p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-white border rounded-2xl p-5 ${m.color}`}>
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="text-xl font-display font-bold mb-0.5 truncate">{m.value}</div>
            <div className="text-xs font-medium opacity-70">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* UPI info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-[#f0faf3] border border-[#b3dcbc] rounded-2xl p-4 mb-6 flex items-center gap-3">
        <span className="text-2xl">💳</span>
        <div>
          <p className="text-sm font-semibold text-[#1a5c2e]">Payments received at: <strong>{profile?.upiId ?? 'rajvir@upi'}</strong></p>
          <p className="text-xs text-[#6b7280]">To update UPI ID, go to My Profile → Edit</p>
        </div>
      </motion.div>

      {/* Bar chart */}
      {weeklyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="bg-white border border-[#e8e5de] rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-[#1c1c1a] mb-4">Weekly Earnings (₹)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Earned']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e8e5de', fontSize: 12 }}/>
              <Bar dataKey="earned" radius={[6, 6, 0, 0]} isAnimationActive>
                {weeklyData.map((w, i) => (
                  <Cell key={w.week} fill={i === 2 ? '#f59e0b' : '#1d4ed8'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Completed jobs list */}
      <div className="space-y-3">
        {completedJobs.length === 0 ? (
          <div className="text-center py-10 text-[#6b7280]">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Complete your first job to see earnings here.</p>
          </div>
        ) : completedJobs.map((j, i) => (
          <motion.div key={j.id ?? i}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48 + i * 0.07 }}
            className="bg-white border border-[#e8e5de] rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1c1c1a]">{j.farmerName}</p>
              <p className="text-xs text-[#6b7280]">{j.date} · {j.tonnes}T · Deal: ₹{j.totalAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-[#1a5c2e] text-lg">₹{j.commission.toLocaleString('en-IN')}</p>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">✓ Paid</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
