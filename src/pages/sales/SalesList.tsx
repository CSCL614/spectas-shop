import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesApi, adminApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { SaleResponse, UserResponse, ProductType, PaymentMethod, CustomerProfileResponse } from '../../types';
import { PAYMENT_METHODS } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, formatDate, getDateRange } from '../../utils/helpers';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Glasses,
  Calendar,
  X,
  CreditCard,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  User,
  Phone,
  Receipt,
  Truck,
  History,
  ExternalLink,
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
    } catch (err) {
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
    } catch (err: any) {
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
    setTimeout(() => setCopiedSticker(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#172554] tracking-tight">
            {isAdmin ? 'All Optical Orders & Master Ledger' : 'My Orders & Personal Ledger'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Complete overview of all customer orders, frame vs lens classification, and outstanding balances'
              : 'View and track all orders registered under your sales account'}
          </p>
        </div>

        <Link to="/sales/new" className="btn-primary inline-flex items-center space-x-2 px-5 py-2.5 text-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Order Entry</span>
        </Link>
      </div>

      {/* KPI Summary Bar (Live filtered aggregates) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-stat">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
          <p className="text-lg font-black text-[#172554] mt-0.5">{summary.totalCount}</p>
        </div>
        <div className="card-stat">
          <p className="text-[10px] font-bold text-blue-600 uppercase">Selling Amount</p>
          <p className="text-lg font-black text-[#2563EB] mt-0.5">{formatINR(summary.totalSellingAmount)}</p>
        </div>
        <div className="card-stat">
          <p className="text-[10px] font-bold text-amber-600 uppercase">Discounts Given</p>
          <p className="text-lg font-black text-amber-600 mt-0.5">{formatINR(summary.totalDiscounts)}</p>
        </div>
        <div className="card-stat">
          <p className="text-[10px] font-bold text-emerald-700 uppercase">Gross Profit</p>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{formatINR(summary.totalProfit)}</p>
        </div>
        <div className="card-stat">
          <p className="text-[10px] font-bold text-teal-700 uppercase">Advance Collected</p>
          <p className="text-lg font-black text-teal-700 mt-0.5">{formatINR(summary.totalAdvanceCollected)}</p>
        </div>
        <div className="card-stat">
          <p className="text-[10px] font-bold text-rose-600 uppercase">Outstanding Balance</p>
          <p className="text-lg font-black text-rose-600 mt-0.5">{formatINR(summary.outstandingBalance)}</p>
        </div>
      </div>

      {/* Custom Date Range & Search Filters */}
      <div className="card-premium p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Row 1: Search & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sticker, customer, phone, brand..."
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
                  className="input-modern cursor-pointer font-bold text-slate-800"
                >
                  <option value="">All Sales Executives</option>
                  {salespersons.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 2: Date Filter Presets + Custom Inputs */}
          <div className="pt-3 border-t border-[#D5DFED] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
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
                onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); setPage(0); }}
                className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); setPage(0); }}
                className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
              />
              <button type="submit" className="btn-primary px-3 py-1 text-xs">Apply</button>
              <button type="button" onClick={handleResetFilters} className="btn-ghost px-3 py-1 text-xs">Reset</button>
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
            <p className="text-sm font-bold text-slate-600">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Sticker / Product</th>
                  <th>Customer Info (Click to View)</th>
                  <th>Selling Price</th>
                  <th>Advance</th>
                  <th>Balance Status</th>
                  <th>Delivery Status</th>
                  {isAdmin && <th>Sales Executive</th>}
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
                      <td>
                        <div className="flex items-center space-x-2">
                          <span
                            onClick={() => handleCopy(sale.stickerNumber)}
                            className="font-mono font-black text-[#2563EB] cursor-pointer hover:underline text-xs flex items-center gap-1"
                            title="Click to copy sticker"
                          >
                            {sale.stickerNumber}
                            {copiedSticker === sale.stickerNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isFrame ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {isFrame ? 'Frame' : 'Lens'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">{sale.companyName}</p>
                      </td>

                      {/* Clickable Customer Section & Name */}
                      <td
                        onClick={() => handleOpenCustomerProfile(sale.customerMobile || sale.customerName)}
                        className="cursor-pointer group select-none hover:bg-blue-50/50 transition-colors rounded-lg p-2"
                        title="Click customer to open comprehensive profile & order history"
                      >
                        <p className="font-black text-[#172554] text-xs group-hover:text-[#2563EB] group-hover:underline transition-colors flex items-center gap-1.5">
                          <User className="w-3 h-3 text-blue-500 opacity-70 group-hover:opacity-100" />
                          <span>{sale.customerName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 group-hover:text-blue-600">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>{sale.customerMobile}</span>
                        </p>
                      </td>

                      <td>
                        <p className="font-black text-slate-900 text-xs">{formatINR(sale.sellingPrice)}</p>
                        {sale.discountAmount > 0 && (
                          <span className="text-[10px] text-amber-600 font-semibold">(-{formatINR(sale.discountAmount)})</span>
                        )}
                      </td>

                      <td>
                        <p className="font-bold text-emerald-600 text-xs">{formatINR(sale.advanceAmount)}</p>
                        <span className="text-[10px] text-slate-400">{sale.paymentMethod}</span>
                      </td>

                      <td>
                        {isCleared ? (
                          <span className="badge-delivered inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Cleared</span>
                          </span>
                        ) : isPartial ? (
                          <div>
                            <span className="badge-pending">Partial</span>
                            <p className="text-[10px] font-bold text-rose-600 mt-0.5">Bal: {formatINR(sale.remainingBalance)}</p>
                          </div>
                        ) : (
                          <div>
                            <span className="badge-overdue">Pending</span>
                            <p className="text-[10px] font-bold text-rose-600 mt-0.5">Bal: {formatINR(sale.remainingBalance)}</p>
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isDelivered ? 'Delivered' : 'Not Delivered'}
                          </span>
                          <p className="text-[10px] text-slate-500 font-semibold">Exp: {sale.expectedDeliveryDate}</p>
                        </div>
                      </td>

                      {isAdmin && (
                        <td>
                          <span className="text-xs font-bold text-slate-800">{sale.salespersonName}</span>
                        </td>
                      )}

                      <td className="text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isCleared && (
                            <button
                              onClick={() => setClearModalSale(sale)}
                              title="Mark Balance Cleared"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-colors"
                            >
                              Clear Bal
                            </button>
                          )}
                          <Link
                            to={`/sales/${sale.id}`}
                            title="View Full Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/sales/${sale.id}/edit`}
                            title="Edit Order"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(sale.id, sale.stickerNumber)}
                              title="Delete Order"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="p-4 bg-slate-50 border-t border-[#D5DFED] flex items-center justify-between text-xs text-slate-500">
            <span>Page <strong className="text-slate-800">{page + 1}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalElements} entries)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition flex items-center space-x-1"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => { setCustomerModalOpen(false); setCustomerProfile(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {customerModalLoading || !customerProfile ? (
                <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
              ) : (
                <div className="space-y-5">
                  {/* Customer Banner */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#172554] to-[#2563EB] text-white flex items-center justify-center font-black text-lg shadow-md">
                      {customerProfile.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#172554] tracking-tight">{customerProfile.customerName}</h2>
                      <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span>{customerProfile.customerMobile}</span>
                      </p>
                    </div>
                  </div>

                  {/* Customer KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Total Orders</span>
                      <p className="text-lg font-black text-[#172554] mt-0.5">{customerProfile.totalOrders}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Billed</span>
                      <p className="text-lg font-black text-[#2563EB] mt-0.5">{formatINR(customerProfile.totalPurchaseAmount)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Total Received</span>
                      <p className="text-lg font-black text-emerald-700 mt-0.5">{formatINR(customerProfile.totalPaymentsReceived)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Balance Due</span>
                      <p className="text-lg font-black text-rose-600 mt-0.5">{formatINR(customerProfile.outstandingBalance)}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Order History ({customerProfile.orders.length} Records)</span>
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
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
                              <td className="font-mono font-bold text-[#2563EB]">{ord.stickerNumber}</td>
                              <td>
                                <span className="font-bold text-slate-800">{ord.companyName}</span>
                                <span className="text-[10px] text-slate-400 block font-semibold">{ord.productType || 'FRAME'}</span>
                              </td>
                              <td className="font-semibold text-slate-600">{ord.saleDate}</td>
                              <td>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  ord.deliveryStatus === 'DELIVERED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {ord.deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                                </span>
                              </td>
                              <td className="font-black text-slate-900">{formatINR(ord.sellingPrice)}</td>
                              <td>
                                {ord.remainingBalance === 0 ? (
                                  <span className="badge-delivered text-[10px]">Cleared</span>
                                ) : (
                                  <span className="font-bold text-rose-600 text-xs">{formatINR(ord.remainingBalance)}</span>
                                )}
                              </td>
                              <td className="text-right">
                                <Link
                                  to={`/sales/${ord.id}`}
                                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment History */}
                  {customerProfile.allPayments && customerProfile.allPayments.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Payment History & Receipts</span>
                      </h3>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {customerProfile.allPayments.map((pt, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <div>
                                <span className="font-bold text-slate-800">{pt.paymentMethod}</span>
                                <span className="text-[11px] text-slate-400 block">{pt.date} {pt.time || ''} • {pt.notes || 'Payment received'}</span>
                              </div>
                            </div>
                            <span className="font-mono font-black text-emerald-700">{formatINR(pt.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Balance Confirmation Modal */}
      <AnimatePresence>
        {clearModalSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setClearModalSale(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-base">Clear Customer Balance</h3>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Record the full receipt of the remaining balance for order{' '}
                <strong className="text-[#172554]">{clearModalSale.stickerNumber}</strong> ({clearModalSale.customerName}).
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Selling Price:</span>
                  <span className="font-bold text-slate-800">{formatINR(clearModalSale.sellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Collected:</span>
                  <span className="font-bold text-emerald-600">{formatINR(clearModalSale.advanceAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-700">Amount to Clear:</span>
                  <span className="font-black text-rose-600">{formatINR(clearModalSale.remainingBalance)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Payment Method Received
                </label>
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

              <div className="flex items-center space-x-2 pt-2">
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
                  className="btn-primary flex-1 py-2.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {clearing ? 'Clearing...' : 'Confirm Full Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
