import Link from 'next/link';

export default async function ProjectReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">AI 리포트</h1>
      <p className="mt-2 text-sm text-slate-600">프로젝트 상세 페이지의 Report 탭에서 생성/확인할 수 있습니다.</p>
      <Link href={`/admin/projects/${id}`} className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-sm text-white">
        사업 상세로 이동
      </Link>
    </div>
  );
}
