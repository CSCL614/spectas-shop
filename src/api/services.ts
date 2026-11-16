import api from './axios';
import type {
  ApiResponse,
  AuthResponse,
  UserResponse,
  SaleResponse,
  SaleRequest,
  SaleFilters,
  PagedResponse,
  DashboardStatsResponse,
  DailyStatementResponse,
  CustomerFeedback,
  FeedbackStatsResponse,
  AuditLogsResponse,
  UploadedSheetResponse,
  ImportResultResponse,
  Brand,
  CustomerProfileResponse,
} from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password }),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  heartbeat: () => api.post('/auth/heartbeat'),
  me: () => api.get<ApiResponse<UserResponse>>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),
};

export const salesApi = {
  getAll: (filters: SaleFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return api.get<ApiResponse<PagedResponse<SaleResponse>>>(`/sales?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<SaleResponse>>(`/sales/${id}`),
  create: (data: SaleRequest) => api.post<ApiResponse<SaleResponse>>('/sales', data),
  update: (id: string, data: SaleRequest) => api.put<ApiResponse<SaleResponse>>(`/sales/${id}`, data),
  clearBalance: (id: string, paymentMethod = 'Cash', notes = 'Customer Balance Cleared') =>
    api.patch<ApiResponse<SaleResponse>>(`/sales/${id}/clear-balance`, { paymentMethod, notes }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/sales/${id}`),
  updateDeliveryStatus: (id: string, status: 'PENDING' | 'DELIVERED') =>
    api.patch<ApiResponse<null>>(`/sales/${id}/delivery-status`, { status }),
  addPayment: (id: string, data: { amount: number; paymentMethod?: string; notes?: string }) =>
    api.post<ApiResponse<SaleResponse>>(`/sales/${id}/payments`, data),
  getNextStickerNumber: () =>
    api.get<ApiResponse<{ nextStickerNumber: string }>>('/sales/next-sticker-number'),
  getOverdue: () => api.get<ApiResponse<SaleResponse[]>>('/sales/overdue'),
  getCustomerProfile: (identifier: string) =>
    api.get<ApiResponse<CustomerProfileResponse>>(`/sales/customer/${encodeURIComponent(identifier)}`),
  seedDummyData: () => api.post<ApiResponse<any>>('/sales/seed-dummy'),
  getDashboardStats: (params?: { dateFrom?: string; dateTo?: string; salespersonId?: string }) => {
    const q = new URLSearchParams();
    if (params?.dateFrom) q.append('dateFrom', params.dateFrom);
    if (params?.dateTo) q.append('dateTo', params.dateTo);
    if (params?.salespersonId) q.append('salespersonId', params.salespersonId);
    return api.get<ApiResponse<DashboardStatsResponse>>(`/sales/dashboard/stats?${q.toString()}`);
  },
  getDailyStatement: (date?: string) =>
    api.get<ApiResponse<DailyStatementResponse>>(`/sales/daily-statement${date ? `?date=${date}` : ''}`),
};

export const brandApi = {
  getAll: () => api.get<ApiResponse<Brand[]>>('/brands'),
  create: (name: string) => api.post<ApiResponse<Brand>>('/brands', { name }),
};

export const feedbackApi = {
  getAll: (params?: any) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
      });
    }
    return api.get<ApiResponse<PagedResponse<CustomerFeedback>>>(`/feedback?${q.toString()}`);
  },
  create: (data: { patientName: string; patientPhone: string; orderId?: string; rating: number; feedback: string; feedbackDate?: string }) =>
    api.post<ApiResponse<CustomerFeedback>>('/feedback', data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/feedback/${id}`),
  getStats: () => api.get<ApiResponse<FeedbackStatsResponse>>('/feedback/stats'),
};

export const usersApi = {
  getSalespersons: () => api.get<ApiResponse<UserResponse[]>>('/users/salespersons'),
};

export const adminApi = {
  getUsers: () => api.get<ApiResponse<UserResponse[]>>('/admin/users'),
  getSalespersons: () => api.get<ApiResponse<UserResponse[]>>('/admin/users/salespersons'),
  createUser: (data: any) => api.post<ApiResponse<UserResponse>>('/admin/users', data),
  updateUser: (id: string, data: any) => api.put<ApiResponse<UserResponse>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post<ApiResponse<null>>(`/admin/users/${id}/reset-password`, { newPassword }),
  toggleStatus: (id: string, _active?: boolean) =>
    api.patch<ApiResponse<UserResponse>>(`/admin/users/${id}/status`),
  getAuditLogs: (params: { page?: number; size?: number; search?: string; action?: string; entityType?: string; userId?: string; dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return api.get<ApiResponse<AuditLogsResponse>>(`/admin/audit-logs?${q.toString()}`);
  },
};

export const excelApi = {
  downloadTemplate: () => api.get('/excel/template', { responseType: 'blob' }),
  importExcel: (file: File, salespersonId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const params = salespersonId ? `?salespersonId=${salespersonId}` : '';
    return api.post<ApiResponse<ImportResultResponse>>(`/excel/import${params}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUploadedSheets: (params?: { search?: string; salespersonId?: string; status?: string; dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) q.append(k, String(v));
      });
    }
    return api.get<ApiResponse<UploadedSheetResponse[]>>(`/excel/uploaded-sheets?${q.toString()}`);
  },
  downloadUploadedSheet: (id: string) => api.get(`/excel/uploaded-sheets/${id}/download`, { responseType: 'blob' }),
  exportExcel: (params?: { salespersonId?: string; dateFrom?: string; dateTo?: string; status?: string; productType?: string; paymentMethod?: string; hasDiscount?: string; customColumns?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    return api.get(`/excel/export?${query.toString()}`, { responseType: 'blob' });
  },
};
