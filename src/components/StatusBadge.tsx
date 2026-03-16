import type { BriefStatus } from '@/lib/types';

const STATUS_LABELS: Record<BriefStatus, string> = {
  requested: '의뢰 접수',
  reviewing: '시안 검토 중',
  revising: '수정 중',
  completed: '최종 완료',
};

const STATUS_COLORS: Record<BriefStatus, string> = {
  requested: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  revising: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }: { status: BriefStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
