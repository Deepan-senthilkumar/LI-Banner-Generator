import dataProvider from './dataProvider';

const TABLE = 'user_projects';

export const projectService = {
  // Get all projects for a specific user
  getByUser: async (userId) => {
    return await dataProvider.getAll(TABLE, { userId });
  },

  // Get single project by ID
  getById: async (projectId) => {
    return await dataProvider.get(TABLE, projectId);
  },

  // Create new project
  create: async (projectData) => {
    return await dataProvider.create(TABLE, projectData);
  },

  // Update existing project
  update: async (projectId, updates) => {
    return await dataProvider.update(TABLE, projectId, updates);
  },

  // Delete project
  delete: async (projectId) => {
    return await dataProvider.delete(TABLE, projectId);
  },

  // Duplicate project
  duplicate: async (projectId, userId) => {
    const original = await dataProvider.get(TABLE, projectId);
    if (!original) throw new Error('Project not found');
    
    // Remove ID to force new generation in create
    const { id: _projectId, ...data } = original;
    
    return await dataProvider.create(TABLE, {
      ...data,
      userId,
      title: `${original.title} (Copy)`,
      updatedAt: new Date().toISOString()
    });
  }
};
