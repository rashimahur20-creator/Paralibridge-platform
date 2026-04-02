import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-6 relative`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold text-[#1c1c1a]">{title}</h3>
                <button onClick={onClose} className="text-[#6b7280] hover:text-[#1c1c1a] text-xl leading-none transition-colors">×</button>
              </div>
            )}
            {!title && (
              <button onClick={onClose} className="absolute top-4 right-4 text-[#6b7280] hover:text-[#1c1c1a] text-xl leading-none transition-colors">×</button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
