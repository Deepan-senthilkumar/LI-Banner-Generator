import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ExternalLink, Loader2, Search, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { teamService } from '../../services/teamService';

const SharedProjects = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadSharedProjects = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError('');

      try {
        const rows = await teamService.getSharedProjects(user.id);
        setProjects(rows || []);
      } catch (err) {
        setError(err.message || 'Failed to load shared projects');
      } finally {
        setLoading(false);
      }
    };

    loadSharedProjects();
  }, [user]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((project) => (
      (project.title || '').toLowerCase().includes(term)
      || (project.ownerName || '').toLowerCase().includes(term)
      || (project.ownerEmail || '').toLowerCase().includes(term)
    ));
  }, [projects, search]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 size={30} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-2">Shared with Me</h1>
          <p className="text-slate-500">Designs shared by your team members.</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or owner"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <Share2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">No shared projects yet</h3>
          <p className="text-slate-500 mt-2">When teammates collaborate, projects will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="aspect-[4/1] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {project.previewImage ? (
                  <img
                    src={project.previewImage}
                    alt={project.title || 'Shared design'}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No Preview</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold dark:text-white truncate" title={project.title || 'Untitled Design'}>
                  {project.title || 'Untitled Design'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  By {project.ownerName || project.ownerEmail || 'Team member'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '-'}
                </p>

                <div className="mt-3">
                  <Link
                    to={`/app/editor/${project.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2"
                  >
                    Open <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedProjects;
