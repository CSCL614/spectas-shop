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
  X
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
      toast.success('Welcome to SPECTAS SHOP ERP!');
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
      {/* LEFT SIDE - LUXURY BRANDING & 3D SPECTACLES SECTION (~55%) */}
      <div className="relative w-full lg:w-[55%] min-h-[480px] lg:h-full bg-gradient-to-br from-[#020617] via-[#071330] to-[#0a1c4d] p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-blue-900/30">
        <div className="absolute top-1/4 -left-20 w-[32rem] h-[32rem] bg-blue-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Glasses className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                SPECTAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">SHOP</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300/75 block">
                Smart Optical Business Management
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Enterprise Suite</span>
          </span>
        </motion.div>

        {/* Center 3D Visual */}
        <div className="relative z-10 my-auto py-6 sm:py-8 flex flex-col items-start max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Next-Generation Optical ERP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
              SMARTER VISION. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-200">
                SMARTER BUSINESS.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-normal max-w-lg">
              Manage patient orders, track payments, monitor deliveries and scale your optical store with one intelligent platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-lg mt-6 sm:mt-8 self-center lg:self-start"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-teal-500/10 to-indigo-600/20 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-0.6, 0.6, -0.6],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(2,6,23,0.6)] border border-white/10"
            >
              <img
                src={heroSpectacles || '/spectacles-hero-3d.jpg'}
                alt="SPECTAS SHOP 3D Eyewear Frame"
                className="w-full h-auto max-h-[260px] sm:max-h-[300px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-white/5 pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400/80 flex flex-col sm:flex-row justify-between gap-1 pt-4 border-t border-white/[0.08]">
          <span>© {new Date().getFullYear()} SPECTAS SHOP • Enterprise Optical Management</span>
          <span className="text-blue-300/70 font-mono text-[10px]">Cloud ERP v2.4 Active</span>
        </div>
      </div>

      {/* RIGHT SIDE - HIGH-CONTRAST LOGIN CARD (~45%) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#050b1e] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(2,6,23,0.45)] border-2 border-[#D5DFED] text-slate-900"
          >
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Portal Authentication
                </span>
                <span className="text-xs font-bold text-slate-400">SPECTAS SHOP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172554] tracking-tight">
                Welcome Back
              </h2>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-[#172554] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#EEF2F8]/60 focus:bg-white border-2 border-[#D5DFED] rounded-xl text-xs font-bold text-[#172554] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 transition-all"
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
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#EEF2F8]/60 focus:bg-white border-2 border-[#D5DFED] rounded-xl text-xs font-bold text-[#172554] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
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
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-600">Remember my session</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#2563EB] via-indigo-600 to-[#0D9488] hover:from-[#1d4ed8] hover:to-[#0f766e] shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Spectas Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-7 pt-5 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2.5 text-center flex items-center justify-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Sign-In Credentials</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickLogin('admin', 'Admin@123')}
                  className="py-2 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-300 border border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition active:scale-95 text-center shadow-xs"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickLogin('salesperson1', 'Sales@123')}
                  className="py-2 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-300 border border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition active:scale-95 text-center shadow-xs"
                >
                  👓 Sales 1
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickLogin('salesperson2', 'Sales@123')}
                  className="py-2 px-2 bg-[#EEF2F8] hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-300 border border-[#D5DFED] rounded-xl text-[11px] font-black text-[#172554] transition active:scale-95 text-center shadow-xs"
                >
                  👓 Sales 2
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-[#2563EB] mb-3">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Forgot Password Assistance</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                SPECTAS SHOP uses centralized RBAC management. Passwords can be reset directly by the Shop Administrator under the <strong>Account Management</strong> module.
              </p>
              <button
                onClick={() => setShowForgotModal(false)}
                className="mt-5 w-full btn-primary py-2.5 text-xs rounded-xl"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
