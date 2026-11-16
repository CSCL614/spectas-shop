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
  Phone,
  MessageCircle,
  Glasses,
  Check,
  RotateCw
} from 'lucide-react';
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
    } catch (err) {
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
    } catch (err) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Delivery Fulfillment & Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Optical Lab Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track lab fitting progress, customer handover and resolve overdue delivery schedules
          </p>
        </div>

        <button
          onClick={fetchData}
          className="btn-secondary text-xs space-x-1.5 py-2 px-3"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Segmented Tabs Bar */}
      <div className="card-premium p-1.5 flex flex-wrap gap-1 bg-slate-100/70 border-slate-200/80">
        <button
          onClick={() => setTab('pending')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            tab === 'pending'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Lab Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
            {pendingSales.length}
          </span>
        </button>

        <button
          onClick={() => setTab('overdue')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            tab === 'overdue'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-rose-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Overdue Alerts</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            overdueSales.length > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-200 text-slate-700'
          }`}>
            {overdueSales.length}
          </span>
        </button>

        <button
          onClick={() => setTab('delivered')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            tab === 'delivered'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Completed Handover</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
            {deliveredSales.length}
          </span>
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
                        <p className="text-sm font-semibold text-slate-700">No orders in this delivery category</p>
                        <p className="text-xs text-slate-400">All customer deliveries are running on schedule!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentList.map((sale) => {
                    const daysLate = getDaysDiff(sale.expectedDeliveryDate);
                    return (
                      <tr key={sale.id} className="group">
                        {/* Sticker */}
                        <td>
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                            {sale.stickerNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{sale.customerName}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[11px] text-slate-400 font-mono">{sale.customerMobile}</span>
                              <a
                                href={`https://wa.me/91${sale.customerMobile}?text=Hello%20${encodeURIComponent(sale.customerName)},%20your%20spectacles%20order%20(${sale.stickerNumber})%20is%20ready%20at%20our%20shop!`}
                                target="_blank"
                                rel="noreferrer"
                                title="Send WhatsApp Delivery Update"
                                className="text-emerald-500 hover:text-emerald-600 p-0.5 rounded transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td>
                          <span className="badge-brand font-medium">
                            {sale.companyName}
                          </span>
                        </td>

                        {/* Expected Date */}
                        <td>
                          <div>
                            <p className="text-xs font-medium text-slate-800">
                              {formatDate(sale.expectedDeliveryDate)}
                            </p>
                            {tab === 'overdue' && daysLate > 0 && (
                              <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                                ⚠️ {daysLate} {daysLate === 1 ? 'day' : 'days'} overdue
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Balance & Payment Method */}
                        <td>
                          <div>
                            {sale.remainingBalance > 0 ? (
                              <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Collect {formatINR(sale.remainingBalance)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Fully Settled
                              </span>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Mode: {sale.paymentMethod || 'Cash'}</p>
                          </div>
                        </td>

                        {/* Salesperson */}
                        <td className="text-xs font-medium text-slate-500">
                          {sale.salespersonName}
                        </td>

                        {/* Handover Action Button */}
                        <td className="text-right">
                          {sale.deliveryStatus === 'PENDING' ? (
                            <button
                              disabled={updatingId === sale.id}
                              onClick={() => handleStatusUpdate(sale.id, 'DELIVERED')}
                              className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow transition active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Hand Over Glasses</span>
                            </button>
                          ) : (
                            <button
                              disabled={updatingId === sale.id}
                              onClick={() => handleStatusUpdate(sale.id, 'PENDING')}
                              className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition active:scale-95 disabled:opacity-50"
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
