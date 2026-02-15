import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../../services/templateService';
import entitlementsService from '../../services/entitlementsService';
import TemplateCard from '../../features/templates/components/TemplateCard';
import { Loader2, Search, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['all', 'minimal', 'corporate', 'developer', 'creative'];
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Name', value: 'name' },
];

const TemplateLibrary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await templateService.getMarketplaceTemplates({
        search,
        category: filter,
        sortBy,
        tags: tagFilter ? [tagFilter] : [],
        includePremium: true,
      });
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filter, sortBy, tagFilter]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const allTags = useMemo(() => {
    const tags = new Set();
    templates.forEach((template) => (template.tags || []).forEach((tag) => tags.add(tag)));
    return Array.from(tags).slice(0, 20);
  }, [templates]);

  const handleSelectTemplate = async (template) => {
    if (template.premium && !entitlementsService.canUsePremiumTemplate(user)) {
      alert('This is a Pro template. Upgrade your plan to use it.');
      navigate('/app/pricing');
      return;
    }

    await templateService.incrementTemplateUsage(template.id);
    sessionStorage.setItem(
      'pending_template',
      JSON.stringify({
        projectId: null,
        title: `Untitled ${template.name}`,
        config: template.config,
        lastSaved: null,
      })
    );
    navigate('/app/editor/new');
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-6">
        <h1 className="text-2xl font-bold">Template Marketplace</h1>
        <p className="text-sm opacity-90 mt-1">
          Discover high-converting banner designs with premium and featured collections.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full xl:w-auto bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Search className="ml-2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search templates, category, tags..."
            className="w-full xl:w-80 py-1.5 bg-transparent border-none outline-none text-sm dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/app/pricing')}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300"
          >
            <Crown size={14} /> Upgrade
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Categories</h3>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="capitalize">{cat}</span>
            </button>
          ))}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2 px-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTagFilter('')}
              className={`px-2 py-1 rounded text-xs ${tagFilter === '' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-2 py-1 rounded text-xs ${tagFilter === tag ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {templates.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium dark:text-white mb-2">No templates found</h3>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                  setTagFilter('');
                }}
                className="text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
