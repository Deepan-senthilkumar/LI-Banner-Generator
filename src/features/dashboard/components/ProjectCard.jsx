import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit2, Copy, Trash2, Download } from 'lucide-react';

const ProjectCard = ({ project, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 relative">
      <Link to={`/app/editor/${project.id}`}>
        <div className="aspect-[4/1] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          {project.previewImage ? (
            <img 
              src={project.previewImage} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No Preview
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <Edit2 size={14} /> Edit Design
             </span>
          </div>
        </div>
      </Link>

      <div className="p-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={project.title}>
            {project.title || 'Untitled Design'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Edited {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 py-1 text-sm overflow-hidden">
                <Link 
                  to={`/app/editor/${project.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Edit2 size={16} /> Edit
                </Link>
                <button 
                  onClick={() => onDuplicate(project.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Copy size={16} /> Duplicate
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button 
                  onClick={() => onDelete(project.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
