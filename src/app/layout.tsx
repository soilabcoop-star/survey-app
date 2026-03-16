import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: '소이랩 디자인 의뢰 시스템',
  description: '디자인 외주 의뢰 및 수정요청 관리',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <div className="flex min-h-screen bg-transparent">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
