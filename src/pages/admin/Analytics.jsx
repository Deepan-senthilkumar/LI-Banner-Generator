import React, { useEffect, useState } from 'react';
import analyticsService from '../../services/analyticsService';
import { StatCard } from '../../features/admin/components/StatCard';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Projects" value={stats.totalProjects} />
        <StatCard label="Templates Count" value={stats.templatesCount} />
        <StatCard label="New Users (7d)" value={stats.newUsersLast7Days} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="font-semibold mb-3 dark:text-white">User Role Distribution</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Admins</span>
              <span className="font-medium dark:text-white">{stats.roleDistribution?.admin ?? 0}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded">
              <div
                className="h-2 rounded bg-blue-600"
                style={{
                  width: `${stats.totalUsers ? ((stats.roleDistribution?.admin || 0) / stats.totalUsers) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Users</span>
              <span className="font-medium dark:text-white">{stats.roleDistribution?.user ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="font-semibold mb-3 dark:text-white">Projects by Template</h2>
          <div className="space-y-2">
            {Object.entries(stats.projectsByTemplate || {}).length ? (
              Object.entries(stats.projectsByTemplate).map(([template, count]) => (
                <div key={template} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600 dark:text-slate-300">{template}</span>
                  <span className="font-medium dark:text-white">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No template usage yet.</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h2 className="font-semibold mb-3 dark:text-white">Recent Activity</h2>
        {stats.recentActivity.length ? (
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {stats.recentActivity.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>{item.message}</span>
                <span className="text-xs text-slate-400">{new Date(item.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No activity available.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
