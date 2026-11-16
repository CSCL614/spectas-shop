import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { UserResponse, AuditLog } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/helpers';
import {
  Users,
  Shield,
  UserCheck,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Lock,
  Mail,
  User as UserIcon,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SALESPERSON'>('ALL');

  // Audit logs state
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
    } catch (err) {
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
    } catch (err) {
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

    const adminCount = users.filter(u => u.role === 'ADMIN' && u.active).length;
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

      toast.success(`Account updated successfully!`);
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

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin & Staff Account Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise role-based access control, security policies, password resets, and user lifecycle.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Accounts ({users.length})
            </button>

          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary py-1.5 px-4 text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['ALL', 'ADMIN', 'SALESPERSON'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${roleFilter === role
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">User Details</th>
                      <th className="py-3.5 px-4">Username</th>
                      <th className="py-3.5 px-4">System Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                            @{u.username}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {u.role === 'ADMIN' ? 'Administrator' : 'Sales Executive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${u.active ? 'text-emerald-600' : 'text-rose-500'
                              }`}>
                              {u.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{u.active ? 'Active' : 'Deactivated'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {u.createdAt ? formatDate(u.createdAt) : 'System default'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Edit details */}
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditFullName(u.fullName);
                                  setEditEmail(u.email);
                                  setEditRole(u.role);
                                  setIsEditOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                title="Edit Account"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset password */}
                              <button
                                onClick={() => {
                                  setPasswordUser(u);
                                  setNewResetPassword('');
                                  setConfirmResetPassword('');
                                  setIsPasswordOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                                title="Change Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Activate / Deactivate Toggle */}
                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.fullName)}
                                  className={`text-[11px] font-bold px-2 py-1 rounded-md border transition ml-1 ${u.active
                                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                  {u.active ? 'Deactivate' : 'Activate'}
                                </button>
                              )}

                              {/* Delete Account */}
                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
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
        /* Audit Logs View */
        <div className="card-premium overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & RBAC Audit Trail</h3>
              <p className="text-xs text-slate-400">Chronological history of security events, creations, updates and deletions</p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Refresh
            </button>
          </div>

          {loadingAudit ? (
            <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No audit records logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">{log.details}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Performed by: <strong className="text-slate-600">{log.performedByName}</strong>
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
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
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Create New Account</h3>
                <p className="text-xs text-purple-200 mt-0.5">Add an Administrator or Sales Executive</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. anand"
                    className="input-field text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="input-field text-xs font-bold text-slate-800"
                  >
                    <option value="ADMIN">Administrator (Full Access)</option>
                    <option value="SALESPERSON">Sales Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. anand@spectasshop.com"
                  className="input-field text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                  disabled={submittingCreate}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="btn-primary py-2 px-5 text-xs flex items-center space-x-1.5"
                >
                  {submittingCreate ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Edit Account Details</h3>
                <p className="text-xs text-blue-200 mt-0.5">@{editingUser.username}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input-field text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="input-field text-xs font-bold text-slate-800"
                >
                  <option value="ADMIN">Administrator (Full Access)</option>
                  <option value="SALESPERSON">Sales Executive</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary py-2 px-5 text-xs flex items-center space-x-1.5"
                >
                  {submittingEdit ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordOpen && passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Change User Password</h3>
                <p className="text-xs text-amber-100 mt-0.5">{passwordUser.fullName} (@{passwordUser.username})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                  disabled={submittingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="btn-primary py-2 px-5 text-xs flex items-center space-x-1.5"
                >
                  {submittingPassword ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
