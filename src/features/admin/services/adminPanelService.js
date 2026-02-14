import adminService from '../../../services/adminService';
import analyticsService from '../../../services/analyticsService';

const adminPanelService = {
  getUsers: () => adminService.getAllUsers(),
  updateUserRole: (userId, role) => adminService.updateUserRole(userId, role),
  deleteUser: (userId) => adminService.deleteUser(userId),

  getProjects: () => adminService.getAllProjects(),
  deleteProject: (projectId) => adminService.deleteProject(projectId),

  getTemplates: () => adminService.getAllTemplates(),
  createTemplate: (template) => adminService.createTemplate(template),
  updateTemplate: (templateId, updates) => adminService.updateTemplate(templateId, updates),
  deleteTemplate: (templateId) => adminService.deleteTemplate(templateId),
  getTemplateModerationQueue: () => adminService.getTemplateModerationQueue(),
  approveTemplate: (templateId) => adminService.approveTemplate(templateId),
  rejectTemplate: (templateId) => adminService.rejectTemplate(templateId),
  getAuditLogs: () => adminService.getAuditLogs(),
  getEditorContentConfig: () => adminService.getEditorContentConfig(),
  updateEditorContentConfig: (config) => adminService.updateEditorContentConfig(config),

  getAnalytics: () => analyticsService.getDashboardStats(),
};

export default adminPanelService;
