import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStatsResponse, SaleResponse } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, getDateRange } from '../../utils/helpers';
import { downloadOrderReceiptPdf } from '../../utils/receiptGenerator';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  CreditCard,
  Clock,
  Plus,
  ArrowRight,
  Glasses,
  Calendar,
  Sparkles,
  Award,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const SalespersonDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [recentSales, setRecentSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Range Filters
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else {
      const { from, to } = getDateRange(preset);
      setDateFrom(from);
      setDateTo(to);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes] = await Promise.all([
        salesApi.getDashboardStats({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
        salesApi.getAll({
          page: 0,
          size: 6,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        }),
      ]);
      setStats(statsRes.data.data);
      setRecentSales(salesRes.data.data.content);
    } catch {
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  // Periodic refresh
  useEffect(() => {
    const timer = setInterval(() => {
      salesApi.getDashboardStats().catch(() => { });
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const totalRev = stats?.totalRevenue || 0;
  const targetGoal = 100000;
  const progressPercent = Math.min(100, Math.round((totalRev / targetGoal) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="page-banner p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/15 border border-white/25 px-3 py-1 rounded-full text-blue-100">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Optical Sales Executive Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2.5 tracking-tight">
            Welcome Back, {user?.fullName}!
          </h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-lg font-medium">
            Track your personal spectacle orders, advance collections, customer deliveries and performance goals.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="sm:text-right min-w-[165px]">
            <div className="flex items-center sm:justify-end gap-1.5 text-[10px] text-teal-200 font-extrabold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Target Goal</span>
            </div>
            <p className="text-sm font-black text-white mt-0.5 tabular-nums">
              {formatINR(totalRev)} / {formatINR(targetGoal)}
            </p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
              />
            </div>
            <p className="text-[10px] text-emerald-300 font-extrabold mt-1">{progressPercent}% Achieved</p>
          </div>
          <Link
            to="/sales/new"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs bg-white text-[#172554] hover:bg-blue-50 font-black shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1 text-[#2563EB]" />
            <span>New Sale</span>
          </Link>
        </div>
      </motion.div>

      {/* Date Range Filter Bar */}
      <div className="card-premium p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-extrabold text-[#172554] mr-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Filter Period:</span>
          </span>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'last7days', label: 'Last 7 Days' },
            { id: 'last30days', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${datePreset === p.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                  : 'bg-[#EEF2F8] text-[#172554] border-[#D5DFED] hover:bg-white hover:border-[#2563EB]'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); }}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); }}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
          <button
            type="button"
            onClick={() => { setDatePreset('all'); setDateFrom(''); setDateTo(''); }}
            className="btn-ghost px-3 py-1.5 text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Total Orders"
              value={stats?.totalOrders || 0}
              subtitle="Booked in selected period"
              icon={ShoppingBag}
              iconBgColor="bg-blue-50"
              iconColor="text-[#2563EB]"
              accentBorderColor="from-[#172554] to-[#2563EB]"
              delay={0.04}
            />
            <StatCard
              title="My Sales Revenue"
              value={formatINR(stats?.totalRevenue || 0)}
              subtitle={`Profit: ${formatINR(stats?.grossProfit || 0)}`}
              icon={IndianRupee}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
              accentBorderColor="from-[#2563EB] to-indigo-600"
              delay={0.1}
            />
            <StatCard
              title="Advance Collected"
              value={formatINR(stats?.advanceCollected || 0)}
              subtitle="Direct cash & digital collected"
              icon={CreditCard}
              iconBgColor="bg-teal-50"
              iconColor="text-[#0D9488]"
              accentBorderColor="from-emerald-500 to-[#0D9488]"
              delay={0.16}
            />
            <StatCard
              title="Pending Balance"
              value={formatINR(stats?.remainingBalance || 0)}
              subtitle="Customer dues to collect"
              icon={Clock}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-600"
              accentBorderColor="from-rose-500 to-orange-500"
              delay={0.22}
            />
          </div>

          {/* Frame vs Lens Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="card-premium p-5 border-l-4 border-l-[#2563EB]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                    <Glasses className="w-4 h-4" />
                  </span>
                  <span>My Frame Sales</span>
                </h3>
                <span className="badge-partial">{stats?.frameAnalytics?.totalOrders || 0} Frames Sold</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                  <p className="text-[10px] text-blue-700 font-extrabold uppercase">Frame Revenue</p>
                  <p className="text-lg font-black text-[#2563EB] mt-0.5 tabular-nums">
                    {formatINR(stats?.frameAnalytics?.revenue || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-extrabold uppercase">Frame Profit</p>
                  <p className="text-lg font-black text-[#0D9488] mt-0.5 tabular-nums">
                    {formatINR(stats?.frameAnalytics?.profit || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="card-premium p-5 border-l-4 border-l-purple-600"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Glasses className="w-4 h-4" />
                  </span>
                  <span>My Lens Sales</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  {stats?.lensAnalytics?.totalOrders || 0} Lenses Sold
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200">
                  <p className="text-[10px] text-purple-700 font-extrabold uppercase">Lens Revenue</p>
                  <p className="text-lg font-black text-purple-700 mt-0.5 tabular-nums">
                    {formatINR(stats?.lensAnalytics?.revenue || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-extrabold uppercase">Lens Profit</p>
                  <p className="text-lg font-black text-[#0D9488] mt-0.5 tabular-nums">
                    {formatINR(stats?.lensAnalytics?.profit || 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Orders Table */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#F8FAFE] to-[#EEF2F8]/80 border-b border-[#D5DFED] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-[#172554]">My Recent Orders</h3>
              </div>
              <Link
                to="/sales"
                className="text-xs font-extrabold text-[#2563EB] hover:text-[#0D9488] flex items-center gap-1 transition-colors"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Sticker</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Price / Paid</th>
                    <th>Balance</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap">
                        <span className="sticker-badge">{s.stickerNumber}</span>
                      </td>
                      <td className="font-extrabold text-[#172554] text-xs max-w-[160px] truncate" title={s.customerName}>
                        {s.customerName}
                      </td>
                      <td className="whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${(s.productType || 'FRAME') === 'FRAME'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                        >
                          {s.productType || 'FRAME'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <p className="font-black text-[#172554] text-xs tabular-nums">{formatINR(s.sellingPrice)}</p>
                        <p className="text-[10px] font-extrabold text-[#0D9488] tabular-nums">
                          Paid {formatINR(s.advanceAmount)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap">
                        {s.remainingBalance === 0 ? (
                          <span className="badge-delivered">Cleared</span>
                        ) : (
                          <span className="font-black text-rose-600 text-xs tabular-nums">
                            {formatINR(s.remainingBalance)}
                          </span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              downloadOrderReceiptPdf(s);
                              toast.success(`Receipt downloaded for ${s.stickerNumber}`);
                            }}
                            title="Download Receipt (PDF)"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 hover:bg-[#0D9488] text-[#0D9488] hover:text-white border border-teal-200 text-[11px] font-extrabold transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          <Link
                            to={`/sales/${s.id}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-blue-200 text-[11px] font-extrabold transition-all"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold">
                        No recent orders found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
