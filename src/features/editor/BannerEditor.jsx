import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EditorProvider, useEditor } from './context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import BannerCanvas from './components/BannerCanvas';
import ControlsPanel from './components/ControlsPanel';
import { Download, Save, ArrowLeft, Loader2, Undo2, Redo2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAutosave } from './hooks/useAutosave';

// Separate content component to use the context
const EditorContent = () => {
    const canvasRef = useRef(null);
    const { projectId: routeProjectId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { state, setTitle, loadProject, dispatch, undo, redo, canUndo, canRedo } = useEditor();
    const { projectId, title, config, lastSaved } = state;
    
    const [saving, setSaving] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);

    // Autosave Hook
    const { saving: autoSaving, lastSaved: autoSavedAt } = useAutosave(state, user?.id);

    useEffect(() => {
        const onKeyDown = (event) => {
            const isMod = event.ctrlKey || event.metaKey;
            if (!isMod) return;

            if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (canUndo) undo();
            }

            if ((event.key.toLowerCase() === 'y') || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
                event.preventDefault();
                if (canRedo) redo();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    // Load project if route ID exists and is different from current context
    useEffect(() => {
        if (routeProjectId && routeProjectId !== 'new' && routeProjectId !== projectId) {
            fetchProject(routeProjectId);
        } else if (routeProjectId === 'new') {
            // Check if we need to reset editor for new project
             if(projectId) {
                 dispatch({ type: 'RESET_EDITOR' });
             }
            const pendingTemplate = sessionStorage.getItem('pending_template');
            if (pendingTemplate) {
                try {
                    const parsed = JSON.parse(pendingTemplate);
                    dispatch({ type: 'LOAD_PROJECT', payload: parsed });
                } catch (err) {
                    console.error('Failed to load pending template', err);
                } finally {
                    sessionStorage.removeItem('pending_template');
                }
            }
        }
    }, [routeProjectId]);

    const fetchProject = async (id) => {
        setLoadingProject(true);
        try {
            const project = await projectService.getById(id);
            if (project) {
                 loadProject(project);
            } else {
                navigate('/app/designs'); // Redirect if not found
            }
        } catch (error) {
            console.error("Failed to load project", error);
        } finally {
            setLoadingProject(false);
        }
    };

    const generatePreview = async () => {
        if (!canvasRef.current) return null;
        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 0.5, // Smaller scale for thumbnail
                useCORS: true,
                backgroundColor: null
            });
            return canvas.toDataURL('image/png', 0.8);
        } catch (e) {
            console.error("Thumbnail generation failed", e);
            return null;
        }
    };

    const handleSave = async () => {
        if (!user) return alert("Please log in to save.");
        setSaving(true);
        
        try {
            const previewImage = await generatePreview();
            const projectData = {
                userId: user.id,
                title: title,
                templateId: config.template,
                designData: {
                    version: 1,
                    config: config
                },
                previewImage
            };

            let savedProject;
            if (projectId) {
                // Update existing
                savedProject = await projectService.update(projectId, projectData);
            } else {
                // Create new
                savedProject = await projectService.create(projectData);
                // Update context
                dispatch({ type: 'SET_PROJECT_ID', payload: savedProject.id });
                // Update URL without reload
                navigate(`/app/editor/${savedProject.id}`, { replace: true });
            }
            
            // Show toast or feedback here
            console.log("Saved!", savedProject);
            
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save project.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!canvasRef.current) return;
        
        try {
             // Wait for images to load if needed, basic check
             const canvas = await html2canvas(canvasRef.current, {
                scale: 2, // Retina quality
                useCORS: true,
                backgroundColor: null
             });
             
             const link = document.createElement('a');
             link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
             link.href = canvas.toDataURL('image/png');
             link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export image. Please try again.");
        }
    };

    if (loadingProject) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="ml-2 text-slate-500">Loading Design...</span>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/app/designs" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <input 
                            type="text" 
                            className="font-semibold text-lg bg-transparent border-none outline-none p-0 focus:ring-0 w-64 dark:text-white placeholder-slate-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Banner"
                        />
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            {autoSaving ? (
                                <>
                                    <Loader2 size={10} className="animate-spin" /> Saving draft...
                                </>
                            ) : (
                                <>
                                    {lastSaved || autoSavedAt ? `Saved ${new Date(lastSaved || autoSavedAt).toLocaleTimeString()}` : 'Unsaved changes'}
                                </>
                            )}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                     <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
                        title="Undo (Ctrl/Cmd + Z)"
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
                        title="Redo (Ctrl/Cmd + Y)"
                    >
                        <Redo2 size={16} />
                    </button>
                     <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Controls */}
                <div className="w-[360px] shrink-0 h-full overflow-hidden shadow-xl z-10">
                    <ControlsPanel />
                </div>
                
                {/* Center Canvas Area */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950/50 p-8 flex items-center justify-center overflow-auto relative">
                    {/* Grid Pattern Background */}
                     <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
                          style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                     </div>
                    
                    <div className="relative z-10 w-full max-w-[1200px]">
                         <BannerCanvas canvasRef={canvasRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const BannerEditor = () => {
  return (
    <EditorProvider>
        <EditorContent />
    </EditorProvider>
  );
};

export default BannerEditor;
