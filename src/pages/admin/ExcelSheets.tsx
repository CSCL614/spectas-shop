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
  User,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ExcelSheets: React.FC = () => {
  const [sheets, setSheets] = useState<UploadedSheetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getSalespersons().then((res) => setSalespersons(res.data.data)).catch(() => {});
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
    } catch (err: any) {
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
      toast.success(`Downloaded "${file.originalFileName}"`);
    } catch (err: any) {
      toast.error('Failed to download original Excel file');
    } finally {
      setDownloadingId(null);
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
      <div className="card-premium p-6 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-white/10 text-teal-300">
              <FolderArchive className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-300">
              Master Admin Archive
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Sales Executive Excel Sheets</h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Access, audit, and download the exact original Excel sheets uploaded by Sales Executives. All original filenames and row data are preserved.
          </p>
        </div>

        <button
          onClick={fetchSheets}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Archive</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div className="lg:col-span-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Search File or Executive</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename or salesperson name..."
                className="input-modern pr-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Sales Executive</label>
            <select
              value={salespersonId}
              onChange={(e) => setSalespersonId(e.target.value)}
              className="input-modern cursor-pointer"
            >
              <option value="">All Sales Executives</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Import Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-modern cursor-pointer"
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

        {/* Date presets */}
        <div className="mt-4 pt-3.5 border-t border-[#D5DFED] flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Upload Date Range:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1 bg-white border border-[#D5DFED] rounded-lg text-xs font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* Table of Uploaded Excel Sheets */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-[#D5DFED] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-black text-sm text-[#172554]">Archived Uploaded Excel Files ({sheets.length})</h3>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : sheets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FolderArchive className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-600">No uploaded Excel files found</p>
            <p className="text-xs text-slate-400 mt-1">Excel files imported by Sales Executives will automatically appear here for download.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="w-12">S.No</th>
                  <th>Sales Executive</th>
                  <th>Original File Name</th>
                  <th>Upload Date & Time</th>
                  <th>Records Scanned</th>
                  <th>Import Status</th>
                  <th>File Size</th>
                  <th className="text-right">Download Original</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((sheet, index) => (
                  <motion.tr
                    key={sheet.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="font-bold text-slate-400">{index + 1}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] font-black text-xs flex items-center justify-center">
                          {sheet.salespersonName?.charAt(0) || 'S'}
                        </div>
                        <span className="font-bold text-[#172554]">{sheet.salespersonName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 break-all">{sheet.originalFileName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <p className="font-bold text-slate-700">{sheet.uploadDate}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{sheet.uploadTime}</p>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="font-black text-[#172554]">{sheet.totalRows}</span> rows
                        <span className="text-[11px] text-emerald-600 font-bold ml-1.5">({sheet.successCount} ok)</span>
                        {sheet.errorCount > 0 && (
                          <span className="text-[11px] text-rose-600 font-bold ml-1">({sheet.errorCount} rejected)</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {sheet.status === 'SUCCESS' ? (
                        <span className="badge-delivered inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Imported</span>
                        </span>
                      ) : sheet.status === 'PARTIAL' ? (
                        <span className="badge-pending inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Partial Rows</span>
                        </span>
                      ) : (
                        <span className="badge-overdue inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-slate-500 font-semibold">
                      {formatFileSize(sheet.fileSize)}
                    </td>
                    <td className="text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(sheet)}
                        disabled={downloadingId === sheet.id}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0d9488] hover:from-[#1d4ed8] hover:to-[#0f766e] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === sheet.id ? 'Downloading...' : 'Download Original'}</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
