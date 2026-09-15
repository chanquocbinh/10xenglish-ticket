export const PERMISSION_MODULES = {
  dashboard: ['view'],
  tickets: ['view', 'create', 'update', 'comment', 'approve'],
  tasks: ['view', 'create', 'update', 'approve'],
  sprints: ['view', 'update'],
  approval: ['view'],
  users: ['view', 'create', 'update', 'resetPassword'],
  roles: ['view', 'create', 'update', 'delete'],
  settings: ['view', 'update'],
  projects: ['view', 'create', 'update', 'manageMembers'],
} as const;

export type PermissionModule = keyof typeof PERMISSION_MODULES;
export type Permission = {
  [M in PermissionModule]: `${M}.${(typeof PERMISSION_MODULES)[M][number]}`;
}[PermissionModule];

export const PERMISSION_MODULE_KEYS = Object.keys(PERMISSION_MODULES) as PermissionModule[];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_MODULE_KEYS.flatMap((m) =>
  PERMISSION_MODULES[m].map((a) => `${m}.${a}` as Permission),
);

export function permissionsOfModule(module: PermissionModule): Permission[] {
  return PERMISSION_MODULES[module].map((a) => `${module}.${a}` as Permission);
}

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as string[]).includes(value);
}

/** Khớp quyền lá, wildcard theo module (`users.*`) và wildcard toàn hệ thống (`*`). */
export function hasPermission(actor: { permissions: string[] }, permission: Permission): boolean {
  if (actor.permissions.includes('*') || actor.permissions.includes(permission)) return true;
  const module = permission.slice(0, permission.indexOf('.'));
  return actor.permissions.includes(`${module}.*`);
}
