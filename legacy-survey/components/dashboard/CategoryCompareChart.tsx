'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORY_LABELS, CategoryStat } from '@/lib/types';

type Props = {
  data: CategoryStat[];
};

export default function CategoryCompareChart({ data }: Props) {
  const chartData = data.map((item) => ({
    category: CATEGORY_LABELS[item.category],
    score: item.avg_overall ?? 0,
    projects: item.project_count,
    responses: item.total_responses,
  }));

  return (
    <div className="h-72 rounded-lg border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 6, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis type="category" dataKey="category" width={80} />
          <Tooltip />
          <Bar dataKey="score" fill="#46549C" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
