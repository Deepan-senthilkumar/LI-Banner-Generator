import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '../../services/shareService';
import { Download, AlertCircle } from 'lucide-react';
import BannerCanvas from '../../features/editor/components/BannerCanvas'; // Reusing canvas for preview

const SharePreview = () => {
  const { shareId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
        try {
            const data = await shareService.getSharedProject(shareId);
            if (!data) throw new Error('Design not found or link expired');
            setProject(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchProject();
  }, [shareId]);

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading preview...</div>;

  if (error) return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Oops!</h1>
          <p className="text-slate-600 mt-2">{error}</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🟦</span>
                <div>
                    <h1 className="font-bold dark:text-white">{project.title}</h1>
                    <p className="text-xs text-slate-500">Shared Design</p>
                </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                <Download size={18} /> Download
            </button>
        </header>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="shadow-2xl rounded- overflow-hidden border border-slate-200 dark:border-slate-800">
                 {/* 
                     We are reusing BannerCanvas in a "read-only" way. 
                     We need to ensure it can work without the full EditorContext if possible, 
                     or we pass props directly. 
                     Assuming BannerCanvas accepts direct props or we can mock the context wrapper.
                     For now, let's assume direct props or simplified Config display.
                 */}
                 <div style={{ pointerEvents: 'none' }} className="scale-75 origin-top">
                     {/* Simplified Render as we might not have EditorContext easily available here without refactoring.
                         Ideally, BannerCanvas should take `config` as a prop.
                         Let's just show a placeholder/thumbnail if direct reuse is hard, 
                         or try to render it if BannerCanvas purely uses Context.
                      */}
                      
                      {/* 
                         Correction: BannerCanvas uses useEditor() internally. 
                         To render it here, we would need to wrap this page in an EditorProvider 
                         loaded with this project data. 
                       */}
                      <div className="bg-white p-10 rounded text-center">
                          <img src={project.preview || "https://placehold.co/800x200?text=Preview"} alt="Preview" className="max-w-full rounded shadow-lg" />
                          <p className="mt-4 text-sm text-slate-400">Live interactive preview requires being in the Editor.</p>
                      </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default SharePreview;
