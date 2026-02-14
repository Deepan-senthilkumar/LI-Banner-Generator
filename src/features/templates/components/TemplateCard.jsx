import React from 'react';
import { ArrowRight, Crown, Star } from 'lucide-react';

const TemplateCard = ({ template, onSelect }) => {
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
      <div className="aspect-[3/1] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onSelect(template)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-blue-700"
          >
            Use Template <ArrowRight size={14} />
          </button>
        </div>
        {template.featured && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-400/95 text-slate-900 text-[10px] font-bold inline-flex items-center gap-1">
            <Star size={11} fill="currentColor" /> Featured
          </div>
        )}
        {template.premium && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-indigo-600/95 text-white text-[10px] font-bold inline-flex items-center gap-1">
            <Crown size={11} /> Pro
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {template.category} | {template.style}
            </p>
            {template.tags?.length ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              template.premium
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {template.premium ? 'Pro' : 'Free'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
