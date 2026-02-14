import dataProvider from './dataProvider';

const TABLE_TEAMS = 'teams';
const TABLE_TEAM_MEMBERS = 'team_members';
const TABLE_INVITES = 'team_invites';
const TABLE_PROJECTS = 'user_projects';
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';

const uniqueById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const sortByUpdatedDesc = (items = []) => (
  [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
);

const hydrateUsersMap = async (userIds = []) => {
  const rows = await Promise.all(userIds.map(async (id) => {
    try {
      return await dataProvider.get('users', id);
    } catch {
      return null;
    }
  }));

  return rows.reduce((acc, user) => {
    if (user?.id) acc[user.id] = user;
    return acc;
  }, {});
};

const toDisplayMembers = (team, usersById, membershipRows = []) => {
  const ownerId = team?.ownerId;
  const embeddedMembers = Array.isArray(team?.members) ? team.members : [];

  const derivedMembers = membershipRows.map((member) => ({
    id: member.userId,
    role: member.role || 'member',
  }));

  const base = uniqueById([
    ownerId ? { id: ownerId, role: 'owner' } : null,
    ...embeddedMembers.map((member) => ({ id: member.id, role: member.role || 'member' })),
    ...derivedMembers,
  ].filter(Boolean));

  return base.map((member) => ({
    id: member.id,
    name: usersById[member.id]?.name || member.name || 'Team Member',
    email: usersById[member.id]?.email || member.email || '',
    role: member.role,
  }));
};

export const teamService = {
  // Get user's team
  getMyTeam: async (userId) => {
    const teams = await dataProvider.getAll(TABLE_TEAMS, {});

    if (PROVIDER === 'local') {
      const localTeam = (teams || []).find((team) => (
        team.ownerId === userId
        || (Array.isArray(team.members) && team.members.some((member) => member.id === userId))
      ));

      if (!localTeam) return null;
      const memberIds = uniqueById([
        { id: localTeam.ownerId },
        ...(localTeam.members || []).map((member) => ({ id: member.id })),
      ]).map((item) => item.id);
      const usersById = await hydrateUsersMap(memberIds);
      const members = toDisplayMembers(localTeam, usersById, []);
      return { ...localTeam, members, memberCount: members.length };
    }

    const ownedTeam = (teams || []).find((team) => team.ownerId === userId);
    let team = ownedTeam || null;

    if (!team) {
      const memberships = await dataProvider.getAll(TABLE_TEAM_MEMBERS, { userId });
      const firstMembership = memberships?.[0];
      if (!firstMembership?.teamId) return null;
      team = await dataProvider.get(TABLE_TEAMS, firstMembership.teamId);
    }

    if (!team) return null;

    const membershipRows = await dataProvider.getAll(TABLE_TEAM_MEMBERS, { teamId: team.id });
    const memberIds = uniqueById([
      { id: team.ownerId },
      ...(membershipRows || []).map((member) => ({ id: member.userId })),
    ]).map((item) => item.id);
    const usersById = await hydrateUsersMap(memberIds);
    const members = toDisplayMembers(team, usersById, membershipRows || []);

    return { ...team, members, memberCount: members.length };
  },

  // Create a new team
  createTeam: async (userId, teamName) => {
    const createdTeam = await dataProvider.create(TABLE_TEAMS, {
      ownerId: userId,
      name: teamName,
      members: [],
      projects: [],
    });

    if (PROVIDER === 'supabase') {
      try {
        await dataProvider.create(TABLE_TEAM_MEMBERS, {
          teamId: createdTeam.id,
          userId,
          role: 'owner',
        });
      } catch {
        // Membership can already exist or be restricted by policy; ignore for idempotency.
      }
      return teamService.getMyTeam(userId);
    }

    return createdTeam;
  },

  // Invite user (mock)
  inviteMember: async (teamId, email) => {
    // In real app: Send email via backend
    return await dataProvider.create(TABLE_INVITES, {
      teamId,
      email,
      status: 'pending',
      token: Math.random().toString(36).slice(2, 14),
      expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
    });
  },

  // Get Shared Projects
  getSharedProjects: async (userId) => {
    const team = await teamService.getMyTeam(userId);
    if (!team) return [];

    const teammateIds = (team.members || [])
      .map((member) => member.id)
      .filter((id) => id && id !== userId);

    if (teammateIds.length === 0) return [];

    const ownerMeta = (team.members || []).reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});

    let projects = [];
    if (PROVIDER === 'supabase') {
      try {
        projects = await dataProvider.getAll(TABLE_PROJECTS, { userId: teammateIds });
      } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('row-level security') || message.includes('permission')) {
          return [];
        }
        throw error;
      }
    } else {
      const allProjects = await dataProvider.getAll(TABLE_PROJECTS, {});
      projects = (allProjects || []).filter((project) => teammateIds.includes(project.userId));
    }

    return sortByUpdatedDesc(projects).map((project) => ({
      ...project,
      ownerName: ownerMeta[project.userId]?.name || 'Team Member',
      ownerEmail: ownerMeta[project.userId]?.email || '',
    }));
  },
};
