import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { SaleResponse, PaymentMethod } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, formatDate, formatDateTime } from '../../utils/helpers';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  User,
  Phone,
  Truck,
  MessageCircle,
  CreditCard,
  PlusCircle,
  Tag,
  Receipt,
  CheckCircle,
  Clock,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card'
];

export const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      salesApi.getById(id)
        .then(res => {
          setSale(res.data.data);
          if (res.data.data.remainingBalance > 0) {
            setPayAmount(res.data.data.remainingBalance);
          }
        })
        .catch(() => {
          toast.error('Order not found or permission denied');
          navigate('/sales');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleStatusChange = async (nextStatus: 'PENDING' | 'DELIVERED') => {
    if (!id) return;
    try {
      await salesApi.updateDeliveryStatus(id, nextStatus);
      toast.success(`Delivery status updated to ${nextStatus}`);
      setSale(prev => prev ? { ...prev, deliveryStatus: nextStatus } : null);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!id || !sale) return;
    if (!window.confirm(`Are you sure you want to delete order ${sale.stickerNumber}?`)) return;

    try {
      await salesApi.delete(id);
      toast.success('Sale deleted successfully');
      navigate('/sales');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !sale) return;
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid payment amount greater than ₹0');
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await salesApi.addPayment(id, {
        amount: amountNum,
        paymentMethod: payMethod,
        notes: payNotes || 'Balance collection'
      });
      toast.success(`Payment of ${formatINR(amountNum)} recorded via ${payMethod}!`);
      setSale(res.data.data);
      setIsPaymentModalOpen(false);
      setPayNotes('');
      if (res.data.data.remainingBalance > 0) {
        setPayAmount(res.data.data.remainingBalance);
      } else {
        setPayAmount('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!sale) return null;

  const originalPrice = sale.originalSellingPrice || sale.sellingPrice;
  const hasDiscount = (sale.discountAmount || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <div className="flex items-center space-x-2">
          {sale.remainingBalance > 0 && (
            <button
              onClick={() => {
                setPayAmount(sale.remainingBalance);
                setIsPaymentModalOpen(true);
              }}
              className="btn-primary py-1.5 px-3.5 text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          <Link
            to={`/sales/${sale.id}/edit`}
            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center space-x-1.5 text-blue-600 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Order</span>
          </Link>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="btn-danger py-1.5 px-3 text-xs flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Order Card */}
      <div className="card-premium overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 px-2.5 py-1 rounded-full text-blue-200">
                Optical Receipt & Job Card
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full text-emerald-200 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {sale.paymentMethod || 'Cash'}
              </span>
            </div>
            <h2 className="text-2xl font-mono font-black mt-2 tracking-tight">{sale.stickerNumber}</h2>
            <p className="text-xs text-blue-200 mt-1 font-medium">{sale.companyName} Spectacles Frame</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-blue-200 font-medium">Delivery:</span>
            <select
              value={sale.deliveryStatus}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer outline-none border border-slate-200"
            >
              <option value="PENDING">PENDING (In Lab)</option>
              <option value="DELIVERED">DELIVERED (Handed Over)</option>
            </select>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Customer & Delivery Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Information</span>
                </div>
                <a
                  href={`https://wa.me/91${sale.customerMobile}?text=Hello%20${encodeURIComponent(sale.customerName)},%20your%20spectacles%20order%20(${sale.stickerNumber})%20is%20ready!`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md transition"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="text-base font-bold text-slate-900">{sale.customerName}</p>
              <p className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91 {sale.customerMobile}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Logistics</span>
              </div>
              <p className="text-base font-bold text-slate-900">{formatDate(sale.expectedDeliveryDate)}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Booked: {formatDate(sale.saleDate)}</span>
                <span className={`px-2 py-0.5 rounded font-semibold ${sale.deliveryStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {sale.deliveryStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                Payment & Accounting Breakdown
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Method: {sale.paymentMethod || 'Cash'}
              </span>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-sm">
              <div className="flex justify-between p-3.5 bg-slate-50/60">
                <span className="text-slate-600">Original Selling Price (MRP):</span>
                <span className="font-semibold text-slate-800">{formatINR(originalPrice)}</span>
              </div>

              {hasDiscount && (
                <div className="flex justify-between p-3.5 bg-rose-50/40 text-rose-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    Discount Applied ({sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}%` : 'Flat ₹'}):
                  </span>
                  <span className="font-bold">- {formatINR(sale.discountAmount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between p-3.5 font-bold text-slate-900 bg-slate-50/30">
                <span>Final Selling Price:</span>
                <span className="text-base text-blue-900">{formatINR(sale.sellingPrice)}</span>
              </div>

              <div className="flex justify-between p-3.5">
                <span className="text-slate-600">Total Advance / Paid Amount:</span>
                <span className="font-bold text-emerald-600">- {formatINR(sale.advanceAmount)}</span>
              </div>

              <div className={`flex justify-between p-3.5 ${sale.remainingBalance > 0 ? 'bg-amber-50/50' : 'bg-emerald-50/40'}`}>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {sale.remainingBalance === 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Payment Status:</span>
                    </>
                  ) : (
                    <span>Remaining Balance to Collect:</span>
                  )}
                </span>
                {sale.remainingBalance === 0 ? (
                  <span className="font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-md text-xs uppercase tracking-wider">
                    Fully Paid
                  </span>
                ) : (
                  <span className="font-black text-amber-700 text-base">{formatINR(sale.remainingBalance)}</span>
                )}
              </div>

              {isAdmin && (
                <>
                  <div className="flex justify-between p-3.5 text-xs text-slate-500">
                    <span>Wholesale Cost Price:</span>
                    <span>{formatINR(sale.costPrice)}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-blue-50/50 text-xs font-bold text-blue-900">
                    <span>Gross Commercial Profit:</span>
                    <span className="text-emerald-700">{formatINR(sale.grossProfit)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Transactions Timeline / History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-600" />
                Payment Transaction Records
              </h3>
              {sale.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Add Transaction</span>
                </button>
              )}
            </div>

            {sale.paymentTransactions && sale.paymentTransactions.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {sale.paymentTransactions.map((tx, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{formatINR(tx.amount)}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {tx.paymentMethod || 'Cash'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{tx.notes || 'Payment recorded'}</p>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(tx.date)} {tx.time ? `• ${tx.time}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Initial advance payment of {formatINR(sale.advanceAmount)} recorded on booking ({formatDate(sale.saleDate)} via {sale.paymentMethod || 'Cash'}).
              </div>
            )}
          </div>

          {/* Audit Info */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-1">
            <span>Servicing Salesperson: <strong className="text-slate-600">{sale.salespersonName}</strong></span>
            <span>Recorded At: {formatDateTime(sale.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Record Payment Collection</h3>
                <p className="text-xs text-blue-200 mt-0.5 font-mono">Order {sale.stickerNumber} • {sale.customerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center text-xs">
                <span className="font-medium text-amber-800">Current Outstanding Balance:</span>
                <span className="font-bold text-amber-900 text-sm">{formatINR(sale.remainingBalance)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={sale.remainingBalance}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="input-field pl-8 font-mono text-sm font-bold text-slate-900"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="input-field text-xs font-semibold text-slate-800"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Payment Remarks
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Balance paid upon frame delivery"
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                  disabled={submittingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="btn-primary py-2 px-5 text-xs flex items-center space-x-1.5"
                >
                  {submittingPayment ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
