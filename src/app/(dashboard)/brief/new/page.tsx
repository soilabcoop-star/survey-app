'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Link as LinkIcon, Palette } from 'lucide-react';
import FieldSelector from '@/components/FieldSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { FieldType, SelectedBriefField } from '@/lib/types';

export default function NewBriefPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [projectName, setProjectName] = useState('');
  const [reference, setReference] = useState('');
  const [concept, setConcept] = useState('');
  const [draftDeadline, setDraftDeadline] = useState('');
  const [fields, setFields] = useState<SelectedBriefField[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/field-types')
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setFieldTypes(json.data);
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast({ title: '프로젝트명을 입력하세요.', variant: 'destructive' });
      return;
    }

    if (!draftDeadline) {
      toast({ title: '초안 기한을 선택하세요.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          reference,
          concept,
          draft_deadline: draftDeadline,
          fields,
        }),
      });
      const json = await response.json();

      if (json.success) {
        toast({ title: '의뢰서가 등록되었습니다!' });
        router.push(`/brief/${json.data.id}`);
      } else {
        toast({ title: json.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '의뢰서 저장 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">새 의뢰서 작성</h1>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            프로젝트명 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="예) 2025 청년 N.E.S.T. 모집 홍보 포스터"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <LinkIcon size={14} className="text-[#248DAC]" />
            레퍼런스
          </label>
          <p className="mb-2 text-xs text-gray-400">
            참고할 이미지 URL, 드라이브 링크, 또는 스타일 설명을 입력하세요.
          </p>
          <Textarea
            placeholder="예) https://drive.google.com/... 또는 '작년 포스터와 비슷한 느낌'"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Palette size={14} className="text-[#228D7B]" />
            색감 / 컨셉
          </label>
          <p className="mb-2 text-xs text-gray-400">
            원하는 색상 계열, 분위기, 키워드를 자유롭게 적어주세요.
          </p>
          <Textarea
            placeholder="예) 따뜻한 봄 느낌, 파스텔 계열 / 청년·희망·성장 키워드"
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <CalendarDays size={14} className="text-[#46549C]" />
            초안 기한 <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-gray-400">초안 시안을 받고 싶은 날짜를 선택하세요.</p>
          <Input
            type="date"
            value={draftDeadline}
            onChange={(event) => setDraftDeadline(event.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700">디자인에 들어갈 내용 항목</label>
          <p className="mb-3 text-xs text-gray-400">아래 버튼으로 항목을 추가하고 각 내용을 입력하세요.</p>
          <FieldSelector fieldTypes={fieldTypes} onChange={setFields} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#46549C] hover:bg-[#3a4785]"
          >
            {submitting ? '등록 중...' : '의뢰서 등록'}
          </Button>
        </div>
      </div>
    </div>
  );
}
