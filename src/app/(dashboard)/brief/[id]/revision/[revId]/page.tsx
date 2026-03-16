'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { Revision, RevisionItem } from '@/lib/types';

type RevisionDetail = Revision & { items: RevisionItem[] };

export default function RevisionDetailPage() {
  const { id: briefId, revId } = useParams<{ id: string; revId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [revision, setRevision] = useState<RevisionDetail | null>(null);

  useEffect(() => {
    fetch(`/api/revisions/${revId}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setRevision(json.data);
        }
      });
  }, [revId]);

  if (!revision) {
    return <div className="py-20 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push(`/brief/${briefId}`)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <MessageSquare size={18} className="text-[#248DAC]" />
            {revision.round}차 수정요청
          </h1>
          <p className="text-xs text-gray-400">{revision.created_at.slice(0, 16).replace('T', ' ')}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: '링크가 복사되었습니다.' });
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <Share2 size={16} />
        </Button>
      </div>

      {revision.overall_note && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-semibold text-blue-600">전체 메모</p>
          <p className="whitespace-pre-wrap text-sm text-blue-800">{revision.overall_note}</p>
        </div>
      )}

      <div className="space-y-4">
        {revision.items.map((item, index) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-sm font-semibold text-[#46549C]">수정 항목 {index + 1}</span>
            </div>
            <div className="p-4">
              {item.image_path && (
                <div className="mb-3">
                  <img
                    src={item.image_path}
                    alt={`수정 항목 ${index + 1} 이미지`}
                    className="max-h-80 w-full rounded-lg border border-gray-100 object-contain"
                  />
                </div>
              )}

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="mb-1 text-xs font-semibold text-yellow-700">수정 내용</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
