import Link from 'next/link';
import { CalendarDays, MessageSquare } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatDotDate } from '@/lib/format';
import type { Brief } from '@/lib/types';

export default function BriefCard({ brief }: { brief: Brief }) {
  const deadline = new Date(brief.draft_deadline);
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 3 && brief.status !== 'completed';

  return (
    <Link href={`/brief/${brief.id}`}>
      <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#46549C]/30 hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="leading-tight font-semibold text-gray-900">{brief.project_name}</h3>
          <StatusBadge status={brief.status} />
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarDays size={12} />
            초안 기한:{' '}
            <span className={isUrgent ? 'font-medium text-red-500' : ''}>
              {formatDotDate(brief.draft_deadline)}
              {isUrgent && daysLeft > 0 && ` (D-${daysLeft})`}
              {daysLeft <= 0 && brief.status !== 'completed' && ' (기한 초과)'}
            </span>
          </span>
          {(brief.revision_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              수정요청 {brief.revision_count}건
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400">등록일: {formatDotDate(brief.created_at.slice(0, 10))}</div>
      </div>
    </Link>
  );
}
