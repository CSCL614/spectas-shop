import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { UserResponse, AuditLog } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/helpers';
import {
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SALESPERSON'>('ALL');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'SALESPERSON'>('ADMIN');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit User Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'SALESPERSON'>('ADMIN');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Change Password Modal
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UserResponse | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await adminApi.getAuditLogs({ page: 0, size: 50 });
      setAuditLogs(res.data.data.content);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleToggleStatus = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error('You cannot deactivate your own logged-in account');
      return;
    }

    try {
      await adminApi.toggleStatus(id);
      toast.success(`Account status updated for ${name}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleDeleteUser = async (userToDelete: UserResponse) => {
    if (userToDelete.id === currentUser?.id) {
      toast.error('Security Safeguard: You cannot delete your currently logged-in account');
      return;
    }

    const adminCount = users.filter((u) => u.role === 'ADMIN' && u.active).length;
    if (userToDelete.role === 'ADMIN' && adminCount <= 1) {
      toast.error('Security Safeguard: Cannot delete the last active Admin account');
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to permanently delete account "${userToDelete.fullName}" (${userToDelete.username})?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.fullName} deleted successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim() || !newEmail.trim() || !newPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmittingCreate(true);
      await adminApi.createUser({
        fullName: newFullName.trim(),
        username: newUsername.trim().toLowerCase(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
      });

      toast.success(`Account for ${newFullName} created successfully!`);
      setIsCreateOpen(false);
      setNewFullName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewConfirmPassword('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSubmittingEdit(true);
      await adminApi.updateUser(editingUser.id, {
        fullName: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
      });

      toast.success('Account updated successfully!');
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update account');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (newResetPassword !== confirmResetPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newResetPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmittingPassword(true);
      await adminApi.resetPassword(passwordUser.id, newResetPassword);
      toast.success(`Password for ${passwordUser.fullName} updated successfully!`);
      setIsPasswordOpen(false);
      setPasswordUser(null);
      setNewResetPassword('');
      setConfirmResetPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-indigo-600">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#172554] via-indigo-600 to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#172554] tracking-tight">Admin & Staff Account Management</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Enterprise role-based access control, security policies, password resets, and user lifecycle.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex bg-[#EEF2F8] p-1 rounded-xl border border-[#D5DFED]">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeTab === 'users' ? 'bg-white text-[#172554] shadow-sm' : 'text-slate-500 hover:text-[#172554]'
              }`}
            >
              Accounts ({users.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary py-2 px-4 text-xs space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </motion.button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'ADMIN', 'SALESPERSON'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${
                  roleFilter === role
                    ? 'bg-[#172554] text-white border-[#172554] shadow-md'
                    : 'bg-white border-[#D5DFED] text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role === 'ADMIN' ? 'Administrators' : 'Sales Executives'}
              </button>
            ))}
          </div>

          {/* Accounts Table */}
          <div className="card-premium overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Username</th>
                      <th>System Role</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm ${
                                u.role === 'ADMIN'
                                  ? 'bg-gradient-to-tr from-[#172554] to-indigo-600'
                                  : 'bg-gradient-to-tr from-[#2563EB] to-[#0D9488]'
                              }`}>
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-[#172554] flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                  {isSelf && <span className="badge-delivered">You</span>}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono font-semibold">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono font-extrabold text-[#172554]">@{u.username}</td>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-blue-50 text-[#2563EB] border-blue-200'
                            }`}>
                              {u.role === 'ADMIN' ? 'Administrator' : 'Sales Executive'}
                            </span>
                          </td>
                          <td>
                            <span className={u.active ? 'badge-delivered' : 'badge-overdue'}>
                              {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{u.active ? 'Active' : 'Deactivated'}</span>
                            </span>
                          </td>
                          <td className="text-slate-500 font-mono text-[11px] font-semibold">
                            {u.createdAt ? formatDate(u.createdAt) : 'System default'}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditFullName(u.fullName);
                                  setEditEmail(u.email);
                                  setEditRole(u.role);
                                  setIsEditOpen(true);
                                }}
                                className="p-2 text-slate-500 hover:text-[#2563EB] bg-white hover:bg-blue-50 border border-[#D5DFED] hover:border-blue-300 rounded-lg transition"
                                title="Edit Account"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setPasswordUser(u);
                                  setNewResetPassword('');
                                  setConfirmResetPassword('');
                                  setIsPasswordOpen(true);
                                }}
                                className="p-2 text-slate-500 hover:text-amber-600 bg-white hover:bg-amber-50 border border-[#D5DFED] hover:border-amber-300 rounded-lg transition"
                                title="Change Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.fullName)}
                                  className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg border transition ${
                                    u.active
                                      ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  }`}
                                >
                                  {u.active ? 'Deactivate' : 'Activate'}
                                </button>
                              )}

                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#D5DFED] hover:border-rose-300 rounded-lg transition"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="p-4 border-b border-[#D5DFED] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#172554]">Security & RBAC Audit Trail</h3>
              <p className="text-xs text-slate-500">Chronological history of security events</p>
            </div>
            <button onClick={fetchAuditLogs} className="btn-secondary py-1.5 px-3 text-xs">Refresh</button>
          </div>
          {loadingAudit ? (
            <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="divide-y divide-[#D5DFED]/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#EEF2F8]/50">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="badge-partial font-mono">{log.action}</span>
                      <span className="text-xs text-[#172554] font-semibold">{log.details}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Performed by: <strong className="text-[#172554]">{log.performedByName}</strong>
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#D5DFED] overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-[#172554] via-[#2563EB] to-[#0D9488] text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base">Create New Account</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Add an Administrator or Sales Executive</p>
                </div>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                <div>
                  <label className="label-modern">Full Name <span className="text-rose-500">*</span></label>
                  <input type="text" required value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="e.g. Anand Kumar" className="input-modern" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-modern">Username <span className="text-rose-500">*</span></label>
                    <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="e.g. anand" className="input-modern font-mono" />
                  </div>
                  <div>
                    <label className="label-modern">Role <span className="text-rose-500">*</span></label>
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="input-modern font-bold cursor-pointer">
                      <option value="ADMIN">Administrator (Full Access)</option>
                      <option value="SALESPERSON">Sales Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-modern">Email Address <span className="text-rose-500">*</span></label>
                  <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g. anand@srisaismartopticals.com" className="input-modern font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-modern">Password <span className="text-rose-500">*</span></label>
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="input-modern" />
                  </div>
                  <div>
                    <label className="label-modern">Confirm Password <span className="text-rose-500">*</span></label>
                    <input type="password" required value={newConfirmPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} placeholder="Repeat password" className="input-modern" />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#D5DFED]">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary py-2 px-4 text-xs" disabled={submittingCreate}>Cancel</button>
                  <button type="submit" disabled={submittingCreate} className="btn-primary py-2 px-5 text-xs space-x-1.5">
                    {submittingCreate ? <><LoadingSpinner size="sm" /><span>Creating...</span></> : <><UserPlus className="w-3.5 h-3.5" /><span>Create Account</span></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {isEditOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#D5DFED] overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-[#172554] to-[#2563EB] text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base">Edit Account Details</h3>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono">@{editingUser.username}</p>
                </div>
                <button type="button" onClick={() => setIsEditOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                <div>
                  <label className="label-modern">Full Name <span className="text-rose-500">*</span></label>
                  <input type="text" required value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className="input-modern" />
                </div>
                <div>
                  <label className="label-modern">Email Address <span className="text-rose-500">*</span></label>
                  <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-modern font-mono" />
                </div>
                <div>
                  <label className="label-modern">Role <span className="text-rose-500">*</span></label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value as any)} className="input-modern font-bold cursor-pointer">
                    <option value="ADMIN">Administrator (Full Access)</option>
                    <option value="SALESPERSON">Sales Executive</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#D5DFED]">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="btn-secondary py-2 px-4 text-xs" disabled={submittingEdit}>Cancel</button>
                  <button type="submit" disabled={submittingEdit} className="btn-primary py-2 px-5 text-xs">
                    {submittingEdit ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {isPasswordOpen && passwordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#D5DFED] overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-amber-600 to-rose-600 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base">Change User Password</h3>
                  <p className="text-xs text-amber-100 mt-0.5">{passwordUser.fullName} (@{passwordUser.username})</p>
                </div>
                <button type="button" onClick={() => setIsPasswordOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
                <div>
                  <label className="label-modern">New Password <span className="text-rose-500">*</span></label>
                  <input type="password" required value={newResetPassword} onChange={(e) => setNewResetPassword(e.target.value)} placeholder="Min 6 characters" className="input-modern" />
                </div>
                <div>
                  <label className="label-modern">Confirm New Password <span className="text-rose-500">*</span></label>
                  <input type="password" required value={confirmResetPassword} onChange={(e) => setConfirmResetPassword(e.target.value)} placeholder="Repeat new password" className="input-modern" />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#D5DFED]">
                  <button type="button" onClick={() => setIsPasswordOpen(false)} className="btn-secondary py-2 px-4 text-xs" disabled={submittingPassword}>Cancel</button>
                  <button type="submit" disabled={submittingPassword} className="btn-primary py-2 px-5 text-xs space-x-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{submittingPassword ? 'Saving...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
