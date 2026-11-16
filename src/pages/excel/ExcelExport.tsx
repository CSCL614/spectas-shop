import React, { useState, useEffect } from 'react';
import { excelApi, adminApi, salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { UserResponse, PaymentMethod, DashboardStatsResponse } from '../../types';
import { PAYMENT_METHODS } from '../../types';
import { getDateRange, formatINR } from '../../utils/helpers';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  CreditCard, 
  Tag, 
  Truck, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  IndianRupee, 
  Clock, 
  Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ExcelExport: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  const [customColumns, setCustomColumns] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [downloading, setDownloading] = useState(false);

  // Live dashboard summary stats
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons()
        .then(res => setSalespersons(res.data.data))
        .catch(() => {});
    }

    salesApi.getDashboardStats()
      .then(res => setStats(res.data.data))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (datePreset !== 'custom' && datePreset !== 'all') {
      const { from, to } = getDateRange(datePreset);
      setDateFrom(from);
      setDateTo(to);
    } else if (datePreset === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  }, [datePreset]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDownloading(true);
      const res = await excelApi.exportExcel({
        salespersonId: (isAdmin && salespersonId) ? salespersonId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: deliveryStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        hasDiscount: discountFilter ? (discountFilter === 'yes' ? 'true' : 'false') : undefined,
        customColumns: customColumns.trim() || undefined,
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `spectas_optical_sales_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Spreadsheet compiled and downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export sales records');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 border border-blue-800/40">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 shadow-inner">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                Financial Operations
              </span>
              <span className="text-blue-200 text-xs font-mono">• Automated Reconciliation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Export Optical Sales Reports
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              Export comprehensive financial datasets, margin calculations, advance payments, and customer delivery orders formatted for Microsoft Excel.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Live Overview Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.06)]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Total Orders</span>
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#172554] mt-1.5">{stats.totalOrders}</p>
            <p className="text-[10px] text-slate-400">Total optical database</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.06)]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Total Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700 mt-1.5">{formatINR(stats.totalRevenue)}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Billed retail volume</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.06)]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Gross Profit</span>
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl font-black text-teal-700 mt-1.5">{formatINR(stats.grossProfit)}</p>
            <p className="text-[10px] text-teal-600 font-medium">Selling minus wholesale</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.06)]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Pending Balance</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1.5">{formatINR(stats.remainingBalance)}</p>
            <p className="text-[10px] text-amber-600 font-medium">Due upon frame delivery</p>
          </motion.div>
        </div>
      )}

      {/* 3. Export Filter Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)]">
        <div className="flex items-center space-x-2 text-sm font-bold text-[#172554] pb-4 mb-6 border-b border-slate-100">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Spreadsheet Parameters & Report Filters</span>
        </div>

        <form onSubmit={handleExport} className="space-y-6">
          {/* Row 1: Date Filter Period */}
          <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
            <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <span>Report Date Period</span>
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
            >
              <option value="all">All Time / Complete Order History</option>
              <option value="today">Today's Transactions</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thisMonth">This Current Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">Current Financial Year</option>
              <option value="custom">Custom Date Range (Specify Below)</option>
            </select>

            {datePreset === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Payment Method & Discount Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                <span>Payment Method Filter</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              >
                <option value="">All Payment Methods (Cash, UPI, Cards)</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-600" />
                <span>Discount Status Filter</span>
              </label>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              >
                <option value="">All Orders (Discounted & Regular)</option>
                <option value="yes">Discounted Orders Only</option>
                <option value="no">Non-Discounted (Full MRP) Only</option>
              </select>
            </div>
          </div>

          {/* Row 3: Delivery Status & Salesperson Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Fulfillment Filter</span>
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="">All Fulfillment Statuses</option>
                <option value="PENDING">Pending Delivery (In Lab / Fitting)</option>
                <option value="DELIVERED">Delivered to Customer</option>
              </select>
            </div>

            {isAdmin && (
              <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
                <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Sales Executive Filter</span>
                </label>
                <select
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="">All Sales Executives (Entire Shop)</option>
                  {salespersons.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.fullName} (@{sp.username})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 4: Custom Columns Input */}
          {isAdmin && (
            <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Custom Excel Columns (Comma Separated)</span>
                <span className="text-[10px] text-slate-400 font-semibold normal-case">Optional Audit Headers</span>
              </label>
              <input
                type="text"
                value={customColumns}
                onChange={(e) => setCustomColumns(e.target.value)}
                placeholder="e.g. Lens Prescription, Frame Color, Lab Technician, Warranty Code"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Appends blank custom headers to each row in the generated spreadsheet for internal audits.
              </p>
            </div>
          )}

          {/* Download Action Button */}
          <div className="pt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={downloading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] via-indigo-600 to-[#0d9488] hover:from-[#1d4ed8] hover:to-[#0f766e] text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Compiling Formatted Excel File...' : 'Download Formatted Excel (.xlsx)'}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
