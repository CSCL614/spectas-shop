import api from './axios';
import { put as putClientBlob } from '@vercel/blob/client';
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

export interface ExcelUploadProgress {
  phase: 'authorizing' | 'uploading' | 'processing' | 'done';
  percentage: number;
  label: string;
}

export const excelApi = {
  downloadTemplate: () => api.get('/excel/template', { responseType: 'blob' }),

  requestBlobUploadToken: (payload: {
    fileName: string;
    fileSize: number;
    salespersonId?: string;
  }) =>
    api.post<
      ApiResponse<{
        clientToken: string;
        pathname: string;
        maxFileSizeBytes: number;
        salespersonId: string;
        salespersonName: string;
      }>
    >('/excel/blob-upload-token', payload),

  importFromBlob: (payload: {
    blobPathname: string;
    blobUrl: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    salespersonId?: string;
  }) => api.post<ApiResponse<ImportResultResponse>>('/excel/import-from-blob', payload),

  /**
   * Secure direct-to-Vercel-Blob Private Storage upload + backend ExcelJS import.
   * Supports files up to 10 MB (bypassing Vercel's 4.5 MB serverless request payload limit)
   * while keeping BLOB_READ_WRITE_TOKEN strictly on the backend.
   */
  uploadAndImportExcel: async (
    file: File,
    salespersonId?: string,
    onProgress?: (progress: ExcelUploadProgress) => void
  ) => {
    const contentType =
      file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Step 1: Request short-lived, path-scoped private upload token from authenticated Express backend
    onProgress?.({
      phase: 'authorizing',
      percentage: 8,
      label: 'Authorizing private cloud storage upload...',
    });

    const tokenRes = await excelApi.requestBlobUploadToken({
      fileName: file.name,
      fileSize: file.size,
      salespersonId: salespersonId || undefined,
    });

    const { clientToken, pathname } = tokenRes.data.data;

    // Step 2: Upload original Excel file directly from browser to Vercel Blob Private Storage
    onProgress?.({
      phase: 'uploading',
      percentage: 15,
      label: 'Uploading Excel file to Vercel Blob Private Storage...',
    });

    const blob = await putClientBlob(pathname, file, {
      access: 'private',
      token: clientToken,
      contentType,
      multipart: file.size > 4 * 1024 * 1024, // Automatically use multipart for files > 4 MB
      onUploadProgress: (evt) => {
        // Scale 0-100% network upload progress into 15-82% overall bar
        const scaled = Math.min(82, Math.max(15, Math.round(15 + (evt.percentage * 0.67))));
        onProgress?.({
          phase: 'uploading',
          percentage: scaled,
          label: `Uploading to Private Cloud Storage (${Math.round(evt.percentage)}%)...`,
        });
      },
    });

    // Step 3: Notify authenticated Express backend to fetch via private `get()`, validate & import orders
    onProgress?.({
      phase: 'processing',
      percentage: 88,
      label: 'Validating Excel columns & importing orders into MongoDB...',
    });

    const importRes = await excelApi.importFromBlob({
      blobPathname: blob.pathname,
      blobUrl: blob.url,
      originalFileName: file.name,
      fileSize: file.size,
      mimeType: contentType,
      salespersonId: salespersonId || undefined,
    });

    onProgress?.({
      phase: 'done',
      percentage: 100,
      label: 'Upload & order import complete!',
    });

    return importRes;
  },

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
  getUploadedSheetById: (id: string) =>
    api.get<ApiResponse<UploadedSheetResponse>>(`/excel/uploaded-sheets/${id}`),
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
