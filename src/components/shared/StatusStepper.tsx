import { motion } from 'framer-motion';
import type { TransactionStatus } from '../../types';

const STEPS: { key: TransactionStatus; label: string; icon: string }[] = [
  { key: 'requested',     label: 'Requested',      icon: '📋' },
  { key: 'baler_assigned', label: 'Baler Assigned', icon: '🚜' },
  { key: 'pickup_done',   label: 'Pickup Done',    icon: '📦' },
  { key: 'in_transit',    label: 'In Transit',     icon: '🚚' },
  { key: 'delivered',     label: 'Delivered',      icon: '🏭' },
  { key: 'paid',          label: 'Paid',           icon: '✅' },
];

const STATUS_INDEX: Record<TransactionStatus, number> = {
  requested: 0, baler_assigned: 1, pickup_done: 2, in_transit: 3, delivered: 4, paid: 5,
};

interface Props { status: TransactionStatus }

export default function StatusStepper({ status }: Props) {
  const current = STATUS_INDEX[status];
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.1 : 1 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                  done
                    ? 'bg-[#1a5c2e] border-[#1a5c2e] text-white'
                    : 'bg-white border-[#e8e5de] text-[#6b7280]'
                } ${active ? 'shadow-lg shadow-green-200' : ''}`}
              >
                {step.icon}
              </motion.div>
              <span className={`text-[10px] font-medium text-center leading-tight ${done ? 'text-[#1a5c2e]' : 'text-[#6b7280]'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-1 flex-1 mx-2 rounded-full bg-[#e8e5de] relative overflow-hidden">
                <div className={`absolute inset-0 transition-all duration-700 ${i < current ? 'bg-[#1a5c2e]' : 'bg-transparent'}`} />
                {active && (
                  <motion.div
                    initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#2d8a47] to-transparent"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
