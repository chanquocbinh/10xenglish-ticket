/** View model danh sách tài khoản dùng cho bảng quản trị. */
export interface UserListItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  isPasswordChanged: boolean;
  department: { name: string } | null;
  role: { id: string; name: string };
  createdAt: Date;
}

/** View model chi tiết một tài khoản. */
export interface UserDetailItem extends UserListItem {
  roleId: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface CreatedUserResult {
  user: { id: string; fullName: string; username: string; email: string };
  defaultPassword: string;
}
