import React from 'react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import useAdminData from '../../features/admin/hooks/useAdminData';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const Moderation = () => {
  const { data: queue, loading, refresh } = useAdminData(() => adminPanelService.getTemplateModerationQueue());

  const approve = async (id) => {
    await adminPanelService.approveTemplate(id);
    refresh();
  };

  const reject = async (id) => {
    await adminPanelService.rejectTemplate(id);
    refresh();
  };

  if (loading) return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Template Moderation</h1>
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {queue.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No items in moderation queue.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => approve(item.id)} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button onClick={() => reject(item.id)} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs inline-flex items-center gap-1">
                      <XCircle size={12} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Moderation;
