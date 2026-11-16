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
  MessageSquareQuote,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group relative ${
      isActive
        ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
        : 'text-[#172554] hover:bg-[#EEF2F8] hover:text-[#2563EB] border border-transparent hover:border-[#D5DFED]'
    }`;

  const iconClass = (isActive: boolean) =>
    `w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#2563EB]'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-[#D5DFED] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shadow-[2px_0_16px_-4px_rgba(23,37,84,0.04)]">
      <div className="p-3.5 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Main Workspace
        </div>

        <NavLink to="/dashboard" className={navItemClass}>
          {({ isActive }) => (
            <>
              <LayoutDashboard className={iconClass(isActive)} />
              <span>Dashboard Overview</span>
            </>
          )}
        </NavLink>

        <NavLink to="/sales" className={navItemClass}>
          {({ isActive }) => (
            <>
              <ShoppingBag className={iconClass(isActive)} />
              <span>{isAdmin ? 'All Optical Orders' : 'My Orders'}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/sales/new" className={navItemClass}>
          {({ isActive }) => (
            <>
              <PlusCircle className={iconClass(isActive)} />
              <span>New Order Entry</span>
            </>
          )}
        </NavLink>

        <NavLink to="/daily-statement" className={navItemClass}>
          {({ isActive }) => (
            <>
              <FileText className={iconClass(isActive)} />
              <span>Daily Statement</span>
            </>
          )}
        </NavLink>

        <NavLink to="/feedback" className={navItemClass}>
          {({ isActive }) => (
            <>
              <MessageSquareQuote className={iconClass(isActive)} />
              <span>Customer Feedback</span>
            </>
          )}
        </NavLink>

        <div className="pt-4 px-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Spreadsheet Operations
        </div>

        <NavLink to="/excel/import" className={navItemClass}>
          {({ isActive }) => (
            <>
              <FileUp className={iconClass(isActive)} />
              <span>Bulk Excel Import</span>
            </>
          )}
        </NavLink>

        <NavLink to="/excel/export" className={navItemClass}>
          {({ isActive }) => (
            <>
              <FileSpreadsheet className={iconClass(isActive)} />
              <span>Filtered Excel Export</span>
            </>
          )}
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin/excel-sheets" className={navItemClass}>
            {({ isActive }) => (
              <>
                <FolderArchive className={iconClass(isActive)} />
                <span>Excel Sheets</span>
              </>
            )}
          </NavLink>
        )}

        {isAdmin && (
          <>
            <div className="pt-4 px-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Management & Logs
            </div>

            <NavLink to="/reports" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <BarChart3 className={iconClass(isActive)} />
                  <span>Business Intelligence</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/users" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <Users className={iconClass(isActive)} />
                  <span>Admin & Accounts</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/audit-logs" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <ShieldCheck className={iconClass(isActive)} />
                  <span>Audit Trails</span>
                </>
              )}
            </NavLink>
          </>
        )}

        <div className="pt-4 px-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Settings
        </div>

        <NavLink to="/profile" className={navItemClass}>
          {({ isActive }) => (
            <>
              <UserCheck className={iconClass(isActive)} />
              <span>My Profile & Security</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
