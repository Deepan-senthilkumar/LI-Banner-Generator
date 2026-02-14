import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, LayoutTemplate, ChartColumnIncreasing, ShieldCheck, ScrollText } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Templates', path: '/admin/templates', icon: LayoutTemplate },
  { label: 'Moderation', path: '/admin/moderation', icon: ShieldCheck },
  { label: 'Analytics', path: '/admin/analytics', icon: ChartColumnIncreasing },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 hidden md:block">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wide text-slate-500">LinkedIn Banner Studio</div>
          <h1 className="text-lg font-bold dark:text-white">Admin Panel</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <h2 className="font-semibold dark:text-white">Administration</h2>
          <Link to="/app/designs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600">
            Back to App
          </Link>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
