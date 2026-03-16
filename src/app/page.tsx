import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { getDb } from '@/lib/db';
import type { Brief } from '@/lib/types';

type BriefRow = Brief & { field_count: number; revision_count: number };

function getBriefs(): BriefRow[] {
  const db = getDb();

  return db
    .prepare(
      `
      SELECT
        b.*,
        COUNT(DISTINCT bf.id) AS field_count,
        COUNT(DISTINCT r.id) AS revision_count
      FROM briefs b
      LEFT JOIN brief_fields bf ON bf.brief_id = b.id
      LEFT JOIN revisions r ON r.brief_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at DESC, b.id DESC
      `,
    )
    .all() as BriefRow[];
}

export default function HomePage() {
  const briefs = getBriefs();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <p className="text-sm font-medium text-[var(--color-secondary)]">프로젝트 초기 세팅</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          소이랩 디자인 의뢰 시스템
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          의뢰서 작성, 시안 검토, 수정 요청까지 한 곳에서 관리할 수 있도록 기본 레이아웃과
          데이터베이스 초기화가 연결된 상태입니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/brief/new"
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            새 의뢰서 만들기
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            관리자 설정 보기
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">등록된 의뢰</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{briefs.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">기본 항목 시드</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">5개</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">DB 파일</p>
          <p className="mt-2 text-lg font-bold text-slate-900">data/design-requests.db</p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">의뢰 목록</h2>
            <p className="mt-1 text-sm text-slate-500">현재는 초기 세팅 상태라 샘플 데이터 없이 시작합니다.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            총 {briefs.length}건
          </span>
        </div>

        {briefs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-medium text-slate-700">아직 등록된 의뢰서가 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">
              첫 의뢰서를 생성하면 여기에서 상태와 수정 회차를 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {briefs.map((brief) => (
              <article
                key={brief.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{brief.project_name}</h3>
                    <p className="mt-1 text-sm text-slate-500">초안 기한 {brief.draft_deadline}</p>
                  </div>
                  <StatusBadge status={brief.status} />
                </div>
                <div className="mt-4 flex gap-4 text-sm text-slate-600">
                  <span>항목 {brief.field_count}개</span>
                  <span>수정 {brief.revision_count}회</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
