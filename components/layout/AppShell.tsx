'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith('/s/') || pathname === '/admin/login';

  if (hideSidebar) {
    return <main className="min-h-screen bg-slate-50 p-4">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="p-4 pt-14 lg:ml-60 lg:pt-4">{children}</main>
    </div>
  );
}
