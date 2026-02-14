import dataProvider from './dataProvider';

const TABLE_TEAMS = 'teams';
const TABLE_INVITES = 'team_invites';

export const teamService = {
  // Get user's team
  getMyTeam: async (userId) => {
    const teams = await dataProvider.getAll(TABLE_TEAMS);
    return teams.find(t => t.ownerId === userId || t.members.some(m => m.id === userId));
  },

  // Create a new team
  createTeam: async (userId, teamName) => {
    return await dataProvider.create(TABLE_TEAMS, {
        ownerId: userId,
        name: teamName,
        members: [], // { id, name, role }
        projects: []
    });
  },

  // Invite user (mock)
  inviteMember: async (teamId, email) => {
    // In real app: Send email via backend
    return await dataProvider.create(TABLE_INVITES, {
        teamId,
        email,
        status: 'pending',
        token: Math.random().toString(36).substr(2)
    });
  },

  // Get Shared Projects
  getSharedProjects: async (userId) => {
     // Mock logic: Get projects where userId is in 'sharedWith' (requires project schema update conceptually)
     // For now, return all projects from the user's team
     const team = await teamService.getMyTeam(userId);
     if (!team) return [];
     
     // Fetch actual project data referenced in team
     // const projects = await Promise.all(team.projects.map(pid => dataProvider.get('user_projects', pid)));
     // return projects.filter(p => p !== null);
     return [];
  }
};
