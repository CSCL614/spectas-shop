import React, { useState, useEffect } from 'react';
import { excelApi, adminApi, type ExcelUploadProgress } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { ImportResultResponse, UploadedSheetResponse, UserResponse } from '../../types';
import {
  FileUp,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
  Info,
  X,
  UploadCloud,
  Cloud,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ExcelImport: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [file, setFile] = useState<File | null>(null);
  const [salespersonId, setSalespersonId] = useState('');
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ExcelUploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResultResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Recent user uploads so both Admin and Sales Executives can view & download their own uploaded files
  const [recentSheets, setRecentSheets] = useState<UploadedSheetResponse[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchRecentSheets = async () => {
    try {
      const res = await excelApi.getUploadedSheets();
      setRecentSheets((res.data.data || []).slice(0, 5));
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons()
        .then((res) => setSalespersons(res.data.data))
        .catch(() => {});
    }
    fetchRecentSheets();
  }, [isAdmin]);

  const validateAndSelectFile = (selected: File | null) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (!selected) {
      setFile(null);
      return;
    }

    if (!/\.(xlsx|xls)$/i.test(selected.name)) {
      const msg = 'Invalid file format. Please select an Excel file (.xlsx or .xls).';
      setUploadError(msg);
      toast.error(msg);
      setFile(null);
      return;
    }

    if (selected.size === 0) {
      const msg = 'The selected Excel file is empty.';
      setUploadError(msg);
      toast.error(msg);
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      const msg = 'File size exceeds the 10 MB maximum upload limit.';
      setUploadError(msg);
      toast.error(msg);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await excelApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sri_sai_opticals_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Standard template downloaded successfully');
    } catch {
      toast.error('Failed to download template');
    }
  };

  const handleDownloadOriginal = async (sheet: UploadedSheetResponse) => {
    try {
      setDownloadingId(sheet.id);
      const res = await excelApi.downloadUploadedSheet(sheet.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', sheet.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded "${sheet.originalFileName}" from private cloud storage`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to download original Excel file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      const msg = 'Please select an Excel (.xlsx/.xls) file';
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setResult(null);

      const res = await excelApi.uploadAndImportExcel(
        file,
        salespersonId || undefined,
        (prog) => setUploadProgress(prog)
      );

      setResult(res.data.data);
      setUploadSuccess(
        `Original file "${file.name}" saved securely to Vercel Blob Private Storage. ${res.data.message}`
      );
      toast.success(res.data.message);
      setFile(null);
      fetchRecentSheets();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Excel cloud upload and import failed';
      setUploadError(errMsg);
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="page-banner p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-teal-200 shadow-inner">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-100 border border-teal-300/35">
                  Vercel Blob Private Storage
                </span>
                <span className="text-blue-200 text-xs font-mono font-bold">• Up to 10 MB Direct Cloud Upload</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
                Bulk Optical Order Import
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl font-medium">
                Upload Excel sheets directly to encrypted Private Cloud Storage, automatically format STK- sticker numbers, and import verified orders into MongoDB.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownloadTemplate}
            className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-[#172554] hover:bg-blue-50 text-xs font-black transition shadow-lg"
          >
            <Download className="w-4 h-4 text-[#2563EB]" />
            <span>Download Template</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Supported Column Guide Card */}
      <div className="card-premium p-5 bg-gradient-to-r from-blue-50/70 via-white to-teal-50/50 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-black text-[#172554] uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>Recognized Template Headers & Automatic Formulas</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Sticker Numbers are automatically normalized to <strong className="font-mono text-[#2563EB]">STK-XXXX</strong> format (or auto-generated sequentially if left blank). Original Excel files up to <strong>10 MB</strong> are archived securely in Vercel Blob Private Storage.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { name: 'Sticker Number (STK-)', req: false },
            { name: 'Company Name', req: true },
            { name: 'Product Type (Frame/Lens)', req: true },
            { name: 'Cost Price', req: true },
            { name: 'Original Selling Price', req: true },
            { name: 'Discount Type', req: false },
            { name: 'Discount Value', req: false },
            { name: 'Advance Amount', req: true },
            { name: 'Payment Method', req: true },
            { name: 'Expected Delivery Date', req: true },
            { name: 'Delivery Status', req: false },
            { name: 'Customer Name', req: true },
            { name: 'Customer Mobile (10 digits)', req: true },
          ].map((col) => (
            <span
              key={col.name}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border shadow-xs ${
                col.req
                  ? 'bg-blue-50 text-[#172554] border-blue-200'
                  : 'bg-white text-slate-600 border-[#D5DFED]'
              }`}
            >
              {col.name} {col.req && <span className="text-rose-500 font-black">*</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Upload & Processing Card */}
      <div className="card-premium p-6 sm:p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {isAdmin && (
            <div className="bg-[#EEF2F8]/70 p-4 rounded-xl border-[1.5px] border-[#D5DFED]">
              <label className="label-modern">Assign Imported Orders To Staff Specialist</label>
              <select
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                disabled={uploading}
                className="input-modern bg-white font-bold cursor-pointer"
              >
                <option value="">Current Administrator Account ({user?.fullName})</option>
                {salespersons.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.fullName} (@{sp.username})</option>
                ))}
              </select>
            </div>
          )}

          {/* Upload Error Banner */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded-xl bg-rose-50 border-[1.5px] border-rose-200 flex items-start space-x-3 text-rose-700 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{uploadError}</div>
                <button type="button" onClick={() => setUploadError(null)} className="text-rose-400 hover:text-rose-700">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Success Banner */}
          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded-xl bg-emerald-50 border-[1.5px] border-emerald-200 flex items-start space-x-3 text-emerald-800 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0D9488]" />
                <div className="flex-1">{uploadSuccess}</div>
                <button type="button" onClick={() => setUploadSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                validateAndSelectFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-[#2563EB] bg-blue-50/70 scale-[1.01]'
                : 'border-[#B8C7DE] hover:border-[#2563EB] bg-[#EEF2F8]/50 hover:bg-white'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#0D9488] rounded-2xl mb-3 shadow-sm">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-[#172554]">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  {formatFileSize(file.size)} • Ready for direct private cloud upload
                </p>
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => validateAndSelectFile(null)}
                    className="mt-3 text-xs font-extrabold text-rose-600 hover:text-rose-800 flex items-center space-x-1 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove selected file</span>
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="p-4 bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white rounded-2xl w-fit mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-black text-[#172554]">
                  Drag & Drop your Excel Spreadsheet here
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Supports Microsoft Excel files (<strong>.xlsx</strong>, <strong>.xls</strong>) up to <strong>10 MB</strong> via Vercel Blob Private Storage
                </p>
                <label className="inline-block mt-4 cursor-pointer">
                  <span className="btn-secondary px-5 py-2.5 text-xs">
                    Browse Files from Computer
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => validateAndSelectFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Real-Time Cloud Upload Progress Bar */}
          <AnimatePresence>
            {uploading && uploadProgress && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-blue-50/70 border-[1.5px] border-blue-200 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-[#172554]">
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-[#2563EB] animate-pulse" />
                    <span>{uploadProgress.label}</span>
                  </span>
                  <span className="font-mono text-[#2563EB]">{uploadProgress.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-white border border-blue-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress.percentage}%` }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>Encrypted Private Blob • Authenticated Access Only</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading || !file}
              className="btn-primary px-8 py-3 text-xs space-x-2"
            >
              <Sparkles className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Uploading & Importing...' : 'Upload to Cloud & Import Orders'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* 4. Import Results & Cloud Archive Metadata Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 sm:p-8 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5DFED] pb-3">
            <h3 className="text-sm font-black text-[#172554]">Import Batch Summary & Validation Audit</h3>
            <span className="badge-delivered">
              <Cloud className="w-3 h-3" />
              Stored in Vercel Blob Private Storage
            </span>
          </div>

          {result.uploadedFile && (
            <div className="p-4 rounded-xl bg-[#EEF2F8]/80 border-[1.5px] border-[#D5DFED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D5DFED] flex items-center justify-center text-[#0D9488] shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#172554] break-all">
                    {result.uploadedFile.originalFileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#2563EB]" />
                      {result.uploadedFile.uploadDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0D9488]" />
                      {result.uploadedFile.uploadTime}
                    </span>
                    <span className="font-mono">{formatFileSize(result.uploadedFile.fileSize)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadOriginal(result.uploadedFile!)}
                disabled={downloadingId === result.uploadedFile.id}
                className="btn-secondary py-2 px-4 text-xs space-x-1.5 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{downloadingId === result.uploadedFile.id ? 'Downloading...' : 'Download Original'}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#EEF2F8] border-[1.5px] border-[#D5DFED]">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Total Rows Scanned</p>
              <p className="text-2xl font-black text-[#172554] mt-1 tabular-nums">{result.totalRows}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border-[1.5px] border-emerald-200">
              <p className="text-[11px] font-extrabold text-emerald-700 uppercase">Successfully Imported</p>
              <p className="text-2xl font-black text-[#0D9488] mt-1 tabular-nums">{result.successCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border-[1.5px] border-rose-200">
              <p className="text-[11px] font-extrabold text-rose-700 uppercase">Rejected Rows</p>
              <p className="text-2xl font-black text-rose-600 mt-1 tabular-nums">{result.errorCount}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Validation Rejection Logs</span>
              </h4>
              <div className="max-h-64 overflow-y-auto border-[1.5px] border-rose-200 rounded-xl divide-y divide-rose-100 text-xs">
                {result.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-rose-50/40 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-black text-rose-800">Row {err.rowNumber}</span> — [{err.field}]: {err.error}
                    </div>
                    {err.rawValue && (
                      <span className="text-[10px] text-slate-600 font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                        "{err.rawValue}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 5. Recent Cloud Uploads (Permitted files for logged-in user) */}
      {recentSheets.length > 0 && (
        <div className="card-premium overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-[#F8FAFE] to-[#EEF2F8]/80 border-b border-[#D5DFED] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488]">
                <Cloud className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-black text-sm text-[#172554]">
                  {isAdmin ? 'Recent Cloud Excel Uploads' : 'My Uploaded Excel Sheets'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Securely stored in Vercel Blob Private Storage
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Original Filename</th>
                  <th>Uploaded By</th>
                  <th>Date & Time</th>
                  <th>Imported</th>
                  <th>Size</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSheets.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#0D9488] shrink-0" />
                        <span className="font-extrabold text-[#172554] break-all">{s.originalFileName}</span>
                      </div>
                    </td>
                    <td className="font-bold text-slate-700">{s.salespersonName}</td>
                    <td className="text-xs">
                      <span className="font-bold text-[#172554] block">{s.uploadDate}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{s.uploadTime}</span>
                    </td>
                    <td>
                      <span className="font-black text-[#0D9488]">{s.successCount}</span>
                      <span className="text-slate-400"> / {s.totalRows}</span>
                    </td>
                    <td className="font-mono text-xs text-slate-600 font-bold">{formatFileSize(s.fileSize)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadOriginal(s)}
                        disabled={downloadingId === s.id}
                        className="btn-secondary py-1.5 px-3 text-xs space-x-1"
                      >
                        <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>{downloadingId === s.id ? 'Downloading...' : 'Download'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
