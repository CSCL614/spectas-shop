import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { salesApi, adminApi, brandApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { SaleRequest, UserResponse, DiscountType, PaymentMethod, ProductType } from '../../types';
import { PAYMENT_METHODS } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/helpers';
import {
  ArrowLeft,
  Save,
  IndianRupee,
  Glasses,
  UserCheck,
  Calendar,
  Sparkles,
  CreditCard,
  Percent,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Plus,
  Check,
  ChevronDown,
  X,
  Truck,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const SaleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);

  // Form Fields
  const [stickerNumber, setStickerNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productType, setProductType] = useState<ProductType>('FRAME');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [originalSellingPrice, setOriginalSellingPrice] = useState<number | ''>('');
  const [discountType, setDiscountType] = useState<DiscountType>('NONE');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'PENDING' | 'DELIVERED'>('PENDING');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [salespersonId, setSalespersonId] = useState('');

  // Brand dropdown state
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Clearance action in edit mode
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [clearingBalance, setClearingBalance] = useState(false);

  const numOriginalSelling = Number(originalSellingPrice) || 0;
  const numCost = Number(costPrice) || 0;
  const numDiscVal = Number(discountValue) || 0;

  let calculatedDiscount = 0;
  if (discountType === 'PERCENTAGE') {
    calculatedDiscount = Math.round((numOriginalSelling * numDiscVal) / 100);
  } else if (discountType === 'FIXED') {
    calculatedDiscount = numDiscVal;
  }
  calculatedDiscount = Math.max(0, Math.min(numOriginalSelling, calculatedDiscount));

  const finalSellingPrice = Math.max(0, numOriginalSelling - calculatedDiscount);
  const numAdvance = Number(advanceAmount) || 0;
  const computedRemaining = Math.max(0, finalSellingPrice - numAdvance);
  const grossProfit = finalSellingPrice - numCost;
  const profitMargin = finalSellingPrice > 0 ? ((grossProfit / finalSellingPrice) * 100).toFixed(1) : '0';

  const fetchBrandsList = async () => {
    try {
      const res = await brandApi.getAll();
      const names = res.data.data.map((b) => b.name);
      setAvailableBrands(names);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchBrandsList();

    if (isAdmin) {
      adminApi.getSalespersons()
        .then((res) => setSalespersons(res.data.data))
        .catch(() => {});
    }

    if (!isEdit) {
      salesApi.getNextStickerNumber()
        .then((res) => {
          if (res.data.data?.nextStickerNumber) {
            setStickerNumber(res.data.data.nextStickerNumber);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, isEdit]);

  // Click outside listener for brand dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      salesApi.getById(id)
        .then((res) => {
          const s = res.data.data;
          setStickerNumber(s.stickerNumber);
          setCompanyName(s.companyName);
          setBrandSearch(s.companyName);
          setProductType(s.productType || 'FRAME');
          setCostPrice(s.costPrice);
          setOriginalSellingPrice(s.originalSellingPrice || s.sellingPrice);
          setDiscountType(s.discountType || 'NONE');
          setDiscountValue(s.discountValue || '');
          setAdvanceAmount(s.advanceAmount);
          setRemainingBalance(s.remainingBalance);
          setPaymentMethod((s.paymentMethod as PaymentMethod) || 'Cash');
          setExpectedDeliveryDate(s.expectedDeliveryDate);
          setDeliveryStatus(s.deliveryStatus || 'PENDING');
          setCustomerName(s.customerName);
          setCustomerMobile(s.customerMobile);
          setSalespersonId(s.salespersonId);
        })
        .catch(() => toast.error('Failed to load order for editing'))
        .finally(() => setInitialLoading(false));
    }
  }, [isEdit, id]);

  const handleAddNewBrand = async (brandName: string) => {
    const clean = brandName.trim();
    if (!clean) return;
    try {
      setAddingBrand(true);
      const res = await brandApi.create(clean);
      toast.success(`Brand "${res.data.data.name}" permanently added to database!`);
      setCompanyName(res.data.data.name);
      setBrandSearch(res.data.data.name);
      setIsBrandDropdownOpen(false);
      await fetchBrandsList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add brand');
    } finally {
      setAddingBrand(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, maximum 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerMobile(digitsOnly);
  };

  const handleMarkBalanceCleared = async () => {
    if (!id || remainingBalance <= 0) return;
    try {
      setClearingBalance(true);
      const res = await salesApi.clearBalance(id, paymentMethod, 'Marked balance cleared in Order Edit');
      const updated = res.data.data;
      setAdvanceAmount(updated.advanceAmount);
      setRemainingBalance(0);
      toast.success(`Customer balance cleared! ₹${updated.advanceAmount} total payment recorded.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clear customer balance');
    } finally {
      setClearingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stickerNumber || !companyName || !customerName || !customerMobile || !expectedDeliveryDate) {
      toast.error('Please fill in all mandatory fields (*)');
      return;
    }

    // Phone number validation: exactly 10 digits
    if (!/^\d{10}$/.test(customerMobile.trim())) {
      toast.error('Customer phone number must be exactly 10 digits (digits only)');
      return;
    }

    try {
      setLoading(true);
      const payload: SaleRequest = {
        stickerNumber: stickerNumber.trim().toUpperCase(),
        companyName: companyName.trim(),
        productType,
        costPrice: numCost,
        originalSellingPrice: numOriginalSelling,
        discountType,
        discountValue: numDiscVal,
        advanceAmount: numAdvance,
        paymentMethod,
        expectedDeliveryDate,
        deliveryStatus,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        salespersonId: (isAdmin && salespersonId) ? salespersonId : undefined,
      };

      if (isEdit && id) {
        await salesApi.update(id, payload);
        toast.success('Order updated successfully!');
      } else {
        await salesApi.create(payload);
        toast.success('New order created successfully!');
      }
      navigate('/sales');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const currentBalanceStatus = (isEdit ? remainingBalance : computedRemaining) === 0 ? 'CLEARED' : (numAdvance > 0 ? 'PARTIAL' : 'PENDING');

  const filteredBrands = availableBrands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );
  const isExactBrandMatch = availableBrands.some(
    (b) => b.toLowerCase() === brandSearch.toLowerCase().trim()
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sales')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders List</span>
        </button>
        <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
          {isEdit ? 'Editing Customer Order' : 'New Order Entry'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Product Classification & Brand Dropdown */}
        <div className="card-premium p-6">
          <h2 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Glasses className="w-4 h-4 text-[#2563EB]" />
            <span>Product & Identification Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Product Category / Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="input-modern cursor-pointer font-bold text-[#172554]"
                required
              >
                <option value="FRAME">👓 Frame (Spectacles / Sunglasses)</option>
                <option value="LENS">🔍 Lens (Single / Progressive / Blue-cut)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  Sticker Number <span className="text-rose-500">*</span>
                </label>
                {!isEdit && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-blue-100 text-blue-700">
                    Auto-Generated
                  </span>
                )}
              </div>
              <input
                type="text"
                value={stickerNumber}
                onChange={(e) => setStickerNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 1001"
                disabled={isEdit}
                className="input-modern font-mono font-black uppercase disabled:bg-slate-100 disabled:text-slate-700 text-[#2563EB]"
                required
              />
            </div>

            {/* PROPER SEARCHABLE BRAND DROPDOWN */}
            <div className="relative" ref={brandDropdownRef}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Brand / Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isBrandDropdownOpen ? brandSearch : companyName}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setCompanyName(e.target.value);
                    setIsBrandDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setBrandSearch(companyName);
                    setIsBrandDropdownOpen(true);
                  }}
                  placeholder="Search or select brand..."
                  className="input-modern font-bold pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Options */}
              {isBrandDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-60 overflow-y-auto">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <div
                        key={brand}
                        onClick={() => {
                          setCompanyName(brand);
                          setBrandSearch(brand);
                          setIsBrandDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                          companyName === brand ? 'bg-blue-50 text-blue-700' : 'text-slate-800'
                        }`}
                      >
                        <span>{brand}</span>
                        {companyName === brand && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No matching brand found
                    </div>
                  )}

                  {/* Add New Brand Option */}
                  {brandSearch.trim() && !isExactBrandMatch && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <button
                        type="button"
                        disabled={addingBrand}
                        onClick={() => handleAddNewBrand(brandSearch)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{addingBrand ? 'Saving Brand...' : `+ Add "${brandSearch.trim()}" to Brands DB`}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Financial Calculation */}
        <div className="card-premium p-6">
          <h2 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-[#0d9488]" />
            <span>Pricing, Discount & Profitability</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Wholesale Cost Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="input-modern font-bold text-[#172554]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Original Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={originalSellingPrice}
                onChange={(e) => setOriginalSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="input-modern font-bold text-[#2563EB]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="input-modern cursor-pointer font-bold"
              >
                <option value="NONE">No Discount</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            {discountType !== 'NONE' && (
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Discount Value ({discountType === 'PERCENTAGE' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="input-modern font-bold text-amber-600"
                />
              </div>
            )}
          </div>

          {/* Auto calculated pill cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#D5DFED]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Discount Deducted</p>
              <p className="text-base font-black text-amber-600 mt-0.5">₹{calculatedDiscount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Final Selling Price</p>
              <p className="text-base font-black text-[#2563EB] mt-0.5">{formatINR(finalSellingPrice)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">Gross Profit</p>
              <p className="text-base font-black text-emerald-700 mt-0.5">{formatINR(grossProfit)}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
              <p className="text-[10px] font-bold text-teal-700 uppercase">Profit Margin</p>
              <p className="text-base font-black text-teal-700 mt-0.5">{profitMargin}%</p>
            </div>
          </div>
        </div>

        {/* Card 3: Payment & Balance Clearance */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#172554] uppercase tracking-wider flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
              <span>Payment Details & Balance Clearance</span>
            </h2>

            <div>
              {currentBalanceStatus === 'CLEARED' ? (
                <span className="badge-delivered">Balance Cleared (Fully Paid)</span>
              ) : currentBalanceStatus === 'PARTIAL' ? (
                <span className="badge-pending">Partially Paid</span>
              ) : (
                <span className="badge-overdue">Balance Pending</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Advance Amount Collected (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="input-modern font-bold text-emerald-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="input-modern cursor-pointer font-bold text-[#172554]"
                required
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Remaining Outstanding Balance (₹)
              </label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-rose-600 text-sm">
                {formatINR(isEdit ? remainingBalance : computedRemaining)}
              </div>
            </div>
          </div>

          {/* Mark Customer Balance as Fully Paid Action */}
          {isEdit && remainingBalance > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-amber-900">Customer has an outstanding balance of {formatINR(remainingBalance)}</p>
                <p className="text-[11px] text-amber-700">Clearing the balance records an actual payment transaction in history and sets remaining balance to ₹0.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleMarkBalanceCleared}
                disabled={clearingBalance}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
                <span>{clearingBalance ? 'Clearing...' : 'Mark Customer Balance as Fully Paid'}</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Card 4: Customer Details & Fulfillment */}
        <div className="card-premium p-6">
          <h2 className="text-sm font-black text-[#172554] uppercase tracking-wider mb-4 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Customer Details & Fulfillment Status</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-modern font-bold text-[#172554]"
                required
              />
            </div>

            {/* CUSTOMER PHONE NUMBER VALIDATION (EXACTLY 10 DIGITS) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  Customer Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono font-bold ${customerMobile.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {customerMobile.length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                value={customerMobile}
                onChange={handleMobileChange}
                placeholder="10-digit mobile number"
                className={`input-modern font-mono font-bold ${
                  customerMobile && customerMobile.length !== 10
                    ? 'border-rose-400 bg-rose-50/30 text-rose-800'
                    : 'text-[#172554]'
                }`}
                required
              />
              {customerMobile && customerMobile.length !== 10 && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">
                  Must be exactly 10 numeric digits
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Expected Delivery Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="input-modern font-bold text-[#172554]"
                required
              />
            </div>

            {/* CUSTOMER DELIVERY STATUS FIELD (ADMIN & SALES EXECUTIVE) */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                Customer Delivery Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value as 'PENDING' | 'DELIVERED')}
                className={`input-modern cursor-pointer font-bold ${
                  deliveryStatus === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="PENDING">🟠 Not Delivered (In Lab / Ready for Pickup)</option>
                <option value="DELIVERED">🟢 Delivered (Handed Over to Customer)</option>
              </select>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${deliveryStatus === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className={`text-[10px] font-extrabold uppercase ${deliveryStatus === 'DELIVERED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Badge: {deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Not Delivered'}
                </span>
              </div>
            </div>

            {/* ASSIGN TO SALES EXECUTIVE (ADMIN ONLY) */}
            {isAdmin && (
              <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Assign to Sales Executive
                </label>
                <select
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="input-modern cursor-pointer font-bold text-slate-800 max-w-md"
                >
                  <option value="">Admin Account ({user?.fullName})</option>
                  {salespersons.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.fullName} (@{sp.username})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigning or reassigning updates order ownership, specialist metrics, and records an audit trail.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="btn-ghost px-6 py-3 text-xs"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 text-xs"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{loading ? 'Saving Order...' : (isEdit ? 'Save Order Changes' : 'Create Optical Order')}</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
};
