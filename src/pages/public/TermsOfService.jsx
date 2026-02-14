import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-4 text-slate-700 dark:text-slate-300">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
        <p>Effective date: February 14, 2026</p>
        <p>
          By using LinkedIn Banner Studio, you agree to use the platform lawfully and not upload harmful or infringing content.
        </p>
        <p>
          You are responsible for your account activity and compliance with platform rules where content is published.
        </p>
        <p>
          We may suspend access for abuse, security threats, or violations of these terms.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
