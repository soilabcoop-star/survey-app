'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'destructive';

interface ToastItem {
  id: string;
  title: string;
  variant: ToastVariant;
}

interface ToastOptions {
  title: string;
  variant?: ToastVariant;
}

const ToastContext = createContext<{ toast: (options: ToastOptions) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, variant = 'default' }: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, variant }]);
      window.setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              item.variant === 'destructive'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            <p className="text-sm font-medium">{item.title}</p>
            <button onClick={() => removeToast(item.id)} className="text-current/60 hover:text-current">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within Toaster');
  }
  return context;
}
