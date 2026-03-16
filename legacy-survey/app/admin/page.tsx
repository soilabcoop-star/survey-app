import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">관리자 홈</h1>
      <p className="text-sm text-slate-600">사업 및 설문을 생성/수정하고 응답 분석을 확인하세요.</p>
      <div className="flex gap-3">
        <Link href="/admin/projects" className="rounded bg-[#248DAC] px-4 py-2 text-white">
          사업 관리로 이동
        </Link>
        <Link href="/admin/categories" className="rounded border border-slate-300 px-4 py-2">
          카테고리 분석
        </Link>
      </div>
    </div>
  );
}
