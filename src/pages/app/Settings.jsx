import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Linkedin, Check, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);

  // Mock function to simulate OAuth flow
  const handleConnectLinkedIn = async () => {
    setConnecting(true);
    
    // In a real app, we would fetch the auth URL from backend:
    // const { url } = await fetch('/api/v1/social/auth').then(res => res.json());
    // window.location.href = url;

    // Simulating the flow for now
    setTimeout(() => {
        alert("Redirecting to LinkedIn... (Mock)");
        // Simulate returning with a code
        // const code = "mock_code";
        // await fetch(\`/api/v1/social/callback?code=\${code}\`);
        
        // Improve local user state (would normally be refreshed from backend)
        user.linkedin_token = "mock_token";
        
        setConnecting(false);
        window.location.reload(); // Refresh to show connected state
    }, 1500);
  };

  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">Account Settings</h1>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Profile</h2>
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500">
                  {user?.name?.[0]}
              </div>
              <div>
                  <div className="font-bold dark:text-white">{user?.name}</div>
                  <div className="text-slate-500 text-sm">{user?.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {user?.is_pro ? 'PRO Plan' : 'Free Plan'}
                  </div>
              </div>
          </div>
      </section>

      {/* Integrations Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Integrations</h2>
          
          <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0077b5] rounded-lg flex items-center justify-center text-white">
                      <Linkedin size={20} />
                  </div>
                  <div>
                      <div className="font-bold dark:text-white">LinkedIn</div>
                      <div className="text-xs text-slate-500">Connect to publish banners directly</div>
                  </div>
              </div>

              {user?.linkedin_token ? (
                  <button disabled className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                      <Check size={16} /> Connected
                  </button>
              ) : (
                  <button 
                    onClick={handleConnectLinkedIn}
                    disabled={connecting}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium dark:text-white transition-colors"
                  >
                      {connecting && <Loader2 size={14} className="animate-spin" />}
                      Connect Account
                  </button>
              )}
          </div>
      </section>

      {/* Danger Zone */}
       <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
          <h2 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h2>
          <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold dark:text-white">Sign Out</div>
                  <div className="text-xs text-slate-500">Sign out of your account on this device</div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                  Sign Out
              </button>
          </div>
       </section>
    </div>
  );
};

export default Settings;
