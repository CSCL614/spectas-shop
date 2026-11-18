import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { SaleResponse, PaymentMethod } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, formatDate, formatDateTime } from '../../utils/helpers';
import { downloadOrderReceiptPdf } from '../../utils/receiptGenerator';
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
  History,
  X,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
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
        .then((res) => {
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
      setSale((prev) => (prev ? { ...prev, deliveryStatus: nextStatus } : null));
    } catch {
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
        notes: payNotes || 'Balance collection',
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary py-2 px-3.5 text-xs flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              downloadOrderReceiptPdf(sale);
              toast.success(`Receipt downloaded for ${sale.stickerNumber}`);
            }}
            className="btn-secondary py-2 px-4 text-xs flex items-center space-x-1.5 text-[#0D9488] border-teal-200 hover:border-[#0D9488] font-extrabold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt</span>
          </motion.button>

          {sale.remainingBalance > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setPayAmount(sale.remainingBalance);
                setIsPaymentModalOpen(true);
              }}
              className="btn-primary py-2 px-4 text-xs flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </motion.button>
          )}

          <Link
            to={`/sales/${sale.id}/edit`}
            className="btn-secondary py-2 px-4 text-xs flex items-center space-x-1.5 text-[#2563EB] font-extrabold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Order</span>
          </Link>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="btn-danger py-2 px-3.5 text-xs flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Order Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium overflow-hidden"
      >
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0D9488] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 border border-white/25 px-3 py-1 rounded-full text-blue-100">
                Optical Receipt & Job Card
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 border border-emerald-300/35 px-3 py-1 rounded-full text-emerald-100 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {sale.paymentMethod || 'Cash'}
              </span>
            </div>
            <h2 className="text-3xl font-mono font-black mt-2.5 tracking-tight">{sale.stickerNumber}</h2>
            <p className="text-xs text-blue-100 mt-1 font-semibold">
              {sale.companyName} • {sale.productType || 'FRAME'}
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-2.5 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
            <span className="text-xs text-blue-100 font-bold">Delivery:</span>
            <select
              value={sale.deliveryStatus}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="bg-white text-[#172554] text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer outline-none border border-[#D5DFED]"
            >
              <option value="PENDING">PENDING (Not Delivered)</option>
              <option value="DELIVERED">DELIVERED (Handed Over)</option>
            </select>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Customer & Delivery Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-[#EEF2F8]/65 border-[1.5px] border-[#D5DFED] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span>Customer Information</span>
                </div>
                <a
                  href={`https://wa.me/91${sale.customerMobile}?text=Hello%20${encodeURIComponent(sale.customerName)},%20your%20spectacles%20order%20(${sale.stickerNumber})%20is%20ready!`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-emerald-700 hover:bg-emerald-600 hover:text-white bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="text-base font-black text-[#172554]">{sale.customerName}</p>
              <p className="text-xs text-slate-600 font-mono font-bold flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>+91 {sale.customerMobile}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF2F8]/65 border-[1.5px] border-[#D5DFED] space-y-2">
              <div className="flex items-center space-x-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488]">
                  <Truck className="w-3.5 h-3.5" />
                </span>
                <span>Delivery Logistics</span>
              </div>
              <p className="text-base font-black text-[#172554]">{formatDate(sale.expectedDeliveryDate)}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Booked: {formatDate(sale.saleDate)}</span>
                <span className={sale.deliveryStatus === 'DELIVERED' ? 'badge-delivered' : 'badge-pending'}>
                  {sale.deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Not Delivered'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-black text-[#172554] uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2563EB]" />
                Payment & Accounting Breakdown
              </h3>
              <span className="badge-partial">
                Method: {sale.paymentMethod || 'Cash'}
              </span>
            </div>

            <div className="border-[1.5px] border-[#D5DFED] rounded-2xl overflow-hidden divide-y divide-[#D5DFED]/70 text-sm">
              <div className="flex justify-between p-3.5 bg-[#EEF2F8]/45">
                <span className="text-slate-600 font-semibold">Original Selling Price (MRP):</span>
                <span className="font-extrabold text-[#172554] tabular-nums">{formatINR(originalPrice)}</span>
              </div>

              {hasDiscount && (
                <div className="flex justify-between p-3.5 bg-rose-50/50 text-rose-700">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    Discount Applied ({sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}%` : 'Flat ₹'}):
                  </span>
                  <span className="font-black tabular-nums">- {formatINR(sale.discountAmount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between p-3.5 font-black text-[#172554] bg-white">
                <span>Final Selling Price:</span>
                <span className="text-base text-[#2563EB] tabular-nums">{formatINR(sale.sellingPrice)}</span>
              </div>

              <div className="flex justify-between p-3.5 bg-white">
                <span className="text-slate-600 font-semibold">Total Advance / Paid Amount:</span>
                <span className="font-black text-[#0D9488] tabular-nums">- {formatINR(sale.advanceAmount)}</span>
              </div>

              <div className={`flex justify-between p-4 ${sale.remainingBalance > 0 ? 'bg-amber-50/70' : 'bg-emerald-50/60'}`}>
                <span className="font-black text-[#172554] flex items-center gap-1.5">
                  {sale.remainingBalance === 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#0D9488]" />
                      <span>Payment Status:</span>
                    </>
                  ) : (
                    <span>Remaining Balance to Collect:</span>
                  )}
                </span>
                {sale.remainingBalance === 0 ? (
                  <span className="badge-delivered">Fully Paid</span>
                ) : (
                  <span className="font-black text-rose-600 text-base tabular-nums">{formatINR(sale.remainingBalance)}</span>
                )}
              </div>

              {isAdmin && (
                <>
                  <div className="flex justify-between p-3.5 text-xs text-slate-500 font-semibold bg-white">
                    <span>Wholesale Cost Price:</span>
                    <span className="tabular-nums font-bold">{formatINR(sale.costPrice)}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-blue-50/60 text-xs font-black text-[#172554]">
                    <span>Gross Commercial Profit:</span>
                    <span className="text-[#0D9488] tabular-nums">{formatINR(sale.grossProfit)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Transactions Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-black text-[#172554] uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-[#0D9488]" />
                Payment Transaction Records
              </h3>
              {sale.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-xs font-extrabold text-[#2563EB] hover:text-[#0D9488] flex items-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Transaction</span>
                </button>
              )}
            </div>

            {sale.paymentTransactions && sale.paymentTransactions.length > 0 ? (
              <div className="border-[1.5px] border-[#D5DFED] rounded-2xl overflow-hidden divide-y divide-[#D5DFED]/60">
                {sale.paymentTransactions.map((tx, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#EEF2F8]/50 transition">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#172554] tabular-nums">{formatINR(tx.amount)}</span>
                        <span className="badge-partial">{tx.paymentMethod || 'Cash'}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{tx.notes || 'Payment recorded'}</p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono font-bold">
                      <Clock className="w-3 h-3 text-[#2563EB]" />
                      <span>{formatDate(tx.date)} {tx.time ? `• ${tx.time}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border-[1.5px] border-dashed border-[#D5DFED] bg-[#EEF2F8]/40 text-center text-xs text-slate-500 font-semibold">
                Initial advance payment of {formatINR(sale.advanceAmount)} recorded on booking ({formatDate(sale.saleDate)} via {sale.paymentMethod || 'Cash'}).
              </div>
            )}
          </div>

          {/* Audit Info */}
          <div className="pt-4 border-t border-[#D5DFED] text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1 font-semibold">
            <span>Servicing Salesperson: <strong className="text-[#172554]">{sale.salespersonName}</strong></span>
            <span>Recorded At: {formatDateTime(sale.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#D5DFED] overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base">Record Payment Collection</h3>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono font-bold">
                    Order {sale.stickerNumber} • {sale.customerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="p-5 space-y-4">
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-800">Current Outstanding Balance:</span>
                  <span className="font-black text-amber-900 text-sm tabular-nums">{formatINR(sale.remainingBalance)}</span>
                </div>

                <div>
                  <label className="label-modern">
                    Amount Received (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      max={sale.remainingBalance}
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="input-modern pl-8 font-mono text-sm font-black text-[#172554]"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-modern">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="input-modern cursor-pointer font-bold text-[#172554]"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-modern">Notes / Payment Remarks</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Balance paid upon frame delivery"
                    className="input-modern"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#D5DFED]">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
