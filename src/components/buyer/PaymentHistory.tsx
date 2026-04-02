import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBuyerMode } from '../../context/BuyerModeContext';
import { DEMO_PAID_TRANSACTIONS } from '../../utils/buyerDemoData';

const COLS = ['Date', 'Farmer', 'District', 'Tonnes', 'Amount', 'Farmer Share', 'Logistics Share', 'Status'];

export default function PaymentHistory() {
  const { isDemoMode, localTransactions } = useBuyerMode();

  const paidFromLocal = localTransactions.filter(t => t.status === 'paid').map(t => ({
    id: t.id,
    date: t.paidAt ? new Date(t.paidAt).toLocaleDateString('en-IN') : new Date(t.createdAt).toLocaleDateString('en-IN'),
    farmerName: t.farmerName,
    district: t.district,
    tonnes: t.tonnes,
    totalAmount: t.totalAmount,
    farmerShare: t.farmerAmount ?? Math.round(t.totalAmount * 0.8),
    logisticsShare: t.logisticsAmount ?? Math.round(t.totalAmount * 0.2),
    status: 'paid',
  }));

  const allPaid = isDemoMode
    ? [
        ...DEMO_PAID_TRANSACTIONS.map(t => ({
          ...t,
          date: new Date(t.date).toLocaleDateString('en-IN'),
          farmerShare: Math.round(t.totalAmount * 0.8),
          logisticsShare: Math.round(t.totalAmount * 0.2),
        })),
        ...paidFromLocal,
      ]
    : paidFromLocal;

  const totalAmount    = allPaid.reduce((s, t) => s + t.totalAmount, 0);
  const totalFarmer    = allPaid.reduce((s, t) => s + t.farmerShare, 0);
  const totalLogistics = allPaid.reduce((s, t) => s + t.logisticsShare, 0);

  function downloadCSV() {
    const header = ['Date', 'Farmer', 'District', 'Tonnes', 'Total Amount', 'Farmer Share', 'Logistics Share'];
    const rows = allPaid.map(t => [t.date, t.farmerName, t.district, t.tonnes, t.totalAmount, t.farmerShare, t.logisticsShare]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payment-history.csv';
    a.click();
    toast.success('CSV downloaded!');
  }

  if (!allPaid.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">💳</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No payments yet</p>
        <p className="text-sm text-[#6b7280] mt-2">Complete a delivery to see payment history here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>💳</span>Payment History</h1>
          <p className="text-[#6b7280] text-sm mt-1">{allPaid.length} completed transactions</p>
        </div>
        <button onClick={downloadCSV}
          className="px-4 py-2.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white text-sm font-semibold rounded-xl transition-colors">
          📥 Download CSV
        </button>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Paid', value: `₹${totalAmount.toLocaleString('en-IN')}`, icon: '💸', c: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'To Farmers (80%)', value: `₹${totalFarmer.toLocaleString('en-IN')}`, icon: '🌾', c: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'To Logistics (20%)', value: `₹${totalLogistics.toLocaleString('en-IN')}`, icon: '🚜', c: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`bg-white border rounded-2xl p-4 ${s.c}`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-lg font-bold font-display">{s.value}</div>
            <div className="text-xs opacity-80">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf7] text-xs text-[#6b7280] uppercase tracking-wide">
              <tr>
                {COLS.map(h => <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {allPaid.map((t, i) => (
                <motion.tr key={t.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.04 }}
                  className="border-t border-[#f0f0ed] hover:bg-[#fafaf7] transition-colors">
                  <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3 font-medium">{t.farmerName}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{t.district}</td>
                  <td className="px-4 py-3">{t.tonnes}T</td>
                  <td className="px-4 py-3 font-semibold text-amber-600">₹{t.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-green-600">₹{t.farmerShare.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-blue-600">₹{t.logisticsShare.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">✓ Paid</span></td>
                </motion.tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2 border-[#e8e5de] bg-amber-50 font-bold">
                <td className="px-4 py-3" colSpan={4}>Total</td>
                <td className="px-4 py-3 text-amber-600">₹{totalAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-green-600">₹{totalFarmer.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-blue-600">₹{totalLogistics.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"/>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
