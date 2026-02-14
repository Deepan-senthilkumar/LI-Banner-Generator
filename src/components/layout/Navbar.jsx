import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Moon, Sparkles, Sun } from 'lucide-react';
import { growthToolCategories } from '../../features/growth/data/toolsCatalog';

const Navbar = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [productOpen, setProductOpen] = useState(false);
  const productMenuRef = useRef(null);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    const onClickOutside = (event) => {
      if (productMenuRef.current && !productMenuRef.current.contains(event.target)) {
        setProductOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center text-xs font-bold">
              LB
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">LinkedIn Banner Studio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <div ref={productMenuRef} className="relative">
              <button
                onClick={() => setProductOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Product <ChevronDown size={14} />
              </button>
              {productOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[960px] max-w-[95vw] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {growthToolCategories.map((category) => (
                      <section key={category.id} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                          {category.title}
                        </h3>
                        <div className="space-y-2">
                          {category.tools.map((tool) => (
                            <Link
                              key={tool.id}
                              to={`/app/tools/${tool.id}`}
                              onClick={() => setProductOpen(false)}
                              className="block rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <p className="font-medium text-slate-900 dark:text-white">{tool.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/app/tools/profile-optimisation" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Solution
            </Link>
            <Link to="/app/tools" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Free Tools
            </Link>
            <Link to="/app/pricing" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              <Sparkles size={14} />
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
