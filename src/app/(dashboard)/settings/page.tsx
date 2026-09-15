import { requirePagePermission } from '@/core/server/page';
import { getSystemSetting } from '@/modules/settings/settings.service';
import { SettingsForm } from '@/modules/settings/components/SettingsForm';

export default async function SettingsPage() {
  await requirePagePermission('settings.view');

  const setting = await getSystemSetting();

  return <SettingsForm initialSetting={setting} />;
}
