'use client';

import { FormEvent, useMemo, useState } from 'react';
import { QuestionType } from '@/lib/types';

type Props = {
  projectId: number;
  onSaved: () => void;
};

const types: Array<{ label: string; value: QuestionType }> = [
  { label: '리커트 5점', value: 'likert5' },
  { label: '리커트 10점', value: 'likert10' },
  { label: '객관식', value: 'multiple' },
  { label: '복수선택', value: 'checkbox' },
  { label: '단답형', value: 'text' },
  { label: '장문형', value: 'textarea' },
];

export default function QuestionEditor({ projectId, onSaved }: Props) {
  const [type, setType] = useState<QuestionType>('likert5');
  const [text, setText] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [required, setRequired] = useState(true);
  const [isOverall, setIsOverall] = useState(false);

  const needsOptions = useMemo(() => type === 'multiple' || type === 'checkbox', [type]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const options = needsOptions
      ? optionsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : undefined;

    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        type,
        text,
        options,
        required,
        is_overall: isOverall,
      }),
    });

    setText('');
    setOptionsText('');
    setRequired(true);
    setIsOverall(false);
    onSaved();
  };

  return (
    <form className="space-y-3 rounded-lg border border-slate-200 bg-white p-4" onSubmit={onSubmit}>
      <h3 className="font-medium">문항 추가</h3>
      <select className="w-full rounded border p-2" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
        {types.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input className="w-full rounded border p-2" placeholder="문항 내용" value={text} onChange={(e) => setText(e.target.value)} required />
      {needsOptions ? (
        <textarea
          className="w-full rounded border p-2"
          rows={4}
          placeholder="선택지를 줄바꿈으로 입력"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
        />
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isOverall} onChange={(e) => setIsOverall(e.target.checked)} />
        전체 만족도 집계에 사용
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
        필수 응답
      </label>
      <button type="submit" className="rounded bg-[#248DAC] px-3 py-2 text-white">
        추가
      </button>
    </form>
  );
}
