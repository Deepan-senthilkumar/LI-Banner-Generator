import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Plus, Loader2, Image as ImageIcon, MoreVertical, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAll();
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Prevent link click
        if (confirm('Are you sure you want to delete this design?')) {
            await projectService.deleteProject(id);
            loadProjects();
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">My Designs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your saved LinkedIn banners.</p>
                </div>
                <Link to="/create" className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                    <Plus size={20} />
                    Create New
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <ImageIcon size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">No designs yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start creating your professional personal brand today.</p>
                    <Link to="/create" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Create your first banner &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link 
                            to={`/app/${project.id}`} 
                            key={project.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
                        >
                            <div className="aspect-[4/1] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                {project.previewImage ? (
                                    <img src={project.previewImage} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Preview</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">Edit Design</span>
                                </div>
                            </div>
                            <div className="p-4 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold dark:text-white group-hover:text-blue-500 transition-colors">{project.title || 'Untitled Design'}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
