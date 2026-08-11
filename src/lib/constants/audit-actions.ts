// Audit log action constants
export const AUDIT_ACTIONS = {
  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_APPROVED: 'user_approved',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  USER_REJECTED: 'user_rejected',
  
  // Role Management
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REMOVED: 'role_removed',
  
  // Permission Management
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  PERMISSION_CREATED: 'permission_created',
  PERMISSION_UPDATED: 'permission_updated',
  PERMISSION_DELETED: 'permission_deleted',
  
  // Group Management
  GROUP_CREATED: 'group_created',
  GROUP_UPDATED: 'group_updated',
  GROUP_DELETED: 'group_deleted',
  GROUP_MEMBER_ADDED: 'group_member_added',
  GROUP_MEMBER_REMOVED: 'group_member_removed',
  
  // Tag Management
  TAG_CREATED: 'tag_created',
  TAG_UPDATED: 'tag_updated',
  TAG_DELETED: 'tag_deleted',
  TAG_ASSIGNED: 'tag_assigned',
  TAG_REMOVED: 'tag_removed',
  
  // System Actions
  SYSTEM_LOGIN: 'system_login',
  SYSTEM_LOGOUT: 'system_logout',
  SYSTEM_SETTINGS_UPDATED: 'system_settings_updated',
  BULK_ACTION_PERFORMED: 'bulk_action_performed',
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported'
} as const

export const RESOURCE_TYPES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  GROUP: 'group',
  TAG: 'tag',
  SYSTEM: 'system',
  AUDIT_LOG: 'audit_log'
} as const

