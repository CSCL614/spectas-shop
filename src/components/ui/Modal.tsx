import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#172554]/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className={`relative bg-white rounded-2xl border-2 border-[#D5DFED] shadow-2xl w-full ${maxWidth} overflow-hidden`}
            >
              {/* Top gradient accent strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488]" />

              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#F8FAFE] to-[#EEF2F8]/60 border-b border-[#D5DFED]">
                <h3 className="text-base font-black text-[#172554] tracking-tight">{title}</h3>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-slate-500 hover:text-rose-600 rounded-xl p-1.5 bg-white hover:bg-rose-50 border border-[#D5DFED] hover:border-rose-200 transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="p-6 max-h-[82vh] overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
