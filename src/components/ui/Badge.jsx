'use client';

const variants = {
  default: 'bg-[#222] text-[#aaa]',
  success: 'bg-[#081A0E] text-[#3ECF8E] border border-[#0E3A1E]',
  warning: 'bg-[#1A1200] text-[#F0A500] border border-[#3A2800]',
  danger: 'bg-[#1A0808] text-[#EF4444] border border-[#3A1212]',
  info: 'bg-[#081018] text-[#3B82F6] border border-[#122A4E]',
  accent: 'bg-[#1A1C00] text-[#F5FF5C] border border-[#3A3C00]',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
