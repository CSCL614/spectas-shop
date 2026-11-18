import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  accentBorderColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-[#2563EB]',
  accentBorderColor = 'from-[#2563EB] via-indigo-500 to-[#0D9488]',
  trend,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      className="card-stat group cursor-default h-full flex flex-col justify-between"
    >
      {/* Top animated gradient accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accentBorderColor} opacity-85 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Subtle corner glow on hover */}
      <div className="pointer-events-none absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500/10 to-teal-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between gap-3 pt-1">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-[26px] font-black text-[#172554] mt-1.5 tracking-tight tabular-nums leading-none group-hover:text-[#2563EB] transition-colors duration-200 truncate">
            {value}
          </h3>
          {(subtitle || trend) && (
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    trend.isPositive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-[11px] font-semibold text-slate-500 truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ rotate: 6, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`w-12 h-12 shrink-0 rounded-xl ${iconBgColor} border border-[#D5DFED]/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}
        >
          <Icon className={`w-5 h-5 ${iconColor} transition-transform duration-300 group-hover:scale-110`} />
        </motion.div>
      </div>
    </motion.div>
  );
};
