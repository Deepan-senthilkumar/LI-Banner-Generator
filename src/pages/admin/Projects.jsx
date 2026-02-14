import React, { useMemo, useState } from 'react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import useAdminData from '../../features/admin/hooks/useAdminData';
import { Loader2, Search } from 'lucide-react';

const PAGE_SIZE = 8;

const Projects = () => {
  const { data: projects, loading, refresh } = useAdminData(() => adminPanelService.getProjects());
  const [inspected, setInspected] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (projects || []).filter((project) => {
      if (!term) return true;
      return (
        (project.title || '').toLowerCase().includes(term) ||
        (project.ownerEmail || '').toLowerCase().includes(term) ||
        (project.ownerName || '').toLowerCase().includes(term)
      );
    });
  }, [projects, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedProjects = filtered.slice(start, start + PAGE_SIZE);

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    await adminPanelService.deleteProject(projectId);
    if (inspected?.id === projectId) setInspected(null);
    refresh();
  };

  if (loading) return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Projects</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title or owner"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {pagedProjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No projects found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedProjects.map((project) => (
                <tr key={project.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{project.title || 'Untitled'}</td>
                  <td className="px-4 py-3">{project.ownerName || project.ownerEmail || 'Unknown'}</td>
                  <td className="px-4 py-3">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => setInspected(project)} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">Inspect</button>
                    <button onClick={() => handleDelete(project.id)} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Showing {pagedProjects.length} of {filtered.length}</span>
        <div className="space-x-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Prev</button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Next</button>
        </div>
      </div>

      {inspected ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold dark:text-white">Project Data</h2>
            <button onClick={() => setInspected(null)} className="text-xs text-slate-500">Close</button>
          </div>
          <pre className="text-xs overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
{JSON.stringify(inspected, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
};

export default Projects;
