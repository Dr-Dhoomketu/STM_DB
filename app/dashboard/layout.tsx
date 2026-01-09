import { DashboardLayout } from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { JWTService } from '@/lib/jwt';

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = JWTService.verify(token);
  
  if (!user) {
    redirect('/login');
  }

  // Pass user data to client component
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
