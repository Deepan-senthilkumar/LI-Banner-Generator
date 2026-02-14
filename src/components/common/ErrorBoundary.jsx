import React from 'react';
import monitoringService from '../../services/monitoringService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    monitoringService.logError(error, {
      componentStack: errorInfo?.componentStack || '',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="max-w-md rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 p-6 text-center">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              The error has been logged. Please refresh and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
