import monitoringService from './monitoringService';

const analyticsEnabled = (import.meta.env.VITE_ANALYTICS_ENABLED || 'true') === 'true';

const shouldIgnorePath = (path) => path.startsWith('/admin');

const analyticsTracker = {
  trackPageView(path, metadata = {}) {
    if (!analyticsEnabled || shouldIgnorePath(path)) return;
    monitoringService.log('page_view', {
      path,
      ...metadata,
    });
  },

  trackEvent(name, payload = {}) {
    if (!analyticsEnabled) return;
    monitoringService.log('event', {
      name,
      ...payload,
    });
  },
};

export default analyticsTracker;
