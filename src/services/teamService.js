import dataProvider from './dataProvider';

const TABLE_TEAMS = 'teams';
const TABLE_TEAM_MEMBERS = 'team_members';
const TABLE_INVITES = 'team_invites';
const TABLE_PROJECTS = 'user_projects';
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';

const byUpdatedDesc = (items = []) => (
  [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
);

const findLocalTeam = (teams = [], userId) => (
  teams.find((team) => (
    team.ownerId === userId
    || (Array.isArray(team.members) && team.members.some((member) => member.id === userId))
  ))
);

const getUsersMap = async (ids = []) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const users = await Promise.all(uniqueIds.map(async (id) => {
    try {
      return await dataProvider.get('users', id);
    } catch {
      return null;
    }
  }));

  return users.reduce((acc, user) => {
    if (user?.id) acc[user.id] = user;
    return acc;
  }, {});
};

export const teamService = {
  // Get user's team
  getMyTeam: async (userId) => {
    const teams = await dataProvider.getAll(TABLE_TEAMS, {});

    if (PROVIDER === 'local') {
      const team = findLocalTeam(teams || [], userId);
      if (!team) return null;

      const members = Array.isArray(team.members) ? team.members : [];
      const usersById = await getUsersMap([team.ownerId, ...members.map((member) => member.id)]);
      const hydratedMembers = [
        { id: team.ownerId, role: 'owner' },
        ...members.map((member) => ({ id: member.id, role: member.role || 'member' })),
      ]
        .filter((member, index, arr) => arr.findIndex((row) => row.id === member.id) === index)
        .map((member) => ({
          ...member,
          name: usersById[member.id]?.name || member.name || 'Team Member',
          email: usersById[member.id]?.email || member.email || '',
        }));

      return { ...team, members: hydratedMembers, memberCount: hydratedMembers.length };
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
    const usersById = await getUsersMap([team.ownerId, ...(membershipRows || []).map((member) => member.userId)]);
    const members = [
      { id: team.ownerId, role: 'owner' },
      ...(membershipRows || []).map((member) => ({ id: member.userId, role: member.role || 'member' })),
    ]
      .filter((member, index, arr) => arr.findIndex((row) => row.id === member.id) === index)
      .map((member) => ({
        ...member,
        name: usersById[member.id]?.name || 'Team Member',
        email: usersById[member.id]?.email || '',
      }));

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
        // Ignore if policy denies owner row insertion or row already exists.
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

    const owners = (team.members || []).reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});

    return byUpdatedDesc(projects).map((project) => ({
      ...project,
      ownerName: owners[project.userId]?.name || 'Team Member',
      ownerEmail: owners[project.userId]?.email || '',
    }));
  },
};
