'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { permissionsOfModule, type Permission, type PermissionModule } from '@/core/auth/permissions';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { createRoleAction, updateRoleAction } from '../roles.actions';

export interface RoleFormValue {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
}

/**
 * State + submit của form vai trò: tạo mới hoặc cập nhật.
 * Vai trò hệ thống chỉ xem (readOnly), không cho submit.
 */
export function useRoleForm(mode: 'create' | 'edit', role?: RoleFormValue) {
  const router = useRouter();
  const readOnly = mode === 'edit' && !!role?.isSystem;
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState<Permission[]>((role?.permissions as Permission[]) || []);

  const submit = useCallback(
    (input: { name: string; description: string; permissions: Permission[] }) =>
      mode === 'create'
        ? createRoleAction(input)
        : updateRoleAction({ roleId: role!.id, ...input }),
    [mode, role],
  );

  const { execute, isLoading, error } = useServerAction(submit, {
    refresh: false,
    onSuccess: () => router.push('/roles'),
  });

  const togglePermission = (p: Permission, checked: boolean) => {
    setPermissions((prev) => (checked ? [...prev, p] : prev.filter((x) => x !== p)));
  };

  const toggleModule = (module: PermissionModule, checked: boolean) => {
    const modulePerms = permissionsOfModule(module);
    setPermissions((prev) =>
      checked
        ? Array.from(new Set([...prev, ...modulePerms]))
        : prev.filter((p) => !modulePerms.includes(p)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute({ name, description, permissions });
  };

  return {
    readOnly,
    name,
    setName,
    description,
    setDescription,
    permissions,
    togglePermission,
    toggleModule,
    isSubmitting: isLoading,
    errorMessage: error,
    handleSubmit,
  };
}
