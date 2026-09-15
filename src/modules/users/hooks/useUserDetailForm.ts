'use client';

import { useState } from 'react';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { resetPasswordAction, updateUserRoleAction } from '@/modules/users/users.actions';

interface FormMessage {
  type: 'success' | 'error';
  text: string;
}

/** Đổi vai trò + reset mật khẩu cho một tài khoản. */
export function useUserDetailForm(user: { id: string; fullName: string; roleId: string }) {
  const [roleId, setRoleId] = useState(user.roleId);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const roleAction = useServerAction(updateUserRoleAction, {
    onSuccess: () => setMessage({ type: 'success', text: 'Đã cập nhật vai trò thành công.' }),
    onError: (text) => setMessage({ type: 'error', text }),
  });

  const passwordAction = useServerAction(resetPasswordAction, {
    onSuccess: (data) => alert(`Đã reset mật khẩu thành công về: ${data.defaultPassword}`),
  });

  const handleSaveRole = async () => {
    setMessage(null);
    await roleAction.execute(user.id, roleId);
  };

  const handleResetPass = async () => {
    if (!confirm(`Reset mật khẩu của "${user.fullName}" về mặc định "10xEnglish@2026"?`)) return;
    await passwordAction.execute(user.id);
  };

  return {
    roleId,
    setRoleId,
    message,
    isSaving: roleAction.isLoading,
    handleSaveRole,
    handleResetPass,
  };
}
