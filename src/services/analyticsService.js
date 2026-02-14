import dataProvider from './dataProvider';
import { templateService } from './templateService';

const USERS_TABLE = 'users';
const PROJECTS_TABLE = 'user_projects';

const buildActivity = (users, projects) => {
  const activity = [];
  (users || []).slice(-5).forEach((user) => {
    activity.push({
      id: `user_${user.id}`,
      message: `User ${user.email} signed up`,
      at: user.createdAt || new Date().toISOString(),
    });
  });
  (projects || []).slice(-5).forEach((project) => {
    activity.push({
      id: `project_${project.id}`,
      message: `Project "${project.title || 'Untitled'}" created`,
      at: project.createdAt || new Date().toISOString(),
    });
  });
  return activity.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
};

const analyticsService = {
  async getDashboardStats() {
    const [users, projects, templates] = await Promise.all([
      dataProvider.getAll(USERS_TABLE, {}),
      dataProvider.getAll(PROJECTS_TABLE, {}),
      templateService.getTemplates(),
    ]);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersLast7Days = (users || []).filter((user) => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt).getTime() >= sevenDaysAgo;
    }).length;

    const roleDistribution = {
      admin: (users || []).filter((user) => user.role === 'admin').length,
      user: (users || []).filter((user) => user.role !== 'admin').length,
    };

    const projectsByTemplate = (projects || []).reduce((acc, project) => {
      const key = project.templateId || project.designData?.config?.template || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const projectsLast7Days = (projects || []).filter((project) => {
      if (!project.createdAt) return false;
      return new Date(project.createdAt).getTime() >= sevenDaysAgo;
    }).length;

    return {
      totalUsers: (users || []).length,
      adminCount: (users || []).filter((user) => user.role === 'admin').length,
      totalProjects: (projects || []).length,
      templatesCount: (templates || []).length,
      newUsersLast7Days,
      projectsLast7Days,
      roleDistribution,
      projectsByTemplate,
      recentActivity: buildActivity(users, projects),
    };
  },
};

export default analyticsService;
