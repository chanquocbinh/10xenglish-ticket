import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { SettingsClientView } from './SettingsClientView';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'DEV_ADMIN') {
    redirect('/');
  }

  let setting = await prisma.systemSetting.findUnique({
    where: { id: 'default' },
  });

  if (!setting) {
    setting = await prisma.systemSetting.create({
      data: {
        id: 'default',
        allowedFileTypes: 'image/png,image/jpeg,image/webp,video/mp4,video/quicktime',
        maxImageSizeMb: 10,
        maxVideoSizeMb: 50,
        allowVideoUpload: true,
        storageQuotaGb: 20,
      },
    });
  }

  return <SettingsClientView initialSetting={setting} />;
}
