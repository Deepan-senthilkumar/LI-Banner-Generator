import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { shareService } from '../../services/shareService';
import ProjectCard from '../../features/dashboard/components/ProjectCard';
import { Loader2, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyDesigns = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sharingProjectId, setSharingProjectId] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareError, setShareError] = useState('');

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await projectService.getByUser(user.id); // Assuming getByUser exists now or mock it
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
        loadProjects();
    }
  }, [user?.id, loadProjects]);

  const handleDelete = async (id) => {
    if (confirm('Delete this design permanently?')) {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDuplicate = async (id) => {
    const newProject = await projectService.duplicate(id, user.id);
    setProjects([newProject, ...projects]);
  };

  const setTemporaryMessage = (setter, message) => {
    setter(message);
    window.setTimeout(() => setter(''), 2600);
  };

  const handleShare = async (projectId) => {
    setShareError('');
    setSharingProjectId(projectId);
    try {
      const share = await shareService.createShareLink(projectId);
      if (!share?.shareId) throw new Error('Share link was not generated');

      const shareUrl = `${window.location.origin}/share/${share.shareId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copy this share link', shareUrl);
      }

      setTemporaryMessage(setShareMessage, 'Share link copied to clipboard');
    } catch (err) {
      setTemporaryMessage(setShareError, err.message || 'Failed to create share link');
    } finally {
      setSharingProjectId(null);
    }
  };
  
  const filteredProjects = projects.filter(p => 
      p.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
     <div className="flex h-64 items-center justify-center">
         <Loader2 className="animate-spin text-blue-500" size={32} />
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">My Designs</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage your saved LinkedIn banners</p>
           {shareMessage ? (
             <p className="mt-2 inline-flex items-center gap-1 text-emerald-600 text-sm">
               <CheckCircle2 size={15} /> {shareMessage}
             </p>
           ) : null}
           {shareError ? (
             <p className="mt-2 inline-flex items-center gap-1 text-red-600 text-sm">
               <AlertCircle size={15} /> {shareError}
             </p>
           ) : null}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search designs..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Link to="/app/editor/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 whitespace-nowrap">
                <Plus size={18} /> New Design
            </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
           <h3 className="text-lg font-medium dark:text-white mb-2">No designs yet</h3>
           <Link to="/app/editor/new" className="text-blue-600 hover:underline">Create your first banner</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredProjects.map(project => (
               <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                  isSharing={sharingProjectId === project.id}
               />
           ))}
        </div>
      )}
    </div>
  );
};

export default MyDesigns;
