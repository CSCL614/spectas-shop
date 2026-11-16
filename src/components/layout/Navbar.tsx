import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Glasses, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
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

  return (
    <header className="h-16 glass-header flex items-center justify-between px-4 sm:px-6">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3.5">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <Glasses className="w-5 h-5 transition-transform group-hover:rotate-12 duration-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-[#172554] tracking-tight text-lg">
                SPECTAS<span className="text-[#2563EB]">SHOP</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-50 text-[#2563EB] border border-blue-200">
                {user?.role === 'ADMIN' ? '👑 Admin Portal' : '💼 Sales Portal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
              Optical Order Management & ERP System
            </p>
          </div>
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick New Sale Action */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/sales/new')}
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0D9488] text-white shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </motion.button>

        {/* User Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2.5 p-1.5 px-2.5 rounded-xl bg-[#EEF2F8]/70 hover:bg-[#EEF2F8] border border-[#D5DFED] transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {getInitials(user?.fullName)}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-black text-[#172554] leading-tight">{user?.fullName}</p>
            <p className="text-[10px] text-slate-500 font-semibold capitalize">
              {user?.role === 'ADMIN' ? 'Master Admin' : 'Sales Specialist'}
            </p>
          </div>
        </motion.div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
