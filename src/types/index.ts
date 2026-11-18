// API & UI Types

export type UserRole = 'ADMIN' | 'SALESPERSON';
export type DeliveryStatus = 'PENDING' | 'DELIVERED';
export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'NONE';
export type ProductType = 'FRAME' | 'LENS' | 'UNSPECIFIED';

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface PaymentTransaction {
  id?: string;
  amount: number;
  paymentMethod: string;
  date: string;
  time?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  summary?: {
    totalCount: number;
    totalSellingAmount: number;
    totalDiscounts: number;
    totalProfit: number;
    totalAdvanceCollected: number;
    outstandingBalance: number;
  };
}

export interface AuthResponse {
  token: string;
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  isOnline?: boolean;
  lastActive?: string;
  lastLogin?: string;
  lastLogout?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleResponse {
  id: string;
  stickerNumber: string;
  companyName: string;
  productType: ProductType;
  costPrice: number;
  originalSellingPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  sellingPrice: number;
  advanceAmount: number;
  remainingBalance: number;
  grossProfit: number;
  paymentMethod: string;
  paymentTransactions?: PaymentTransaction[];
  expectedDeliveryDate: string;
  deliveryStatus: DeliveryStatus;
  deliveredAt?: string;
  deliveredBy?: string;
  customerName: string;
  customerMobile: string;
  saleDate: string;
  salespersonId: string;
  salespersonName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRequest {
  stickerNumber: string;
  companyName: string;
  productType?: ProductType;
  costPrice: number;
  originalSellingPrice: number;
  discountType: DiscountType;
  discountValue?: number;
  advanceAmount: number;
  paymentMethod: string;
  expectedDeliveryDate: string;
  deliveryStatus?: DeliveryStatus;
  customerName: string;
  customerMobile: string;
  salespersonId?: string;
}

export interface SaleFilters {
  page?: number;
  size?: number;
  search?: string;
  deliveryStatus?: string;
  productType?: string;
  balanceStatus?: string;
  salespersonId?: string;
  companyName?: string;
  paymentMethod?: string;
  hasDiscount?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Brand {
  id: string;
  name: string;
  createdBy?: string;
  createdAt: string;
}

export interface CustomerProfileResponse {
  customerName: string;
  customerMobile: string;
  totalOrders: number;
  totalPurchaseAmount: number;
  totalPaymentsReceived: number;
  outstandingBalance: number;
  orders: SaleResponse[];
  allPayments: PaymentTransaction[];
}

export interface DashboardStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  netSales?: number;
  totalCost: number;
  grossProfit: number;
  totalDiscounts?: number;
  advanceCollected: number;
  remainingBalance: number;
  deliveredOrders: number;
  pendingOrders: number;
  deliverySuccessRate: number;
  deliveryFulfilmentRate?: number;
  deliveryStatusData?: { status: string; count: number }[];
  todayCollection?: number;
  todayOrders?: number;
  todayRevenue?: number;
  todayDiscount?: number;
  todayProfit?: number;
  averageCustomerRating?: number;
  totalCustomerFeedback?: number;
  dailySales?: { date: string; revenue: number; orders: number; profit: number; collection?: number }[];
  dailyTrends: { date: string; revenue: number; orders: number; profit: number }[];
  companySales?: { company: string; brand?: string; count?: number; orders: number; revenue: number; profit?: number }[];
  brandDistribution: { brand: string; count: number; revenue: number }[];
  paymentMethodDistribution?: { method: string; total: number; count: number }[];
  salespersonPerformance?: {
    id: string;
    name: string;
    username: string;
    orders: number;
    sales: number;
    revenue: number;
    collection: number;
    profit: number;
    pendingBalance: number;
  }[];
  frameAnalytics?: {
    totalOrders: number;
    revenue: number;
    cost: number;
    profit: number;
    discount: number;
    topBrands: { brand: string; count: number }[];
  };
  lensAnalytics?: {
    totalOrders: number;
    revenue: number;
    cost: number;
    profit: number;
    discount: number;
    topBrands: { brand: string; count: number }[];
  };
}

export interface DailyStatementResponse {
  date: string;
  totalOrders: number;
  totalSellingAmount: number;
  totalCostAmount: number;
  totalDiscountGiven: number;
  totalProfit: number;
  totalAdvanceCollected: number;
  totalCollection: number;
  paymentMethodTotals: Record<string, number>;
  remainingBalance: number;
  pendingDeliveries: number;
  deliveredOrders: number;
  orders: SaleResponse[];
}

export interface CustomerFeedback {
  id: string;
  patientName: string;
  patientPhone: string;
  orderId?: string;
  rating: number;
  feedback: string;
  feedbackDate: string;
  salespersonId?: string;
  salespersonName?: string;
  createdAt: string;
}

export interface FeedbackStatsResponse {
  totalCount: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
  totalReviews?: number;
  positiveRatingPercent?: number;
  starDistribution?: Record<number, number>;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedByName: string;
  details: string;
  timestamp: string;
}

export interface SalesExecutiveSession {
  id: string;
  fullName: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastActive: string | null;
  lastLogin: string | null;
  lastLogout: string | null;
  sessionDuration: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface AuditLogsResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  salesExecutiveSessions?: SalesExecutiveSession[];
}

export interface UploadedSheetResponse {
  id: string;
  originalFileName: string;
  storedFileName: string;
  blobPathname?: string;
  blobUrl?: string;
  storageProvider?: 'VERCEL_BLOB' | 'LOCAL';
  fileSize: number;
  mimeType: string;
  salespersonId: string;
  salespersonName: string;
  uploadDate: string;
  uploadTime: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  createdAt: string;
}

export interface ImportResultResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; field: string; error: string; rawValue?: any }[];
  uploadedFile?: UploadedSheetResponse;
}

export interface SearchSuggestionItem {
  id: string;
  type: 'customer' | 'phone' | 'sticker' | 'brand' | 'order' | 'page';
  label: string;
  sublabel: string;
  value: string;
  orderId?: string;
  customerIdentifier?: string;
  route?: string;
  badge?: string;
}
