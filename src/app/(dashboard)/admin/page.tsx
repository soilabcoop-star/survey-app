'use client';

import { useEffect, useState } from 'react';
import { GripVertical, Info, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { FieldType } from '@/lib/types';

export default function AdminPage() {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [newName, setNewName] = useState('');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFieldTypes = async () => {
    const response = await fetch('/api/field-types');
    const json = await response.json();
    if (json.success) {
      setFieldTypes(json.data);
    }
  };

  useEffect(() => {
    fetchFieldTypes();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/field-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, placeholder: newPlaceholder }),
      });
      const json = await response.json();

      if (json.success) {
        toast({ title: '항목이 추가되었습니다.' });
        setNewName('');
        setNewPlaceholder('');
        fetchFieldTypes();
      } else {
        toast({ title: json.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '항목 추가 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 항목을 삭제하시겠습니까?`)) {
      return;
    }

    const response = await fetch(`/api/field-types/${id}`, { method: 'DELETE' });
    const json = await response.json();
    if (json.success) {
      toast({ title: '삭제되었습니다.' });
      fetchFieldTypes();
    } else {
      toast({ title: json.error, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">관리자 설정</h1>
        <p className="mt-1 text-sm text-gray-500">의뢰서 작성 시 사용할 항목 유형을 관리합니다.</p>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          아래 항목들은 의뢰서 작성 화면의 드롭다운에 표시됩니다. 이미 의뢰서에서 사용 중인 항목은
          삭제할 수 없습니다.
        </span>
      </div>

      <div className="divide-y rounded-xl border border-gray-200 bg-white">
        {fieldTypes.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">등록된 항목이 없습니다.</div>
        ) : (
          fieldTypes.map((fieldType) => (
            <div key={fieldType.id} className="flex items-center gap-3 px-4 py-3">
              <GripVertical size={16} className="shrink-0 text-gray-300" />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{fieldType.name}</div>
                {fieldType.placeholder && (
                  <div className="mt-0.5 text-xs text-gray-400">힌트: {fieldType.placeholder}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={() => handleDelete(fieldType.id, fieldType.name)}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-[#46549C]/40 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">새 항목 추가</p>
        <div className="mb-2 flex gap-2">
          <Input
            placeholder="항목명 (예: 신청방법)"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="입력 힌트 텍스트 (선택)"
            value={newPlaceholder}
            onChange={(event) => setNewPlaceholder(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="shrink-0 bg-[#46549C] hover:bg-[#3a4785]"
          >
            <Plus size={16} className="mr-1" />
            추가
          </Button>
        </div>
      </div>
    </div>
  );
}
