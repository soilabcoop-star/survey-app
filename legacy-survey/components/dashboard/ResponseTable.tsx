'use client';

import { useMemo, useState } from 'react';
import { Question } from '@/lib/types';

type Props = {
  responses: Array<{ id: number; submitted_at: string; answers: Record<number, string> }>;
  questions: Question[];
};

export default function ResponseTable({ responses, questions }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return responses.slice(start, start + pageSize);
  }, [page, responses]);

  const totalPages = Math.max(1, Math.ceil(responses.length / pageSize));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4">번호</th>
              <th className="py-2 pr-4">제출일시</th>
              {questions.map((q, idx) => (
                <th key={q.id} className="py-2 pr-4">Q{idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2 pr-4">{row.id}</td>
                <td className="py-2 pr-4">{row.submitted_at}</td>
                {questions.map((q) => (
                  <td key={q.id} className="max-w-40 truncate py-2 pr-4" title={row.answers[q.id] ?? ''}>
                    {row.answers[q.id] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-sm">
        <button type="button" className="rounded border px-2 py-1 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button type="button" className="rounded border px-2 py-1 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          다음
        </button>
      </div>
    </div>
  );
}
