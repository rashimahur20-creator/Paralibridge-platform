import { useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useFarmerMode } from '../../context/FarmerModeContext';
import { DEMO_TRANSACTION } from '../../utils/farmerDemoData';
import { calcCO2Saved, calcCreditValue, generateCertificateId, formatINR } from '../../utils/calculations';

export default function GreenCertificates() {
  const { isDemoMode, localTransactions, farmerProfile } = useFarmerMode();
  const paidTxns = isDemoMode
    ? [{ ...DEMO_TRANSACTION, status: 'paid' }, ...localTransactions.filter(t => t.status === 'paid')]
    : localTransactions.filter(t => t.status === 'paid');

  if (!paidTxns.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏆</div>
        <p className="font-display text-xl font-bold text-[#1c1c1a]">No Certificates Yet</p>
        <p className="text-sm text-[#6b7280] mt-2">Complete a transaction to receive your Certificate of Non-Burning.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1c1a] flex items-center gap-2"><span>🏆</span>Green Certificates</h1>
        <p className="text-[#6b7280] text-sm mt-1">Official proof that you did not burn your parali.</p>
      </motion.div>
      <div className="space-y-6">
        {paidTxns.map((txn, i) => (
          <CertCard key={txn.id} txn={txn} profile={farmerProfile} index={i}/>
        ))}
      </div>
    </div>
  );
}

function CertCard({ txn, profile, index }: { txn: any; profile: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const co2    = calcCO2Saved(txn.tonnes);
  const credit = calcCreditValue(co2);
  const certId = generateCertificateId(profile?.district ?? 'Ludhiana');
  const date   = new Date(txn.createdAt ?? Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  async function download() {
    if (!ref.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#fff' });
      const a = document.createElement('a');
      a.download = `ParaliBridge-${certId}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast.success('Certificate downloaded!');
    } catch { window.print(); }
  }

  function listCarbon() {
    toast(`Estimated value: ${formatINR(credit)} — Carbon exchange listing coming soon!`, { icon: '🌿' });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      {/* Certificate */}
      <div ref={ref} style={{
        background: '#fff', border: '4px double #1a5c2e', borderRadius: 20,
        padding: 32, position: 'relative', overflow: 'hidden', fontFamily: 'Georgia, serif',
      }}>
        {/* Watermark */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          opacity:.04, fontSize:120, transform:'rotate(-30deg)', pointerEvents:'none', userSelect:'none' }}>🌿</div>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1a5c2e"/>
              <path d="M16 6C13 6 10 9 10 13c0 3 1.5 5.5 4 7v6h4v-6c2.5-1.5 4-4 4-7 0-4-3-7-6-7z" fill="#2d8a47"/>
              <rect x="10" y="24" width="12" height="2" rx="1" fill="#f59e0b"/>
            </svg>
            <span style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:20, fontWeight:700, color:'#1a5c2e' }}>ParaliBridge</span>
          </div>
          <div style={{ width:60, height:2, background:'#f59e0b', margin:'0 auto 10px' }}/>
          <h2 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:22, fontWeight:700, color:'#1c1c1a', margin:0 }}>
            Certificate of Non-Burning
          </h2>
          <p style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>This certifies that the farmer named below has NOT burned parali</p>
        </div>

        {/* Fields */}
        <div style={{ border:'1px solid #e8e5de', borderRadius:12, padding:20, marginBottom:20, background:'#fafaf7' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Farmer Name"   value={profile?.name ?? txn.farmerName ?? 'Gurpreet Singh'}/>
            <Field label="District"      value={`${profile?.district ?? 'Ludhiana'}, Punjab`}/>
            <Field label="Date"          value={date}/>
            <Field label="Certificate ID" value={certId} mono/>
            <Field label="Parali Sold"   value={`${txn.tonnes} tonnes`} highlight/>
            <Field label="Buyer"         value={txn.buyerName}/>
          </div>
        </div>

        {/* Impact */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          <Stat icon="🌿" label="CO₂ Saved"      value={`${co2}T CO₂e`}     color="#1a5c2e"/>
          <Stat icon="💸" label="Revenue Earned"  value={formatINR(txn.totalAmount)} color="#f59e0b"/>
          <Stat icon="🏭" label="Carbon Credits"  value={formatINR(credit)}   color="#2563eb"/>
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', borderTop:'1px solid #e8e5de', paddingTop:14 }}>
          <p style={{ fontSize:11, color:'#9ca3af' }}>Verified by ParaliBridge · Punjab Climate Action Programme · {new Date().getFullYear()}</p>
          <p style={{ fontSize:10, color:'#d1d5db', marginTop:2 }}>Tradable on India's Carbon Credit Trading Scheme (CCTS)</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-3">
        <button onClick={download}
          className="flex-1 py-2.5 bg-[#1a5c2e] hover:bg-[#2d8a47] text-white text-sm font-semibold rounded-xl transition-colors">
          📥 Download Certificate
        </button>
        <button onClick={listCarbon}
          className="flex-1 py-2.5 border border-[#1a5c2e] text-[#1a5c2e] text-sm font-semibold rounded-xl hover:bg-[#f0faf3] transition-colors">
          🌿 Carbon Exchange
        </button>
      </div>
    </motion.div>
  );
}

function Field({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontSize:10, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{label}</p>
      <p style={{ fontSize: highlight ? 16 : 13, fontWeight: highlight ? 700 : 600, color: highlight ? '#1a5c2e' : '#1c1c1a',
        fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</p>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign:'center', background:'#f9fafb', borderRadius:10, padding:12, border:'1px solid #f3f4f6' }}>
      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:10, color:'#6b7280', marginTop:2 }}>{label}</div>
    </div>
  );
}
