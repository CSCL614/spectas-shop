import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-14 h-14 border-4',
  };

  const innerDot = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <div className={`flex flex-col justify-center items-center p-4 gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div
          className={`${sizeClasses[size]} rounded-full border-[#D5DFED] border-t-[#2563EB] border-r-[#0D9488] animate-spin shadow-sm`}
        />
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute ${innerDot[size]} rounded-full bg-gradient-to-tr from-[#2563EB] to-[#0D9488]`}
        />
      </div>
      {size === 'lg' && (
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 animate-pulse">
          Loading Sri Sai Opticals...
        </span>
      )}
    </div>
  );
};
