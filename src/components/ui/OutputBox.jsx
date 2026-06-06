'use client';

import CopyButton from './CopyButton';

export default function OutputBox({ content, label = '', showCopy = true, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#777] uppercase tracking-wider">{label}</p>
          {showCopy && content && <CopyButton text={content} />}
        </div>
      )}
      <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg p-4 font-mono text-sm text-[#ccc] leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-wrap">
        {content || <span className="text-[#444]">No content yet</span>}
      </div>
    </div>
  );
}
