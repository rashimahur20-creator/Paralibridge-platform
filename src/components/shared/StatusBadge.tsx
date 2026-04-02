import type { TransactionStatus } from '../../types';

const STATUS_CONFIG: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
  requested:      { label: 'Requested',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  baler_assigned: { label: 'Baler Assigned',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  pickup_done:    { label: 'Pickup Complete', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  in_transit:     { label: 'In Transit',      color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered:      { label: 'Delivered',       color: 'text-[#1a5c2e]',  bg: 'bg-[#e8f5ec] border-[#1a5c2e]/20' },
  paid:           { label: 'Paid',            color: 'text-white',      bg: 'bg-[#1c1c1a] border-[#1c1c1a]' },
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
