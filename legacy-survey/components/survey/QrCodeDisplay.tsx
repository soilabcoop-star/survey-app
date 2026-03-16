'use client';

import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  surveyCode: string;
  projectName: string;
};

export default function QrCodeDisplay({ surveyCode, projectName }: Props) {
  const url = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${base}/s/${surveyCode}`;
  }, [surveyCode]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    alert('링크를 복사했습니다.');
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 font-medium text-slate-900">{projectName} QR</p>
      <div className="flex items-center gap-4">
        <QRCodeSVG value={url} size={140} includeMargin />
        <div className="flex-1 text-sm">
          <p className="mb-2 break-all text-slate-700">{url}</p>
          <button type="button" className="rounded bg-slate-900 px-3 py-2 text-white" onClick={copy}>
            링크 복사
          </button>
        </div>
      </div>
    </div>
  );
}
