import { getSupabaseClient } from '../supabaseClient';

const toSnakeCase = (value) => value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
const toCamelCase = (value) => value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

const mapRecordToDb = (record = {}) => Object.fromEntries(
  Object.entries(record).map(([key, value]) => [toSnakeCase(key), value]),
);

const mapRecordToApp = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [toCamelCase(key), value]),
  );
};

const mapError = (error, context) => {
  const message = error?.message || 'Unknown Supabase error';
  return new Error(`Supabase ${context} failed: ${message}`);
};

const parseDraftKey = (key) => {
  const match = /^draft_(.+)_(.+)$/.exec(String(key || ''));
  if (!match) return null;
  return { userId: match[1], projectId: match[2] };
};

const allowedTables = new Set([
  'users',
  'templates',
  'user_projects',
  'project_drafts',
  'brand_kits',
  'shared_links',
  'teams',
  'team_members',
  'team_invites',
  'admin_audit_logs',
  'editor_content_config',
  'growth_post_drafts',
  'growth_carousel_decks',
  'growth_swipe_files',
  'growth_engagement_streaks',
  'growth_crm_leads',
  'growth_integrations',
  'subscriptions',
  'app_monitoring_events',
]);

const tablesWithUpdatedAt = new Set([
  'users',
  'templates',
  'user_projects',
  'brand_kits',
  'shared_links',
  'teams',
  'team_invites',
  'editor_content_config',
  'growth_post_drafts',
  'growth_carousel_decks',
  'growth_engagement_streaks',
  'growth_crm_leads',
  'growth_integrations',
  'subscriptions',
]);

const assertAllowedTable = (table) => {
  if (!allowedTables.has(table)) {
    throw new Error(`Supabase table "${table}" is not allowed by provider whitelist`);
  }
};

const isSessionError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.status === 401
    || message.includes('jwt expired')
    || message.includes('invalid jwt')
    || message.includes('session expired')
  );
};

const runWithAuthRetry = async (queryFactory) => {
  let result = await queryFactory();
  if (!result?.error || !isSessionError(result.error)) return result;

  const supabase = getSupabaseClient();
  await supabase.auth.refreshSession();
  result = await queryFactory();
  return result;
};

const applyFilter = (query, filter = {}) => {
  let next = query;
  const filterDb = mapRecordToDb(filter);

  Object.entries(filterDb).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      if (!value.length) return;
      next = next.in(key, value);
      return;
    }

    if (value === null) {
      next = next.is(key, null);
      return;
    }

    next = next.eq(key, value);
  });

  return next;
};

const supabaseProvider = {
  get: async (table, id) => {
    assertAllowedTable(table);
    const supabase = getSupabaseClient();
    const { data, error } = await runWithAuthRetry(
      () => supabase.from(table).select('*').eq('id', id).maybeSingle(),
    );
    if (error) throw mapError(error, `get(${table})`);
    return mapRecordToApp(data);
  },

  getAll: async (table, filter = {}) => {
    assertAllowedTable(table);
    const supabase = getSupabaseClient();
    const queryFactory = () => {
      let query = supabase.from(table).select('*');
      query = applyFilter(query, filter);

      if (tablesWithUpdatedAt.has(table)) {
        query = query.order('updated_at', { ascending: false });
      }

      return query;
    };
    const { data, error } = await runWithAuthRetry(queryFactory);
    if (error) throw mapError(error, `getAll(${table})`);
    return (data || []).map(mapRecordToApp);
  },

  create: async (table, data) => {
    assertAllowedTable(table);
    const supabase = getSupabaseClient();
    const payload = mapRecordToDb(data);
    const { data: created, error } = await runWithAuthRetry(
      () => supabase.from(table).insert(payload).select('*').single(),
    );
    if (error) throw mapError(error, `create(${table})`);
    return mapRecordToApp(created);
  },

  update: async (table, id, data) => {
    assertAllowedTable(table);
    const supabase = getSupabaseClient();
    const payload = mapRecordToDb(data);
    delete payload.id;

    const { data: updated, error } = await runWithAuthRetry(
      () => supabase.from(table).update(payload).eq('id', id).select('*').single(),
    );
    if (error) throw mapError(error, `update(${table})`);
    return mapRecordToApp(updated);
  },

  delete: async (table, id) => {
    assertAllowedTable(table);
    const supabase = getSupabaseClient();
    const { error } = await runWithAuthRetry(
      () => supabase.from(table).delete().eq('id', id),
    );
    if (error) throw mapError(error, `delete(${table})`);
    return true;
  },

  saveDraft: async (key, data) => {
    const parsed = parseDraftKey(key);
    if (!parsed) throw new Error(`Invalid draft key: ${key}`);

    const supabase = getSupabaseClient();
    const payload = {
      user_id: parsed.userId,
      project_id: parsed.projectId,
      draft_data: data,
      saved_at: new Date().toISOString(),
    };

    const { error } = await runWithAuthRetry(
      () => supabase
        .from('project_drafts')
        .upsert(payload, { onConflict: 'user_id,project_id' }),
    );

    if (error) throw mapError(error, 'saveDraft(project_drafts)');
    return true;
  },

  getDraft: async (key) => {
    const parsed = parseDraftKey(key);
    if (!parsed) return null;

    const supabase = getSupabaseClient();
    const { data, error } = await runWithAuthRetry(
      () => supabase
        .from('project_drafts')
        .select('draft_data')
        .eq('user_id', parsed.userId)
        .eq('project_id', parsed.projectId)
        .maybeSingle(),
    );

    if (error) throw mapError(error, 'getDraft(project_drafts)');
    return data?.draft_data || null;
  },
};

export default supabaseProvider;
