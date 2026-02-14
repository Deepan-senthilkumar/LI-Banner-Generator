import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teamService } from '../../services/teamService';
import { Users, UserPlus, Mail, Shield, Trash2 } from 'lucide-react';

const Team = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
        // Auto-create a team if none exists for the demo
        teamService.getMyTeam(user.id).then(t => {
            if (t) setTeam(t);
            else teamService.createTeam(user.id, `${user.name}'s Team`).then(setTeam);
        });
    }
  }, [user]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setLoading(true);
    await teamService.inviteMember(team.id, inviteEmail);
    setInviteEmail('');
    setLoading(false);
    alert(`Invite sent to ${inviteEmail}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-white mb-2">Team Collaboration</h1>
            <p className="text-slate-500">Manage your team and collaborate on designs.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              <UserPlus size={18} /> Invite Member
          </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
                      <Users size={18} className="text-blue-500" />
                      Team Members ({team?.members?.length || 0} / 5)
                  </h3>
                  
                  {user?.is_pro ? (
                      <div className="space-y-4">
                          {/* Owner (You) */}
                          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                      {user.name[0]}
                                  </div>
                                  <div>
                                      <div className="font-bold dark:text-white">{user.name} <span className="text-xs text-slate-400">(You)</span></div>
                                      <div className="text-xs text-slate-500">{user.email}</div>
                                  </div>
                              </div>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex items-center gap-1">
                                  <Shield size={10} /> Owner
                              </span>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                          <Users size={32} className="mx-auto text-slate-400 mb-3" />
                          <h4 className="font-bold text-slate-600 dark:text-slate-300">Upgrade to Pro</h4>
                          <p className="text-sm text-slate-500 mb-4">Team features are available on the Pro plan.</p>
                          <a href="/app/pricing" className="text-blue-600 font-bold text-sm hover:underline">View Plans</a>
                      </div>
                  )}
              </div>
          </div>

          {/* Invite Box */}
          <div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
                  <h3 className="font-bold mb-4 dark:text-white">Invite People</h3>
                  <form onSubmit={handleInvite} className="space-y-3">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                          <div className="relative mt-1">
                              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                type="email" 
                                placeholder="colleague@example.com"
                                className="w-full pl-9 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                disabled={!user?.is_pro}
                              />
                          </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading || !user?.is_pro}
                        className="w-full py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                          {loading ? 'Sending...' : 'Send Invite'}
                      </button>
                  </form>
                  {!user?.is_pro && (
                      <div className="mt-4 text-xs text-center text-slate-400">
                          Upgrade to invite team members.
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Team;
