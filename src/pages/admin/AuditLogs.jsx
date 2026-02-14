import React, { useMemo, useState } from 'react';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import useAdminData from '../../features/admin/hooks/useAdminData';

const AuditLogs = () => {
  const { data: logs, loading, error, refresh } = useAdminData(() => adminPanelService.getAuditLogs());
  const [query, setQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;

    return logs.filter((log) => {
      const action = String(log.action || '').toLowerCase();
      const metadata = JSON.stringify(log.metadata || {}).toLowerCase();
      return action.includes(q) || metadata.includes(q);
    });
  }, [logs, query]);

  if (loading) {
    return (
      <div className="h-56 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Audit Logs</h1>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by action or metadata"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No logs found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Metadata</th>
                <th className="text-left px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800 align-top">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                      {JSON.stringify(log.metadata || {}, null, 2)}
                    </pre>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(log.at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
