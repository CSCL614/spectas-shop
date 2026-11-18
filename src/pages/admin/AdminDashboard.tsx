import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesApi, adminApi } from '../../api/services';
import type { DashboardStatsResponse, UserResponse } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, getDateRange } from '../../utils/helpers';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Clock,
  Calendar,
  Sparkles,
  RotateCw,
  Glasses,
  Activity,
  Award,
  Zap,
  PackageCheck,
  FileText,
  Wallet,
  Percent,
  Users,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DONUT_COLORS = ['#0D9488', '#f59e0b', '#2563EB', '#ec4899', '#8b5cf6', '#14b8a6', '#6366f1', '#f43f5e'];
const BRAND_GRADIENTS = [
  'from-[#2563EB] to-indigo-600',
  'from-violet-600 to-purple-600',
  'from-emerald-600 to-[#0D9488]',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-600 to-[#2563EB]',
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');

  // Interactive Chart View Toggle & Time Grouping
  const [chartMode, setChartMode] = useState<'area' | 'composed' | 'brand'>('area');
  const [timeGrouping, setTimeGrouping] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const handleSeed = async () => {
    try {
      setLoading(true);
      await salesApi.seedDummyData();
      toast.success('15 Sample Optical Orders refreshed successfully!');
      await fetchStats();
    } catch {
      toast.error('Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminApi.getSalespersons()
      .then((res) => setSalespersons(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (datePreset !== 'custom') {
      const { from, to } = getDateRange(datePreset);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [datePreset]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await salesApi.getDashboardStats({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        salespersonId: selectedSalesperson || undefined,
      });
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo, selectedSalesperson]);

  // Derived Business KPIs
  const totalOrders = stats?.totalOrders || 0;
  const totalRev = stats?.totalRevenue || 0;
  const grossProfit = stats?.grossProfit || 0;
  const advance = stats?.advanceCollected || 0;
  const delivered = stats?.deliveredOrders || 0;
  const pending = stats?.pendingOrders || 0;

  const profitMargin = totalRev > 0 ? ((grossProfit / totalRev) * 100).toFixed(1) : '0';
  const collectionRate = totalRev > 0 ? Math.min(100, Math.round((advance / totalRev) * 100)) : 0;
  const fulfillmentRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

  // Custom Glass Tooltip
  const CustomGlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#172554]/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-blue-400/30 text-xs space-y-1.5 min-w-[185px]">
          <p className="font-extrabold text-blue-200 border-b border-white/15 pb-1.5 flex items-center justify-between">
            <span>📅 {label}</span>
          </p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-1.5 text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-black text-white">
                {typeof item.value === 'number' && item.name.toLowerCase().includes('order')
                  ? `${item.value} units`
                  : formatINR(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Grouped Interactive Sales Trajectory Data (Daily, Weekly, Monthly, Yearly)
  const getTrajectoryData = () => {
    const rawData = stats?.dailySales || [];
    if (rawData.length === 0 || timeGrouping === 'daily') {
      return rawData;
    }

    const map = new Map<string, { date: string; revenue: number; orders: number; profit: number }>();
    rawData.forEach((item) => {
      const parts = item.date.split('-');
      let key = item.date;

      if (timeGrouping === 'weekly') {
        const d = new Date(item.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        key = `Wk of ${monday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      } else if (timeGrouping === 'monthly') {
        if (parts.length >= 2) {
          const d = new Date(`${parts[0]}-${parts[1]}-01`);
          key = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        }
      } else if (timeGrouping === 'yearly') {
        key = parts[0] || item.date;
      }

      const cur = map.get(key) || { date: key, revenue: 0, orders: 0, profit: 0 };
      cur.revenue += item.revenue;
      cur.orders += item.orders;
      cur.profit += item.profit;
      map.set(key, cur);
    });

    return Array.from(map.values());
  };

  const trajectoryData = getTrajectoryData();

  return (
    <div className="space-y-6">
      {/* Top Header & Dynamic Sales Executive Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-premium p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t-4 border-t-[#2563EB]"
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-[#172554] tracking-tight">Executive Optical Intelligence</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 tracking-wide uppercase border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Real-Time
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Real-time spectacle sales, gross revenue, inventory costs & delivery distribution
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-[#EEF2F8]/80 hover:bg-white px-3 py-2 rounded-xl border-[1.5px] border-[#D5DFED] hover:border-[#2563EB]/60 transition-all shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#172554] outline-none cursor-pointer"
            >
              <option value="all">All Time (All Orders)</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* DYNAMIC SALES EXECUTIVE DROPDOWN */}
          <div className="flex items-center space-x-2 bg-[#EEF2F8]/80 hover:bg-white px-3 py-2 rounded-xl border-[1.5px] border-[#D5DFED] hover:border-[#2563EB]/60 transition-all shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#0D9488]" />
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#172554] outline-none cursor-pointer"
            >
              <option value="">All Orders (All Staff)</option>
              <option value="ADMIN">Admin</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.fullName}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => fetchStats()}
            title="Refresh Metrics"
            disabled={refreshing}
            className="p-2.5 bg-white hover:bg-[#EEF2F8] text-[#172554] hover:text-[#2563EB] rounded-xl border-[1.5px] border-[#D5DFED] hover:border-[#2563EB] transition-all shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2563EB]' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSeed}
            title="Populate 15 spectacles demo sales into MongoDB"
            className="btn-primary py-2 px-3.5 text-xs space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Demo Data</span>
          </motion.button>
        </div>
      </motion.div>

      {datePreset === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 flex flex-wrap items-center gap-3 bg-blue-50/70 border-blue-300"
        >
          <span className="text-xs font-extrabold text-[#172554]">Custom Date Span:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-modern py-1.5 px-3 text-xs w-auto bg-white"
          />
          <span className="text-xs text-slate-500 font-bold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-modern py-1.5 px-3 text-xs w-auto bg-white"
          />
        </motion.div>
      )}

      {loading && !stats ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* TODAY'S OPERATING PULSE HERO BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="page-banner p-5 sm:p-6 text-white"
          >
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-400/15 blur-3xl" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Today's Live Financial Reconciliation (IST)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                  Today's Operating Pulse
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/daily-statement"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold bg-white/12 hover:bg-white/22 text-white px-3.5 py-2 rounded-xl border border-white/20 transition-all backdrop-blur-sm hover:-translate-y-0.5"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-200" />
                  <span>Daily Statement PDF</span>
                </Link>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Today's Collection */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-teal-300/50 backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between text-emerald-300 text-xs font-extrabold">
                  <span>Today's Collection</span>
                  <span className="p-1.5 rounded-lg bg-emerald-400/20">
                    <Wallet className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white mt-2 tabular-nums">
                  {formatINR(stats?.todayCollection || 0)}
                </p>
                <p className="text-[10px] text-blue-100/75 mt-1 font-medium">Actual cash + digital received today</p>
              </motion.div>

              {/* Today's Discount */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-rose-300/50 backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between text-rose-300 text-xs font-extrabold">
                  <span>Today's Discount</span>
                  <span className="p-1.5 rounded-lg bg-rose-400/20">
                    <Percent className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-rose-200 mt-2 tabular-nums">
                  {formatINR(stats?.todayDiscount || 0)}
                </p>
                <p className="text-[10px] text-blue-100/75 mt-1 font-medium">Concessions given today</p>
              </motion.div>

              {/* Today's Profit */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-sky-300/50 backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between text-sky-300 text-xs font-extrabold">
                  <span>Today's Profit</span>
                  <span className="p-1.5 rounded-lg bg-sky-400/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-sky-100 mt-2 tabular-nums">
                  {formatINR(stats?.todayProfit || 0)}
                </p>
                <p className="text-[10px] text-blue-100/75 mt-1 font-medium">Selling price minus wholesale cost</p>
              </motion.div>

              {/* Today's Orders */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-indigo-300/50 backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between text-indigo-200 text-xs font-extrabold">
                  <span>Today's Orders</span>
                  <span className="p-1.5 rounded-lg bg-indigo-400/25">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white mt-2 tabular-nums">
                  {stats?.todayOrders || 0}
                </p>
                <p className="text-[10px] text-blue-100/75 mt-1 font-medium">Booked in shop today</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Primary KPI Metric Cards (Staggered Entrance) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gross Revenue"
              value={formatINR(stats?.totalRevenue)}
              subtitle={`${stats?.totalOrders || 0} Total Orders (Net: ${formatINR(stats?.totalRevenue)})`}
              icon={IndianRupee}
              iconBgColor="bg-blue-50"
              iconColor="text-[#2563EB]"
              accentBorderColor="from-[#2563EB] to-indigo-600"
              delay={0.04}
            />
            <StatCard
              title="Gross Profit"
              value={formatINR(stats?.grossProfit)}
              subtitle={`${profitMargin}% Gross Margin (Selling - Cost)`}
              icon={TrendingUp}
              iconBgColor="bg-emerald-50"
              iconColor="text-[#0D9488]"
              accentBorderColor="from-emerald-500 to-[#0D9488]"
              delay={0.1}
            />
            <StatCard
              title="Total Advance Collected"
              value={formatINR(stats?.advanceCollected)}
              subtitle={`${collectionRate}% of Total Billed Collected`}
              icon={CreditCard}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-600"
              accentBorderColor="from-violet-500 to-purple-600"
              delay={0.16}
            />
            <StatCard
              title="Outstanding Balance"
              value={formatINR(stats?.remainingBalance)}
              subtitle="Pending Customer Dues"
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              accentBorderColor="from-amber-400 to-orange-500"
              delay={0.22}
            />
          </div>

          {/* Interactive Visual Analytics Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interactive Chart with Daily/Weekly/Monthly/Yearly Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="lg:col-span-2 card-premium p-5 flex flex-col"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EEF2F8]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172554] tracking-tight">Interactive Sales Trajectory</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Analyze revenue, order volume and profit margins across time scales
                    </p>
                  </div>
                </div>

                {/* View Switchers: Time Scale + Chart Type */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center p-1 bg-[#EEF2F8] rounded-xl border border-[#D5DFED] text-xs">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTimeGrouping(mode)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                          timeGrouping === mode
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'text-slate-600 hover:text-[#172554]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center p-1 bg-[#EEF2F8] rounded-xl border border-[#D5DFED] text-xs">
                    {(['area', 'composed', 'brand'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setChartMode(mode)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          chartMode === mode
                            ? 'bg-white text-[#2563EB] shadow-sm border border-[#D5DFED]'
                            : 'text-slate-600 hover:text-[#172554]'
                        }`}
                      >
                        {mode === 'area' ? 'Area' : mode === 'composed' ? 'Volume' : 'Brands'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-80 w-full flex-1">
                {trajectoryData && trajectoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === 'area' ? (
                      <AreaChart data={trajectoryData}>
                        <defs>
                          <linearGradient id="areaRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="areaProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E9F3" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 700 }} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Gross Revenue"
                          stroke="#2563EB"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#areaRev)"
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          name="Gross Profit"
                          stroke="#0D9488"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#areaProfit)"
                        />
                      </AreaChart>
                    ) : chartMode === 'composed' ? (
                      <ComposedChart data={trajectoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E9F3" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#2563EB" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 700 }} />
                        <Bar yAxisId="right" dataKey="orders" name="Order Units" fill="#c7d2fe" radius={[6, 6, 0, 0]} barSize={24} />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
                        <Line yAxisId="left" type="monotone" dataKey="profit" name="Gross Margin" stroke="#0D9488" strokeWidth={2.5} strokeDasharray="4 4" />
                      </ComposedChart>
                    ) : (
                      <BarChart data={stats?.companySales || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E9F3" vertical={false} />
                        <XAxis dataKey="company" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Bar dataKey="revenue" name="Brand Revenue" fill="#2563EB" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="orders" name="Units Sold" fill="#0D9488" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Glasses className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold">No sales recorded for this date range.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Delivery Fulfilment Rate Donut */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="card-premium p-5 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-[#EEF2F8]">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0D9488]">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172554] tracking-tight">Delivery Fulfilment Rate</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    (Delivered / Total Eligible) × 100
                  </p>
                </div>
              </div>

              <div className="h-64 w-full relative flex items-center justify-center my-2">
                {stats?.deliveryStatusData && stats.deliveryStatusData.some((d) => d.count > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.deliveryStatusData}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={98}
                          paddingAngle={8}
                          strokeWidth={2}
                          stroke="#ffffff"
                        >
                          {stats.deliveryStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1.5px solid #D5DFED', fontSize: '12px', fontWeight: 700 }} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-[#172554] tracking-tight tabular-nums">
                        {fulfillmentRate}%
                      </span>
                      <span className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                        Fulfilment Rate
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 text-center font-semibold">No delivery logs recorded</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#EEF2F8] text-xs">
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-emerald-50/75 border border-emerald-200">
                  <span className="w-3 h-3 rounded-full bg-[#0D9488] shrink-0" />
                  <div>
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">Delivered</p>
                    <p className="font-black text-[#172554] tabular-nums">{delivered} Orders</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-amber-50/75 border border-amber-200">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-amber-700 font-bold uppercase">Lab Pending</p>
                    <p className="font-black text-[#172554] tabular-nums">{pending} Orders</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* PAYMENT METHOD DISTRIBUTION CHART */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="card-premium p-5"
          >
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#EEF2F8]">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488]">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#172554] tracking-tight">Payment Method Distribution</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Actual money received per transaction method (Cash, UPI, Debit Card, Credit Card)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 h-72 w-full">
                {stats?.paymentMethodDistribution && stats.paymentMethodDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.paymentMethodDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E9F3" vertical={false} />
                      <XAxis dataKey="method" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          name === 'total' ? formatINR(Number(val)) : `${val} transactions`,
                          name === 'total' ? 'Amount Collected' : 'Transactions',
                        ]}
                        contentStyle={{ borderRadius: '12px', border: '1.5px solid #D5DFED', fontSize: '12px', fontWeight: 700 }}
                      />
                      <Bar dataKey="total" name="Collected Value" fill="#0D9488" radius={[8, 8, 0, 0]}>
                        {stats.paymentMethodDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    No payment transaction records found
                  </div>
                )}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {stats?.paymentMethodDistribution && stats.paymentMethodDistribution.length > 0 ? (
                  stats.paymentMethodDistribution.map((item, idx) => (
                    <motion.div
                      key={item.method}
                      whileHover={{ x: 3, scale: 1.01 }}
                      className="p-3.5 rounded-xl bg-[#EEF2F8]/70 hover:bg-white border-[1.5px] border-[#D5DFED] hover:border-[#2563EB]/50 flex items-center justify-between transition-all shadow-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-md shadow-xs"
                          style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                        />
                        <span className="text-xs font-extrabold text-[#172554]">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-black text-[#0D9488] tabular-nums">{formatINR(item.total)}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{item.count} transactions</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-6">No payment methods logged</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* TOP EYEWEAR BRANDS SHOWCASE & SALES SPECIALIST LEADERBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Eyewear Brands Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.24 }}
              className="card-premium p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF2F8]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Glasses className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172554] tracking-tight">Top Eyewear Brands Showcase</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Actual brand sales: total orders, revenue, and gross profit
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {stats?.companySales?.length || 0} Brands
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                {stats?.companySales && stats.companySales.length > 0 ? (
                  stats.companySales.map((item, idx) => {
                    const share = totalRev > 0 ? Math.round((item.revenue / totalRev) * 100) : 0;
                    const grad = BRAND_GRADIENTS[idx % BRAND_GRADIENTS.length];
                    return (
                      <motion.div
                        key={item.company}
                        whileHover={{ scale: 1.01, x: 2 }}
                        className="p-3.5 rounded-xl bg-[#EEF2F8]/60 hover:bg-white transition-all border-[1.5px] border-[#D5DFED] hover:border-[#2563EB]/50 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs mb-2 gap-2 flex-wrap">
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-6 h-6 rounded-lg bg-gradient-to-r ${grad} text-white font-black text-[10px] flex items-center justify-center shadow-sm`}>
                              {idx + 1}
                            </span>
                            <span className="font-black text-[#172554]">{item.company}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-slate-500 font-bold">{item.orders} orders</span>
                            <span className="font-mono font-black text-[#172554]">{formatINR(item.revenue)}</span>
                            {item.profit !== undefined && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                +{formatINR(item.profit)}
                              </span>
                            )}
                            <span className="text-[10px] font-extrabold text-[#2563EB] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                              {share}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-[#D5DFED]/70 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(4, share)}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 text-center py-10 font-semibold">No brand data recorded</div>
                )}
              </div>
            </motion.div>

            {/* Sales Specialist Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.28 }}
              className="card-premium p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF2F8]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172554] tracking-tight">Sales Specialist Leaderboard</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Ranked live performance: revenue, actual collections, profit & pending balance
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {stats?.salespersonPerformance?.length || 0} Specialists
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                {stats?.salespersonPerformance && stats.salespersonPerformance.length > 0 ? (
                  stats.salespersonPerformance.map((sp, idx) => (
                    <motion.div
                      key={sp.id}
                      whileHover={{ scale: 1.01, y: -1 }}
                      className="p-3.5 rounded-xl bg-[#EEF2F8]/60 hover:bg-white transition-all border-[1.5px] border-[#D5DFED] hover:border-[#2563EB]/50 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-sm ${
                              idx === 0
                                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400'
                                : idx === 1
                                ? 'bg-gradient-to-tr from-slate-500 to-slate-400'
                                : idx === 2
                                ? 'bg-gradient-to-tr from-amber-800 to-orange-600'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-black text-[#172554] text-xs">{sp.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono font-semibold">@{sp.username}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-[#2563EB] font-mono tabular-nums">{formatINR(sp.sales)}</span>
                          <span className="text-[10px] text-slate-500 block font-bold">{sp.orders} orders</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#D5DFED]/70 text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-[#D5DFED]">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Collection</span>
                          <span className="font-black text-[#0D9488] font-mono tabular-nums">{formatINR(sp.collection)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-[#D5DFED]">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Profit</span>
                          <span className="font-black text-[#2563EB] font-mono tabular-nums">{formatINR(sp.profit)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-[#D5DFED]">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Pending Bal</span>
                          <span className={`font-black font-mono tabular-nums ${sp.pendingBalance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {formatINR(sp.pendingBalance)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10 font-semibold">
                    No active sales specialist data found
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
