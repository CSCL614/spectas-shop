import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Glasses, Plus, Menu, X, Shield, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

/* Crisp custom optical frame SVGs for the subtle Admin marquee */
const WayfarerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-3.5' }) => (
  <svg viewBox="0 0 48 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M2 5.5H20.5L19 14.5C18.6 16.5 16.9 18 14.8 18H8.2C6 18 4.2 16.4 3.9 14.2L2 5.5Z"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path
      d="M46 5.5H27.5L29 14.5C29.4 16.5 31.1 18 33.2 18H39.8C42 18 43.8 16.4 44.1 14.2L46 5.5Z"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path d="M20.5 7.5C22.2 6.2 25.8 6.2 27.5 7.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

const RoundFrameIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-3.5' }) => (
  <svg viewBox="0 0 48 20" fill="none" className={className} aria-hidden="true">
    <circle cx="13" cy="11" r="6.8" stroke="currentColor" strokeWidth="2" />
    <circle cx="35" cy="11" r="6.8" stroke="currentColor" strokeWidth="2" />
    <path d="M20 10C22 8.2 26 8.2 28 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2.5 8.5L6.2 9.5M45.5 8.5L41.8 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AviatorIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-3.5' }) => (
  <svg viewBox="0 0 48 20" fill="none" className={className} aria-hidden="true">
    <path d="M4 5H44" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M4.5 7.2C4.5 7.2 5.5 17.5 12.8 17.5C19 17.5 21.2 12.2 21.2 8.5C21.2 7.2 20 6.8 18.5 6.8H4.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M43.5 7.2C43.5 7.2 42.5 17.5 35.2 17.5C29 17.5 26.8 12.2 26.8 8.5C26.8 7.2 28 6.8 29.5 6.8H43.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path d="M21.2 9.2H26.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

const CatEyeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-3.5' }) => (
  <svg viewBox="0 0 48 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M2.5 4.5L19.5 7.5C20.5 12 18.2 17 12.5 17C7.2 17 4.2 12.8 2.5 4.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M45.5 4.5L28.5 7.5C27.5 12 29.8 17 35.5 17C40.8 17 43.8 12.8 45.5 4.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M19.5 8.5C21.8 7 26.2 7 28.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MARQUEE_ITEMS = [
  { id: 'wayfarer', Icon: WayfarerIcon, label: 'Signature Frames', color: 'text-[#2563EB]' },
  { id: 'round', Icon: RoundFrameIcon, label: 'Anti-Glare Precision', color: 'text-[#0D9488]' },
  { id: 'aviator', Icon: AviatorIcon, label: 'Sri Sai Opticals Lab', color: 'text-[#172554]' },
  { id: 'cateye', Icon: CatEyeIcon, label: 'Blue-Cut Eyewear', color: 'text-indigo-600' },
  { id: 'wayfarer2', Icon: WayfarerIcon, label: 'Smart Optical ERP', color: 'text-[#0D9488]' },
  { id: 'round2', Icon: RoundFrameIcon, label: 'Crafted Clarity', color: 'text-[#2563EB]' },
];

const SpectaclesMarqueeTrack: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="spectacles-marquee-mask w-full overflow-hidden select-none" aria-hidden="true">
    <div className="spectacles-marquee-track">
      {[0, 1].map((dup) => (
        <div key={dup} className={`flex items-center shrink-0 ${compact ? 'gap-5 pr-5' : 'gap-7 pr-7'}`}>
          {MARQUEE_ITEMS.map(({ id, Icon, label, color }) => (
            <div key={`${dup}-${id}`} className="inline-flex items-center gap-2 shrink-0">
              <span className={`${color} opacity-85`}>
                <Icon className={compact ? 'w-5 h-3' : 'w-6 h-3.5'} />
              </span>
              <span
                className={`${
                  compact ? 'text-[10px]' : 'text-[11px]'
                } font-bold tracking-wide text-slate-500 whitespace-nowrap`}
              >
                {label}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#2563EB]/35 ml-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

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
    <header className="sticky top-0 z-40 glass-header">
      {/* Subtle Top Optical Brand Accent Line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#0D9488]" />

      {/* Main 64px Navbar Row */}
      <div className="h-16 flex items-center justify-between gap-3 px-4 sm:px-5">
        {/* Left: Mobile Menu Button + Brand & Identity */}
        <div className="flex items-center space-x-3 shrink-0">
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
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F172A] via-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-100 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200 shrink-0">
              <Glasses className="w-5 h-5 transition-transform group-hover:rotate-12 duration-300" />
            </div>
            <div>
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
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block mt-0.5 whitespace-nowrap">
                Optical Order Management & ERP Suite
              </p>
            </div>
          </motion.div>
        </div>

        {/* Center (Admin Only, Desktop & Tablet): Subtle Animated Spectacles Scrolling Marquee */}
        {isAdmin && (
          <div className="hidden lg:flex flex-1 min-w-0 max-w-xl mx-2 items-center h-9 px-2 rounded-full bg-gradient-to-r from-[#EEF3FA]/90 via-white/95 to-[#E7F5F4]/90 border border-[#CFDCEB]/90 shadow-inner overflow-hidden">
            <SpectaclesMarqueeTrack />
          </div>
        )}

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
              <p className="text-xs font-black text-[#0F172A] leading-tight whitespace-nowrap">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">
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
      </div>

      {/* Tablet & Mobile Subtle Spectacles Strip (Admin Only — never crowds navbar buttons) */}
      {isAdmin && (
        <div className="lg:hidden h-7 px-3 flex items-center bg-gradient-to-r from-[#EEF3FA]/90 via-white/95 to-[#E7F5F4]/90 border-t border-[#D5DFED]/80 overflow-hidden">
          <SpectaclesMarqueeTrack compact />
        </div>
      )}
    </header>
  );
};
