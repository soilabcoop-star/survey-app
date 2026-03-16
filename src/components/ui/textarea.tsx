import type { TextareaHTMLAttributes } from 'react';

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#46549C] focus:ring-2 focus:ring-[#46549C]/15 ${className}`.trim()}
      {...props}
    />
  );
}
