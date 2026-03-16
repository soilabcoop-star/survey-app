'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Link as LinkIcon,
  MessageSquare,
  Palette,
  Plus,
  Printer,
  Share2,
  Trash2,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatDateKorean } from '@/lib/format';
import type { Brief, BriefField, BriefStatus, Revision } from '@/lib/types';

const STATUS_ORDER: BriefStatus[] = ['requested', 'reviewing', 'revising', 'completed'];
const STATUS_LABELS: Record<BriefStatus, string> = {
  requested: '의뢰 접수',
  reviewing: '시안 검토 중',
  revising: '수정 중',
  completed: '최종 완료',
};

type BriefDetail = Brief & { fields: BriefField[]; revisions: Revision[] };

export default function BriefDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [brief, setBrief] = useState<BriefDetail | null>(null);

  useEffect(() => {
    const fetchBrief = async () => {
      const response = await fetch(`/api/briefs/${id}`);
      const json = await response.json();
      if (json.success) {
        setBrief(json.data);
      }
    };

    fetchBrief();
  }, [id]);

  const handleStatusChange = async (status: BriefStatus) => {
    const response = await fetch(`/api/briefs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await response.json();

    if (!json.success) {
      toast({ title: json.error ?? '상태 변경에 실패했습니다.', variant: 'destructive' });
      return;
    }

    const responseRefresh = await fetch(`/api/briefs/${id}`);
    const refreshJson = await responseRefresh.json();
    if (refreshJson.success) {
      setBrief(refreshJson.data);
    }
    toast({ title: `상태를 "${STATUS_LABELS[status]}"으로 변경했습니다.` });
  };

  const handleDelete = async () => {
    if (!window.confirm('이 의뢰서를 삭제하시겠습니까? 모든 수정요청도 함께 삭제됩니다.')) {
      return;
    }

    const response = await fetch(`/api/briefs/${id}`, { method: 'DELETE' });
    const json = await response.json();
    if (!json.success) {
      toast({ title: json.error ?? '삭제에 실패했습니다.', variant: 'destructive' });
      return;
    }

    toast({ title: '삭제되었습니다.' });
    router.push('/');
  };

  if (!brief) {
    return <div className="py-20 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{brief.project_name}</h1>
            <StatusBadge status={brief.status} />
          </div>
          <p className="mt-0.5 text-xs text-gray-400">등록일: {brief.created_at.slice(0, 10)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(`/brief/${id}/print`, '_blank')}
          title="인쇄용 페이지"
          className="text-gray-400 hover:text-gray-600"
        >
          <Printer size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: '링크가 복사되었습니다.' });
          }}
          title="링크 복사"
          className="text-gray-400 hover:text-gray-600"
        >
          <Share2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-gray-500">진행 단계 변경</p>
        <div className="flex gap-1">
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
                brief.status === status
                  ? 'bg-[#46549C] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <CalendarDays size={14} className="text-[#46549C]" />
            초안 기한
          </div>
          <p className="text-gray-900">{formatDateKorean(brief.draft_deadline)}</p>
        </div>

        {brief.reference && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <LinkIcon size={14} className="text-[#248DAC]" />
              레퍼런스
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{brief.reference}</p>
          </div>
        )}

        {brief.concept && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Palette size={14} className="text-[#228D7B]" />
              색감 / 컨셉
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{brief.concept}</p>
          </div>
        )}

        {brief.fields.length > 0 && (
          <div className="divide-y rounded-xl border border-gray-200 bg-white">
            {brief.fields.map((field) => (
              <div key={field.id} className="p-4">
                <p className="mb-1 text-sm font-semibold text-[#46549C]">{field.field_name}</p>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{field.content || '(내용 없음)'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-gray-800">
            <MessageSquare size={16} className="text-[#248DAC]" />
            수정요청 ({brief.revisions?.length ?? 0}건)
          </h2>
          <Link href={`/brief/${id}/revision/new`}>
            <Button size="sm" className="bg-[#248DAC] hover:bg-[#1e7a96]">
              <Plus size={14} className="mr-1" />
              수정요청 작성
            </Button>
          </Link>
        </div>

        {brief.revisions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-400">
            아직 수정요청이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {brief.revisions.map((revision) => (
              <Link key={revision.id} href={`/brief/${id}/revision/${revision.id}`}>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-[#248DAC]/30 hover:shadow-sm">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{revision.round}차 수정요청</span>
                    <span className="ml-2 text-xs text-gray-400">{revision.created_at.slice(0, 10)}</span>
                    {revision.overall_note && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
                        {revision.overall_note}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
