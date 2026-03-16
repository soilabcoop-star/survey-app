'use client';

import useSWR from 'swr';
import CategoryCompareChart from '@/components/dashboard/CategoryCompareChart';
import { CATEGORY_LABELS, CategoryStat } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCategoriesPage() {
  const { data } = useSWR<CategoryStat[]>('/api/categories', fetcher);
  const categories = data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">카테고리 통합 분석</h1>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {categories.map((c) => (
          <div key={c.category} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium">{CATEGORY_LABELS[c.category]}</p>
            <p className="mt-2 text-sm text-slate-600">사업 {c.project_count}개 · 응답 {c.total_responses}건</p>
            <p className="text-sm text-slate-600">평균 만족도 {c.avg_overall ?? '-'}</p>
          </div>
        ))}
      </div>

      <CategoryCompareChart data={categories} />

      <div className="space-y-3">
        {categories.map((c) => (
          <details key={c.category} className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium">{CATEGORY_LABELS[c.category]} 상세</summary>
            <div className="mt-3 space-y-2 text-sm">
              {c.projects.map((p) => (
                <div key={p.id} className="rounded border border-slate-200 p-2">
                  {p.name} · 응답 {p.response_count}건 · 평균 {p.avg_overall ?? '-'}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
