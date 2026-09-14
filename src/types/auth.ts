export type Role = 'DEV_ADMIN' | 'MANAGER' | 'LEAD_STAFF' | 'STAFF';

export interface AuthJWTPayload {
  sub: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  departmentName?: string;
  isPasswordChanged: boolean;
  iat?: number;
  exp?: number;
}
