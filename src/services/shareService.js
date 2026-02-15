import dataProvider from './dataProvider';
import { getSupabaseClient } from './supabaseClient';

const TABLE_SHARES = 'shared_links';
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';

const toCamelCase = (value) => value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
const mapKeysToCamel = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  return Object.fromEntries(Object.entries(record).map(([key, val]) => [toCamelCase(key), val]));
};

const buildShareId = () => `shr_${Math.random().toString(36).slice(2, 14)}`;

export const shareService = {
  // Generate a public share link
  createShareLink: async (projectId) => {
    const existing = await dataProvider.getAll(TABLE_SHARES, { projectId });
    if (existing.length > 0) return existing[0];

    const shareId = buildShareId();
    return await dataProvider.create(TABLE_SHARES, {
        projectId,
        shareId,
        views: 0,
        createdAt: new Date().toISOString()
    });
  },

  // Get project by share ID (Public Access)
  getSharedProject: async (shareId) => {
    if (PROVIDER === 'supabase') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('get_shared_project', { p_share_id: shareId });
      if (error) throw new Error(error.message || 'Failed to load shared project');
      return data ? mapKeysToCamel(data) : null;
    }

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
