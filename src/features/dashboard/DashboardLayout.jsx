import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, Settings, LogOut, PanelLeft, CreditCard, Palette, Layout, Users, Share2, Shield, WandSparkles } from 'lucide-react';
import Tour from '../../components/common/Tour';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'My Designs', path: '/app/designs', id: 'nav-designs' },
    { icon: Layout, label: 'Templates', path: '/app/templates', id: 'nav-templates' },
    { icon: Palette, label: 'Brand Kit', path: '/app/brand-kit', id: 'nav-brand' },
    { icon: WandSparkles, label: 'Growth Tools', path: '/app/tools', id: 'nav-tools' },
    { icon: Users, label: 'Team', path: '/app/team', id: 'nav-team' },
    { icon: Share2, label: 'Shared', path: '/app/shared', id: 'nav-shared' },
    { icon: CreditCard, label: 'Pricing', path: '/app/pricing', id: 'nav-pricing' },
    { icon: PlusCircle, label: 'Create New', path: '/app/editor/new', id: 'nav-create' },
    { icon: Settings, label: 'Settings', path: '/app/settings', id: 'nav-settings' },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin', id: 'nav-admin' }] : []),
  ];

  const tourSteps = [
    { target: 'nav-create', title: 'Start Creating', content: 'Click here to design a new LinkedIn banner from scratch.' },
    { target: 'nav-templates', title: 'Use Templates', content: 'Explore our library of professional templates to save time.' },
    { target: 'nav-brand', title: 'Your Brand', content: 'Save your colors and logos here to use them in the editor.' },
    { target: 'nav-designs', title: 'Your Work', content: 'All your saved projects live here.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Tour steps={tourSteps} tourKey="dashboard_v1" />

      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 fixed h-full z-20 hidden sm:flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          {sidebarOpen ? (
            <Link to="/" className="font-bold text-lg dark:text-white flex items-center gap-2">
              <span className="text-xl">&#x1F7E6;</span> BannerStudio
            </Link>
          ) : (
            <span className="text-xl mx-auto">&#x1F7E6;</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <PanelLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
              || (item.path === '/admin' && location.pathname.startsWith('/admin'))
              || (item.path === '/app/tools' && location.pathname.startsWith('/app/tools'));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                id={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {sidebarOpen && !user?.is_pro && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold text-sm mb-1">Upgrade to Pro</h3>
              <p className="text-xs opacity-90 mb-3">Unlock all features</p>
              <Link to="/app/pricing" className="block text-center py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50">
                View Plans
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className={`h-8 w-8 rounded-full ${user?.is_pro ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} flex items-center justify-center text-sm font-bold`}>
              {user?.name?.[0] || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-medium dark:text-white flex items-center gap-1">
                  {user?.name}
                  {user?.is_pro && <CreditCard size={12} className="text-yellow-500" fill="currentColor" />}
                </div>
                <div className="truncate text-xs text-slate-500">{user?.is_pro ? 'Pro Member' : 'Free Plan'}</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'sm:ml-64' : 'sm:ml-20'}`}>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
