import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import type { DashboardStatsResponse } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, getDateRange } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  IndianRupee,
  Glasses,
  Layers,
  Sparkles,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ReportsAnalytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('thisMonth');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FRAMES' | 'LENSES' | 'COMPARISON'>('OVERVIEW');

  useEffect(() => {
    if (preset !== 'custom') {
      const { from, to } = getDateRange(preset);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [preset]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await salesApi.getDashboardStats({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load analytical metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [dateFrom, dateTo]);

  const frame = stats?.frameAnalytics || { totalOrders: 0, revenue: 0, cost: 0, profit: 0, discount: 0, topBrands: [] };
  const lens = stats?.lensAnalytics || { totalOrders: 0, revenue: 0, cost: 0, profit: 0, discount: 0, topBrands: [] };

  const comparisonData = [
    { metric: 'Orders Count', Frame: frame.totalOrders, Lens: lens.totalOrders },
    { metric: 'Revenue (₹)', Frame: frame.revenue, Lens: lens.revenue },
    { metric: 'Gross Profit (₹)', Frame: frame.profit, Lens: lens.profit },
    { metric: 'Wholesale Cost (₹)', Frame: frame.cost, Lens: lens.cost },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="page-banner p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pointer-events-none absolute -right-12 -top-12 w-52 h-52 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-white/15 border border-white/25 text-teal-200">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">
              Business Intelligence & Product Type Breakdown
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Frames & Lenses Financial Analytics</h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl font-medium">
            Strictly segregated business intelligence: independent performance, profit margins, brand velocities, and comparative charts for Frames versus Lenses.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/25 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-teal-200" />
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="text-xs font-extrabold bg-transparent outline-none cursor-pointer text-white"
          >
            <option value="today" className="text-slate-900">Today</option>
            <option value="last7days" className="text-slate-900">Last 7 Days</option>
            <option value="thisMonth" className="text-slate-900">This Month</option>
            <option value="lastMonth" className="text-slate-900">Last Month</option>
            <option value="thisYear" className="text-slate-900">This Year (Annual)</option>
          </select>
        </div>
      </div>

      {/* Segregation Tabs */}
      <div className="card-premium p-2 flex flex-wrap items-center gap-2 bg-[#EEF2F8]/90 text-xs font-extrabold">
        {[
          { id: 'OVERVIEW', label: 'Overall Summary', icon: Layers },
          { id: 'FRAMES', label: '👓 Frame Analytics', icon: Glasses },
          { id: 'LENSES', label: '🔍 Lens Analytics', icon: Sparkles },
          { id: 'COMPARISON', label: '⚖️ Frame vs Lens Comparison', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all border ${isActive
                  ? 'bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] text-white border-blue-400/30 shadow-md'
                  : 'text-[#172554] bg-white/60 border-[#D5DFED] hover:bg-white hover:border-[#2563EB]'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !stats ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={formatINR(stats?.totalRevenue || 0)}
                  subtitle={`${stats?.totalOrders || 0} total optical orders`}
                  icon={IndianRupee}
                  iconBgColor="bg-blue-50"
                  iconColor="text-[#2563EB]"
                  accentBorderColor="from-[#172554] to-[#2563EB]"
                  delay={0.04}
                />
                <StatCard
                  title="Gross Profit"
                  value={formatINR(stats?.grossProfit || 0)}
                  subtitle={`Margin: ${stats?.totalRevenue ? Math.round((stats.grossProfit / stats.totalRevenue) * 100) : 0}%`}
                  icon={TrendingUp}
                  iconBgColor="bg-emerald-50"
                  iconColor="text-[#0D9488]"
                  accentBorderColor="from-emerald-500 to-[#0D9488]"
                  delay={0.08}
                />
                <StatCard
                  title="Frame Share"
                  value={formatINR(frame.revenue)}
                  subtitle={`${frame.totalOrders} frame units`}
                  icon={Glasses}
                  iconBgColor="bg-indigo-50"
                  iconColor="text-indigo-600"
                  accentBorderColor="from-[#2563EB] to-indigo-600"
                  delay={0.12}
                />
                <StatCard
                  title="Lens Share"
                  value={formatINR(lens.revenue)}
                  subtitle={`${lens.totalOrders} lens pairs`}
                  icon={Sparkles}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-600"
                  accentBorderColor="from-purple-500 to-fuchsia-600"
                  delay={0.16}
                />
              </div>

              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 pb-3 border-b border-[#EEF2F8]">
                  Daily Revenue & Profit Velocity
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.dailyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E9F3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} stroke="#64748b" />
                      <Tooltip formatter={(v: any) => formatINR(Number(v))} contentStyle={{ borderRadius: '12px', border: '1.5px solid #D5DFED' }} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="profit" name="Gross Profit" fill="#0D9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRAME ANALYTICS */}
          {activeTab === 'FRAMES' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Frame Orders" value={frame.totalOrders} icon={ShoppingBag} iconBgColor="bg-blue-50" iconColor="text-[#2563EB]" accentBorderColor="from-[#172554] to-[#2563EB]" />
                <StatCard title="Frame Revenue" value={formatINR(frame.revenue)} icon={IndianRupee} iconBgColor="bg-indigo-50" iconColor="text-indigo-600" accentBorderColor="from-[#2563EB] to-indigo-600" />
                <StatCard title="Frame Wholesale Cost" value={formatINR(frame.cost)} icon={Wallet} iconBgColor="bg-slate-100" iconColor="text-slate-600" accentBorderColor="from-slate-500 to-slate-700" />
                <StatCard title="Frame Gross Profit" value={formatINR(frame.profit)} icon={TrendingUp} iconBgColor="bg-emerald-50" iconColor="text-[#0D9488]" accentBorderColor="from-emerald-500 to-[#0D9488]" />
              </div>

              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 pb-3 border-b border-[#EEF2F8] flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-[#2563EB]" />
                  <span>Most Sold Frame Brands</span>
                </h3>
                {frame.topBrands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center font-semibold">No frame orders in selected period</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {frame.topBrands.map((b, i) => (
                      <motion.div
                        key={b.brand}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="p-4 rounded-xl bg-blue-50/70 border-[1.5px] border-blue-200 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-black text-[#172554]">#{i + 1} {b.brand}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Frame Brand</p>
                        </div>
                        <span className="badge-partial text-xs">{b.count} sold</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LENS ANALYTICS */}
          {activeTab === 'LENSES' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Lens Orders" value={lens.totalOrders} icon={ShoppingBag} iconBgColor="bg-purple-50" iconColor="text-purple-600" accentBorderColor="from-purple-500 to-fuchsia-600" />
                <StatCard title="Lens Revenue" value={formatINR(lens.revenue)} icon={IndianRupee} iconBgColor="bg-indigo-50" iconColor="text-indigo-600" accentBorderColor="from-[#2563EB] to-purple-600" />
                <StatCard title="Lens Wholesale Cost" value={formatINR(lens.cost)} icon={Wallet} iconBgColor="bg-slate-100" iconColor="text-slate-600" accentBorderColor="from-slate-500 to-slate-700" />
                <StatCard title="Lens Gross Profit" value={formatINR(lens.profit)} icon={TrendingUp} iconBgColor="bg-emerald-50" iconColor="text-[#0D9488]" accentBorderColor="from-emerald-500 to-[#0D9488]" />
              </div>

              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 pb-3 border-b border-[#EEF2F8] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Most Sold Lens Brands & Optical Types</span>
                </h3>
                {lens.topBrands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center font-semibold">No lens orders in selected period</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {lens.topBrands.map((b, i) => (
                      <motion.div
                        key={b.brand}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="p-4 rounded-xl bg-purple-50/70 border-[1.5px] border-purple-200 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-black text-[#172554]">#{i + 1} {b.brand}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Lens Category</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white text-purple-700 border border-purple-200">
                          {b.count} sold
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMPARISON */}
          {activeTab === 'COMPARISON' && (
            <div className="card-premium p-6">
              <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 pb-3 border-b border-[#EEF2F8]">
                Frame vs Lens Metric Comparison
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E9F3" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip formatter={(v: any) => formatINR(Number(v))} contentStyle={{ borderRadius: '12px', border: '1.5px solid #D5DFED' }} />
                    <Legend />
                    <Bar dataKey="Frame" name="👓 Frames" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Lens" name="🔍 Lenses" fill="#9333EA" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
