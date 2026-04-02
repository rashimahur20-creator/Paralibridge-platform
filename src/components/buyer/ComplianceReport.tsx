import { motion } from 'framer-motion';
import { useBuyerMode } from '../../context/BuyerModeContext';
import { DEMO_ANALYTICS } from '../../utils/buyerDemoData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CHECKLIST = [
  { label: 'Biomass purchase records maintained', done: true },
  { label: 'Farmer non-burning certificates collected', done: true },
  { label: 'Transaction history logged', done: true },
  { label: 'CO₂ offset calculated and documented', done: true },
  { label: 'Annual CPCB report submitted', done: false, pending: true },
];

const DISTRICT_TABLE = [
  { district: 'Ludhiana', tonnes: 210, amount: 367500, co2: 315,   farmers: 11 },
  { district: 'Moga',     tonnes: 80,  amount: 140000, co2: 120,   farmers: 4  },
  { district: 'Sangrur',  tonnes: 85,  amount: 148750, co2: 127.5, farmers: 3  },
];

export default function ComplianceReport() {
  const { isDemoMode } = useBuyerMode();
  const mandate = isDemoMode ? DEMO_ANALYTICS.mandateProgress : 0;
  const co2 = isDemoMode ? DEMO_ANALYTICS.co2Offset : 0;
  const tonnes = isDemoMode ? DEMO_ANALYTICS.totalTonnes : 0;
  const needed = Math.max(0, 6000 - tonnes);

  function exportReport() { window.print(); }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>📄</span>Compliance Report</h1>
        <p className="text-[#6b7280] text-sm mt-1">Ministry of Environment & CPCB compliance tracker.</p>
      </motion.div>

      {/* Mandate card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-white border border-[#e8e5de] rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-[#1c1c1a]">7% Co-Firing Mandate</p>
            <p className="text-xs text-[#6b7280] mt-0.5">NTPC directive — biomass must form ≥7% of annual fuel</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${mandate >= 7 ? 'bg-green-100 text-green-700' : mandate >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {mandate >= 7 ? '✅ Compliant' : mandate >= 5 ? '⚠️ At Risk' : '❌ Behind Target'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: Math.min(mandate, 7), color: mandate >= 7 ? '#22c55e' : '#f59e0b' }, { value: Math.max(0, 7 - mandate), color: '#f3f4f6' }]}
                  cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={0} dataKey="value" stroke="none"
                >
                  {[{ value: Math.min(mandate, 7), color: mandate >= 7 ? '#22c55e' : '#f59e0b' }, { value: Math.max(0, 7 - mandate), color: '#f3f4f6' }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-bold text-lg leading-none">{mandate.toFixed(1)}%</span>
              <span className="text-[10px] text-[#6b7280]">/ 7%</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="w-full bg-[#f5f5f2] rounded-full h-4 mb-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(mandate, 100)}%` }} transition={{ duration: 1.2, delay: 0.3 }}
                className={`h-full rounded-full ${mandate >= 7 ? 'bg-green-500' : mandate >= 5 ? 'bg-amber-400' : 'bg-red-400'}`}/>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6b7280]">
              <span>{mandate.toFixed(2)}% achieved</span>
              <span>Target: 7%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Purchased', value: `${tonnes}T` },
            { label: 'Still Needed', value: `${needed.toLocaleString()}T` },
            { label: 'CO₂ Offset', value: `${co2}T` },
          ].map(s => (
            <div key={s.label} className="bg-[#fafaf7] rounded-xl p-3">
              <p className="text-sm font-bold text-[#1c1c1a]">{s.value}</p>
              <p className="text-xs text-[#6b7280]">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Checklist */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="bg-white border border-[#e8e5de] rounded-2xl p-6 mb-5">
        <p className="text-sm font-semibold text-[#1c1c1a] mb-4">Compliance Checklist</p>
        <div className="space-y-3">
          {CHECKLIST.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${c.done ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                {c.done ? '✓' : '!'}
              </div>
              <p className={`text-sm ${c.done ? 'text-[#1c1c1a]' : 'text-amber-700 font-medium'}`}>{c.label}</p>
              {c.pending && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Pending</span>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* District table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#e8e5de]">
          <p className="text-sm font-semibold text-[#1c1c1a]">District-wise Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf7] text-xs text-[#6b7280] uppercase tracking-wide">
              <tr>
                {['District', 'Tonnes', 'Amount', 'CO₂ Offset', 'Farmers'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISTRICT_TABLE.map((row, i) => (
                <tr key={row.district} className={`border-t border-[#f0f0ed] ${i % 2 === 0 ? '' : 'bg-[#fafaf7]'}`}>
                  <td className="px-4 py-3 font-medium">{row.district}</td>
                  <td className="px-4 py-3">{row.tonnes}T</td>
                  <td className="px-4 py-3 text-amber-600 font-medium">₹{row.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-green-600">{row.co2}T</td>
                  <td className="px-4 py-3">{row.farmers}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#e8e5de] font-bold bg-amber-50">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">{tonnes}T</td>
                <td className="px-4 py-3 text-amber-600">₹{DEMO_ANALYTICS.totalPaid.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-green-600">{co2}T</td>
                <td className="px-4 py-3">{DEMO_ANALYTICS.farmersSupported}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Export button */}
      <button onClick={exportReport}
        className="w-full py-3.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-green-900/20 hover:-translate-y-0.5">
        📤 Export Compliance Report (Print)
      </button>
    </div>
  );
}
