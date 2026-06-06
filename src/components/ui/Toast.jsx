'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
        type === 'success'
          ? 'bg-[#081A0E] border-[#0E3A1E] text-[#3ECF8E]'
          : 'bg-[#1A0808] border-[#3A1212] text-[#EF4444]'
      }`}>
        {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
