import { notFound } from 'next/navigation';
import { NotFoundError } from '@/core/errors';
import { requirePagePermission } from '@/core/server/page';
import { getRole } from '@/modules/roles/roles.service';
import { RoleForm } from '@/modules/roles/components/RoleForm';

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission('roles.update', '/roles');

  const { id } = await params;
  const role = await getRole(id).catch((error) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });
  if (!role) notFound();

  return <RoleForm mode="edit" role={role} />;
}
