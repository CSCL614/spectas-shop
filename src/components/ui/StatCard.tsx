import React from 'react';
import { LucideIcon } from 'lucide-react';

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
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  accentBorderColor = 'from-blue-500 to-indigo-500',
}) => {
  return (
    <div className="card-stat group">
      {/* Top micro-gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentBorderColor} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight group-hover:text-blue-600 transition-colors">
            {value}
          </h3>
          {subtitle && (
            <div className="flex items-center space-x-1 mt-1.5">
              <span className="text-[11px] font-medium text-slate-500">{subtitle}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgColor} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
