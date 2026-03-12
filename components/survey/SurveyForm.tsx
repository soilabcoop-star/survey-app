'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Question } from '@/lib/types';

type Props = {
  surveyCode: string;
  projectName: string;
  description: string;
  questions: Question[];
};

export default function SurveyForm({ surveyCode, projectName, description, questions }: Props) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const sessionKey = `soilab_session_${surveyCode}`;
  const respondedKey = `soilab_responded_${surveyCode}`;

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const requiredCount = useMemo(() => questions.filter((q) => q.required).length, [questions]);
  const answeredRequired = useMemo(
    () => questions.filter((q) => q.required && answers[q.id] !== undefined && answers[q.id] !== '').length,
    [questions, answers],
  );

  if (typeof window !== 'undefined' && localStorage.getItem(respondedKey) === '1') {
    return <div className="mx-auto mt-16 max-w-xl rounded-lg border bg-white p-6 text-center">이미 응답하셨습니다.</div>;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const sessionId = localStorage.getItem(sessionKey) ?? crypto.randomUUID();
    localStorage.setItem(sessionKey, sessionId);

    const payload = {
      survey_code: surveyCode,
      session_id: sessionId,
      answers: questions.map((q) => ({ question_id: q.id, value: answers[q.id] ?? '' })),
    };

    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      localStorage.setItem(respondedKey, '1');
      setDone(true);
      return;
    }

    const body = await res.json();
    alert(body.error ?? '제출에 실패했습니다.');
  };

  const setValue = (id: number, value: string) => setAnswers((prev) => ({ ...prev, [id]: value }));

  if (!started) {
    return (
      <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">{projectName}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <p className="mt-3 text-sm text-slate-500">예상 소요 시간: 약 {Math.max(3, questions.length)}분</p>
        <button type="button" className="mt-5 rounded bg-[#248DAC] px-4 py-2 text-white" onClick={() => setStarted(true)}>
          시작하기
        </button>
      </div>
    );
  }

  if (done) {
    return <div className="mx-auto mt-16 max-w-xl rounded-lg border bg-white p-6 text-center">참여해주셔서 감사합니다!</div>;
  }

  return (
    <form className="mx-auto mt-6 max-w-2xl space-y-4" onSubmit={submit}>
      <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
        진행률: {answeredRequired} / {requiredCount}
      </div>
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 font-medium">
            Q{idx + 1}. {q.text} {q.required ? <span className="text-red-500">*</span> : null}
          </p>

          {(q.type === 'likert5' || q.type === 'likert10') && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: q.type === 'likert5' ? 5 : 10 }).map((_, i) => {
                const value = String(i + 1);
                const selected = answers[q.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue(q.id, value)}
                    className={`h-10 w-10 rounded border ${selected ? 'border-[#248DAC] bg-[#248DAC] text-white' : 'border-slate-300'}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'multiple' && (
            <div className="space-y-2">
              {JSON.parse(q.options ?? '[]').map((option: string) => (
                <label key={option} className="flex items-center gap-2 rounded border p-2">
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === option} onChange={() => setValue(q.id, option)} />
                  {option}
                </label>
              ))}
            </div>
          )}

          {q.type === 'checkbox' && (
            <div className="space-y-2">
              {JSON.parse(q.options ?? '[]').map((option: string) => {
                const selected = (() => {
                  try {
                    return (JSON.parse(answers[q.id] ?? '[]') as string[]).includes(option);
                  } catch {
                    return false;
                  }
                })();
                return (
                  <label key={option} className="flex items-center gap-2 rounded border p-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const arr = (() => {
                          try {
                            return JSON.parse(answers[q.id] ?? '[]') as string[];
                          } catch {
                            return [] as string[];
                          }
                        })();
                        const next = e.target.checked ? [...arr, option] : arr.filter((x) => x !== option);
                        setValue(q.id, JSON.stringify(next));
                      }}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          )}

          {q.type === 'text' && <input className="w-full rounded border p-2" value={answers[q.id] ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />}
          {q.type === 'textarea' && (
            <textarea className="w-full rounded border p-2" rows={4} value={answers[q.id] ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />
          )}
        </div>
      ))}

      <button type="submit" className="w-full rounded bg-slate-900 px-4 py-3 text-white">
        제출하기
      </button>
    </form>
  );
}
