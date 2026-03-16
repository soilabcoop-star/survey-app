'use client';

import { useState } from 'react';
import useSWR from 'swr';
import LikertChart from '@/components/dashboard/LikertChart';
import ResponseTable from '@/components/dashboard/ResponseTable';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ReportView from '@/components/report/ReportView';
import QrCodeDisplay from '@/components/survey/QrCodeDisplay';
import QuestionEditor from '@/components/survey/QuestionEditor';
import { CATEGORY_LABELS } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectDetailClient({ projectId }: { projectId: number }) {
  const [tab, setTab] = useState<'info' | 'questions' | 'analysis' | 'report'>('info');
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const { data, mutate } = useSWR(`/api/projects/${projectId}`, fetcher);

  if (!data) {
    return <div className="rounded border bg-white p-4">로딩 중...</div>;
  }

  const { project, questions, question_stats, total_responses, avg_overall } = data;

  const updateStatus = async (status: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    mutate();
  };

  const deleteQuestion = async (questionId: number) => {
    await fetch(`/api/questions/${questionId}`, { method: 'DELETE' });
    mutate();
  };

  const generateReport = async () => {
    setLoadingReport(true);
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    });
    const body = await res.json();
    setReport(body.report ?? null);
    setLoadingReport(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{project.name}</h1>

      <div className="flex flex-wrap gap-2">
        {['info', 'questions', 'analysis', 'report'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as any)}
            className={`rounded px-3 py-2 text-sm ${tab === key ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === 'info' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">카테고리</p>
            <p className="font-medium">{CATEGORY_LABELS[project.category as keyof typeof CATEGORY_LABELS]}</p>
            <p className="mt-3 text-sm text-slate-500">설명</p>
            <p>{project.description}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded border border-slate-300 px-3 py-1" onClick={() => updateStatus('draft')}>
                초안
              </button>
              <button type="button" className="rounded border border-slate-300 px-3 py-1" onClick={() => updateStatus('active')}>
                운영중
              </button>
              <button type="button" className="rounded border border-slate-300 px-3 py-1" onClick={() => updateStatus('closed')}>
                종료
              </button>
            </div>
          </div>
          <QrCodeDisplay surveyCode={project.survey_code} projectName={project.name} />
        </div>
      ) : null}

      {tab === 'questions' ? (
        <div className="space-y-4">
          <QuestionEditor projectId={projectId} onSaved={() => mutate()} />
          <div className="space-y-2">
            {questions.map((q: any, idx: number) => (
              <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium">
                  Q{idx + 1}. {q.text}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {q.type} / 필수:{String(q.required)} / overall:{String(q.is_overall)}
                </p>
                <button type="button" className="mt-2 rounded border border-red-300 px-2 py-1 text-sm text-red-600" onClick={() => deleteQuestion(q.id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'analysis' ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="총 응답 수" value={total_responses} />
            <SummaryCard label="전체 만족도 평균" value={avg_overall ?? '-'} />
            <SummaryCard label="완료율" value={`${total_responses > 0 ? 100 : 0}%`} />
          </div>

          {question_stats.map((s: any) =>
            s.question_type.startsWith('likert') ? (
              <LikertChart key={s.question_id} questionText={s.question_text} distribution={s.distribution} avgScore={s.avg_score} />
            ) : (
              <div key={s.question_id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium">{s.question_text}</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                  {s.text_answers.slice(0, 10).map((answer: string, idx: number) => (
                    <li key={`${answer}-${idx}`}>{answer}</li>
                  ))}
                </ul>
              </div>
            ),
          )}

          <a href={`/api/export?project_id=${projectId}`} className="inline-block rounded bg-slate-900 px-3 py-2 text-sm text-white">
            CSV 다운로드
          </a>

          <ResponseTable responses={data.responses ?? []} questions={questions} />
        </div>
      ) : null}

      {tab === 'report' ? (
        <div className="space-y-3">
          <button
            type="button"
            className="rounded bg-[#248DAC] px-4 py-2 text-white disabled:opacity-50"
            onClick={generateReport}
            disabled={loadingReport || total_responses < 5}
          >
            리포트 생성
          </button>
          {total_responses < 5 ? <p className="text-sm text-slate-500">응답 5건 이상일 때 생성할 수 있습니다.</p> : null}
          {loadingReport ? <p>생성 중...</p> : null}
          {report ? <ReportView report={report} /> : null}
        </div>
      ) : null}
    </div>
  );
}
