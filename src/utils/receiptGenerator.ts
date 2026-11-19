import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SaleResponse } from '../types';

const formatRs = (amount?: number): string => {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const downloadOrderReceiptPdf = (sale: SaleResponse): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const navy: [number, number, number] = [23, 37, 84];      // #172554
  const royalBlue: [number, number, number] = [37, 99, 235]; // #2563EB
  const teal: [number, number, number] = [13, 148, 136];    // #0D9488
  const slateText: [number, number, number] = [51, 65, 85];
  const mutedText: [number, number, number] = [100, 116, 139];
  const borderCol: [number, number, number] = [213, 223, 237]; // #D5DFED
  const softBg: [number, number, number] = [238, 242, 248];    // #EEF2F8

  // 1. Top Navy Header Banner
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 34, 'F');

  // Accent gradient strip under header
  doc.setFillColor(...teal);
  doc.rect(0, 34, pageWidth, 2.2, 'F');

  // Shop Branding (Left)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SRI SAI SMART OPTICALS SOFTWARE', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(191, 219, 254);
  doc.text('A Clear Vision for Better Business', 15, 23);
  doc.setFontSize(8);
  doc.text('Smart Optical Order Management & Billing Receipt', 15, 28.5);

  // Receipt Title & Sticker Pill (Right)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CUSTOMER RECEIPT', pageWidth - 15, 14, { align: 'right' });

  doc.setFillColor(...royalBlue);
  doc.roundedRect(pageWidth - 58, 17.5, 43, 8, 2, 2, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(sale.stickerNumber || 'N/A', pageWidth - 36.5, 22.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`Order Date: ${formatDisplayDate(sale.saleDate)}`, pageWidth - 15, 30, { align: 'right' });

  // 2. Customer & Order Info Two-Column Cards
  const cardTop = 43;
  const cardHeight = 34;
  const colGap = 6;
  const cardWidth = (pageWidth - 30 - colGap) / 2;

  // Left Card: Customer Details
  doc.setFillColor(...softBg);
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, cardTop, cardWidth, cardHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...royalBlue);
  doc.text('CUSTOMER / PATIENT DETAILS', 20, cardTop + 7);

  doc.setFontSize(11);
  doc.setTextColor(...navy);
  doc.text(sale.customerName || 'Walk-in Customer', 20, cardTop + 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...slateText);
  doc.text(`Mobile: +91 ${sale.customerMobile || 'N/A'}`, 20, cardTop + 21);
  doc.text(`Attended By: ${sale.salespersonName || 'Optical Specialist'}`, 20, cardTop + 27.5);

  // Right Card: Order & Delivery Info
  const rightX = 15 + cardWidth + colGap;
  doc.setFillColor(...softBg);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(rightX, cardTop, cardWidth, cardHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...teal);
  doc.text('ORDER & FULFILLMENT DETAILS', rightX + 5, cardTop + 7);

  const isCleared = (sale.remainingBalance || 0) <= 0;
  const isPartial = !isCleared && (sale.advanceAmount || 0) > 0;
  const payStatusText = isCleared ? 'FULLY PAID' : isPartial ? 'PARTIALLY PAID' : 'PAYMENT PENDING';
  const delStatusText = sale.deliveryStatus === 'DELIVERED' ? 'DELIVERED' : 'NOT DELIVERED (IN LAB)';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...slateText);
  doc.text(`Sticker Ref: ${sale.stickerNumber}`, rightX + 5, cardTop + 14);
  doc.text(`Expected Delivery: ${formatDisplayDate(sale.expectedDeliveryDate)}`, rightX + 5, cardTop + 20.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...(sale.deliveryStatus === 'DELIVERED' ? teal : ([180, 83, 9] as [number, number, number])));
  doc.text(`Delivery: ${delStatusText}`, rightX + 5, cardTop + 26.5);

  doc.setTextColor(...(isCleared ? teal : ([190, 18, 60] as [number, number, number])));
  doc.text(`Payment: ${payStatusText}`, rightX + 5, cardTop + 31.5);

  // 3. Itemized Order Summary Table
  const originalPrice = sale.originalSellingPrice || sale.sellingPrice || 0;
  const discountAmt = sale.discountAmount || 0;
  const discountLabel =
    discountAmt > 0
      ? `${formatRs(discountAmt)}${sale.discountType === 'PERCENTAGE' ? ` (${sale.discountValue}%)` : ''}`
      : 'Rs. 0';

  const productLabel = (sale.productType || 'FRAME') === 'LENS' ? 'Optical Lens' : 'Eyewear Frame';

  autoTable(doc, {
    startY: cardTop + cardHeight + 8,
    margin: { left: 15, right: 15 },
    head: [['Sticker No', 'Brand / Company', 'Category', 'MRP', 'Discount', 'Net Payable']],
    body: [[
      sale.stickerNumber,
      sale.companyName || 'Optical Product',
      productLabel,
      formatRs(originalPrice),
      discountAmt > 0 ? `- ${discountLabel}` : 'Rs. 0',
      formatRs(sale.sellingPrice),
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3.5,
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: slateText,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', textColor: royalBlue },
      1: { fontStyle: 'bold', textColor: navy },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right', textColor: discountAmt > 0 ? [225, 29, 72] : mutedText },
      5: { halign: 'right', fontStyle: 'bold', textColor: navy },
    },
  });

  // 4. Financial Totals Box (Right aligned)
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  const totalsWidth = 86;
  const totalsX = pageWidth - 15 - totalsWidth;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.5);
  doc.roundedRect(totalsX, currentY, totalsWidth, 42, 3, 3, 'FD');

  const writeTotalRow = (
    label: string,
    val: string,
    y: number,
    bold = false,
    color: [number, number, number] = slateText
  ) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...mutedText);
    doc.text(label, totalsX + 5, y);
    doc.setTextColor(...color);
    doc.text(val, totalsX + totalsWidth - 5, y, { align: 'right' });
  };

  writeTotalRow('Original MRP:', formatRs(originalPrice), currentY + 8);
  writeTotalRow(
    'Discount Applied:',
    discountAmt > 0 ? `- ${formatRs(discountAmt)}` : 'Rs. 0',
    currentY + 15,
    false,
    discountAmt > 0 ? [225, 29, 72] : mutedText
  );
  writeTotalRow('Final Bill Amount:', formatRs(sale.sellingPrice), currentY + 22.5, true, navy);
  writeTotalRow('Total Paid / Advance:', formatRs(sale.advanceAmount), currentY + 29.5, true, teal);

  // Divider line before Balance Due
  doc.setDrawColor(...borderCol);
  doc.line(totalsX + 4, currentY + 33, totalsX + totalsWidth - 4, currentY + 33);

  writeTotalRow(
    'Balance Due:',
    isCleared ? 'Rs. 0 (PAID)' : formatRs(sale.remainingBalance),
    currentY + 39,
    true,
    isCleared ? teal : [225, 29, 72]
  );

  // Payment Mode Badge Box on the Left side opposite Totals
  doc.setFillColor(...softBg);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(15, currentY, pageWidth - 30 - totalsWidth - 8, 42, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text('PAYMENT SUMMARY', 20, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...slateText);
  doc.text(`Primary Mode: ${sale.paymentMethod || 'Cash'}`, 20, currentY + 16);
  doc.text(`Status: ${payStatusText}`, 20, currentY + 23);

  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text('Please present this receipt or Sticker Ref', 20, currentY + 32);
  doc.text(`(${sale.stickerNumber}) when collecting your eyewear.`, 20, currentY + 37);

  // 5. Payment Transactions History Table
  currentY += 50;
  const transactions =
    sale.paymentTransactions && sale.paymentTransactions.length > 0
      ? sale.paymentTransactions
      : sale.advanceAmount > 0
      ? [
          {
            amount: sale.advanceAmount,
            paymentMethod: sale.paymentMethod || 'Cash',
            date: sale.saleDate,
            time: '',
            notes: 'Initial Advance Payment',
          },
        ]
      : [];

  if (transactions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text('PAYMENT TRANSACTION LEDGER', 15, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      margin: { left: 15, right: 15 },
      head: [['#', 'Date & Time', 'Payment Method', 'Notes / Reference', 'Amount Paid']],
      body: transactions.map((tx, idx) => [
        idx + 1,
        `${formatDisplayDate(tx.date)}${tx.time ? ` • ${tx.time}` : ''}`,
        tx.paymentMethod || 'Cash',
        tx.notes || 'Payment received',
        formatRs(tx.amount),
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: slateText,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 42 },
        2: { halign: 'center', cellWidth: 32, fontStyle: 'bold' },
        4: { halign: 'right', cellWidth: 32, fontStyle: 'bold', textColor: teal },
      },
    });
  }

  // 6. Footer & Signature Area
  const footerY = 272;
  doc.setDrawColor(...borderCol);
  doc.line(15, footerY - 8, pageWidth - 15, footerY - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text('Thank you for choosing SRI SAI SMART OPTICALS SOFTWARE!', 15, footerY - 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-IN')} • A Clear Vision for Better Business`,
    15,
    footerY + 4.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text('Authorized Signature', pageWidth - 15, footerY + 2, { align: 'right' });

  const safeName = (sale.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const safeSticker = (sale.stickerNumber || 'ORDER').replace(/[^a-zA-Z0-9-]/g, '');
  doc.save(`Sri_Sai_Smart_Opticals_Receipt_${safeSticker}_${safeName}.pdf`);
};

