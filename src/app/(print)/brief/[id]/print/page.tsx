import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function PrintBriefPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const brief = db.prepare('SELECT * FROM briefs WHERE id = ?').get(params.id) as
    | {
        project_name: string;
        created_at: string;
        status: string;
        draft_deadline: string;
        reference: string | null;
        concept: string | null;
      }
    | undefined;

  if (!brief) {
    notFound();
  }

  const fields = db
    .prepare('SELECT * FROM brief_fields WHERE brief_id = ? ORDER BY sort_order ASC')
    .all(params.id) as Array<{ id: number; field_name: string; content: string | null }>;

  const statusLabels: Record<string, string> = {
    requested: '의뢰 접수',
    reviewing: '시안 검토 중',
    revising: '수정 중',
    completed: '최종 완료',
  };

  return (
    <div className="min-h-screen bg-white px-8 py-10 text-black">
      <style>{`
        body { background: #fff; }
        @media print {
          body { margin: 0; }
        }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 border-b-[3px] border-[#46549C] pb-4">
          <div className="text-sm font-bold text-[#46549C]">협동조합 소이랩 | 디자인 의뢰서</div>
          <h1 className="mt-2 text-[28px] font-bold">{brief.project_name}</h1>
          <div className="mt-2 text-sm text-gray-500">
            등록일: {brief.created_at.slice(0, 10)} | 상태: {statusLabels[brief.status] ?? brief.status}
          </div>
        </div>

        <section className="mb-5">
          <div className="mb-2 border-l-4 border-[#46549C] pl-2 text-sm font-bold text-[#46549C]">초안 기한</div>
          <div className="rounded bg-gray-50 p-3 text-sm leading-6">{brief.draft_deadline}</div>
        </section>

        {brief.reference && (
          <section className="mb-5">
            <div className="mb-2 border-l-4 border-[#46549C] pl-2 text-sm font-bold text-[#46549C]">레퍼런스</div>
            <div className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm leading-6">{brief.reference}</div>
          </section>
        )}

        {brief.concept && (
          <section className="mb-5">
            <div className="mb-2 border-l-4 border-[#46549C] pl-2 text-sm font-bold text-[#46549C]">색감 / 컨셉</div>
            <div className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm leading-6">{brief.concept}</div>
          </section>
        )}

        {fields.length > 0 && (
          <section className="mb-5">
            <div className="mb-2 border-l-4 border-[#46549C] pl-2 text-sm font-bold text-[#46549C]">
              디자인에 들어갈 내용
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="rounded-md border border-gray-200 p-3">
                  <div className="mb-1 text-sm font-bold text-[#46549C]">{field.field_name}</div>
                  <div className="whitespace-pre-wrap text-sm leading-6">{field.content || '(내용 없음)'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
          협동조합 소이랩 | soilabcoop@gmail.com | 053-941-9003 | soilabcoop.kr
        </div>
      </div>
    </div>
  );
}
