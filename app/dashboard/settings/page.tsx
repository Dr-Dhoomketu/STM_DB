import { auth } from '@/lib/auth-config';
import { SettingsForm } from '@/components/SettingsForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <SettingsForm userId={parseInt(session.user.id)} />
    </div>
  );
}

