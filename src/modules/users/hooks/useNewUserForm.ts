'use client';

import { useState } from 'react';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { createUserAction } from '@/modules/users/users.actions';
import type { DepartmentOption } from '@/modules/users/users.types';

export interface CreatedUserInfo {
  fullName: string;
  username: string;
  defaultPass: string;
}

/** State + submit của form tạo tài khoản mới. */
export function useNewUserForm(departments: DepartmentOption[], roles: { id: string; name: string }[]) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [roleId, setRoleId] = useState(roles[0]?.id || '');
  const [createdResult, setCreatedResult] = useState<CreatedUserInfo | null>(null);

  const { execute, isLoading, error } = useServerAction(createUserAction, { refresh: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('departmentId', departmentId);
    formData.append('roleId', roleId);

    const result = await execute(formData);
    if (result.success) {
      setCreatedResult({ fullName, username, defaultPass: result.data.defaultPassword });
    }
  };

  return {
    fullName,
    setFullName,
    username,
    setUsername,
    email,
    setEmail,
    departmentId,
    setDepartmentId,
    roleId,
    setRoleId,
    createdResult,
    isSubmitting: isLoading,
    errorMessage: error,
    handleSubmit,
  };
}
