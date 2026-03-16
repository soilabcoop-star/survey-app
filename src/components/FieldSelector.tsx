'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { FieldType, SelectedBriefField } from '@/lib/types';

interface SelectedField extends SelectedBriefField {
  uid: string;
  placeholder: string | null;
}

interface Props {
  fieldTypes: FieldType[];
  onChange: (fields: SelectedBriefField[]) => void;
}

export default function FieldSelector({ fieldTypes, onChange }: Props) {
  const [selected, setSelected] = useState<SelectedField[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const syncFields = (next: SelectedField[]) => {
    setSelected(next);
    onChange(next.map(({ uid, placeholder, ...rest }) => rest));
  };

  const addField = (fieldType: FieldType) => {
    const next = [
      ...selected,
      {
        uid: crypto.randomUUID(),
        field_type_id: fieldType.id,
        field_name: fieldType.name,
        placeholder: fieldType.placeholder,
        content: '',
      },
    ];

    syncFields(next);
    setDropdownOpen(false);
  };

  const removeField = (uid: string) => {
    syncFields(selected.filter((field) => field.uid !== uid));
  };

  const updateContent = (uid: string, content: string) => {
    syncFields(selected.map((field) => (field.uid === uid ? { ...field, content } : field)));
  };

  return (
    <div className="space-y-3">
      {selected.map((field) => (
        <div key={field.uid} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#46549C]">{field.field_name}</span>
            <button
              type="button"
              onClick={() => removeField(field.uid)}
              className="text-gray-400 transition-colors hover:text-red-500"
            >
              <X size={15} />
            </button>
          </div>
          <Textarea
            placeholder={field.placeholder || `${field.field_name} 내용을 입력하세요`}
            value={field.content}
            onChange={(event) => updateContent(field.uid, event.target.value)}
            className="min-h-[70px] resize-none text-sm"
          />
        </div>
      ))}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDropdownOpen((current) => !current)}
          className="border-dashed border-[#46549C]/40 text-[#46549C] hover:bg-[#46549C]/5"
        >
          <Plus size={14} className="mr-1" />
          항목 추가
        </Button>

        {dropdownOpen && (
          <>
            <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg">
              {fieldTypes.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">항목 없음</div>
              ) : (
                fieldTypes.map((fieldType) => (
                  <button
                    key={fieldType.id}
                    type="button"
                    onClick={() => addField(fieldType)}
                    className="w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                  >
                    {fieldType.name}
                  </button>
                ))
              )}
            </div>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}
