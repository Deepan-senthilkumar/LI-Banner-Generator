export const StatCard = ({ label, value, subtext }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-2xl font-bold mt-1 dark:text-white">{value}</div>
    {subtext ? <div className="text-xs mt-1 text-slate-500">{subtext}</div> : null}
  </div>
);
