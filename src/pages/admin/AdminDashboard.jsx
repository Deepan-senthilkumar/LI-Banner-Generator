import React, { useEffect, useState } from 'react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import { StatCard } from '../../features/admin/components/StatCard';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminPanelService.getAnalytics().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Total Projects" value={stats?.totalProjects ?? 0} />
        <StatCard label="Templates" value={stats?.templatesCount ?? 0} />
        <StatCard label="Admin Users" value={stats?.adminCount ?? 0} />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h2 className="font-semibold mb-3 dark:text-white">Recent Activity</h2>
        {stats?.recentActivity?.length ? (
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {stats.recentActivity.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>{item.message}</span>
                <span className="text-xs text-slate-400">{new Date(item.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
