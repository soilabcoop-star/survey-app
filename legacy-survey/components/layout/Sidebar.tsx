'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menus = [
  { href: '/', label: '사업 현황' },
  { href: '/admin', label: '관리자 홈' },
  { href: '/admin/projects', label: '사업 관리' },
  { href: '/admin/categories', label: '카테고리 분석' },
];

function NavItems() {
  const pathname = usePathname();
  return (
    <nav className="space-y-2">
      {menus.map((menu) => {
        const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`block rounded-md px-3 py-2 text-sm transition ${
              active ? 'bg-[#248DAC] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {menu.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm lg:hidden"
        onClick={() => setOpen((prev) => !prev)}
      >
        메뉴
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 border-b border-slate-200 pb-3">
          <p className="text-base font-semibold text-slate-900">Soilab Survey</p>
          <p className="text-xs text-slate-500">만족도 조사 시스템</p>
        </div>
        <NavItems />
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="close menu"
        />
      ) : null}
    </>
  );
}
