export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const isAdminRole = (role) => role === ROLES.ADMIN;

export const canAccessAdmin = (user) => Boolean(user && isAdminRole(user.role));

export const normalizeUserRole = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: isAdminRole(user.role) ? ROLES.ADMIN : ROLES.USER,
  };
};
