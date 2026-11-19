import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Glasses,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  X,
  CheckCircle2,
  Activity,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import heroSpectacles from '../assets/spectacles-hero-3d.jpg';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username, password);
      toast.success('Welcome to SRI SAI SMART OPTICALS SOFTWARE!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid username or password (Check if backend server is running)';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#020617] text-slate-100 selection:bg-[#2563EB] selection:text-white lg:h-screen lg:overflow-hidden">
      {/* LEFT SIDE - LUXURY OPTICAL BRANDING & ANIMATED VISUALS (~55%) */}
      <div className="relative w-full lg:w-[55%] min-h-[500px] lg:h-full bg-gradient-to-br from-[#020617] via-[#0b193d] to-[#0f2957] p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-blue-500/20">
        {/* Animated optical ambient orbs */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.16, 0.25, 0.16] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -left-24 w-[34rem] h-[34rem] bg-blue-600 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.14, 0.22, 0.14] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-4 right-4 w-[28rem] h-[28rem] bg-teal-500 rounded-full blur-[110px] pointer-events-none"
        />

        {/* Subtle optical concentric rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute -top-28 -right-28 w-[26rem] h-[26rem] rounded-full border border-dashed border-blue-400/15"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute -bottom-32 -left-20 w-[24rem] h-[24rem] rounded-full border border-teal-400/15"
        />

        {/* Top Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.06 }}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-indigo-500 to-[#0D9488] text-white shadow-lg shadow-blue-500/35 ring-2 ring-white/20"
            >
              <Glasses className="w-6 h-6" />
            </motion.div>
            <div>
              <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-1.5">
                SRI SAI{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                  SMART OPTICALS SOFTWARE
                </span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300/90 block mt-0.5">
                A Clear Vision for Better Business
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-blue-100 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Enterprise Suite</span>
          </span>
        </motion.div>

        {/* Center 3D Visual */}
        <div className="relative z-10 my-auto py-5 sm:py-6 flex flex-col items-start max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Next-Generation Optical ERP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
              A CLEAR VISION. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
                FOR BETTER BUSINESS.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-medium max-w-lg">
              Manage patient orders, track payments, monitor lab deliveries and scale your optical store with one intelligent platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.18 }}
            className="relative w-full max-w-lg mt-6 self-center lg:self-start"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-teal-400/20 to-indigo-500/30 rounded-3xl blur-xl pointer-events-none" />

            <motion.div
              animate={{
                y: [-5, 5, -5],
                rotate: [-0.4, 0.4, -0.4],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(2,6,23,0.7)] border border-white/15 ring-1 ring-blue-400/20"
            >
              <img
                src={heroSpectacles || '/spectacles-hero-3d.jpg'}
                alt="SRI SAI SMART OPTICALS SOFTWARE 3D Eyewear Frame"
                className="w-full h-auto max-h-[245px] sm:max-h-[275px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/85 via-transparent to-white/5 pointer-events-none" />

              {/* Floating Optical KPI Strip inside Hero */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#172554]/85 backdrop-blur-md border border-blue-400/30 text-[10px] font-bold text-blue-100">
                  <Activity className="w-3 h-3 text-teal-300" />
                  Live Analytics & Ledger
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#172554]/85 backdrop-blur-md border border-teal-400/30 text-[10px] font-bold text-teal-200">
                  <BarChart3 className="w-3 h-3 text-blue-300" />
                  STK- Smart Sequencing
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-1 pt-4 border-t border-white/10">
          <span>© {new Date().getFullYear()} SRI SAI SMART OPTICALS SOFTWARE • A Clear Vision for Better Business</span>
          <span className="text-teal-300/80 font-mono text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cloud ERP Active
          </span>
        </div>
      </div>

      {/* RIGHT SIDE - HIGH-CONTRAST ELEVATED LOGIN CARD (~45%) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#060f28] via-[#0b193d] to-[#08132e] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Glowing Gradient Outer Frame */}
          <div className="p-[2px] rounded-[26px] bg-gradient-to-br from-[#2563EB] via-indigo-400/70 to-[#0D9488] shadow-[0_30px_70px_-15px_rgba(2,6,23,0.75)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[24px] p-8 sm:p-9 text-[#172554] relative overflow-hidden"
            >
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <CheckCircle2 className="w-3 h-3 text-[#0D9488]" />
                    Portal Authentication
                  </span>
                  <span className="text-[10px] font-black text-slate-500 tracking-wider">SRI SAI SMART OPTICALS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#172554] tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  A Clear Vision for Better Business • Sign In
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-5 p-3.5 rounded-2xl bg-rose-50 border-[1.5px] border-rose-200 flex items-center space-x-3 text-rose-700 text-xs font-bold shadow-xs"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#172554] uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#EEF2F8]/65 hover:bg-[#EEF2F8] focus:bg-white border-[1.5px] border-[#D5DFED] rounded-xl text-xs font-bold text-[#172554] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 transition-all"
                      placeholder="Enter username (e.g. admin)"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold text-[#172554] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-[#2563EB] hover:text-[#0D9488] hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#EEF2F8]/65 hover:bg-[#EEF2F8] focus:bg-white border-[1.5px] border-[#D5DFED] rounded-xl text-xs font-bold text-[#172554] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#2563EB] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-[#D5DFED]"
                    />
                    <span className="text-xs font-bold text-slate-600">Remember my session</span>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] hover:shadow-xl hover:shadow-blue-500/35 shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to SRI SAI SMART OPTICALS SOFTWARE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              {/* Quick Demo Credentials */}
              <div className="mt-7 pt-5 border-t border-[#D5DFED]">
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2.5 text-center flex items-center justify-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Sign-In Credentials</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => fillQuickLogin('admin', 'Admin@123')}
                    className="py-2.5 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-[#2563EB] border-[1.5px] border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition-colors text-center shadow-xs"
                  >
                    👑 Admin
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => fillQuickLogin('salesperson1', 'Sales@123')}
                    className="py-2.5 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-[#2563EB] border-[1.5px] border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition-colors text-center shadow-xs"
                  >
                    👓 Sales 1
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => fillQuickLogin('salesperson2', 'Sales@123')}
                    className="py-2.5 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-[#2563EB] border-[1.5px] border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition-colors text-center shadow-xs"
                  >
                    👓 Sales 2
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden text-[#172554] shadow-2xl border-2 border-[#D5DFED] relative"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488]" />
              <div className="p-6">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="absolute top-5 right-4 text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2.5 text-[#2563EB] mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#172554]">Forgot Password Assistance</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  SRI SAI SMART OPTICALS SOFTWARE uses centralized RBAC security. Passwords can be reset directly by the Shop Administrator under <strong>My Profile & Security</strong> or <strong>Admin & Accounts</strong>.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForgotModal(false)}
                  className="mt-5 w-full btn-primary py-2.5 text-xs rounded-xl"
                >
                  Understood
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
