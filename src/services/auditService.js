import storage from './storage';

const KEY = 'admin_audit_logs';

const readLogs = () => storage.get(KEY, []);
const writeLogs = (logs) => storage.set(KEY, logs);

const auditService = {
  async log(action, metadata = {}) {
    const logs = readLogs();
    logs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      metadata,
      at: new Date().toISOString(),
    });
    writeLogs(logs.slice(0, 300));
  },

  async getLogs() {
    return readLogs();
  },
};

export default auditService;
