/** Tăng khi định dạng quyền trong token thay đổi -> token cũ bị coi là không hợp lệ. */
export const PERMISSION_CLAIM_VERSION = 2;

export interface AuthJWTPayload {
  sub: string;
  username: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  pv: number;
  departmentName?: string;
  isPasswordChanged: boolean;
  iat?: number;
  exp?: number;
}
