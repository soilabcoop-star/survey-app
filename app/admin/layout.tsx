import AdminBanner from '@/components/layout/AdminBanner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminBanner />
      {children}
    </div>
  );
}
