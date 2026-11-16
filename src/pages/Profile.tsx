import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, adminApi } from '../api/services';
import type { UserResponse } from '../types';
import { 
  User, 
  Lock, 
  KeyRound, 
  Shield, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Mail, 
  Sparkles,
  Fingerprint,
  Award,
  Users,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Personal Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Show / Hide password toggles for personal form
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Admin Sales Executive Password Reset State
  const [salespersons, setSalespersons] = useState<UserResponse[]>([]);
  const [selectedSalespersonId, setSelectedSalespersonId] = useState('');
  const [spNewPassword, setSpNewPassword] = useState('');
  const [spConfirmPassword, setSpConfirmPassword] = useState('');
  const [showSpNew, setShowSpNew] = useState(false);
  const [showSpConfirm, setShowSpConfirm] = useState(false);
  const [spResetLoading, setSpResetLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getSalespersons()
        .then((res) => {
          setSalespersons(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedSalespersonId(res.data.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  // Password Strength Calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'None', color: 'bg-slate-200' };
    }
  };

  const strength = calculateStrength(newPassword);
  const spStrength = calculateStrength(spNewPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      setLoading(true);
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Security credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetSalespersonPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalespersonId) {
      return toast.error('Please select a Sales Executive');
    }
    if (spNewPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (spNewPassword !== spConfirmPassword) {
      return toast.error('New passwords do not match');
    }

    const targetUser = salespersons.find((s) => s.id === selectedSalespersonId);

    try {
      setSpResetLoading(true);
      await adminApi.resetPassword(selectedSalespersonId, spNewPassword);
      toast.success(
        `Password for ${targetUser ? targetUser.fullName : 'Sales Executive'} reset successfully! Active session invalidated.`
      );
      setSpNewPassword('');
      setSpConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset Sales Executive password');
    } finally {
      setSpResetLoading(false);
    }
  };

  const selectedSalesperson = salespersons.find((s) => s.id === selectedSalespersonId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0d9488] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 border border-blue-800/40">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 shadow-inner">
            <Fingerprint className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                Identity & Access
              </span>
              <span className="text-blue-200 text-xs font-mono">• Active Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Profile & Security Credentials
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
              Manage your personal staff profile, role permissions, and cryptographically hashed login credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Elevated Profile Card */}
        <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)] flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0d9488] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 border-2 border-white">
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-lg font-black text-[#172554] tracking-tight">{user?.fullName}</h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">@{user?.username}</p>

          <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
            <Award className="w-3.5 h-3.5" />
            <span>{user?.role === 'ADMIN' ? 'Master Administrator' : 'Sales Executive'}</span>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-medium truncate">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Stateless JWT Protected</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="font-medium">Bcrypt Password Hashing</span>
            </div>
          </div>
        </div>

        {/* 3. Personal Password Reset Form Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)]">
          <div className="flex items-center space-x-2 text-sm font-bold text-[#172554] pb-3 mb-5 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-[#2563EB]" />
            <span>Update Personal Account Password</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Strength:</span>
                    <span className={`capitalize ${strength.label === 'Strong' ? 'text-emerald-600' : strength.label === 'Good' ? 'text-blue-600' : 'text-amber-600'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
                  placeholder="Repeat new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0d9488] hover:from-[#1d4ed8] hover:to-[#0f766e] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Updating Credentials...' : 'Save & Update Password'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. ADMIN-ONLY SECTION: MANAGE SALES EXECUTIVE PASSWORDS */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(23,37,84,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-[#172554] tracking-tight">
                    Manage Sales Executive Passwords
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a Sales Executive staff account and reset their access credentials.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAdminResetSalespersonPassword} className="space-y-5">
            {/* Sales Executive Selector */}
            <div>
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                Select Sales Executive <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSalespersonId}
                onChange={(e) => setSelectedSalespersonId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
                required
              >
                {salespersons.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.fullName} (@{sp.username}) — {sp.email}
                  </option>
                ))}
              </select>
            </div>

            {selectedSalesperson && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-800">{selectedSalesperson.fullName}</span>
                  <span className="text-slate-400 font-mono ml-2">@{selectedSalesperson.username}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedSalesperson.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedSalesperson.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedSalesperson.active ? 'Account Active' : 'Deactivated'}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                  Enter New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSpNew ? 'text' : 'password'}
                    value={spNewPassword}
                    onChange={(e) => setSpNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpNew(!showSpNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showSpNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {spNewPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase">Strength:</span>
                      <span className={`capitalize ${spStrength.label === 'Strong' ? 'text-emerald-600' : spStrength.label === 'Good' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {spStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${spStrength.color}`}
                        style={{ width: `${spStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSpConfirm ? 'text' : 'password'}
                    value={spConfirmPassword}
                    onChange={(e) => setSpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF3FA]/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
                    placeholder="Repeat new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpConfirm(!showSpConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showSpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={spResetLoading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{spResetLoading ? 'Updating Credentials...' : 'Save Updated Sales Executive Password'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};
