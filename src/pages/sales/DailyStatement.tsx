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
  Sparkles
} from 'lucide-react';
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
      // Use landscape A4 for optimal readability of the 12 columns
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [15, 23, 42]; // Slate 900
      const accentColor = [37, 99, 235]; // Blue 600

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 24, 'F');

      // Shop Name & Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SPECTAS SHOP', 14, 11);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Smart Optical Business Management System', 14, 18);

      // Statement Info (Right aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('DAILY BUSINESS STATEMENT', 283, 11, { align: 'right' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Statement Date: ${selectedDate} | Generated: ${new Date().toLocaleTimeString()}`, 283, 18, { align: 'right' });

      // Daily KPI Summary Box
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.roundedRect(14, 28, 269, 22, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      // Metric columns in PDF header box
      const colWidth = 269 / 6;
      const yLabel = 34;
      const yValue = 44;

      // Col 1: Orders
      doc.text('TOTAL ORDERS', 14 + 4, yLabel);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(`${statement.totalOrders}`, 14 + 4, yValue);

      // Col 2: Total Selling MRP
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('SELLING VALUE (MRP)', 14 + colWidth + 2, yLabel);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.totalSellingAmount.toLocaleString('en-IN')}`, 14 + colWidth + 2, yValue);

      // Col 3: Total Discount
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('TOTAL DISCOUNT', 14 + colWidth * 2 + 2, yLabel);
      doc.setTextColor(225, 29, 72);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.totalDiscountGiven.toLocaleString('en-IN')}`, 14 + colWidth * 2 + 2, yValue);

      // Col 4: Daily Collection
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('ACTUAL COLLECTION', 14 + colWidth * 3 + 2, yLabel);
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(12);
      doc.text(`Rs. ${statement.totalCollection.toLocaleString('en-IN')}`, 14 + colWidth * 3 + 2, yValue);

      // Col 5: Pending Balance
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('REMAINING BALANCE', 14 + colWidth * 4 + 2, yLabel);
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(11);
      doc.text(`Rs. ${statement.remainingBalance.toLocaleString('en-IN')}`, 14 + colWidth * 4 + 2, yValue);

      // Col 6: Profit (Admin) or Deliveries
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      if (isAdmin) {
        doc.text('ESTIMATED PROFIT', 14 + colWidth * 5 + 2, yLabel);
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(12);
        doc.text(`Rs. ${statement.totalProfit.toLocaleString('en-IN')}`, 14 + colWidth * 5 + 2, yValue);
      } else {
        doc.text('DELIVERIES (DONE/PEND)', 14 + colWidth * 5 + 2, yLabel);
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.text(`${statement.deliveredOrders} / ${statement.pendingDeliveries}`, 14 + colWidth * 5 + 2, yValue);
      }

      // Prepare Table Data (12 columns)
      const tableHeaders = [
        [
          'S.No',
          'Order ID',
          'Patient Name',
          'Phone',
          'Company Name',
          'Selling Price',
          'Discount',
          'Final Amount',
          'Advance Paid',
          'Balance Amount',
          'Payment Method',
          'Delivery Status',
        ],
      ];

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
          `Rs. ${origPrice.toLocaleString('en-IN')}`,
          `Rs. ${discountStr}`,
          `Rs. ${o.sellingPrice.toLocaleString('en-IN')}`,
          `Rs. ${o.advanceAmount.toLocaleString('en-IN')}`,
          `Rs. ${o.remainingBalance.toLocaleString('en-IN')}`,
          o.paymentMethod || 'Cash',
          o.deliveryStatus,
        ];
      });

      // Bottom Totals Row
      const footRow = [
        [
          { content: 'TOTALS', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold' } },
          { content: `Rs. ${statement.totalSellingAmount.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } },
          { content: `Rs. ${statement.totalDiscountGiven.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [225, 29, 72] } },
          { content: `Rs. ${(statement.totalSellingAmount - statement.totalDiscountGiven).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } },
          { content: `Rs. ${statement.totalAdvanceCollected.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [5, 150, 105] } },
          { content: `Rs. ${statement.remainingBalance.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [180, 83, 9] } },
          { content: `Total Collected: Rs. ${statement.totalCollection.toLocaleString('en-IN')}`, colSpan: 2, styles: { fontStyle: 'bold', textColor: [5, 150, 105] } },
        ],
      ];

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        foot: footRow as any,
        startY: 54,
        margin: { left: 14, right: 14, bottom: 20 },
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
          2: { cellWidth: 32 },
          3: { halign: 'center', cellWidth: 24 },
          4: { cellWidth: 28 },
          5: { halign: 'right', cellWidth: 24 },
          6: { halign: 'right', cellWidth: 22 },
          7: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
          8: { halign: 'right', cellWidth: 24 },
          9: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
          10: { halign: 'center', cellWidth: 23 },
          11: { halign: 'center', cellWidth: 20 },
        },
        didDrawPage: (data) => {
          // Bottom Page Number Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          const pageCurrent = data.pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `SPECTAS SHOP Optical ERP • Daily Business Statement (${selectedDate}) • Page ${pageCurrent} of ${pageCount}`,
            148.5,
            205,
            { align: 'center' }
          );
        },
      });

      doc.save(`Spectas_Shop_Daily_Statement_${selectedDate}.pdf`);
      toast.success('Daily Statement PDF downloaded successfully!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Business Statement</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete reconciliation of daily optical sales, discounts, payment transactions, and collections.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
            />
          </div>

          <button
            onClick={() => fetchStatement(selectedDate)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center space-x-1.5"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf || loading || !statement}
            className="btn-primary py-1.5 px-4 text-xs flex items-center space-x-1.5 shadow-sm"
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
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : !statement ? (
        <div className="card-premium p-12 text-center text-slate-400">
          No statement data available for the selected date.
        </div>
      ) : (
        <>
          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Total Orders */}
            <div className="card-premium p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Orders</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{statement.totalOrders}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-600 font-semibold">{statement.deliveredOrders} delivered</span>
                <span>•</span>
                <span className="text-amber-600 font-semibold">{statement.pendingDeliveries} lab</span>
              </div>
            </div>

            {/* 2. Total Selling Amount */}
            <div className="card-premium p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total MRP</span>
                <IndianRupee className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{formatINR(statement.totalSellingAmount)}</p>
              <p className="text-[10px] text-slate-400 mt-1">Gross catalogue value</p>
            </div>

            {/* 3. Total Discount Given */}
            <div className="card-premium p-4 border-rose-100">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Discount</span>
                <Percent className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl font-black text-rose-600 mt-2">{formatINR(statement.totalDiscountGiven)}</p>
              <p className="text-[10px] text-rose-400 mt-1">Customer concessions</p>
            </div>

            {/* 4. Total Daily Collection */}
            <div className="card-premium p-4 bg-emerald-50/40 border-emerald-200/80">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                <span>Daily Collection</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-700 mt-2">{formatINR(statement.totalCollection)}</p>
              <p className="text-[10px] text-emerald-600 mt-1">
                Advance + collections today
              </p>
            </div>

            {/* 5. Remaining Balance */}
            <div className="card-premium p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Pending Balance</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-black text-amber-700 mt-2">{formatINR(statement.remainingBalance)}</p>
              <p className="text-[10px] text-slate-400 mt-1">Due upon delivery</p>
            </div>

            {/* 6. Total Profit (Admin only or General) */}
            <div className="card-premium p-4 bg-blue-50/40 border-blue-200/80">
              <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
                <span>{isAdmin ? 'Total Profit' : 'Delivered'}</span>
                {isAdmin ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xl font-black text-blue-900 mt-2">
                {isAdmin ? formatINR(statement.totalProfit) : `${statement.deliveredOrders} Orders`}
              </p>
              <p className="text-[10px] text-blue-600 mt-1">
                {isAdmin ? `Cost: ${formatINR(statement.totalCostAmount)}` : `${statement.pendingDeliveries} Pending`}
              </p>
            </div>
          </div>

          {/* Payment Method Breakdown Bar */}
          {statement.paymentMethodTotals && Object.keys(statement.paymentMethodTotals).length > 0 && (
            <div className="card-premium p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Collections Received by Payment Method on {formatDate(selectedDate)}</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(statement.paymentMethodTotals).map(([method, amount]) => (
                  <div key={method} className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
                    <span className="font-semibold text-slate-700">{method}:</span>
                    <span className="font-bold text-emerald-700">{formatINR(amount as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Order Table (12 columns) */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Detailed Statement Order Breakdown</h3>
                <p className="text-xs text-slate-400">All orders booked or payments recorded for {formatDate(selectedDate)}</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {statement.orders.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center">S.No</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">Patient Phone</th>
                    <th className="py-3 px-3">Company Name</th>
                    <th className="py-3 px-3 text-right">Selling Price</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-3 text-right">Final Amount</th>
                    <th className="py-3 px-3 text-right">Advance Amount</th>
                    <th className="py-3 px-3 text-right">Balance Amount</th>
                    <th className="py-3 px-3 text-center">Payment Method</th>
                    <th className="py-3 px-3 text-center">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statement.orders.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 text-xs">
                        No orders recorded on this date.
                      </td>
                    </tr>
                  ) : (
                    statement.orders.map((o: SaleResponse, index: number) => {
                      const origPrice = o.originalSellingPrice || o.sellingPrice;
                      const hasDisc = (o.discountAmount || 0) > 0;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{index + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">{o.stickerNumber}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{o.customerName}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{o.customerMobile}</td>
                          <td className="py-3 px-3 text-slate-700">{o.companyName}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700">{formatINR(origPrice)}</td>
                          <td className="py-3 px-3 text-right">
                            {hasDisc ? (
                              <span className="text-rose-600 font-semibold">
                                -{formatINR(o.discountAmount || 0)}
                              </span>
                            ) : (
                              <span className="text-slate-300">₹0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(o.sellingPrice)}</td>
                          <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatINR(o.advanceAmount)}</td>
                          <td className="py-3 px-3 text-right font-bold">
                            {o.remainingBalance > 0 ? (
                              <span className="text-amber-700">{formatINR(o.remainingBalance)}</span>
                            ) : (
                              <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded font-bold">PAID</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {o.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.deliveryStatus === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.deliveryStatus}
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
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collection</span>
                  <span className="text-lg font-black text-emerald-600 mt-1 block">{formatINR(statement.totalCollection)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pending Balance</span>
                  <span className="text-lg font-black text-amber-700 mt-1 block">{formatINR(statement.remainingBalance)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Discount Given</span>
                  <span className="text-lg font-black text-rose-600 mt-1 block">{formatINR(statement.totalDiscountGiven)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Profit</span>
                  <span className="text-lg font-black text-blue-700 mt-1 block">
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

