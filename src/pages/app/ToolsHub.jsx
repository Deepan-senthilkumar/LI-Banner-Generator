import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { growthToolCategories } from '../../features/growth/data/toolsCatalog';

const ToolsHub = () => {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return growthToolCategories;

    return growthToolCategories
      .map((category) => ({
        ...category,
        tools: category.tools.filter((tool) => (
          tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q)
        )),
      }))
      .filter((category) => category.tools.length > 0);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            Growth Suite
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All LinkedIn Growth Tools In One Workspace</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Use every feature from your reference app inside this project. Each tool runs with local mock data so you can test complete workflows.
          </p>
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <section key={category.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm uppercase tracking-wide font-semibold text-blue-600 dark:text-blue-300 mb-4">{category.title}</h2>
            <div className="space-y-2">
              {category.tools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/app/tools/${tool.id}`}
                  className="group block rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{tool.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{tool.description}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1 text-slate-400 group-hover:text-blue-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ToolsHub;
