'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  questionText: string;
  distribution: Record<string, number>;
  avgScore: number | null;
};

export default function LikertChart({ questionText, distribution, avgScore }: Props) {
  const data = Object.entries(distribution)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([value, count]) => ({ value, count }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium text-slate-900">{questionText}</p>
        {avgScore !== null ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">평균 {avgScore}</span> : null}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="value" width={28} />
            <Tooltip />
            <Bar dataKey="count" fill="#248DAC" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
