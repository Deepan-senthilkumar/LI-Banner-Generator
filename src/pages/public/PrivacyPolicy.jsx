import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-4 text-slate-700 dark:text-slate-300">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p>Effective date: February 14, 2026</p>
        <p>
          We collect account information, workspace content, and product usage events to operate and improve the service.
          We do not sell your personal data.
        </p>
        <p>
          Local-mode demo data is stored in your browser localStorage. In production mode, data may be stored in secure
          hosted infrastructure configured by your team.
        </p>
        <p>
          You can request data deletion and account removal by contacting support through the Contact page.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
