import storage from './storage';

const KEY = 'app_monitoring_events';
const MAX_EVENTS = 500;

const shouldConsoleLog = (import.meta.env.VITE_MONITORING_CONSOLE || 'true') === 'true';
const endpoint = import.meta.env.VITE_MONITORING_ENDPOINT || '';

const readEvents = () => storage.get(KEY, []);
const writeEvents = (events) => storage.set(KEY, events.slice(0, MAX_EVENTS));

const sendToEndpoint = (payload) => {
  if (!endpoint) return;
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore telemetry failures by design.
  }
};

const createEvent = (type, data = {}) => ({
  id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type,
  data,
  at: new Date().toISOString(),
});

const monitoringService = {
  log(type, data = {}) {
    const event = createEvent(type, data);
    const events = readEvents();
    events.unshift(event);
    writeEvents(events);

    if (shouldConsoleLog) {
      console.log('[monitoring]', type, data);
    }

    sendToEndpoint(event);
    return event;
  },

  logError(error, context = {}) {
    const serialized = {
      message: error?.message || String(error),
      stack: error?.stack || null,
      name: error?.name || 'Error',
      ...context,
    };
    return this.log('error', serialized);
  },

  getEvents() {
    return readEvents();
  },

  clearEvents() {
    writeEvents([]);
    return true;
  },
};

export default monitoringService;
