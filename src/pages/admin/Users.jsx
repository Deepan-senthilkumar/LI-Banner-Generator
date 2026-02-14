import React, { useMemo, useState } from 'react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import useAdminData from '../../features/admin/hooks/useAdminData';
import { Loader2, Search } from 'lucide-react';

const PAGE_SIZE = 8;

const Users = () => {
  const { data: users, loading, refresh } = useAdminData(() => adminPanelService.getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return (users || []).filter((user) => {
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' ? true : (user.role || 'user') === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedUsers = filtered.slice(start, start + PAGE_SIZE);

  const handleRoleToggle = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    await adminPanelService.updateUserRole(user.id, nextRole);
    refresh();
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    await adminPanelService.deleteUser(userId);
    refresh();
  };

  if (loading) return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Users</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {pagedUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{user.name || '-'}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role || 'user'}</td>
                  <td className="px-4 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleRoleToggle(user)} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Showing {pagedUsers.length} of {filtered.length}</span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
