import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import type { Transaction } from '../../types';
import toast from 'react-hot-toast';

export default function MyJobs() {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'transactions'),
      where('balerId', '==', currentUser.uid),
      where('status', '==', 'baler_assigned')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Transaction));
      // Only show jobs that haven't been accepted yet
      setJobs(data.filter(j => !j.balerAccepted));
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  async function acceptJob(id: string) {
    try {
      await updateDoc(doc(db, 'transactions', id), {
        balerAccepted: true,
        updatedAt: new Date()
      });
      toast.success('Job accepted! Go to Current Job to start navigating.');
    } catch (err) {
      toast.error('Failed to accept job');
    }
  }

  async function generateDemoJob() {
    if (!currentUser) return;
    try {
      const mockParams = {
        farmerId: 'demo-farmer',
        buyerId: 'b5',
        farmerName: 'Karanvir Farm (Demo)',
        buyerName: 'Jaipur Green Fuel Ltd.', // Out of state demo
        tonnes: 15,
        pricePerTonne: 2100,
        totalAmount: 15 * 2100,
        status: 'baler_assigned',
        balerId: currentUser.uid,
        balerName: userProfile?.name || 'Demo Baler',
        upiId: 'demo@upi',
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [
          { status: 'requested', timestamp: new Date() },
          { status: 'baler_assigned', timestamp: new Date() }
        ]
      };
      await addDoc(collection(db, 'transactions'), mockParams);
      toast.success('Demo assignment injected!');
    } catch (e) {
      toast.error('Failed to inject demo');
    }
  }

  if (loading) return <div className="p-8 text-center text-[#6b7280]">Loading available jobs...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display text-[#1c1c1a] mb-6">Available Assignments</h2>
      
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e5de] p-12 text-center text-[#6b7280]">
          <div className="text-4xl mb-4">💤</div>
          <p className="mb-6">No new job requests assigned to your machine right now.</p>
          <button 
            onClick={generateDemoJob} 
            className="px-6 py-2 bg-[#e8f5ec] text-[#1a5c2e] hover:bg-green-100 rounded-xl font-semibold border border-[#1a5c2e]/20 transition-colors"
          >
            + Generate Mock Job (For Pitch)
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map(job => {
            const commission = (job.tonnes * job.pricePerTonne * 0.08).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-[#e8e5de] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#1c1c1a]">{job.farmerName}</h3>
                      <p className="text-sm text-[#6b7280]">Pick up from farm</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{job.tonnes} Tonnes</span>
                  </div>
                  
                  <div className="space-y-2 mb-6 text-sm text-[#4b5563]">
                    <p className="flex justify-between"><span>Deliver to:</span> <span className="font-medium text-[#1c1c1a]">{job.buyerName}</span></p>
                    <p className="flex justify-between"><span>Rate:</span> <span className="font-medium text-[#1c1c1a]">₹{job.pricePerTonne}/T</span></p>
                    <div className="h-px bg-[#e8e5de] my-2" />
                    <p className="flex justify-between font-bold text-[#1a5c2e]">
                      <span>Your Earnings (8%):</span> 
                      <span>{commission}</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => acceptJob(job.id)}
                  className="w-full bg-[#1a5c2e] hover:bg-[#2d8a47] text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Accept Job
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
