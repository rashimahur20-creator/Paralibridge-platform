import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLogisticsMode } from '../../context/LogisticsModeContext';
import { DEMO_AVAILABLE_JOB } from '../../utils/logisticsDemoData';
import { haversineDistance } from '../../utils/distance';

export default function AvailableJobs() {
  const { isDemoMode, profile, currentPos, setActiveJob, setProfile } = useLogisticsMode();
  const navigate = useNavigate();

  const isAvailable = profile?.available ?? true;
  const hasActiveJob = false; // would check activeJob with balerAccepted=true in real mode

  const jobs = isDemoMode ? [DEMO_AVAILABLE_JOB] : [];

  async function acceptJob(job: any) {
    setActiveJob({ ...job, balerAccepted: true });
    setProfile((p: any) => ({ ...p, available: false }));
    toast.success('Job accepted! Navigate to farmer location 🚜');
    navigate('/logistics/current');
  }

  if (!isAvailable) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚪</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">You are marked as Busy</p>
        <p className="text-sm text-[#6b7280] mt-2">Go to <strong>My Profile</strong> and toggle your status to Available to see jobs.</p>
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No matching jobs right now</p>
        <p className="text-sm text-[#6b7280] mt-2">No jobs matching your type and location. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>📋</span>Available Jobs</h1>
        <p className="text-[#6b7280] text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} matching your type and location.</p>
      </motion.div>

      <div className="space-y-4">
        {jobs.map((job, i) => {
          const distToFarmer = haversineDistance(currentPos.lat, currentPos.lng, job.farmerLat, job.farmerLng);
          const distFarmerBuyer = haversineDistance(job.farmerLat, job.farmerLng, job.buyerLat, job.buyerLng);
          const isBaler = profile?.type === 'baler';

          return (
            <motion.div key={job.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#e8e5de] rounded-2xl overflow-hidden">
              {/* Job type badge */}
              <div className={`px-5 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-between ${isBaler ? 'bg-blue-50 text-[#1d4ed8]' : 'bg-purple-50 text-purple-700'}`}>
                <span>{isBaler ? '🚜 Baler Job' : '🚛 Transport Job'}</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full normal-case">Available</span>
              </div>

              <div className="p-5">
                {/* Route */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-xl">🌾</div>
                    <p className="text-xs font-semibold text-[#1c1c1a] mt-0.5">{job.farmerName}</p>
                    <p className="text-xs text-[#6b7280]">{job.farmerDistrict}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-green-400 to-red-400 rounded-full mb-1"/>
                    <p className="text-xs text-[#6b7280]">{distFarmerBuyer} km</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl">🏭</div>
                    <p className="text-xs font-semibold text-[#1c1c1a] mt-0.5">{job.buyerName}</p>
                    <p className="text-xs text-[#6b7280]">Buyer</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#f0faf3] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7280]">Your distance</p>
                    <p className="text-sm font-bold text-[#1a5c2e]">{distToFarmer} km</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7280]">Tonnes</p>
                    <p className="text-sm font-bold text-[#1d4ed8]">{job.tonnes}T</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7280]">Commission</p>
                    <p className="text-sm font-bold text-amber-600">₹{job.commission.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Commission breakdown */}
                <div className="bg-[#fafaf7] border border-[#e8e5de] rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6b7280]">Deal total: ₹{job.totalAmount.toLocaleString('en-IN')}</span>
                    <span className="font-bold text-amber-600">Your 20%: ₹{job.commission.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button onClick={() => acceptJob(job)}
                  className="w-full py-3 bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5">
                  ✓ Accept Job — Earn ₹{job.commission.toLocaleString('en-IN')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
