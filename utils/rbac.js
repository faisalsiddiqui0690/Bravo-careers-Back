const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  VIEWER: 'VIEWER'
};

const Permission = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  
  // User management permissions
  VIEW_USERS: 'VIEW_USERS',
  CREATE_USERS: 'CREATE_USERS',
  EDIT_USERS: 'EDIT_USERS',
  DELETE_USERS: 'DELETE_USERS',
  MANAGE_USER_ROLES: 'MANAGE_USER_ROLES',
  
  // Admin management permissions
  VIEW_ADMINS: 'VIEW_ADMINS',
  CREATE_ADMINS: 'CREATE_ADMINS',
  EDIT_ADMINS: 'EDIT_ADMINS',
  DELETE_ADMINS: 'DELETE_ADMINS',
  MANAGE_ADMIN_ROLES: 'MANAGE_ADMIN_ROLES',
  
  // Content management permissions
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_REPORTS: 'MANAGE_REPORTS',
  VIEW_LIKES: 'VIEW_LIKES',
  MANAGE_LIKES: 'MANAGE_LIKES',
  VIEW_MESSAGES: 'VIEW_MESSAGES',
  MANAGE_MESSAGES: 'MANAGE_MESSAGES',
  VIEW_ONLINE_USERS: 'VIEW_ONLINE_USERS',
  
  // System permissions
  VIEW_SYSTEM_SETTINGS: 'VIEW_SYSTEM_SETTINGS',
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  VIEW_SYSTEM_LOGS: 'VIEW_SYSTEM_LOGS',
  
  // Profile permissions
  VIEW_PROFILE: 'VIEW_PROFILE',
  EDIT_PROFILE: 'EDIT_PROFILE'
};

const ROLE_PERMISSIONS = {
  [Role.SUPER_ADMIN]: [
    // Super Admin has all permissions
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ADMINS,
    Permission.CREATE_ADMINS,
    Permission.EDIT_ADMINS,
    Permission.DELETE_ADMINS,
    Permission.MANAGE_ADMIN_ROLES,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_REPORTS,
    Permission.VIEW_LIKES,
    Permission.MANAGE_LIKES,
    Permission.VIEW_MESSAGES,
    Permission.MANAGE_MESSAGES,
    Permission.VIEW_ONLINE_USERS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE
  ],
  
  [Role.ADMIN]: [
    // Admin has most permissions except admin management
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_REPORTS,
    Permission.VIEW_LIKES,
    Permission.MANAGE_LIKES,
    Permission.VIEW_MESSAGES,
    Permission.MANAGE_MESSAGES,
    Permission.VIEW_ONLINE_USERS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE
  ],
  
  [Role.MODERATOR]: [
    // Moderator can view and manage content
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_REPORTS,
    Permission.VIEW_LIKES,
    Permission.VIEW_MESSAGES,
    Permission.MANAGE_MESSAGES,
    Permission.VIEW_ONLINE_USERS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE
  ],
  
  [Role.VIEWER]: [
    // Viewer can only view content
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_LIKES,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_ONLINE_USERS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE
  ]
};

class RBAC {
  static getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
  }

  static hasPermission(user, permission) {
    if (!user || !user.isActive) return false;
    
    const userPermissions = user.permissions || this.getRolePermissions(user.role);
    return userPermissions.includes(permission);
  }

  static hasAnyPermission(user, permissions) {
    if (!user || !user.isActive) return false;
    
    const userPermissions = user.permissions || this.getRolePermissions(user.role);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  static hasAllPermissions(user, permissions) {
    if (!user || !user.isActive) return false;
    
    const userPermissions = user.permissions || this.getRolePermissions(user.role);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  static hasRole(user, role) {
    if (!user || !user.isActive) return false;
    return user.role === role;
  }

  static canManageRole(managerRole, targetRole) {
    const roleHierarchy = {
      [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.VIEWER],
      [Role.ADMIN]: [Role.ADMIN, Role.MODERATOR, Role.VIEWER],
      [Role.MODERATOR]: [Role.VIEWER],
      [Role.VIEWER]: []
    };
    
    return roleHierarchy[managerRole]?.includes(targetRole) || false;
  }

  static getMinimumRoleForPermission(permission) {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(permission)) {
        return role;
      }
    }
    return Role.SUPER_ADMIN;
  }

  static validateRole(role) {
    return Object.values(Role).includes(role);
  }

  static validatePermission(permission) {
    return Object.values(Permission).includes(permission);
  }
}

module.exports = {
  Role,
  Permission,
  ROLE_PERMISSIONS,
  RBAC
};
