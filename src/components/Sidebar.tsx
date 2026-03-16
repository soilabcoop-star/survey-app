'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, Plus, Settings } from 'lucide-react';

const nav = [
  { href: '/', label: '의뢰 목록', icon: Home },
  { href: '/brief/new', label: '새 의뢰서', icon: Plus },
  { href: '/admin', label: '관리자 설정', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-56 flex-col bg-[#46549C] py-6 text-white shadow-lg">
      <div className="mb-8 px-5">
        <div className="flex items-center gap-2">
          <FileText size={22} />
          <span className="text-lg font-bold leading-tight">
            소이랩
            <br />
            디자인 의뢰
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-5 text-xs text-white/40">협동조합 소이랩</div>
    </aside>
  );
}
