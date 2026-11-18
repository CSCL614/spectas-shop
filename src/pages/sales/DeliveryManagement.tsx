import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import type { SaleResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, formatINR } from '../../utils/helpers';
import {
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircle,
  Check,
  RotateCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const DeliveryManagement: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'overdue' | 'delivered'>('pending');
  const [pendingSales, setPendingSales] = useState<SaleResponse[]>([]);
  const [deliveredSales, setDeliveredSales] = useState<SaleResponse[]>([]);
  const [overdueSales, setOverdueSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, deliveredRes, overdueRes] = await Promise.all([
        salesApi.getAll({ deliveryStatus: 'PENDING', size: 100 }),
        salesApi.getAll({ deliveryStatus: 'DELIVERED', size: 100 }),
        salesApi.getOverdue(),
      ]);

      setPendingSales(pendingRes.data.data.content);
      setDeliveredSales(deliveredRes.data.data.content);
      setOverdueSales(overdueRes.data.data);
    } catch {
      toast.error('Failed to load delivery records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'DELIVERED') => {
    try {
      setUpdatingId(id);
      await salesApi.updateDeliveryStatus(id, status);
      toast.success(
        status === 'DELIVERED'
          ? '🎉 Glasses marked as Delivered & Handed Over!'
          : 'Order reverted to Pending status'
      );
      await fetchData();
    } catch {
      toast.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentList = tab === 'pending' ? pendingSales : tab === 'delivered' ? deliveredSales : overdueSales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-[#0D9488]">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-[#172554] tracking-tight">Delivery Fulfillment & Tracking</h1>
              <span className="badge-partial">Optical Lab Pipeline</span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Track lab fitting progress, customer handover and resolve overdue delivery schedules
            </p>
          </div>
        </div>

        <button onClick={fetchData} className="btn-secondary text-xs space-x-1.5 py-2 px-3.5">
          <RotateCw className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Segmented Tabs Bar */}
      <div className="card-premium p-2 flex flex-wrap gap-2 bg-[#EEF2F8]/90">
        <button
          onClick={() => setTab('pending')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 border ${tab === 'pending'
              ? 'bg-white text-[#172554] border-[#D5DFED] shadow-md'
              : 'text-slate-600 border-transparent hover:text-[#172554]'
            }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Lab Orders</span>
          <span className="badge-pending">{pendingSales.length}</span>
        </button>

        <button
          onClick={() => setTab('overdue')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 border ${tab === 'overdue'
              ? 'bg-white text-rose-600 border-rose-200 shadow-md'
              : 'text-slate-600 border-transparent hover:text-rose-600'
            }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Overdue Alerts</span>
          <span className={overdueSales.length > 0 ? 'badge-overdue animate-pulse' : 'badge-partial'}>
            {overdueSales.length}
          </span>
        </button>

        <button
          onClick={() => setTab('delivered')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 border ${tab === 'delivered'
              ? 'bg-white text-[#0D9488] border-emerald-200 shadow-md'
              : 'text-slate-600 border-transparent hover:text-[#0D9488]'
            }`}
        >
          <CheckCircle className="w-4 h-4 text-[#0D9488]" />
          <span>Completed Handover</span>
          <span className="badge-delivered">{deliveredSales.length}</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="py-16"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Sticker Tag</th>
                  <th>Customer Information</th>
                  <th>Frame Brand</th>
                  <th>Expected Date</th>
                  <th>Customer Dues</th>
                  <th>Assigned Salesperson</th>
                  <th className="text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-10 h-10 text-slate-300" />
                        <p className="text-sm font-black text-[#172554]">No orders in this delivery category</p>
                        <p className="text-xs text-slate-500">All customer deliveries are running on schedule!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentList.map((sale) => {
                    const daysLate = getDaysDiff(sale.expectedDeliveryDate);
                    return (
                      <tr key={sale.id}>
                        <td>
                          <span className="sticker-badge">{sale.stickerNumber}</span>
                        </td>
                        <td>
                          <div>
                            <p className="font-extrabold text-xs text-[#172554]">{sale.customerName}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 font-mono font-semibold">{sale.customerMobile}</span>
                              <a
                                href={`https://wa.me/91${sale.customerMobile}?text=Hello%20${encodeURIComponent(sale.customerName)},%20your%20spectacles%20order%20(${sale.stickerNumber})%20is%20ready%20at%20our%20shop!`}
                                target="_blank"
                                rel="noreferrer"
                                title="Send WhatsApp Delivery Update"
                                className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-partial">{sale.companyName}</span>
                        </td>
                        <td>
                          <div>
                            <p className="text-xs font-bold text-[#172554]">{formatDate(sale.expectedDeliveryDate)}</p>
                            {tab === 'overdue' && daysLate > 0 && (
                              <span className="badge-overdue mt-1">
                                ⚠️ {daysLate} {daysLate === 1 ? 'day' : 'days'} overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {sale.remainingBalance > 0 ? (
                              <span className="badge-pending">Collect {formatINR(sale.remainingBalance)}</span>
                            ) : (
                              <span className="badge-delivered">Fully Settled</span>
                            )}
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Mode: {sale.paymentMethod || 'Cash'}</p>
                          </div>
                        </td>
                        <td className="text-xs font-bold text-[#172554]">{sale.salespersonName}</td>
                        <td className="text-right">
                          {sale.deliveryStatus === 'PENDING' ? (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              disabled={updatingId === sale.id}
                              onClick={() => handleStatusUpdate(sale.id, 'DELIVERED')}
                              className="inline-flex items-center space-x-1.5 text-xs font-extrabold px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-[#0D9488] text-white rounded-xl shadow-sm hover:shadow-md transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Hand Over Glasses</span>
                            </motion.button>
                          ) : (
                            <button
                              disabled={updatingId === sale.id}
                              onClick={() => handleStatusUpdate(sale.id, 'PENDING')}
                              className="btn-secondary text-xs py-1.5 px-3 space-x-1.5 disabled:opacity-50"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Revert to Pending</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
