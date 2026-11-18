import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import type { AuditLog, SalesExecutiveSession, UserResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/helpers';
import {
  ShieldCheck,
  Search,
  Calendar,
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<SalesExecutiveSession[]>([]);
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [userIdFilter, setUserIdFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    adminApi.getSalespersons().then((res) => setSalespersons(res.data.data)).catch(() => {});
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        page,
        size: 20,
        search: search || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
        userId: userIdFilter !== 'ALL' ? userIdFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const data = res.data.data;
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      if (data.salesExecutiveSessions) {
        setSessions(data.salesExecutiveSessions);
      }
    } catch {
      toast.error('Failed to load audit trails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, userIdFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_SALE':
        return <span className="badge-delivered">CREATE ORDER</span>;
      case 'UPDATE_SALE':
        return <span className="badge-partial">EDIT ORDER</span>;
      case 'CLEAR_BALANCE':
        return <span className="badge-delivered">BALANCE CLEARED</span>;
      case 'ADD_PAYMENT':
        return <span className="badge-pending">PAYMENT</span>;
      case 'DELETE_SALE':
        return <span className="badge-overdue">DELETE ORDER</span>;
      case 'LOGIN':
        return <span className="badge-partial">USER LOGIN</span>;
      case 'LOGOUT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-300">USER LOGOUT</span>;
      case 'EXCEL_IMPORT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-800 border border-purple-200">EXCEL IMPORT</span>;
      default:
        return <span className="badge-partial">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="page-banner p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-white/15 border border-white/25 text-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">
              Enterprise Security Audit
            </span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Audit Trails & Executive Monitoring</h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl font-medium">
            Live tracking of Sales Executives: online session status, login/logout timestamps, order entries, balance clearances, and Excel operations.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchLogs}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs border border-white/25 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live</span>
        </motion.button>
      </div>

      {/* Sales Executive Activity Monitoring Cards */}
      <div>
        <h2 className="text-xs font-black text-[#172554] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563EB]" />
          <span>Sales Executive Live Session & Activity Status</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="card-premium p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${session.isOnline ? 'bg-gradient-to-r from-emerald-500 to-[#0D9488]' : 'bg-slate-300'}`} />
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white font-black text-sm flex items-center justify-center shadow-md">
                    {session.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-sm text-[#172554]">{session.fullName}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-500">(@{session.username})</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{session.email}</p>
                  </div>
                </div>

                <div>
                  {session.isOnline ? (
                    <span className="badge-delivered">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-[#D5DFED] text-xs">
                <div className="p-2.5 rounded-xl bg-[#EEF2F8]/80 border border-[#D5DFED]">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase">Last Login</p>
                  <p className="font-black text-[#172554] mt-0.5 tabular-nums">
                    {session.lastLogin ? new Date(session.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold">{session.lastLogin ? new Date(session.lastLogin).toISOString().split('T')[0] : ''}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#EEF2F8]/80 border border-[#D5DFED]">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase">Last Logout</p>
                  <p className="font-black text-[#172554] mt-0.5 tabular-nums">
                    {session.lastLogout ? new Date(session.lastLogout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active/Open'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold">{session.lastLogout ? new Date(session.lastLogout).toISOString().split('T')[0] : ''}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                  <p className="text-[10px] text-blue-700 font-extrabold uppercase">Session Time</p>
                  <p className="font-black text-[#2563EB] mt-0.5 tabular-nums">{session.sessionDuration}</p>
                  <p className="text-[9px] text-blue-600 font-semibold">Duration</p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-extrabold uppercase">Orders Entered</p>
                  <p className="font-black text-[#0D9488] mt-0.5 tabular-nums">{session.totalOrders}</p>
                  <p className="text-[9px] text-emerald-700 font-bold tabular-nums">{formatINR(session.totalRevenue)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div className="lg:col-span-2">
            <label className="label-modern">Search Details</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, action, STK-1016..."
                className="input-modern pr-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="label-modern">Sales Executive</label>
            <select
              value={userIdFilter}
              onChange={(e) => { setUserIdFilter(e.target.value); setPage(0); }}
              className="input-modern cursor-pointer"
            >
              <option value="ALL">All Executives</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-modern">Activity Type</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
              className="input-modern cursor-pointer"
            >
              <option value="ALL">All Activities</option>
              <option value="CREATE_SALE">Order Created</option>
              <option value="UPDATE_SALE">Order Edited</option>
              <option value="CLEAR_BALANCE">Balance Cleared</option>
              <option value="ADD_PAYMENT">Payment Recorded</option>
              <option value="DELETE_SALE">Order Deleted</option>
              <option value="EXCEL_IMPORT">Excel Bulk Import</option>
              <option value="LOGIN">Executive Login</option>
              <option value="LOGOUT">Executive Logout</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">Filter</button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActionFilter('ALL');
                setEntityFilter('ALL');
                setUserIdFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setPage(0);
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
            <span className="font-extrabold text-[#172554]">Timestamp Filter:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="input-modern py-1.5 px-2.5 text-xs w-auto bg-white"
          />
        </div>
      </div>

      {/* Audit Trails Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-black text-[#172554]">No audit trail records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Performed By</th>
                  <th>Activity Type</th>
                  <th>Details & Activity Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs whitespace-nowrap">
                      <p className="font-extrabold text-[#172554]">{new Date(log.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </td>

                    <td>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#172554] to-[#2563EB] text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {log.performedByName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-extrabold text-[#172554] text-xs">{log.performedByName}</span>
                      </div>
                    </td>

                    <td>{getActionBadge(log.action)}</td>

                    <td className="font-semibold text-slate-700 text-xs leading-relaxed max-w-xl">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 bg-[#EEF2F8]/60 border-t border-[#D5DFED] flex items-center justify-between text-xs text-slate-600">
            <span>Page <strong className="text-[#172554]">{page + 1}</strong> of <strong className="text-[#172554]">{totalPages}</strong> ({totalElements} entries)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
