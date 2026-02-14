import dataProvider from './dataProvider';

const DRAFT_PREFIX = 'draft';

export const draftService = {
  saveDraft: async (userId, projectId, data) => {
    const key = `${DRAFT_PREFIX}_${userId}_${projectId}`;
    await dataProvider.saveDraft(key, {
        ...data,
        savedAt: new Date().toISOString()
    });
  },

  getDraft: async (userId, projectId) => {
    const key = `${DRAFT_PREFIX}_${userId}_${projectId}`;
    return await dataProvider.getDraft(key);
  },

  clearDraft: async (userId, projectId) => {
      const key = `${DRAFT_PREFIX}_${userId}_${projectId}`;
      await dataProvider.saveDraft(key, null);
  }
};
