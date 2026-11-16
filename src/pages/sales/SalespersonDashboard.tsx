import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStatsResponse, SaleResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, formatDate, getDateRange } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Clock,
  Plus,
  ArrowRight,
  Glasses,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
    } catch (err) {
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  // Periodic session heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      salesApi.getDashboardStats().catch(() => {});
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const totalRev = stats?.totalRevenue || 0;
  const targetGoal = 100000;
  const progressPercent = Math.min(100, Math.round((totalRev / targetGoal) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card-premium p-6 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 border border-white/20 px-3 py-0.5 rounded-full text-blue-200">
            👓 Optical Sales Executive Portal
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            Welcome Back, {user?.fullName}!
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Track your personal spectacle orders, advance collections, customer deliveries and performance commissions.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
          <div className="text-right">
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Target Goal</p>
            <p className="text-sm font-black text-white">{formatINR(totalRev)} / {formatINR(targetGoal)}</p>
            <p className="text-[10px] text-emerald-300 font-bold mt-0.5">{progressPercent}% Achieved</p>
          </div>
          <Link to="/sales/new" className="btn-primary py-2 px-3 text-xs bg-white text-[#172554] hover:bg-blue-50 font-black shadow-md">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="card-premium p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
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
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                datePreset === p.id
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); }}
            className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); }}
            className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
          />
          <button
            type="button"
            onClick={() => { setDatePreset('all'); setDateFrom(''); setDateTo(''); }}
            className="btn-ghost px-2.5 py-1 text-xs"
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-stat">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">My Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#2563EB]" />
              </div>
              <p className="text-2xl font-black text-[#172554] mt-1">{stats?.totalOrders || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">Booked in selected period</p>
            </div>

            <div className="card-stat">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 uppercase">My Sales Revenue</span>
                <IndianRupee className="w-4 h-4 text-[#2563EB]" />
              </div>
              <p className="text-2xl font-black text-[#2563EB] mt-1">{formatINR(stats?.totalRevenue || 0)}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Profit: {formatINR(stats?.grossProfit || 0)}</p>
            </div>

            <div className="card-stat">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-700 uppercase">Advance Collected</span>
                <CreditCard className="w-4 h-4 text-[#0d9488]" />
              </div>
              <p className="text-2xl font-black text-teal-700 mt-1">{formatINR(stats?.advanceCollected || 0)}</p>
              <p className="text-[10px] text-slate-400 mt-1">Direct cash & UPI collected</p>
            </div>

            <div className="card-stat">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-600 uppercase">Pending Balance</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-1">{formatINR(stats?.remainingBalance || 0)}</p>
              <p className="text-[10px] text-rose-500 font-bold mt-1">Customer balance to collect</p>
            </div>
          </div>

          {/* Frame vs Lens Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-premium p-5 border-l-4 border-l-[#2563EB]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider flex items-center gap-1.5">
                  <Glasses className="w-4 h-4 text-[#2563EB]" />
                  <span>My Frame Sales</span>
                </h3>
                <span className="badge-brand">{stats?.frameAnalytics?.totalOrders || 0} Frames Sold</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Frame Revenue</p>
                  <p className="text-base font-black text-[#2563EB] mt-0.5">{formatINR(stats?.frameAnalytics?.revenue || 0)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Frame Profit</p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">{formatINR(stats?.frameAnalytics?.profit || 0)}</p>
                </div>
              </div>
            </div>

            <div className="card-premium p-5 border-l-4 border-l-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider flex items-center gap-1.5">
                  <Glasses className="w-4 h-4 text-purple-600" />
                  <span>My Lens Sales</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {stats?.lensAnalytics?.totalOrders || 0} Lenses Sold
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-purple-50">
                  <p className="text-[10px] text-purple-700 font-bold uppercase">Lens Revenue</p>
                  <p className="text-base font-black text-purple-700 mt-0.5">{formatINR(stats?.lensAnalytics?.revenue || 0)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Lens Profit</p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">{formatINR(stats?.lensAnalytics?.profit || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-[#D5DFED] flex items-center justify-between">
              <h3 className="font-black text-sm text-[#172554]">My Recent Orders</h3>
              <Link to="/sales" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
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
                    <th>Final Price</th>
                    <th>Advance</th>
                    <th>Balance</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono font-bold text-[#2563EB]">{s.stickerNumber}</td>
                      <td className="font-bold text-slate-800 text-xs">{s.customerName}</td>
                      <td>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (s.productType || 'FRAME') === 'FRAME' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {s.productType || 'FRAME'}
                        </span>
                      </td>
                      <td className="font-black text-slate-900">{formatINR(s.sellingPrice)}</td>
                      <td className="font-bold text-emerald-600">{formatINR(s.advanceAmount)}</td>
                      <td>
                        {s.remainingBalance === 0 ? (
                          <span className="badge-delivered">Cleared</span>
                        ) : (
                          <span className="font-bold text-rose-600 text-xs">{formatINR(s.remainingBalance)}</span>
                        )}
                      </td>
                      <td className="text-right">
                        <Link to={`/sales/${s.id}`} className="text-xs font-bold text-[#2563EB] hover:underline">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
