'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      에러가 발생했습니다.
      <button type="button" className="ml-3 rounded border border-red-300 px-2 py-1" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
