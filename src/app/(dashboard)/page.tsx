'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import BriefCard from '@/components/BriefCard';
import { Button } from '@/components/ui/button';
import type { Brief, BriefStatus } from '@/lib/types';

const STATUS_TABS: { value: BriefStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'requested', label: '의뢰 접수' },
  { value: 'reviewing', label: '검토 중' },
  { value: 'revising', label: '수정 중' },
  { value: 'completed', label: '완료' },
];

export default function HomePage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [activeTab, setActiveTab] = useState<BriefStatus | 'all'>('all');

  useEffect(() => {
    fetch('/api/briefs')
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setBriefs(json.data);
        }
      });
  }, []);

  const filtered = activeTab === 'all' ? briefs : briefs.filter((brief) => brief.status === activeTab);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">디자인 의뢰 현황</h1>
          <p className="mt-1 text-sm text-gray-500">의뢰서와 수정 요청 진행 상황을 한눈에 확인하세요.</p>
        </div>
        <Link href="/brief/new">
          <Button className="bg-[#46549C] hover:bg-[#3a4785]">
            <Plus size={16} className="mr-1" />
            새 의뢰서
          </Button>
        </Link>
      </div>

      <div className="mb-5 flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === value
                ? 'bg-white text-[#46549C] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {value !== 'all' && (
              <span className="ml-1 text-xs text-gray-400">
                ({briefs.filter((brief) => brief.status === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#46549C]/10">
            <FileText size={28} className="text-[#46549C]" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-700">아직 등록된 의뢰가 없습니다</h2>
          <p className="mb-4 text-sm text-gray-400">첫 디자인 의뢰서를 작성해보세요.</p>
          <Link href="/brief/new">
            <Button className="bg-[#46549C] hover:bg-[#3a4785]">
              <Plus size={16} className="mr-1" />
              첫 의뢰서 작성
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((brief) => (
            <BriefCard key={brief.id} brief={brief} />
          ))}
        </div>
      )}
    </div>
  );
}
