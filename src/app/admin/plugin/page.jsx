import PluginClient from './PluginClient';
import { getSystemSettings } from '@/app/actions/adminActions';

export const metadata = {
  title: 'Plugin Distribution | Admin',
};

export default async function PluginPage() {
  const settings = await getSystemSettings();

  return (
    <div className="max-w-6xl mx-auto">
      <PluginClient initialSettings={settings} />
    </div>
  );
}
