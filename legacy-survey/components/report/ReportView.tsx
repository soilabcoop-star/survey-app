'use client';

type Report = {
  summary: string;
  strengths: string[];
  improvements: string[];
  key_insights: string[];
  recommendations: string[];
  overall_grade: string;
  grade_reason: string;
};

export default function ReportView({ report }: { report: Report }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 print:shadow-none">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-xl font-semibold text-slate-900">만족도 분석 리포트</h2>
        <p className="mt-1 text-sm text-slate-500">종합 등급: {report.overall_grade}</p>
        <p className="text-sm text-slate-600">{report.grade_reason}</p>
      </div>

      <section className="mb-4">
        <h3 className="mb-1 font-medium">요약</h3>
        <p className="text-sm text-slate-700">{report.summary}</p>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-medium">강점</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.strengths?.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-medium">개선 필요</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.improvements?.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-medium">핵심 인사이트</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.key_insights?.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h3 className="mb-1 font-medium">제언</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {report.recommendations?.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
        </ol>
      </section>
    </div>
  );
}
