import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Glasses, Plus, Menu, X, Shield, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="h-16 sticky top-0 z-40 glass-header flex items-center justify-between px-4 sm:px-5">
      {/* Subtle Top Optical Brand Accent Line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#0D9488]" />

      {/* Left: Mobile Menu Button + Brand & Identity */}
      <div className="flex items-center space-x-3 min-w-0">
        {onMenuToggle && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onMenuToggle}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-xl bg-[#172554] text-white shadow-sm hover:bg-[#2563EB] transition-colors shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F172A] via-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-100 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200 shrink-0">
            <Glasses className="w-5 h-5 transition-transform group-hover:rotate-12 duration-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-black text-[#0F172A] tracking-tight text-base sm:text-lg leading-none whitespace-nowrap">
                SRI SAI{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#0D9488]">
                  OPTICALS
                </span>
              </span>
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border shadow-2xs whitespace-nowrap ${
                  isAdmin
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-[#172554] border-blue-200'
                    : 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800 border-teal-200'
                }`}
              >
                {isAdmin ? (
                  <Shield className="w-3 h-3 text-[#2563EB]" />
                ) : (
                  <Briefcase className="w-3 h-3 text-[#0D9488]" />
                )}
                <span>{isAdmin ? 'Admin Portal' : 'Sales Portal'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold hidden sm:block mt-0.5 truncate">
              Optical Order Management & ERP Suite
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
        {/* Quick New Order Action */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/sales/new')}
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-extrabold px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] via-blue-600 to-[#0D9488] text-white shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </motion.button>

        {/* User Profile Pill */}
        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2.5 p-1 pr-3 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF3FA] border-[1.5px] border-[#CFDCEB] hover:border-[#2563EB]/60 shadow-2xs transition-all cursor-pointer"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F172A] via-[#2563EB] to-[#0D9488] text-white font-black text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.fullName)}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-black text-[#0F172A] leading-tight">{user?.fullName}</p>
            <p className="text-[10px] text-slate-500 font-bold">
              {isAdmin ? 'Master Admin' : 'Sales Executive'}
            </p>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleLogout}
          title="Sign Out"
          className="w-9 h-9 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border-[1.5px] border-[#CFDCEB] hover:border-rose-300 rounded-xl shadow-2xs transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
};
