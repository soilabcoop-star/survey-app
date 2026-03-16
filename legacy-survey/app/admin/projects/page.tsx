'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { FormEvent, useMemo, useState } from 'react';
import { CATEGORY_LABELS, ProjectCategory, ProjectWithStats } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProjectsPage() {
  const { data, mutate } = useSWR<ProjectWithStats[]>('/api/projects', fetcher);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('livinglab');
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const projects = data ?? [];
  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (filterCategory !== 'all' && p.category !== filterCategory) return false;
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [projects, filterCategory, filterStatus, search],
  );

  const createProject = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, description }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      await mutate();
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">사업 관리</h1>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4" onSubmit={createProject}>
        <input className="rounded border p-2" placeholder="사업명" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input className="rounded border p-2" placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="rounded bg-[#248DAC] px-3 py-2 text-white" type="submit">
          새 사업 만들기
        </button>
      </form>

      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <select className="rounded border p-2" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">전체 카테고리</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="rounded border p-2" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">전체 상태</option>
          <option value="active">운영중</option>
          <option value="closed">종료</option>
          <option value="draft">초안</option>
        </select>
        <input className="rounded border p-2" placeholder="사업명 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => (
          <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span>{CATEGORY_LABELS[project.category]}</span>
              <span className="rounded bg-slate-100 px-2 py-1">{project.status}</span>
            </div>
            <h3 className="font-semibold">{project.name}</h3>
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{project.description}</p>
            <p className="mt-2 text-sm text-slate-600">응답 {project.response_count}건</p>
            <p className="text-sm text-slate-600">평균 {project.avg_overall ?? '-'}</p>
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/projects/${project.id}`} className="rounded border border-slate-300 px-3 py-1 text-sm">
                설문 편집
              </Link>
              <Link href={`/s/${project.survey_code}`} className="rounded bg-[#248DAC] px-3 py-1 text-sm text-white">
                설문 링크
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
