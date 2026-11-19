import React, { useState, useEffect } from 'react';
import { excelApi, adminApi, salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { UserResponse, DashboardStatsResponse } from '../../types';
import { PAYMENT_METHODS } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
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
  IndianRupee,
  Clock,
  Layers,
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

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons()
        .then((res) => setSalespersons(res.data.data))
        .catch(() => {});
    }

    salesApi.getDashboardStats()
      .then((res) => setStats(res.data.data))
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
      link.setAttribute('download', `sri_sai_smart_opticals_sales_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Spreadsheet compiled and downloaded successfully!');
    } catch {
      toast.error('Failed to export sales records');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="page-banner p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10 flex items-start sm:items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-teal-200 shadow-inner">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-100 border border-teal-300/35">
                Financial Operations
              </span>
              <span className="text-blue-200 text-xs font-mono font-bold">• STK- Ready Exports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              Export Optical Sales Reports
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed font-medium">
              Export comprehensive financial datasets, STK- sticker numbers, margin calculations, advance payments, and customer delivery orders formatted for Microsoft Excel.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Live Overview Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="Total optical database"
            icon={FileSpreadsheet}
            iconBgColor="bg-blue-50"
            iconColor="text-[#2563EB]"
            accentBorderColor="from-[#172554] to-[#2563EB]"
            delay={0.04}
          />
          <StatCard
            title="Total Revenue"
            value={formatINR(stats.totalRevenue)}
            subtitle="Billed retail volume"
            icon={IndianRupee}
            iconBgColor="bg-emerald-50"
            iconColor="text-[#0D9488]"
            accentBorderColor="from-emerald-500 to-[#0D9488]"
            delay={0.08}
          />
          <StatCard
            title="Gross Profit"
            value={formatINR(stats.grossProfit)}
            subtitle="Selling minus wholesale"
            icon={Sparkles}
            iconBgColor="bg-teal-50"
            iconColor="text-[#0D9488]"
            accentBorderColor="from-teal-500 to-cyan-500"
            delay={0.12}
          />
          <StatCard
            title="Pending Balance"
            value={formatINR(stats.remainingBalance)}
            subtitle="Due upon frame delivery"
            icon={Clock}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
            accentBorderColor="from-amber-400 to-orange-500"
            delay={0.16}
          />
        </div>
      )}

      {/* 3. Export Filter Form Card */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center space-x-2.5 text-sm font-black text-[#172554] pb-4 mb-6 border-b border-[#D5DFED]">
          <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <Layers className="w-4 h-4" />
          </span>
          <span>Spreadsheet Parameters & Report Filters</span>
        </div>

        <form onSubmit={handleExport} className="space-y-5">
          {/* Row 1: Date Filter Period */}
          <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
            <label className="label-modern flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Report Date Period</span>
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="input-modern bg-white font-bold cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#D5DFED]">
                <div>
                  <label className="label-modern">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-modern bg-white"
                  />
                </div>
                <div>
                  <label className="label-modern">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-modern bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Payment Method & Discount Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
              <label className="label-modern flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Payment Method Filter</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-modern bg-white font-bold cursor-pointer"
              >
                <option value="">All Payment Methods (Cash, UPI, Cards)</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
              <label className="label-modern flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Discount Status Filter</span>
              </label>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="input-modern bg-white font-bold cursor-pointer"
              >
                <option value="">All Orders (Discounted & Regular)</option>
                <option value="yes">Discounted Orders Only</option>
                <option value="no">Non-Discounted (Full MRP) Only</option>
              </select>
            </div>
          </div>

          {/* Row 3: Delivery Status & Salesperson Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
              <label className="label-modern flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Delivery Fulfillment Filter</span>
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="input-modern bg-white font-bold cursor-pointer"
              >
                <option value="">All Fulfillment Statuses</option>
                <option value="PENDING">Pending Delivery (In Lab / Fitting)</option>
                <option value="DELIVERED">Delivered to Customer</option>
              </select>
            </div>

            {isAdmin && (
              <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
                <label className="label-modern flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sales Executive Filter</span>
                </label>
                <select
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="input-modern bg-white font-bold cursor-pointer"
                >
                  <option value="">All Sales Executives (Entire Shop)</option>
                  {salespersons.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.fullName} (@{sp.username})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 4: Custom Columns Input */}
          {isAdmin && (
            <div className="bg-[#EEF2F8]/65 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
              <label className="label-modern flex items-center justify-between">
                <span>Custom Excel Columns (Comma Separated)</span>
                <span className="text-[10px] text-slate-400 font-semibold normal-case">Optional Audit Headers</span>
              </label>
              <input
                type="text"
                value={customColumns}
                onChange={(e) => setCustomColumns(e.target.value)}
                placeholder="e.g. Lens Prescription, Frame Color, Lab Technician, Warranty Code"
                className="input-modern bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Appends blank custom headers to each row in the generated spreadsheet for internal audits.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={downloading}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm space-x-2.5"
            >
              <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Compiling Formatted Excel File...' : 'Download Formatted Excel (.xlsx)'}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};
