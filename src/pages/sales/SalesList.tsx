import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesApi, adminApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { SaleResponse, UserResponse, PaymentMethod, CustomerProfileResponse } from '../../types';
import { PAYMENT_METHODS } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, getDateRange } from '../../utils/helpers';
import { downloadOrderReceiptPdf } from '../../utils/receiptGenerator';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  X,
  ShoppingBag,
  User,
  Phone,
  Receipt,
  ExternalLink,
  IndianRupee,
  Percent,
  TrendingUp,
  CreditCard,
  Clock,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const SalesList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [copiedSticker, setCopiedSticker] = useState<string | null>(null);

  // Summary Metrics
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalSellingAmount: 0,
    totalDiscounts: 0,
    totalProfit: 0,
    totalAdvanceCollected: 0,
    outstandingBalance: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productType, setProductType] = useState<'' | 'FRAME' | 'LENS'>('');
  const [balanceStatus, setBalanceStatus] = useState<'' | 'CLEARED' | 'PARTIAL' | 'PENDING'>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);

  // Balance Clear Modal
  const [clearModalSale, setClearModalSale] = useState<SaleResponse | null>(null);
  const [clearPaymentMethod, setClearPaymentMethod] = useState<PaymentMethod>('Cash');
  const [clearing, setClearing] = useState(false);

  // Customer Profile Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerModalLoading, setCustomerModalLoading] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileResponse | null>(null);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons().then((res) => setSalespersons(res.data.data)).catch(() => {});
    }
  }, [isAdmin]);

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
    setPage(0);
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await salesApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        productType: productType || undefined,
        balanceStatus: balanceStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        salespersonId: (isAdmin && salespersonId) ? salespersonId : undefined,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      const data = res.data.data;
      setSales(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, productType, balanceStatus, paymentMethod, salespersonId, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchSales();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
    setProductType('');
    setBalanceStatus('');
    setPaymentMethod('');
    setSalespersonId('');
    setPage(0);
  };

  const handleOpenCustomerProfile = async (identifier: string) => {
    if (!identifier) return;
    try {
      setCustomerModalLoading(true);
      setCustomerModalOpen(true);
      const res = await salesApi.getCustomerProfile(identifier);
      setCustomerProfile(res.data.data);
    } catch {
      toast.error('Failed to load customer profile');
      setCustomerModalOpen(false);
    } finally {
      setCustomerModalLoading(false);
    }
  };

  const handleConfirmClearBalance = async () => {
    if (!clearModalSale) return;
    try {
      setClearing(true);
      await salesApi.clearBalance(clearModalSale.id, clearPaymentMethod, 'Cleared via All Orders quick action');
      toast.success(`Remaining balance for ${clearModalSale.stickerNumber} marked as fully cleared!`);
      setClearModalSale(null);
      fetchSales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clear balance');
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id: string, sticker: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${sticker}?`)) return;
    try {
      await salesApi.delete(id);
      toast.success(`Order ${sticker} deleted`);
      fetchSales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSticker(text);
    toast.success(`Copied ${text}`);
    setTimeout(() => setCopiedSticker(null), 1500);
  };

  const handleDownloadReceipt = (sale: SaleResponse) => {
    try {
      downloadOrderReceiptPdf(sale);
      toast.success(`Receipt downloaded for ${sale.stickerNumber}`);
    } catch {
      toast.error('Failed to generate PDF receipt');
    }
  };

  const summaryItems = [
    { label: 'Total Orders', value: summary.totalCount, color: 'text-[#172554]', accent: 'from-[#172554] to-[#2563EB]', icon: ShoppingBag, iconBg: 'bg-blue-50 text-[#2563EB]' },
    { label: 'Selling Amount', value: formatINR(summary.totalSellingAmount), color: 'text-[#2563EB]', accent: 'from-[#2563EB] to-indigo-600', icon: IndianRupee, iconBg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Discounts Given', value: formatINR(summary.totalDiscounts), color: 'text-amber-600', accent: 'from-amber-400 to-orange-500', icon: Percent, iconBg: 'bg-amber-50 text-amber-600' },
    { label: 'Gross Profit', value: formatINR(summary.totalProfit), color: 'text-emerald-700', accent: 'from-emerald-500 to-[#0D9488]', icon: TrendingUp, iconBg: 'bg-emerald-50 text-emerald-700' },
    { label: 'Advance Collected', value: formatINR(summary.totalAdvanceCollected), color: 'text-[#0D9488]', accent: 'from-teal-500 to-cyan-600', icon: CreditCard, iconBg: 'bg-teal-50 text-[#0D9488]' },
    { label: 'Outstanding Bal', value: formatINR(summary.outstandingBalance), color: 'text-rose-600', accent: 'from-rose-500 to-pink-600', icon: Clock, iconBg: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-[#2563EB]">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#172554] tracking-tight">
              {isAdmin ? 'All Optical Orders & Master Ledger' : 'My Orders & Personal Ledger'}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {isAdmin
                ? 'Complete overview of all customer orders, frame vs lens classification, and outstanding balances'
                : 'View and track all orders registered under your sales account'}
            </p>
          </div>
        </div>

        <Link to="/sales/new" className="btn-primary inline-flex items-center space-x-2 px-5 py-2.5 text-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Order Entry</span>
        </Link>
      </div>

      {/* KPI Summary Bar (Live filtered aggregates) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.04 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="card-stat p-3.5 h-full flex flex-col justify-between"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent}`} />
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
                  {item.label}
                </p>
                <span className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className={`text-lg font-black ${item.color} mt-2 tabular-nums truncate`}>{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Date Range & Search Filters */}
      <div className="card-premium p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-3.5">
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search STK-1016, 1016, customer, phone, brand..."
                className="input-modern pr-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <select
                value={productType}
                onChange={(e) => { setProductType(e.target.value as any); setPage(0); }}
                className="input-modern cursor-pointer font-bold text-[#172554]"
              >
                <option value="">All Product Types</option>
                <option value="FRAME">Frames Only</option>
                <option value="LENS">Lenses Only</option>
              </select>
            </div>

            <div>
              <select
                value={balanceStatus}
                onChange={(e) => { setBalanceStatus(e.target.value as any); setPage(0); }}
                className="input-modern cursor-pointer font-bold text-[#172554]"
              >
                <option value="">All Balance Statuses</option>
                <option value="CLEARED">Balance Cleared (Fully Paid)</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PENDING">Balance Pending</option>
              </select>
            </div>

            {isAdmin && (
              <div>
                <select
                  value={salespersonId}
                  onChange={(e) => { setSalespersonId(e.target.value); setPage(0); }}
                  className="input-modern cursor-pointer font-bold text-[#172554]"
                >
                  <option value="">All Sales Executives</option>
                  {salespersons.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#D5DFED] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-extrabold text-[#172554] mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Date Range:</span>
              </span>
              {[
                { id: 'all', label: 'All Time' },
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
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                    datePreset === p.id
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
                onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); setPage(0); }}
                className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); setPage(0); }}
                className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
              />
              <button type="submit" className="btn-primary px-3.5 py-1.5 text-xs">Apply</button>
              <button type="button" onClick={handleResetFilters} className="btn-ghost px-3.5 py-1.5 text-xs">Reset</button>
            </div>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-black text-[#172554]">No orders found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Sticker / Brand</th>
                  <th>Customer</th>
                  <th>Price / Paid</th>
                  <th className="text-center">Balance</th>
                  <th className="text-center">Delivery</th>
                  {isAdmin && <th>Executive</th>}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const isCleared = sale.remainingBalance === 0;
                  const isPartial = !isCleared && sale.advanceAmount > 0;
                  const isFrame = (sale.productType || 'FRAME') === 'FRAME';
                  const isDelivered = sale.deliveryStatus === 'DELIVERED';

                  return (
                    <tr key={sale.id}>
                      <td className="max-w-[155px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => handleCopy(sale.stickerNumber)}
                            className="sticker-badge cursor-pointer gap-1"
                            title="Click to copy sticker"
                          >
                            {sale.stickerNumber}
                            {copiedSticker === sale.stickerNumber ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-400" />
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 min-w-0">
                          <span
                            className="text-[11px] font-extrabold text-[#172554] truncate"
                            title={sale.companyName}
                          >
                            {sale.companyName}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border shrink-0 leading-none ${
                              isFrame
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {isFrame ? 'Frame' : 'Lens'}
                          </span>
                        </div>
                      </td>

                      {/* Clickable Customer Section & Name */}
                      <td
                        onClick={() => handleOpenCustomerProfile(sale.customerMobile || sale.customerName)}
                        className="cursor-pointer group select-none max-w-[165px]"
                        title="Click customer to view profile & order history"
                      >
                        <div className="p-1 -m-1 rounded-lg group-hover:bg-blue-50/90 border border-transparent group-hover:border-blue-200 transition-all">
                          <p className="font-black text-[#172554] text-xs group-hover:text-[#2563EB] group-hover:underline transition-colors flex items-center gap-1 min-w-0">
                            <User className="w-3 h-3 text-[#2563EB] shrink-0" />
                            <span className="truncate" title={sale.customerName}>{sale.customerName}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono font-semibold flex items-center gap-1 mt-0.5 whitespace-nowrap group-hover:text-[#2563EB]">
                            <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{sale.customerMobile}</span>
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-[#172554] text-xs tabular-nums">
                            {formatINR(sale.sellingPrice)}
                          </span>
                          {sale.discountAmount > 0 && (
                            <span className="text-[10px] text-amber-600 font-bold tabular-nums">
                              (-{formatINR(sale.discountAmount)})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                          <span className="font-extrabold text-[#0D9488] tabular-nums">
                            Paid {formatINR(sale.advanceAmount)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-semibold">{sale.paymentMethod}</span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap text-center">
                        {isCleared ? (
                          <span className="badge-delivered">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Cleared</span>
                          </span>
                        ) : isPartial ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="badge-partial">Partial</span>
                            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5 tabular-nums">
                              Bal: {formatINR(sale.remainingBalance)}
                            </p>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="badge-overdue">Pending</span>
                            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5 tabular-nums">
                              Bal: {formatINR(sale.remainingBalance)}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center space-y-0.5">
                          <span className={isDelivered ? 'badge-delivered' : 'badge-pending'}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            {isDelivered ? 'Delivered' : 'Pending'}
                          </span>
                          <p className="text-[10px] text-slate-500 font-bold">Exp: {sale.expectedDeliveryDate}</p>
                        </div>
                      </td>

                      {isAdmin && (
                        <td className="whitespace-nowrap">
                          <span
                            className="text-xs font-extrabold text-[#172554] block max-w-[165px] truncate"
                            title={sale.salespersonName}
                          >
                            {sale.salespersonName}
                          </span>
                        </td>
                      )}

                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {!isCleared && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setClearModalSale(sale)}
                              title="Mark Balance Cleared"
                              className="h-7 px-2 inline-flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-[10px] font-extrabold transition-all shadow-xs"
                            >
                              Clear
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleDownloadReceipt(sale)}
                            title="Download Receipt (PDF)"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white border border-blue-200 transition-all shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </motion.button>
                          <Link
                            to={`/sales/${sale.id}`}
                            title="View Full Details"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-[#2563EB] bg-white hover:bg-blue-50 border border-[#D5DFED] hover:border-blue-300 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/sales/${sale.id}/edit`}
                            title="Edit Order"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-600 bg-white hover:bg-amber-50 border border-[#D5DFED] hover:border-amber-300 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          {isAdmin && (
                            <motion.button
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handleDelete(sale.id, sale.stickerNumber)}
                              title="Delete Order"
                              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#D5DFED] hover:border-rose-300 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#EEF2F8]/60 border-t border-[#D5DFED] flex items-center justify-between text-xs text-slate-600">
            <span>Page <strong className="text-[#172554]">{page + 1}</strong> of <strong className="text-[#172554]">{totalPages}</strong> ({totalElements} entries)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Modal */}
      <AnimatePresence>
        {customerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border-2 border-[#D5DFED] max-h-[90vh] overflow-hidden relative flex flex-col"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] shrink-0" />
              <div className="p-6 overflow-y-auto relative">
                <button
                  onClick={() => { setCustomerModalOpen(false); setCustomerProfile(null); }}
                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-600 p-1.5 rounded-xl bg-[#EEF2F8] hover:bg-rose-50 border border-[#D5DFED] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {customerModalLoading || !customerProfile ? (
                  <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3.5 pb-4 border-b border-[#D5DFED]">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex items-center justify-center font-black text-lg shadow-md">
                        {customerProfile.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#172554] tracking-tight">{customerProfile.customerName}</h2>
                        <p className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-[#2563EB]" />
                          <span>{customerProfile.customerMobile}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border-[1.5px] border-blue-200">
                        <span className="text-[10px] font-extrabold text-blue-700 uppercase">Total Orders</span>
                        <p className="text-lg font-black text-[#172554] mt-0.5 tabular-nums">{customerProfile.totalOrders}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#EEF2F8] border-[1.5px] border-[#D5DFED]">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase">Total Billed</span>
                        <p className="text-lg font-black text-[#2563EB] mt-0.5 tabular-nums">{formatINR(customerProfile.totalPurchaseAmount)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border-[1.5px] border-emerald-200">
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Total Received</span>
                        <p className="text-lg font-black text-[#0D9488] mt-0.5 tabular-nums">{formatINR(customerProfile.totalPaymentsReceived)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50/80 border-[1.5px] border-rose-200">
                        <span className="text-[10px] font-extrabold text-rose-600 uppercase">Balance Due</span>
                        <p className="text-lg font-black text-rose-600 mt-0.5 tabular-nums">{formatINR(customerProfile.outstandingBalance)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Order History ({customerProfile.orders.length} Records)</span>
                      </h3>
                      <div className="overflow-x-auto border-[1.5px] border-[#D5DFED] rounded-xl">
                        <table className="table-modern text-xs">
                          <thead>
                            <tr>
                              <th>Sticker</th>
                              <th>Brand / Type</th>
                              <th>Order Date</th>
                              <th>Delivery</th>
                              <th>Amount</th>
                              <th>Balance</th>
                              <th className="text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerProfile.orders.map((ord) => (
                              <tr key={ord.id}>
                                <td><span className="sticker-badge">{ord.stickerNumber}</span></td>
                                <td>
                                  <span className="font-extrabold text-[#172554]">{ord.companyName}</span>
                                  <span className="text-[10px] text-slate-400 block font-bold">{ord.productType || 'FRAME'}</span>
                                </td>
                                <td className="font-semibold text-slate-600">{ord.saleDate}</td>
                                <td>
                                  <span className={ord.deliveryStatus === 'DELIVERED' ? 'badge-delivered' : 'badge-pending'}>
                                    {ord.deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                                  </span>
                                </td>
                                <td className="font-black text-[#172554] tabular-nums">{formatINR(ord.sellingPrice)}</td>
                                <td>
                                  {ord.remainingBalance === 0 ? (
                                    <span className="badge-delivered">Cleared</span>
                                  ) : (
                                    <span className="font-black text-rose-600 text-xs tabular-nums">{formatINR(ord.remainingBalance)}</span>
                                  )}
                                </td>
                                <td className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadReceipt(ord)}
                                      title="Download Receipt PDF"
                                      className="text-[11px] font-extrabold text-[#0D9488] hover:underline inline-flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Receipt</span>
                                    </button>
                                    <Link
                                      to={`/sales/${ord.id}`}
                                      className="text-[11px] font-extrabold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                                    >
                                      <span>View</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {customerProfile.allPayments && customerProfile.allPayments.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>Payment History & Receipts</span>
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {customerProfile.allPayments.map((pt, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-[#EEF2F8]/70 border border-[#D5DFED] flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                                <div>
                                  <span className="font-extrabold text-[#172554]">{pt.paymentMethod}</span>
                                  <span className="text-[11px] text-slate-500 block font-medium">{pt.date} {pt.time || ''} • {pt.notes || 'Payment received'}</span>
                                </div>
                              </div>
                              <span className="font-mono font-black text-[#0D9488] tabular-nums">{formatINR(pt.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Balance Confirmation Modal */}
      <AnimatePresence>
        {clearModalSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#D5DFED] relative"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-[#0D9488]" />
              <div className="p-6">
                <button
                  onClick={() => setClearModalSale(null)}
                  className="absolute top-5 right-4 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2.5 text-[#0D9488] mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-[#172554]">Clear Customer Balance</h3>
                </div>

                <p className="text-xs text-slate-600 mb-4 font-medium">
                  Record the full receipt of the remaining balance for order{' '}
                  <span className="sticker-badge mx-1">{clearModalSale.stickerNumber}</span> ({clearModalSale.customerName}).
                </p>

                <div className="p-4 rounded-xl bg-[#EEF2F8]/80 border border-[#D5DFED] mb-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Order Selling Price:</span>
                    <span className="font-extrabold text-[#172554] tabular-nums">{formatINR(clearModalSale.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Already Collected:</span>
                    <span className="font-extrabold text-[#0D9488] tabular-nums">{formatINR(clearModalSale.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#D5DFED] text-sm">
                    <span className="font-black text-[#172554]">Amount to Clear:</span>
                    <span className="font-black text-rose-600 tabular-nums">{formatINR(clearModalSale.remainingBalance)}</span>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="label-modern">Payment Method Received</label>
                  <select
                    value={clearPaymentMethod}
                    onChange={(e) => setClearPaymentMethod(e.target.value as PaymentMethod)}
                    className="input-modern cursor-pointer font-bold text-[#172554]"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setClearModalSale(null)}
                    className="btn-ghost flex-1 py-2.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClearBalance}
                    disabled={clearing}
                    className="btn-primary flex-1 py-2.5 text-xs bg-gradient-to-r from-emerald-600 to-[#0D9488]"
                  >
                    {clearing ? 'Clearing...' : 'Confirm Full Payment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
