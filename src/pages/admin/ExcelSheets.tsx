import React, { useState, useEffect } from 'react';
import { excelApi, adminApi } from '../../api/services';
import type { UploadedSheetResponse, UserResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  FolderArchive,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Cloud,
  Lock,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ExcelSheets: React.FC = () => {
  const [sheets, setSheets] = useState<UploadedSheetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UploadedSheetResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Load all users (Admin + all Sales Executives) for complete filtering
    adminApi.getUsers()
      .then((res) => setAllUsers(res.data.data))
      .catch(() => {
        adminApi.getSalespersons().then((res) => setAllUsers(res.data.data)).catch(() => {});
      });
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await excelApi.getUploadedSheets({
        search: search || undefined,
        salespersonId: salespersonId || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setSheets(res.data.data);
    } catch {
      toast.error('Failed to load uploaded Excel sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [salespersonId, status, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSheets();
  };

  const handleDownload = async (file: UploadedSheetResponse) => {
    try {
      setDownloadingId(file.id);
      const res = await excelApi.downloadUploadedSheet(file.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded "${file.originalFileName}" securely from Vercel Blob`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to download original Excel file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await excelApi.deleteUploadedSheet(deleteTarget.id);
      setSheets((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success(`Deleted "${deleteTarget.originalFileName}" from Excel Sheets`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete Excel sheet');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="page-banner p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-2 rounded-xl bg-white/15 border border-white/25 text-teal-200">
              <FolderArchive className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">
              Master Admin Private Cloud Archive
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/15 border border-white/25 text-blue-100">
              <Lock className="w-2.5 h-2.5" />
              Vercel Blob Private
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Excel Sheets Cloud Vault</h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl font-medium">
            View, audit, and securely download all original Excel spreadsheets uploaded by Admin and Sales Executives from Vercel Blob Private Storage.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchSheets}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs border border-white/25 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Archive</span>
        </motion.button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div className="lg:col-span-2">
            <label className="label-modern">Search File or Staff Member</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by original filename or staff name..."
                className="input-modern pr-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="label-modern">Uploaded By</label>
            <select
              value={salespersonId}
              onChange={(e) => setSalespersonId(e.target.value)}
              className="input-modern cursor-pointer font-bold"
            >
              <option value="">All Users (Admin & Sales)</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role === 'ADMIN' ? 'Admin' : 'Sales'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-modern">Import Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-modern cursor-pointer font-bold"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">100% Success</option>
              <option value="PARTIAL">Partial (With Rejections)</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSalespersonId('');
                setStatus('');
                setDateFrom('');
                setDateTo('');
              }}
              className="btn-ghost py-2.5 text-xs"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3.5 border-t border-[#D5DFED] flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-extrabold text-[#172554]">Upload Date Range:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
        </div>
      </div>

      {/* Table of Uploaded Excel Sheets */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[#F8FAFE] to-[#EEF2F8]/80 border-b border-[#D5DFED] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <h3 className="font-black text-sm text-[#172554]">
              Cloud Archived Excel Files ({sheets.length})
            </h3>
          </div>
          <span className="badge-partial">
            <Cloud className="w-3 h-3" />
            Private Blob Stream
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : sheets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FolderArchive className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-black text-[#172554]">No uploaded Excel files found</p>
            <p className="text-xs text-slate-500 mt-1">
              Excel files uploaded via Bulk Excel Import are stored in Vercel Blob Private Storage and will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="w-10 text-center">#</th>
                  <th>Executive</th>
                  <th>Excel File</th>
                  <th>Uploaded</th>
                  <th className="text-right">Size</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Records</th>
                  <th className="text-center">Download</th>
                  <th className="text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((sheet, index) => (
                  <tr key={sheet.id}>
                    <td className="text-center font-mono font-bold text-slate-400">{index + 1}</td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#172554] to-[#2563EB] text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0">
                          {sheet.salespersonName?.charAt(0) || 'S'}
                        </div>
                        <span
                          className="font-extrabold text-[#172554] max-w-[160px] truncate"
                          title={sheet.salespersonName}
                        >
                          {sheet.salespersonName}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[190px]">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileSpreadsheet className="w-4 h-4 text-[#0D9488] shrink-0" />
                        <div className="min-w-0">
                          <span
                            className="font-extrabold text-[#172554] truncate block"
                            title={sheet.originalFileName}
                          >
                            {sheet.originalFileName}
                          </span>
                          {sheet.storageProvider === 'VERCEL_BLOB' && (
                            <span className="text-[10px] font-bold text-[#2563EB] inline-flex items-center gap-1">
                              <Cloud className="w-2.5 h-2.5" />
                              Private Blob
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="font-bold text-[#172554] text-xs">{sheet.uploadDate}</p>
                      <p className="font-mono text-[10px] text-slate-500 font-semibold">{sheet.uploadTime}</p>
                    </td>
                    <td className="text-right font-mono text-xs text-slate-600 font-bold whitespace-nowrap">
                      {formatFileSize(sheet.fileSize)}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {sheet.status === 'SUCCESS' ? (
                        <span className="badge-delivered">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Imported</span>
                        </span>
                      ) : sheet.status === 'PARTIAL' ? (
                        <span className="badge-pending">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Partial</span>
                        </span>
                      ) : (
                        <span className="badge-overdue">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="text-xs">
                        <span className="font-black text-[#0D9488]">{sheet.successCount}</span>
                        <span className="text-slate-400"> / {sheet.totalRows}</span>
                        {sheet.errorCount > 0 && (
                          <span className="text-[10px] text-rose-600 font-extrabold block">
                            ({sheet.errorCount} rejected)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDownload(sheet)}
                        disabled={downloadingId === sheet.id}
                        className="btn-primary py-1.5 px-2.5 text-xs space-x-1"
                        title="Download Original Excel File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === sheet.id ? '...' : 'Download'}</span>
                      </motion.button>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setDeleteTarget(sheet)}
                        disabled={deletingId === sheet.id}
                        title="Delete Excel Sheet"
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-extrabold transition-all shadow-xs disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Excel Sheet Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#CFDCEB] relative"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />
              <div className="p-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletingId === deleteTarget.id}
                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-600 p-1.5 rounded-xl bg-[#EEF2F8] hover:bg-rose-50 border border-[#D5DFED] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="pr-6">
                    <h3 className="text-base font-black text-[#172554]">Delete Excel Sheet?</h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      This will permanently remove{' '}
                      <strong className="text-[#172554] break-all">{deleteTarget.originalFileName}</strong>{' '}
                      from Vercel Blob Private Storage and the Excel Sheets archive.
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-2">
                      Note: Orders already imported into the Orders Ledger will not be deleted.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingId === deleteTarget.id}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deletingId === deleteTarget.id}
                    className="btn-danger py-2 px-4 text-xs space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === deleteTarget.id ? 'Deleting...' : 'Delete Sheet'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
