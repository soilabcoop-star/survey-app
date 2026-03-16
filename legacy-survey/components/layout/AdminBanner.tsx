import Link from 'next/link';

export default function AdminBanner() {
  return (
    <div className="mb-4 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-medium text-amber-800">🔧 관리자 모드 — 사업 및 설문을 관리합니다</p>
      <Link href="/" className="text-amber-700 underline">
        열람 모드로 전환
      </Link>
    </div>
  );
}
