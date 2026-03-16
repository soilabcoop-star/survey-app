'use client';

import { ReactNode } from 'react';

type Props = {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  color?: string;
};

export default function SummaryCard({ label, value, subtext, icon, color = '#248DAC' }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm" style={{ color }}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
      {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}
