import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, adminApi } from '../api/services';
import type { UserResponse } from '../types';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Sparkles,
  Fingerprint,
  Award,
  ShieldAlert,
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
        return { score: 75, label: 'Good', color: 'bg-[#2563EB]' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-[#0D9488]' };
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="page-banner p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -right-12 -bottom-12 w-52 h-52 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10 flex items-start sm:items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-teal-200 shadow-inner">
            <Fingerprint className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-100 border border-teal-300/35">
                Identity & Access
              </span>
              <span className="text-blue-200 text-xs font-mono font-bold">• Active Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              Profile & Security Credentials
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl font-medium">
              {isAdmin
                ? 'Manage your personal staff profile, role permissions, and cryptographically hashed login credentials.'
                : 'View your staff profile details, assigned role permissions, and account security policy.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Elevated Profile Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="md:col-span-1 card-premium p-6 flex flex-col items-center text-center"
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#172554] via-[#2563EB] to-[#0D9488] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white">
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm" title="Active">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-lg font-black text-[#172554] tracking-tight">{user?.fullName}</h2>
          <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">@{user?.username}</p>

          <div className="mt-3 badge-partial">
            <Award className="w-3.5 h-3.5" />
            <span>{user?.role === 'ADMIN' ? 'Master Administrator' : 'Sales Executive'}</span>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-[#D5DFED] space-y-3 text-left text-xs">
            <div className="flex items-center space-x-2.5 text-[#172554] font-semibold">
              <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="truncate">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-[#172554] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>Stateless JWT Protected</span>
            </div>
            <div className="flex items-center space-x-2.5 text-[#172554] font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Bcrypt Password Hashing</span>
            </div>
          </div>
        </motion.div>

        {/* 3. Personal Password Reset Form Card (ADMIN ONLY) or Security Policy Notice (SALESPERSON) */}
        {isAdmin ? (
          <div className="md:col-span-2 card-premium p-6 sm:p-8">
            <div className="flex items-center space-x-2.5 text-sm font-black text-[#172554] pb-3.5 mb-5 border-b border-[#D5DFED]">
              <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                <KeyRound className="w-4 h-4" />
              </span>
              <span>Update Personal Account Password</span>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="label-modern">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-modern pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] p-1"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-modern">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-modern pr-10"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] p-1"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-extrabold">
                      <span className="text-slate-500 uppercase">Strength:</span>
                      <span className={strength.label === 'Strong' ? 'text-[#0D9488]' : strength.label === 'Good' ? 'text-[#2563EB]' : 'text-amber-600'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EEF2F8] rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label-modern">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-modern pr-10"
                    placeholder="Repeat new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] p-1"
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
                  className="btn-primary px-6 py-2.5 text-xs space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Credentials...' : 'Save & Update Password'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        ) : (
          <div className="md:col-span-2 card-premium p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 text-sm font-black text-[#172554] pb-3.5 mb-5 border-b border-[#D5DFED]">
                <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Lock className="w-4 h-4" />
                </span>
                <span>Password & Account Security Policy</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <p className="font-black text-[#172554]">Admin-Managed Credentials</p>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    For security and store governance, password updates are managed exclusively by the{' '}
                    <strong className="text-[#172554]">Sri Sai Opticals Master Administrator</strong>.
                    If you need your login password changed or reset, please contact your administrator.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#EEF2F8]/80 border border-[#D5DFED]">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Assigned Role</span>
                  <p className="font-black text-[#172554] mt-1">Sales Executive</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#EEF2F8]/80 border border-[#D5DFED]">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Account Status</span>
                  <p className="font-black text-[#0D9488] mt-1">Active & Verified</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ADMIN-ONLY SECTION: MANAGE SALES EXECUTIVE PASSWORDS */}
      {isAdmin && (
        <div className="card-premium p-6 sm:p-8 border-t-4 border-t-amber-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-[#D5DFED]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-[#172554] tracking-tight">
                    Manage Sales Executive Passwords
                  </h3>
                  <span className="badge-pending">Admin Exclusive</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a Sales Executive staff account and reset their access credentials. Active sessions are automatically invalidated.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAdminResetSalespersonPassword} className="space-y-5">
            <div>
              <label className="label-modern">
                Select Sales Executive <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSalespersonId}
                onChange={(e) => setSelectedSalespersonId(e.target.value)}
                className="input-modern font-bold cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-[#EEF2F8]/80 border-[1.5px] border-[#D5DFED] flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-[#172554]">{selectedSalesperson.fullName}</span>
                  <span className="text-slate-500 font-mono font-bold ml-2">@{selectedSalesperson.username}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{selectedSalesperson.email}</p>
                </div>
                <span className={selectedSalesperson.active ? 'badge-delivered' : 'badge-overdue'}>
                  {selectedSalesperson.active ? 'Account Active' : 'Deactivated'}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-modern">
                  Enter New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSpNew ? 'text' : 'password'}
                    value={spNewPassword}
                    onChange={(e) => setSpNewPassword(e.target.value)}
                    className="input-modern pr-10"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpNew(!showSpNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] p-1"
                  >
                    {showSpNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {spNewPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-extrabold">
                      <span className="text-slate-500 uppercase">Strength:</span>
                      <span className={spStrength.label === 'Strong' ? 'text-[#0D9488]' : spStrength.label === 'Good' ? 'text-[#2563EB]' : 'text-amber-600'}>
                        {spStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EEF2F8] rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${spStrength.color}`} style={{ width: `${spStrength.score}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label-modern">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSpConfirm ? 'text' : 'password'}
                    value={spConfirmPassword}
                    onChange={(e) => setSpConfirmPassword(e.target.value)}
                    className="input-modern pr-10"
                    placeholder="Repeat new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpConfirm(!showSpConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] p-1"
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
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{spResetLoading ? 'Updating Credentials...' : 'Save Updated Sales Executive Password'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
