import React from 'react';
import { Share2 } from 'lucide-react';

const SharedProjects = () => {
  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold dark:text-white mb-2">Shared with Me</h1>
              <p className="text-slate-500">Designs shared by your team members.</p>
            </div>
        </div>

        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <Share2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">No shared projects yet</h3>
            <p className="text-slate-500 mt-2">When someone shares a design with you, it will appear here.</p>
        </div>
    </div>
  );
};

export default SharedProjects;
