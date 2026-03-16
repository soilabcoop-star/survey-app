'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { PixelCrop } from 'react-image-crop';
import ImageCropUploader from '@/components/ImageCropUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface RevisionItemState {
  uid: string;
  image_path: string;
  crop_data?: PixelCrop;
  description: string;
}

export default function NewRevisionPage() {
  const router = useRouter();
  const { id: briefId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [overallNote, setOverallNote] = useState('');
  const [items, setItems] = useState<RevisionItemState[]>([
    { uid: crypto.randomUUID(), image_path: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems((current) => [...current, { uid: crypto.randomUUID(), image_path: '', description: '' }]);
  };

  const removeItem = (uid: string) => {
    if (items.length <= 1) {
      toast({ title: '최소 1개의 수정 항목이 필요합니다.', variant: 'destructive' });
      return;
    }
    setItems((current) => current.filter((item) => item.uid !== uid));
  };

  const updateItem = (uid: string, patch: Partial<RevisionItemState>) => {
    setItems((current) => current.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async () => {
    if (items.some((item) => !item.description.trim())) {
      toast({ title: '모든 항목에 수정 내용을 입력하세요.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief_id: Number(briefId),
          overall_note: overallNote,
          items: items.map(({ uid, ...rest }) => rest),
        }),
      });
      const json = await response.json();

      if (json.success) {
        toast({ title: `${json.data.round}차 수정요청이 등록되었습니다!` });
        router.push(`/brief/${briefId}`);
      } else {
        toast({ title: json.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '수정요청 저장 중 오류가 발생했습니다.', variant: 'destructive' });
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
        <h1 className="text-2xl font-bold text-gray-900">수정요청 작성</h1>
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <label className="mb-2 block text-sm font-semibold text-gray-700">전체 메모 (선택)</label>
        <Textarea
          placeholder="전반적인 수정 방향이나 참고사항을 적어주세요."
          value={overallNote}
          onChange={(event) => setOverallNote(event.target.value)}
          className="min-h-[80px] resize-none text-sm"
        />
      </div>

      <div className="mb-4 space-y-4">
        {items.map((item, index) => (
          <div key={item.uid} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-300" />
                <span className="text-sm font-semibold text-[#46549C]">수정 항목 {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.uid)}
                className="text-gray-400 transition-colors hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                이미지 첨부 <span className="text-gray-400">(전체 또는 일부 크롭)</span>
              </label>
              <ImageCropUploader
                uploadedPath={item.image_path}
                onUploadComplete={(imagePath, cropData) =>
                  updateItem(item.uid, { image_path: imagePath, crop_data: cropData })
                }
                onClear={() => updateItem(item.uid, { image_path: '', crop_data: undefined })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                수정 내용 설명 <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="어떤 부분을 어떻게 수정해야 하는지 구체적으로 설명해주세요."
                value={item.description}
                onChange={(event) => updateItem(item.uid, { description: event.target.value })}
                className="min-h-[90px] resize-none text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mb-6 w-full border-dashed border-[#46549C]/40 text-[#46549C] hover:bg-[#46549C]/5"
      >
        <Plus size={14} className="mr-1" />
        수정 항목 추가
      </Button>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#248DAC] hover:bg-[#1e7a96]"
        >
          {submitting ? '등록 중...' : '수정요청 등록'}
        </Button>
      </div>
    </div>
  );
}
