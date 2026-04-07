import GlobalSettings from './SettingsClient';
import { getSystemSettings } from '@/app/actions/adminActions';

export const metadata = {
  title: 'System Configuration | Admin',
};

export default async function SettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="max-w-6xl mx-auto">
      <GlobalSettings initialSettings={settings} />
    </div>
  );
}
