import dataProvider from './dataProvider';
import { templateService } from './templateService';
import editorContentService from './editorContentService';
import auditService from './auditService';

const USERS_TABLE = 'users';
const PROJECTS_TABLE = 'user_projects';

const toRole = (role) => (role === 'admin' ? 'admin' : 'user');

const adminService = {
  async getAllUsers() {
    const users = await dataProvider.getAll(USERS_TABLE, {});
    return (users || []).map((user) => ({ ...user, role: toRole(user.role) }));
  },

  async updateUserRole(userId, role) {
    const updated = await dataProvider.update(USERS_TABLE, userId, { role: toRole(role) });
    await auditService.log('user.role.updated', { userId, role: toRole(role) });
    return updated;
  },

  async deleteUser(userId) {
    await dataProvider.delete(USERS_TABLE, userId);
    const projects = await dataProvider.getAll(PROJECTS_TABLE, {});
    const owned = (projects || []).filter((project) => project.userId === userId);
    await Promise.all(owned.map((project) => dataProvider.delete(PROJECTS_TABLE, project.id)));
    await auditService.log('user.deleted', { userId });
    return true;
  },

  async getAllProjects() {
    const [projects, users] = await Promise.all([
      dataProvider.getAll(PROJECTS_TABLE, {}),
      dataProvider.getAll(USERS_TABLE, {}),
    ]);

    const userMap = Object.fromEntries((users || []).map((user) => [user.id, user]));
    return (projects || []).map((project) => ({
      ...project,
      ownerName: userMap[project.userId]?.name,
      ownerEmail: userMap[project.userId]?.email,
    }));
  },

  async deleteProject(projectId) {
    const deleted = await dataProvider.delete(PROJECTS_TABLE, projectId);
    await auditService.log('project.deleted', { projectId });
    return deleted;
  },

  async getAllTemplates() {
    return templateService.getAllTemplatesRaw();
  },

  async createTemplate(template) {
    const created = await templateService.createTemplate(template);
    await auditService.log('template.created', { templateId: created.id, name: created.name });
    return created;
  },

  async updateTemplate(templateId, updates) {
    const updated = await templateService.updateTemplate(templateId, updates);
    await auditService.log('template.updated', { templateId });
    return updated;
  },

  async deleteTemplate(templateId) {
    const deleted = await templateService.deleteTemplate(templateId);
    await auditService.log('template.deleted', { templateId });
    return deleted;
  },

  async getEditorContentConfig() {
    return editorContentService.getConfig();
  },

  async updateEditorContentConfig(config) {
    return editorContentService.updateConfig(config);
  },

  async getTemplateModerationQueue() {
    const templates = await templateService.getAllTemplatesRaw();
    return templates.filter((template) => template.status !== 'approved');
  },

  async approveTemplate(templateId) {
    const approved = await templateService.updateTemplate(templateId, { status: 'approved' });
    await auditService.log('template.approved', { templateId });
    return approved;
  },

  async rejectTemplate(templateId) {
    const rejected = await templateService.updateTemplate(templateId, { status: 'rejected' });
    await auditService.log('template.rejected', { templateId });
    return rejected;
  },

  async getAuditLogs() {
    return auditService.getLogs();
  },
};

export default adminService;
