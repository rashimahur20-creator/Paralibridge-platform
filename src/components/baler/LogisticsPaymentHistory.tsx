import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLogisticsMode } from '../../context/LogisticsModeContext';

export default function LogisticsPaymentHistory() {
  const { completedJobs, profile } = useLogisticsMode();

  const total = completedJobs.reduce((s, j) => s + j.commission, 0);

  function downloadCSV() {
    const header = ['Date', 'Farmer', 'Tonnes', 'Deal Amount', 'Your Commission (20%)', 'UPI Status'];
    const rows = completedJobs.map(j => [j.date, j.farmerName, j.tonnes, j.totalAmount, j.commission, 'Paid ✓']);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logistics-payment-history.csv';
    a.click();
    toast.success('CSV downloaded!');
  }

  if (!completedJobs.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">💳</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No payment history yet</p>
        <p className="text-sm text-[#6b7280] mt-2">Complete your first job to see records here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>💳</span>Payment History</h1>
          <p className="text-[#6b7280] text-sm mt-1">{completedJobs.length} jobs · All payments to: <strong>{profile?.upiId ?? 'rajvir@upi'}</strong></p>
        </div>
        <button onClick={downloadCSV}
          className="px-4 py-2.5 bg-[#1d4ed8] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
          📥 Download CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf7] text-xs text-[#6b7280] uppercase tracking-wide">
              <tr>
                {['Date', 'Farmer', 'Tonnes', 'Deal Amount', 'Your Commission (20%)', 'UPI Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedJobs.map((j, i) => (
                <motion.tr key={j.id ?? i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 + i * 0.04 }}
                  className="border-t border-[#f0f0ed] hover:bg-[#fafaf7] transition-colors">
                  <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">{j.date}</td>
                  <td className="px-4 py-3 font-medium">{j.farmerName}</td>
                  <td className="px-4 py-3">{j.tonnes}T</td>
                  <td className="px-4 py-3 text-[#6b7280]">₹{j.totalAmount?.toLocaleString('en-IN') ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-[#1a5c2e]">₹{j.commission.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">✓ Paid to {profile?.upiId ?? 'UPI'}</span></td>
                </motion.tr>
              ))}
              <tr className="border-t-2 border-[#e8e5de] bg-blue-50 font-bold">
                <td className="px-4 py-3" colSpan={4}>Total Earned</td>
                <td className="px-4 py-3 text-[#1a5c2e] text-base">₹{total.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"/>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
