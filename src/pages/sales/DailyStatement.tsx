import React, { useState, useEffect } from 'react';
import { salesApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { DailyStatementResponse, SaleResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  IndianRupee,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Wallet,
  ShoppingBag,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const DailyStatement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statement, setStatement] = useState<DailyStatementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  const fetchStatement = async (date: string) => {
    try {
      setLoading(true);
      const res = await salesApi.getDailyStatement(date);
      setStatement(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load daily statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement(selectedDate);
  }, [selectedDate]);

  // Generate Professional A4 PDF
  const handleDownloadPdf = () => {
    if (!statement) return;

    try {
      setGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [23, 37, 84];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SRI SAI OPTICALS', 14, 11);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Smart Optical Business Management System', 14, 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('DAILY BUSINESS STATEMENT', 283, 11, { align: 'right' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Statement Date: ${selectedDate} | Generated: ${new Date().toLocaleTimeString()}`, 283, 18, { align: 'right' });

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(213, 223, 237);
      doc.roundedRect(14, 28, 269, 22, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      const colWidth = 269 / 6;
      const yLabel = 34;
      const yValue = 44;

      doc.text('TOTAL ORDERS', 14 + 4, yLabel);
      doc.setTextColor(23, 37, 84);
      doc.setFontSize(12);
      doc.text(`${statement.totalOrders}`, 14 + 4, yValue);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('SELLING VALUE (MRP)', 14 + colWidth + 2, yLabel);
      doc.setTextColor(23, 37, 84);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.totalSellingAmount.toLocaleString('en-IN')}`, 14 + colWidth + 2, yValue);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('TOTAL DISCOUNT', 14 + colWidth * 2 + 2, yLabel);
      doc.setTextColor(225, 29, 72);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.totalDiscountGiven.toLocaleString('en-IN')}`, 14 + colWidth * 2 + 2, yValue);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('ACTUAL COLLECTION', 14 + colWidth * 3 + 2, yLabel);
      doc.setTextColor(13, 148, 136);
      doc.setFontSize(12);
      doc.text(`Rs. ${statement.totalCollection.toLocaleString('en-IN')}`, 14 + colWidth * 3 + 2, yValue);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('REMAINING BALANCE', 14 + colWidth * 4 + 2, yLabel);
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.remainingBalance.toLocaleString('en-IN')}`, 14 + colWidth * 4 + 2, yValue);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      if (isAdmin) {
        doc.text('ESTIMATED PROFIT', 14 + colWidth * 5 + 2, yLabel);
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(12);
        doc.text(`Rs. ${statement.totalProfit.toLocaleString('en-IN')}`, 14 + colWidth * 5 + 2, yValue);
      } else {
        doc.text('DELIVERIES (DONE/PEND)', 14 + colWidth * 5 + 2, yLabel);
        doc.setTextColor(23, 37, 84);
        doc.setFontSize(11);
        doc.text(`${statement.deliveredOrders} / ${statement.pendingDeliveries}`, 14 + colWidth * 5 + 2, yValue);
      }

      const tableHeaders = [[
        'S.No', 'Sticker No', 'Patient Name', 'Phone', 'Company Name', 'Handled By',
        'Selling Price', 'Discount', 'Final Amount', 'Advance Paid',
        'Balance Amount', 'Payment Method', 'Delivery Status',
      ]];

      const tableRows = (statement.orders || []).map((o: SaleResponse, index: number) => {
        const origPrice = o.originalSellingPrice || o.sellingPrice;
        const discountStr = o.discountAmount && o.discountAmount > 0
          ? `${o.discountAmount} (${o.discountType === 'PERCENTAGE' ? `${o.discountValue}%` : 'Flat'})`
          : '0';

        return [
          index + 1,
          o.stickerNumber,
          o.customerName,
          o.customerMobile,
          o.companyName,
          o.salespersonName || '—',
          `Rs. ${origPrice.toLocaleString('en-IN')}`,
          `Rs. ${discountStr}`,
          `Rs. ${o.sellingPrice.toLocaleString('en-IN')}`,
          `Rs. ${o.advanceAmount.toLocaleString('en-IN')}`,
          `Rs. ${o.remainingBalance.toLocaleString('en-IN')}`,
          o.paymentMethod || 'Cash',
          o.deliveryStatus,
        ];
      });

      const footRow = [[
        { content: 'TOTALS', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: `Rs. ${statement.totalSellingAmount.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${statement.totalDiscountGiven.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [225, 29, 72] } },
        { content: `Rs. ${(statement.totalSellingAmount - statement.totalDiscountGiven).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${statement.totalAdvanceCollected.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [13, 148, 136] } },
        { content: `Rs. ${statement.remainingBalance.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [180, 83, 9] } },
        { content: `Total Collected: Rs. ${statement.totalCollection.toLocaleString('en-IN')}`, colSpan: 2, styles: { fontStyle: 'bold', textColor: [13, 148, 136] } },
      ]];

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        foot: footRow as any,
        startY: 54,
        margin: { left: 14, right: 14, bottom: 20 },
        theme: 'grid',
        headStyles: { fillColor: [23, 37, 84], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: [238, 242, 248], textColor: [23, 37, 84], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: (data) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `Sri Sai Opticals ERP • Daily Business Statement (${selectedDate}) • Page ${data.pageNumber} of ${pageCount}`,
            148.5, 205, { align: 'center' }
          );
        },
      });

      doc.save(`Sri_Sai_Opticals_Daily_Statement_${selectedDate}.pdf`);
      toast.success('Daily Statement PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="card-premium p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t-4 border-t-[#2563EB]">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#172554] tracking-tight">Daily Business Statement</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Complete reconciliation of daily optical sales, discounts, payment transactions, and collections.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-[#EEF2F8]/80 border-[1.5px] border-[#D5DFED] rounded-xl px-3 py-2 shadow-xs">
            <Calendar className="w-4 h-4 text-[#2563EB] mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-extrabold text-[#172554] outline-none cursor-pointer bg-transparent"
            />
          </div>

          <button
            onClick={() => fetchStatement(selectedDate)}
            className="btn-secondary py-2 px-3 text-xs space-x-1.5"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => window.print()}
            className="btn-secondary py-2 px-3.5 text-xs space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf || loading || !statement}
            className="btn-primary py-2 px-4 text-xs space-x-1.5"
          >
            {generatingPdf ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : !statement ? (
        <div className="card-premium p-12 text-center text-slate-400 font-semibold">
          No statement data available for the selected date.
        </div>
      ) : (
        <>
          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#172554] to-[#2563EB]" />
              <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
                <span>Orders</span>
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center"><ShoppingBag className="w-3.5 h-3.5" /></span>
              </div>
              <p className="text-2xl font-black text-[#172554] mt-2 tabular-nums">{statement.totalOrders}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-bold">
                <span className="text-[#0D9488]">{statement.deliveredOrders} delivered</span>
                <span>•</span>
                <span className="text-amber-600">{statement.pendingDeliveries} lab</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-indigo-600" />
              <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
                <span>Total MRP</span>
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><IndianRupee className="w-3.5 h-3.5" /></span>
              </div>
              <p className="text-xl font-black text-[#172554] mt-2 tabular-nums">{formatINR(statement.totalSellingAmount)}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Gross catalogue value</p>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
              <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
                <span>Discount</span>
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Percent className="w-3.5 h-3.5" /></span>
              </div>
              <p className="text-xl font-black text-rose-600 mt-2 tabular-nums">{formatINR(statement.totalDiscountGiven)}</p>
              <p className="text-[10px] text-rose-500 mt-1 font-medium">Customer concessions</p>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4 border-emerald-200 bg-emerald-50/40">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-[#0D9488]" />
              <div className="flex items-center justify-between text-emerald-700 text-xs font-extrabold">
                <span>Collection</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0D9488] flex items-center justify-center"><Wallet className="w-3.5 h-3.5" /></span>
              </div>
              <p className="text-xl font-black text-[#0D9488] mt-2 tabular-nums">{formatINR(statement.totalCollection)}</p>
              <p className="text-[10px] text-emerald-700 mt-1 font-semibold">Received today</p>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
                <span>Balance</span>
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-3.5 h-3.5" /></span>
              </div>
              <p className="text-xl font-black text-amber-700 mt-2 tabular-nums">{formatINR(statement.remainingBalance)}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Due upon delivery</p>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card-stat p-4 border-blue-200 bg-blue-50/40">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#0D9488]" />
              <div className="flex items-center justify-between text-[#172554] text-xs font-extrabold">
                <span>{isAdmin ? 'Profit' : 'Delivered'}</span>
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  {isAdmin ? <TrendingUp className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-xl font-black text-[#2563EB] mt-2 tabular-nums">
                {isAdmin ? formatINR(statement.totalProfit) : `${statement.deliveredOrders} Orders`}
              </p>
              <p className="text-[10px] text-blue-700 mt-1 font-semibold">
                {isAdmin ? `Cost: ${formatINR(statement.totalCostAmount)}` : `${statement.pendingDeliveries} Pending`}
              </p>
            </motion.div>
          </div>

          {/* Payment Method Breakdown Bar */}
          {statement.paymentMethodTotals && Object.keys(statement.paymentMethodTotals).length > 0 && (
            <div className="card-premium p-4">
              <h3 className="text-xs font-black text-[#172554] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                <span>Collections Received by Payment Method on {formatDate(selectedDate)}</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(statement.paymentMethodTotals).map(([method, amount]) => (
                  <div key={method} className="flex items-center space-x-2 bg-[#EEF2F8]/80 border-[1.5px] border-[#D5DFED] px-3.5 py-2 rounded-xl text-xs">
                    <span className="font-extrabold text-[#172554]">{method}:</span>
                    <span className="font-black text-[#0D9488] tabular-nums">{formatINR(amount as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Order Table */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#F8FAFE] to-[#EEF2F8]/80 border-b border-[#D5DFED] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#172554]">Detailed Statement Order Breakdown</h3>
                <p className="text-xs text-slate-500 font-medium">All orders booked or payments recorded for {formatDate(selectedDate)}</p>
              </div>
              <span className="badge-partial">{statement.orders.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="text-center w-9">#</th>
                    <th>Sticker</th>
                    <th>Patient</th>
                    <th>Company</th>
                    <th>Handled By</th>
                    <th className="text-right">MRP / Disc</th>
                    <th className="text-right">Final</th>
                    <th className="text-right">Paid / Mode</th>
                    <th className="text-right">Balance</th>
                    <th className="text-center">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400 font-semibold">
                        No orders recorded on this date.
                      </td>
                    </tr>
                  ) : (
                    statement.orders.map((o: SaleResponse, index: number) => {
                      const origPrice = o.originalSellingPrice || o.sellingPrice;
                      const hasDisc = (o.discountAmount || 0) > 0;
                      const handlerName = o.salespersonName || '—';
                      return (
                        <tr key={o.id}>
                          <td className="text-center font-mono font-bold text-slate-400">{index + 1}</td>
                          <td className="whitespace-nowrap"><span className="sticker-badge">{o.stickerNumber}</span></td>
                          <td className="max-w-[140px]">
                            <p className="font-extrabold text-[#172554] truncate" title={o.customerName}>{o.customerName}</p>
                            <p className="font-mono text-[11px] font-semibold text-slate-500 whitespace-nowrap">{o.customerMobile}</p>
                          </td>
                          <td className="font-bold text-slate-700 max-w-[105px] truncate" title={o.companyName}>{o.companyName}</td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#172554] to-[#2563EB] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                {handlerName.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-extrabold text-[#172554] text-xs max-w-[165px] truncate" title={handlerName}>
                                {handlerName}
                              </span>
                            </div>
                          </td>
                          <td className="text-right whitespace-nowrap tabular-nums">
                            <p className="font-semibold text-slate-700">{formatINR(origPrice)}</p>
                            {hasDisc && (
                              <span className="text-[10px] text-rose-600 font-bold">-{formatINR(o.discountAmount || 0)}</span>
                            )}
                          </td>
                          <td className="text-right font-black text-[#172554] whitespace-nowrap tabular-nums">{formatINR(o.sellingPrice)}</td>
                          <td className="text-right whitespace-nowrap tabular-nums">
                            <p className="font-extrabold text-[#0D9488]">{formatINR(o.advanceAmount)}</p>
                            <span className="text-[10px] font-bold text-slate-500">{o.paymentMethod || 'Cash'}</span>
                          </td>
                          <td className="text-right font-black whitespace-nowrap tabular-nums">
                            {o.remainingBalance > 0 ? (
                              <span className="text-rose-600">{formatINR(o.remainingBalance)}</span>
                            ) : (
                              <span className="badge-delivered">PAID</span>
                            )}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className={o.deliveryStatus === 'DELIVERED' ? 'badge-delivered' : 'badge-pending'}>
                              {o.deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Totals Bar */}
            <div className="p-4 bg-[#EEF2F8]/70 border-t border-[#D5DFED]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 bg-white rounded-xl border-[1.5px] border-[#D5DFED] shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Collection</span>
                  <span className="text-lg font-black text-[#0D9488] mt-1 block tabular-nums">{formatINR(statement.totalCollection)}</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border-[1.5px] border-[#D5DFED] shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Pending Balance</span>
                  <span className="text-lg font-black text-amber-700 mt-1 block tabular-nums">{formatINR(statement.remainingBalance)}</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border-[1.5px] border-[#D5DFED] shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Discount Given</span>
                  <span className="text-lg font-black text-rose-600 mt-1 block tabular-nums">{formatINR(statement.totalDiscountGiven)}</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border-[1.5px] border-[#D5DFED] shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Profit</span>
                  <span className="text-lg font-black text-[#2563EB] mt-1 block tabular-nums">
                    {isAdmin ? formatINR(statement.totalProfit) : 'Confidential'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
