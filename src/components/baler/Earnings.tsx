import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import type { Payment, Baler } from '../../types';

export default function Earnings() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balerStats, setBalerStats] = useState<Baler | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch live baler stats
    const unsubBaler = onSnapshot(doc(db, 'balers', currentUser.uid), (snap) => {
      setBalerStats(snap.data() as Baler);
    });

    // Fetch payments log
    const q = query(
      collection(db, 'payments'),
      where('balerId', '==', currentUser.uid)
    );
    const unsubPayments = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(d => ({ ...d.data(), id: d.id } as Payment))
        .sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : new Date(a.createdAt).getTime();
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : new Date(b.createdAt).getTime();
          return tB - tA;
        })
      );
    });
    
    return () => { unsubBaler(); unsubPayments(); };
  }, [currentUser]);

  const totalEarnings = balerStats?.totalEarnings || 0;
  const pendingEarnings = balerStats?.pendingEarnings || 0;
  const paidEarnings = balerStats?.paidEarnings || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display text-[#1c1c1a] mb-6">Earnings Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1a5c2e] to-[#2d8a47] rounded-2xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm font-medium mb-1">Total Earned This Season</p>
          <p className="text-3xl font-display font-bold">₹{totalEarnings.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e5de] shadow-sm">
          <p className="text-amber-600 text-sm font-medium mb-1">Pending (In Transit)</p>
          <p className="text-3xl font-display font-bold text-[#1c1c1a]">₹{pendingEarnings.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e5de] shadow-sm">
          <p className="text-blue-600 text-sm font-medium mb-1">Paid to UPI</p>
          <p className="text-3xl font-display font-bold text-[#1c1c1a]">₹{paidEarnings.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8e5de] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e5de] bg-[#f5f5f2]">
          <h3 className="font-semibold text-[#1c1c1a]">Commission History</h3>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-8 text-center text-[#6b7280]">No completed jobs yet.</div>
        ) : (
          <div className="divide-y divide-[#e8e5de]">
            {payments.map(payment => (
              <div key={payment.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-gray-50/50">
                <div>
                  <h4 className="font-semibold text-[#1c1c1a] flex items-center gap-2">
                    {payment.status === 'paid' ? <span className="text-green-600">✓</span> : <span className="text-amber-500 animate-pulse">⏳</span>}
                    Job #{payment.transactionId.slice(-6).toUpperCase()}
                  </h4>
                  <p className="text-sm text-[#6b7280]">
                    {payment.status === 'paid' 
                      ? <span className="text-green-700 font-medium">₹{payment.amount.toLocaleString('en-IN')} sent to UPI: {payment.balerUpiId}</span> 
                      : 'Payment Processing (ETA < 5 mins)'}
                  </p>
                  <div className="text-xs text-[#9ca3af] mt-2 p-2 bg-gray-50 rounded inline-block">
                    Farmer received: ₹{(payment.tonnes * payment.pricePerTonne).toLocaleString('en-IN')} <br/>
                    Your commission (8%): ₹{payment.amount.toLocaleString('en-IN')} <br/>
                    Paid to: {payment.balerUpiId}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1a5c2e]">₹{payment.amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-[#6b7280]">{payment.tonnes}T @ ₹{payment.pricePerTonne}/T</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{(payment.createdAt as any)?.toDate ? (payment.createdAt as any).toDate().toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
