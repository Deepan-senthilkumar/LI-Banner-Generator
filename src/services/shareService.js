import dataProvider from './dataProvider';

const TABLE_SHARES = 'shared_links';

export const shareService = {
  // Generate a public share link
  createShareLink: async (projectId) => {
    const existing = await dataProvider.getAll(TABLE_SHARES, { projectId });
    if (existing.length > 0) return existing[0];

    const shareId = Math.random().toString(36).substr(2, 12);
    return await dataProvider.create(TABLE_SHARES, {
        projectId,
        shareId,
        views: 0,
        createdAt: new Date().toISOString()
    });
  },

  // Get project by share ID (Public Access)
  getSharedProject: async (shareId) => {
    const shares = await dataProvider.getAll(TABLE_SHARES, { shareId });
    if (shares.length === 0) return null;

    const share = shares[0];
    
    // Increment view count
    await dataProvider.update(TABLE_SHARES, share.id, { views: share.views + 1 });

    // Fetch actual project
    const project = await dataProvider.get('user_projects', share.projectId);
    return project;
  }
};
