import Link from 'next/link';
import CategoryCompareChart from '@/components/dashboard/CategoryCompareChart';
import { getCategoryStats, getProjectsWithStats } from '@/lib/stats';
import { CATEGORY_LABELS } from '@/lib/types';

export default function HomePage() {
  const projects = getProjectsWithStats();
  const categories = getCategoryStats();
  const active = projects.filter((p) => p.status === 'active');
  const closed = projects.filter((p) => p.status === 'closed');

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-semibold">소이랩 만족도 조사 대시보드</h1>
        <p className="mt-2 text-sm text-slate-600">사업별 설문 참여 링크와 요약 결과를 확인할 수 있습니다.</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">운영중 사업</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{CATEGORY_LABELS[project.category]}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{project.description}</p>
              <Link href={`/s/${project.survey_code}`} className="mt-3 inline-block rounded bg-[#248DAC] px-3 py-2 text-sm text-white">
                설문 참여
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">종료 사업 요약</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {closed.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-2 text-sm text-slate-600">응답 {project.response_count}건</p>
              <p className="text-sm text-slate-600">평균 만족도 {project.avg_overall ?? '-'} / 5.0</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">카테고리 비교</h2>
        <CategoryCompareChart data={categories} />
      </section>
    </div>
  );
}
