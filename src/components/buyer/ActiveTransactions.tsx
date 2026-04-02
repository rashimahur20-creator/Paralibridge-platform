import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/calculations';
import StatusStepper from '../shared/StatusStepper';
import StatusBadge from '../shared/StatusBadge';
import type { Transaction, TransactionStatus } from '../../types';

const STATUS_ORDER: TransactionStatus[] = ['requested','baler_assigned','pickup_done','delivered','paid'];

const MOCK_TX: Transaction[] = [
  {
    id: 'btx-1', farmerId: 'f1', buyerId: 'b1',
    farmerName: 'Gurpreet Singh', buyerName: 'Haryana Biomass Energy Ltd.',
    tonnes: 12.5, pricePerTonne: 1750, totalAmount: 21875,
    status: 'pickup_done', upiId: 'gurpreet@ybl',
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'btx-2', farmerId: 'f2', buyerId: 'b1',
    farmerName: 'Harjit Kaur', buyerName: 'Haryana Biomass Energy Ltd.',
    tonnes: 8.0, pricePerTonne: 1750, totalAmount: 14000,
    status: 'baler_assigned', upiId: 'harjit@okaxis',
    createdAt: new Date(), updatedAt: new Date(),
  },
];

export default function ActiveTransactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured() || !currentUser) {
      setTransactions(MOCK_TX);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'transactions'), where('buyerId', '==', currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  async function advanceStatus(tx: Transaction) {
    const idx = STATUS_ORDER.indexOf(tx.status);
    if (idx >= STATUS_ORDER.length - 1) return;
    const next = STATUS_ORDER[idx + 1];
    setAdvancing(tx.id);
    try {
      if (isFirebaseConfigured()) {
        await updateDoc(doc(db, 'transactions', tx.id), { status: next, updatedAt: new Date() });
      } else {
        setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: next } : t));
      }
      toast.success(`Updated → ${next.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdvancing(null);
    }
  }

  const totalTonnes = transactions.reduce((s, t) => s + t.tonnes, 0);

  if (loading) return <div className="space-y-4">{[1,2].map(i=><div key={i} className="bg-white border border-[#e8e5de] rounded-2xl p-6 animate-pulse h-44"/>)}</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-[#1c1c1a]">Active Transactions</h2>
        <p className="mt-2 text-[#6b7280]">All your parali purchases this season.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transactions', value: transactions.length },
          { label: 'Tonnes Collecting', value: `${totalTonnes}T` },
          { label: 'Total Value', value: formatINR(transactions.reduce((s,t)=>s+t.totalAmount,0)) },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e8e5de] rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-[#1c1c1a]">{s.value}</div>
            <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e8e5de] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-[#6b7280]">No transactions yet. Accept incoming requests first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
              className="bg-white border border-[#e8e5de] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-[#1c1c1a]">{tx.farmerName}</h3>
                  <p className="text-sm text-[#6b7280]">{tx.tonnes}T · ₹{tx.pricePerTonne.toLocaleString('en-IN')}/T</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-[#1a5c2e]">{formatINR(tx.totalAmount)}</div>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
              <div className="mb-4"><StatusStepper status={tx.status} /></div>
              {tx.status !== 'paid' && (
                <button onClick={() => advanceStatus(tx)} disabled={advancing === tx.id}
                  className="px-4 py-2 border border-[#e8e5de] hover:border-[#1a5c2e] text-sm text-[#6b7280] hover:text-[#1a5c2e] rounded-xl transition-all disabled:opacity-50">
                  {advancing === tx.id ? 'Updating...' : '▶ Simulate Next Step'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
