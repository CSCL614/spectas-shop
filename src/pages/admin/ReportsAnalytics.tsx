import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import type { DashboardStatsResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, getDateRange } from '../../utils/helpers';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Glasses,
  Percent,
  Layers,
  Sparkles,
} from 'lucide-react';
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
      } catch (err: any) {
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
      <div className="card-premium p-6 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-white/10 text-teal-300">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-300">
              Business Intelligence & Product Type Breakdown
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Frames & Lenses Financial Analytics</h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Strictly segregated business intelligence: independent performance, profit margins, brand velocities, and comparative charts for Frames versus Lenses.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-200" />
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="text-xs font-bold bg-transparent outline-none cursor-pointer text-white"
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
      <div className="flex items-center space-x-2 border-b border-[#D5DFED] pb-3 text-xs font-bold">
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
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</p>
                  <p className="text-2xl font-black text-[#2563EB] mt-1">{formatINR(stats?.totalRevenue || 0)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats?.totalOrders || 0} total optical orders</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Gross Profit</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(stats?.grossProfit || 0)}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Margin: {stats?.totalRevenue ? Math.round((stats.grossProfit / stats.totalRevenue) * 100) : 0}%</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Frame Share</p>
                  <p className="text-2xl font-black text-[#2563EB] mt-1">{formatINR(frame.revenue)}</p>
                  <p className="text-[10px] text-blue-500 font-bold mt-1">{frame.totalOrders} frame units</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Lens Share</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">{formatINR(lens.revenue)}</p>
                  <p className="text-[10px] text-purple-600 font-bold mt-1">{lens.totalOrders} lens pairs</p>
                </div>
              </div>

              {/* Daily Trend Chart */}
              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4">Daily Revenue & Profit Velocity</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.dailyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Gross Profit" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRAME ANALYTICS */}
          {activeTab === 'FRAMES' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-stat border-l-4 border-l-[#2563EB]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Frame Orders</p>
                  <p className="text-2xl font-black text-[#2563EB] mt-1">{frame.totalOrders}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Frame Revenue</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(frame.revenue)}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Frame Wholesale Cost</p>
                  <p className="text-2xl font-black text-slate-600 mt-1">{formatINR(frame.cost)}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Frame Gross Profit</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(frame.profit)}</p>
                </div>
              </div>

              {/* Top Frame Brands Table */}
              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-[#2563EB]" />
                  <span>Most Sold Frame Brands</span>
                </h3>
                {frame.topBrands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No frame orders in selected period</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {frame.topBrands.map((b, i) => (
                      <div key={b.brand} className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-[#172554]">#{i + 1} {b.brand}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Frame Brand</p>
                        </div>
                        <span className="text-sm font-black text-[#2563EB]">{b.count} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LENS ANALYTICS */}
          {activeTab === 'LENSES' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-stat border-l-4 border-l-purple-600">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Lens Orders</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">{lens.totalOrders}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lens Revenue</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(lens.revenue)}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lens Wholesale Cost</p>
                  <p className="text-2xl font-black text-slate-600 mt-1">{formatINR(lens.cost)}</p>
                </div>
                <div className="card-stat">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Lens Gross Profit</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(lens.profit)}</p>
                </div>
              </div>

              {/* Top Lens Brands Table */}
              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Most Sold Lens Brands & Optical Types</span>
                </h3>
                {lens.topBrands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No lens orders in selected period</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {lens.topBrands.map((b, i) => (
                      <div key={b.brand} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-[#172554]">#{i + 1} {b.brand}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Lens Category</p>
                        </div>
                        <span className="text-sm font-black text-purple-700">{b.count} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMPARISON */}
          {activeTab === 'COMPARISON' && (
            <div className="space-y-6">
              <div className="card-premium p-6">
                <h3 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4">Frame vs Lens Metric Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                      <Legend />
                      <Bar dataKey="Frame" name="👓 Frames" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lens" name="🔍 Lenses" fill="#9333EA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
