import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Download, LayoutTemplate, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500/30">
        
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/20 blur-[100px] rounded-full -z-10 opacity-50 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[800px] h-[600px] bg-purple-500/20 blur-[100px] rounded-full -z-10 opacity-40 dark:opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 text-sm font-medium animate-fade-in-up">
                <Sparkles size={16} className="text-yellow-500" />
                <span>No design skills needed</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up delay-100">
                Create a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 animate-gradient-x">premium LinkedIn banner</span><br className="hidden sm:block"/>
                in under 60 seconds.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
                Professional branding made simple. Choose a template, customize instantly, and download a high-quality banner for your profile.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                <Link to="/create" className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
                    Open Studio Free
                    <ArrowRight size={20} />
                </Link>
                <Link to="/app/templates" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    View Templates
                </Link>
            </div>
        </div>

        {/* Preview Image / Placeholder */}
        <div className="mt-20 max-w-6xl mx-auto relative animate-fade-in-up delay-500 group">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
             <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-900">
                <img 
                    src="https://placehold.co/1584x396/1e293b/ffffff?text=Premium+LinkedIn+Banner+Preview&font=poppins" 
                    alt="App Preview" 
                    className="w-full h-auto"
                />
             </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                        <LayoutTemplate size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Professional Templates</h3>
                    <p className="text-slate-600 dark:text-slate-400">From corporate to creative, choose designs that match your industry and personality.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Live Editing</h3>
                    <p className="text-slate-600 dark:text-slate-400">Adjust colors, fonts, and spacing in real-time. No loading spinners, just instant feedback.</p>
                </div>
                 <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                        <Download size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">One-Click Export</h3>
                    <p className="text-slate-600 dark:text-slate-400">Download high-resolution PNGs perfectly sized for LinkedIn (1584x396px).</p>
                </div>
            </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} LinkedIn Banner Studio</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/about" className="hover:text-blue-600">About</Link>
            <Link to="/contact" className="hover:text-blue-600">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-600">Privacy</Link>
            <Link to="/terms" className="hover:text-blue-600">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
