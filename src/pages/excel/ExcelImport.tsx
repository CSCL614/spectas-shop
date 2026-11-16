import React, { useState, useEffect } from 'react';
import { excelApi, adminApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { ImportResultResponse, UserResponse } from '../../types';
import { 
  FileUp, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  FileSpreadsheet, 
  Check, 
  Sparkles, 
  Tag, 
  CreditCard, 
  Info, 
  X, 
  UploadCloud, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ExcelImport: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [file, setFile] = useState<File | null>(null);
  const [salespersonId, setSalespersonId] = useState('');
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResultResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons()
        .then(res => setSalespersons(res.data.data))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleDownloadTemplate = async () => {
    try {
      const res = await excelApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'spectas_sales_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Standard template downloaded successfully');
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an Excel (.xlsx/.xls) file');

    try {
      setUploading(true);
      setResult(null);
      const res = await excelApi.importExcel(file, salespersonId || undefined);
      setResult(res.data.data);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Excel import failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 shadow-inner">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  Bulk Data Operations
                </span>
                <span className="text-blue-200 text-xs font-mono">• Automated Ingestion</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Bulk Optical Order Import
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
                Mass upload patient prescriptions, frames, automatic pricing formulas, and advance payments directly into SPECTAS SHOP ERP.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownloadTemplate}
            className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 backdrop-blur-md text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-300" />
            <span>Download Standard Template</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Supported Column Guide Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-teal-50/40 to-blue-50/70 rounded-2xl p-5 border border-blue-200/80 shadow-[0_4px_20px_-4px_rgba(23,37,84,0.04)] space-y-3">
        <div className="flex items-center space-x-2 text-xs font-black text-[#172554] uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>Recognized Template Headers & Automatic Formulas</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The ERP spreadsheet parser maps columns automatically and calculates <strong>Final Selling Price</strong>, <strong>Remaining Balance</strong>, and <strong>Gross Profit</strong> without manual formulas:
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { name: 'Sticker Number', req: true },
            { name: 'Company Name', req: true },
            { name: 'Cost Price', req: true },
            { name: 'Original Selling Price', req: true },
            { name: 'Discount Type', req: false },
            { name: 'Discount Value', req: false },
            { name: 'Advance Amount', req: true },
            { name: 'Payment Method', req: true },
            { name: 'Expected Delivery Date', req: true },
            { name: 'Delivery Status', req: false },
            { name: 'Customer Name', req: true },
            { name: 'Customer Mobile', req: true },
          ].map((col) => (
            <span
              key={col.name}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-xs ${
                col.req 
                  ? 'bg-blue-100/70 text-blue-900 border-blue-300/80' 
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {col.name} {col.req && <span className="text-rose-500 font-black">*</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Upload & Processing Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)]">
        <form onSubmit={handleUpload} className="space-y-6">
          {isAdmin && (
            <div className="bg-[#EEF3FA]/50 p-4 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                Assign Imported Orders To Staff Specialist
              </label>
              <select
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">Current Administrator Account (Self)</option>
                {salespersons.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.fullName} (@{sp.username})</option>
                ))}
              </select>
            </div>
          )}

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-[#2563EB] bg-blue-50/50 scale-[1.01]' 
                : 'border-slate-300 hover:border-[#2563EB] bg-[#EEF3FA]/40 hover:bg-white'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl mb-3 shadow-sm">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-[#172554]">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)} • Ready for validation</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove selected file</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-gradient-to-tr from-blue-600 to-teal-500 text-white rounded-2xl w-fit mx-auto mb-4 shadow-md shadow-blue-500/20">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-black text-[#172554]">
                  Drag & Drop your Excel Spreadsheet here
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Supports standard Microsoft Excel files (<strong>.xlsx</strong>, <strong>.xls</strong>) up to 10MB
                </p>
                <label className="inline-block mt-4 cursor-pointer">
                  <span className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#172554] border border-slate-300 font-bold text-xs shadow-xs hover:border-[#2563EB] transition">
                    Browse Files from Computer
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0d9488] hover:from-[#1d4ed8] hover:to-[#0f766e] text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Validating & Importing...' : 'Execute Import'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* 4. Import Results & Audit Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)] space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#172554]">
              Import Batch Summary & Validation Audit
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              Processed Batch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#EEF3FA]/70 border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Rows Scanned</p>
              <p className="text-2xl font-black text-[#172554] mt-1">{result.totalRows}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Successfully Imported</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{result.successCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80">
              <p className="text-[11px] font-bold text-rose-700 uppercase">Rejected Rows</p>
              <p className="text-2xl font-black text-rose-700 mt-1">{result.errorCount}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Validation Rejection Logs</span>
              </h4>
              <div className="max-h-64 overflow-y-auto border border-rose-100 rounded-xl divide-y divide-rose-100 text-xs">
                {result.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-rose-50/30 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-rose-800">Row {err.rowNumber}</span> - [{err.field}]: {err.error}
                    </div>
                    {err.rawValue && (
                      <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
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
    </motion.div>
  );
};
