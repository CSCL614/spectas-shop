import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  FileSpreadsheet,
  FileUp,
  FolderArchive,
  BarChart3,
  Users,
  ShieldCheck,
  UserCheck,
  FileText,
  ChevronRight,
  Sparkles,
  Glasses,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavAccent {
  iconBg: string;
  iconText: string;
  glow: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
      isActive
        ? 'bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0D9488] text-white shadow-lg shadow-blue-950/50 border border-white/25'
        : 'text-blue-100/85 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 hover:translate-x-0.5'
    }`;

  const renderItem = (
    to: string,
    label: string,
    Icon: React.ElementType,
    accent: NavAccent,
    end = false
  ) => (
    <NavLink to={to} end={end} onClick={onClose} className={navItemClass}>
      {({ isActive }) => (
        <>
          {/* Glowing Left Active Bar */}
          {isActive && (
            <motion.span
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-cyan-300 via-sky-300 to-teal-300 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
            />
          )}

          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-inner ring-1 ring-white/30 scale-105'
                  : `${accent.iconBg} ${accent.iconText} border border-white/10 group-hover:scale-110 ${accent.glow}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="truncate">{label}</span>
          </div>

          {isActive ? (
            <ChevronRight className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-cyan-300/80 transition-colors shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );

  const renderSectionHeader = (title: string, dotColor: string) => (
    <div className="px-2 pt-4 pb-1.5 first:pt-1 flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`} />
      <span className="text-[10px] font-black text-sky-200/70 uppercase tracking-[0.14em]">
        {title}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
    </div>
  );

  const sidebarContent = (
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Creative Ambient Aurora Glows inside Colored Sidebar */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 w-44 h-44 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-indigo-500/25 blur-3xl" />

      {/* Subtle Vertical Highlight Edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-cyan-400/30 via-blue-400/20 to-teal-400/30" />

      {/* Mini Portal Strip */}
      <div className="relative z-10 px-3 pt-3 pb-2">
        <div className="px-3 py-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-400 to-teal-300 text-[#0F172A] flex items-center justify-center shrink-0 shadow-sm">
              <Glasses className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white tracking-tight truncate leading-none" title="SRI SAI SMART OPTICALS SOFTWARE">
                SRI SAI SMART OPTICALS SOFTWARE
              </p>
              <p className="text-[9px] font-bold text-cyan-200/85 uppercase tracking-wider mt-0.5 truncate">
                {isAdmin ? 'Admin Command' : 'Sales Desk'}
              </p>
            </div>
          </div>
          <span
            title="System Connected"
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0"
          />
        </div>
      </div>

      {/* Scrollable Navigation Links */}
      <div className="relative z-10 px-3 pb-3 flex-1 space-y-0.5 overflow-y-auto sidebar-scroll">
        {renderSectionHeader('Main Workspace', 'bg-sky-400')}

        {renderItem('/dashboard', 'Dashboard Overview', LayoutDashboard, {
          iconBg: 'bg-sky-500/20',
          iconText: 'text-sky-300',
          glow: 'group-hover:bg-sky-500/30 group-hover:text-sky-200',
        })}
        {renderItem(
          '/sales',
          isAdmin ? 'All Optical Orders' : 'My Orders',
          ShoppingBag,
          {
            iconBg: 'bg-indigo-500/25',
            iconText: 'text-indigo-200',
            glow: 'group-hover:bg-indigo-500/35 group-hover:text-white',
          },
          true
        )}
        {renderItem('/sales/new', 'New Order Entry', PlusCircle, {
          iconBg: 'bg-emerald-500/20',
          iconText: 'text-emerald-300',
          glow: 'group-hover:bg-emerald-500/35 group-hover:text-emerald-200',
        })}
        {renderItem('/daily-statement', 'Daily Statement', FileText, {
          iconBg: 'bg-amber-500/20',
          iconText: 'text-amber-300',
          glow: 'group-hover:bg-amber-500/35 group-hover:text-amber-200',
        })}

        {renderSectionHeader('Spreadsheet Hub', 'bg-teal-400')}

        {renderItem('/excel/import', 'Bulk Excel Import', FileUp, {
          iconBg: 'bg-teal-500/20',
          iconText: 'text-teal-300',
          glow: 'group-hover:bg-teal-500/35 group-hover:text-teal-200',
        })}
        {renderItem('/excel/export', 'Filtered Export', FileSpreadsheet, {
          iconBg: 'bg-cyan-500/20',
          iconText: 'text-cyan-300',
          glow: 'group-hover:bg-cyan-500/35 group-hover:text-cyan-200',
        })}
        {isAdmin &&
          renderItem('/admin/excel-sheets', 'Excel Sheets', FolderArchive, {
            iconBg: 'bg-blue-500/25',
            iconText: 'text-blue-200',
            glow: 'group-hover:bg-blue-500/35 group-hover:text-white',
          })}

        {isAdmin && (
          <>
            {renderSectionHeader('Management & Logs', 'bg-violet-400')}

            {renderItem('/reports', 'Business Intelligence', BarChart3, {
              iconBg: 'bg-violet-500/25',
              iconText: 'text-violet-200',
              glow: 'group-hover:bg-violet-500/35 group-hover:text-white',
            })}
            {renderItem('/admin/users', 'Admin & Accounts', Users, {
              iconBg: 'bg-rose-500/20',
              iconText: 'text-rose-300',
              glow: 'group-hover:bg-rose-500/35 group-hover:text-rose-200',
            })}
            {renderItem('/admin/audit-logs', 'Audit Trails', ShieldCheck, {
              iconBg: 'bg-orange-500/20',
              iconText: 'text-orange-300',
              glow: 'group-hover:bg-orange-500/35 group-hover:text-orange-200',
            })}
          </>
        )}

        {renderSectionHeader('Account', 'bg-cyan-300')}

        {renderItem('/profile', 'Profile & Security', UserCheck, {
          iconBg: 'bg-slate-400/20',
          iconText: 'text-slate-200',
          glow: 'group-hover:bg-slate-400/30 group-hover:text-white',
        })}
      </div>

      {/* Creative Footer Glass Card */}
      <div className="relative z-10 p-3 pt-2 border-t border-white/10">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-white/12 via-blue-500/15 to-teal-500/15 backdrop-blur-md border border-white/15 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-300">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>SRI SAI SMART OPTICALS</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
              LIVE
            </span>
          </div>
          <p className="text-[10px] font-semibold text-blue-100/90 mt-1 leading-snug">
            A Clear Vision for Better Business
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Colored Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-gradient-to-b from-[#0F172A] via-[#172554] to-[#113054] flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shadow-[6px_0_28px_-6px_rgba(15,23,42,0.35)]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Colored Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="fixed top-16 bottom-0 left-0 w-64 bg-gradient-to-b from-[#0F172A] via-[#172554] to-[#113054] border-r border-white/15 shadow-2xl flex flex-col z-50 select-none"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
