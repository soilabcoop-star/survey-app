'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      setError('비밀번호가 올바르지 않습니다.');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">소이랩 관리자 로그인</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          type="password"
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="관리자 비밀번호"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="w-full rounded bg-slate-900 px-3 py-2 text-white">
          로그인
        </button>
      </form>
    </div>
  );
}
