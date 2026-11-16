import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  CheckCircle2,
  Calendar,
  Filter,
  Sparkles,
  RotateCw,
  Glasses,
  Activity,
  Award,
  Zap,
  PackageCheck,
  FileText,
  Star,
  Wallet,
  Percent,
  MessageSquareQuote,
  Users
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

const DONUT_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#6366f1', '#f43f5e'];
const BRAND_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-violet-600 to-purple-600',
  'from-emerald-600 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-600 to-blue-500',
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
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
    } catch (err) {
      toast.error('Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminApi.getSalespersons()
      .then(res => setSalespersons(res.data.data))
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
    } catch (err) {
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
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 flex items-center justify-between">
            <span>📅 {label}</span>
          </p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
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
      <div className="card-premium p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Optical Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 tracking-wide uppercase border border-blue-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time spectacle sales, gross revenue, inventory costs & delivery distribution
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
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
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 transition-colors">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Sales Specialists</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.fullName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchStats()}
            title="Refresh Metrics"
            disabled={refreshing}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleSeed}
            title="Populate 15 spectacles demo sales into MongoDB"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Load Demo Data</span>
          </button>
        </div>
      </div>

      {datePreset === 'custom' && (
        <div className="card-premium p-4 flex items-center gap-3 bg-blue-50/50 border-blue-200">
          <span className="text-xs font-bold text-blue-900">Custom Date Span:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-modern py-1 px-3 text-xs w-auto bg-white"
          />
          <span className="text-xs text-slate-400 font-semibold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-modern py-1 px-3 text-xs w-auto bg-white"
          />
        </div>
      )}

      {loading && !stats ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* TODAY'S BUSINESS PULSE CARDS */}
          {/* ============================================================ */}
          <div className="card-premium p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Today's Live Financial Reconciliation (IST)
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">Today's Operating Pulse</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/daily-statement"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/15 transition backdrop-blur-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span>Daily Statement PDF</span>
                </Link>
                <Link
                  to="/feedback"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-xl border border-amber-400/30 transition backdrop-blur-sm"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customer Reviews</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Today's Collection */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                  <span>Today's Collection</span>
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-white mt-1.5">{formatINR(stats?.todayCollection || 0)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Actual cash + digital received today</p>
              </div>

              {/* Today's Discount */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
                  <span>Today's Discount</span>
                  <Percent className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-rose-300 mt-1.5">{formatINR(stats?.todayDiscount || 0)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Concessions given today</p>
              </div>

              {/* Today's Profit */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-blue-400 text-xs font-bold">
                  <span>Today's Profit</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-blue-200 mt-1.5">{formatINR(stats?.todayProfit || 0)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Selling price minus wholesale cost</p>
              </div>

              {/* Today's Orders */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-indigo-400 text-xs font-bold">
                  <span>Today's Orders</span>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-white mt-1.5">{stats?.todayOrders || 0}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Booked in shop today</p>
              </div>

              {/* Customer Feedback */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
                  <span>Patient Rating</span>
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div className="flex items-baseline space-x-1.5 mt-1.5">
                  <span className="text-xl font-black text-amber-300">{stats?.averageCustomerRating || 0}</span>
                  <span className="text-xs text-slate-400">/ 5 ★</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {stats?.totalCustomerFeedback || 0} Total Reviews
                </p>
              </div>
            </div>
          </div>

          {/* Primary KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gross Revenue"
              value={formatINR(stats?.totalRevenue)}
              subtitle={`${stats?.totalOrders || 0} Total Orders (Net Sales: ${formatINR(stats?.totalRevenue)})`}
              icon={IndianRupee}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
              accentBorderColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Gross Profit"
              value={formatINR(stats?.grossProfit)}
              subtitle={`${profitMargin}% Gross Margin (Selling - Cost)`}
              icon={TrendingUp}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
              accentBorderColor="from-emerald-400 to-teal-600"
            />
            <StatCard
              title="Total Advance Collected"
              value={formatINR(stats?.advanceCollected)}
              subtitle={`${collectionRate}% of Total Billed Collected`}
              icon={CreditCard}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-600"
              accentBorderColor="from-violet-500 to-purple-600"
            />
            <StatCard
              title="Outstanding Balance"
              value={formatINR(stats?.remainingBalance)}
              subtitle="Pending Customer Dues"
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              accentBorderColor="from-amber-400 to-orange-500"
            />
          </div>

          {/* Interactive Visual Analytics Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interactive Chart with Daily/Weekly/Monthly/Yearly Switcher */}
            <div className="lg:col-span-2 card-premium p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Interactive Sales Trajectory</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Analyze revenue, order volume and profit margins across custom time scales
                  </p>
                </div>

                {/* View Switchers: Time Scale + Chart Type */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Time Grouping Pills */}
                  <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTimeGrouping(mode)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                          timeGrouping === mode
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* Chart Style Pills */}
                  <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setChartMode('area')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        chartMode === 'area'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Area
                    </button>
                    <button
                      onClick={() => setChartMode('composed')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        chartMode === 'composed'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Volume
                    </button>
                    <button
                      onClick={() => setChartMode('brand')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        chartMode === 'brand'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Brands
                    </button>
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
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="areaProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Gross Revenue"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#areaRev)"
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          name="Gross Profit"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#areaProfit)"
                        />
                      </AreaChart>
                    ) : chartMode === 'composed' ? (
                      <ComposedChart data={trajectoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar yAxisId="right" dataKey="orders" name="Order Units" fill="#c7d2fe" radius={[6, 6, 0, 0]} barSize={24} />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                        <Line yAxisId="left" type="monotone" dataKey="profit" name="Gross Margin" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" />
                      </ComposedChart>
                    ) : (
                      <BarChart data={stats?.companySales || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="company" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomGlassTooltip />} />
                        <Bar dataKey="revenue" name="Brand Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="orders" name="Units Sold" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Glasses className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-medium">No sales recorded for this date range.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Fulfilment Rate Donut */}
            <div className="card-premium p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Delivery Fulfilment Rate</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Delivered orders vs lab pending orders: (Delivered / Total) × 100
                </p>
              </div>

              {/* Center Stat Donut Chart */}
              <div className="h-64 w-full relative flex items-center justify-center my-2">
                {stats?.deliveryStatusData && stats.deliveryStatusData.some(d => d.count > 0) ? (
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
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Fulfillment Score Badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">{fulfillmentRate}%</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                        Fulfilment Rate
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 text-center">No delivery logs recorded</div>
                )}
              </div>

              {/* Donut Legend Footer */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Delivered</p>
                    <p className="font-bold text-slate-800">{delivered} Orders</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Lab Pending</p>
                    <p className="font-bold text-slate-800">{pending} Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PAYMENT METHOD DISTRIBUTION CHART */}
          {/* ============================================================ */}
          <div className="card-premium p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Payment Method Distribution</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Actual money received per transaction method (Cash, UPI, Debit Card, Credit Card)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Payment Method Bar Chart */}
              <div className="lg:col-span-2 h-72 w-full">
                {stats?.paymentMethodDistribution && stats.paymentMethodDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.paymentMethodDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="method" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          name === 'total' ? formatINR(Number(val)) : `${val} transactions`,
                          name === 'total' ? 'Amount Collected' : 'Transactions'
                        ]}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                      <Bar dataKey="total" name="Collected Value" fill="#10b981" radius={[8, 8, 0, 0]}>
                        {stats.paymentMethodDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No payment transaction records found
                  </div>
                )}
              </div>

              {/* Payment Method Metric Cards List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {stats?.paymentMethodDistribution && stats.paymentMethodDistribution.length > 0 ? (
                  stats.paymentMethodDistribution.map((item, idx) => (
                    <div key={item.method} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-slate-800">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-emerald-700">{formatINR(item.total)}</p>
                        <p className="text-[10px] text-slate-400">{item.count} transactions</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-6">No payment methods logged</div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TOP EYEWEAR BRANDS SHOWCASE & SALES SPECIALIST LEADERBOARD */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Eyewear Brands Showcase */}
            <div className="card-premium p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Glasses className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Top Eyewear Brands Showcase</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Actual brand sales: total orders, revenue, and gross profit
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  {stats?.companySales?.length || 0} Brands
                </span>
              </div>

              {/* Progress bars list for each brand */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                {stats?.companySales && stats.companySales.length > 0 ? (
                  stats.companySales.map((item, idx) => {
                    const share = totalRev > 0 ? Math.round((item.revenue / totalRev) * 100) : 0;
                    const grad = BRAND_GRADIENTS[idx % BRAND_GRADIENTS.length];
                    return (
                      <div key={item.company} className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-5 h-5 rounded-lg bg-gradient-to-r ${grad} text-white font-bold text-[10px] flex items-center justify-center shadow-xs`}>
                              {idx + 1}
                            </span>
                            <span className="font-black text-slate-800">{item.company}</span>
                          </div>
                          <div className="flex items-center space-x-2.5">
                            <span className="text-[11px] text-slate-500 font-semibold">{item.orders} orders</span>
                            <span className="font-mono font-black text-slate-900">{formatINR(item.revenue)}</span>
                            {item.profit !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                +{formatINR(item.profit)}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {share}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500`}
                            style={{ width: `${Math.max(4, share)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 text-center py-10">No brand data recorded</div>
                )}
              </div>
            </div>

            {/* Sales Specialist Leaderboard */}
            <div className="card-premium p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Sales Specialist Leaderboard</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Ranked live performance: revenue, actual collections, profit & pending balance
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  {stats?.salespersonPerformance?.length || 0} Specialists
                </span>
              </div>

              {/* Leaderboard Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                {stats?.salespersonPerformance && stats.salespersonPerformance.length > 0 ? (
                  stats.salespersonPerformance.map((sp, idx) => (
                    <div
                      key={sp.id}
                      className="p-3.5 rounded-xl bg-slate-50/90 hover:bg-white transition-all border border-slate-200/80 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center ${
                              idx === 0
                                ? 'bg-amber-500 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-400'
                                : idx === 2
                                ? 'bg-amber-700'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-black text-slate-900 text-xs">{sp.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">@{sp.username}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-blue-700 font-mono">{formatINR(sp.sales)}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{sp.orders} orders</span>
                        </div>
                      </div>

                      {/* Stat Breakdown Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Collection</span>
                          <span className="font-bold text-emerald-600 font-mono">{formatINR(sp.collection)}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Profit</span>
                          <span className="font-bold text-blue-600 font-mono">{formatINR(sp.profit)}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Bal</span>
                          <span className={`font-bold font-mono ${sp.pendingBalance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {formatINR(sp.pendingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10">
                    No active sales specialist data found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
