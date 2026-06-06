'use client';

import { useState } from 'react';
import CopyButton from '@/components/ui/CopyButton';
import Badge from '@/components/ui/Badge';

const stageBadgeVariant = {
  cold: 'info',
  followup: 'warning',
  scarcity: 'warning',
  'obj-price': 'danger',
  'obj-trust': 'danger',
  'obj-agency': 'danger',
  'obj-call': 'danger',
  close: 'success',
  loom: 'accent',
};

export default function OutreachTab({ outreachResult }) {
  const scripts = outreachResult?.scripts || [];
  const allIndices = new Set(scripts.map((_, i) => i));
  const [expandedSet, setExpandedSet] = useState(allIndices);

  if (!scripts.length) {
    return <div className="text-[#777] text-center py-12">Outreach scripts will appear here after generation.</div>;
  }

  const allExpanded = expandedSet.size === scripts.length;

  function toggleIdx(idx) {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  function toggleAll() {
    if (allExpanded) {
      setExpandedSet(new Set());
    } else {
      setExpandedSet(new Set(scripts.map((_, i) => i)));
    }
  }

  const emptyCount = scripts.filter((s) => s.empty || !s.text).length;

  return (
    <div className="space-y-3">
      {emptyCount > 0 && scripts.length > 1 && (
        <div className="bg-[#1A1200] border border-[#3A2800] rounded-lg p-3 text-sm text-[#F0A500]">
          {emptyCount} of {scripts.length} scripts were not generated. Try re-running outreach for complete results.
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-xs text-[#777] hover:text-white transition-colors px-2 py-1"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      {scripts.map((script, i) => {
        const isExpanded = expandedSet.has(i);
        return (
          <div key={i} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div
              onClick={() => toggleIdx(i)}
              className="flex items-center justify-between p-4 hover:bg-[#181818] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-4 h-4 text-[#777] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white text-sm font-medium">{script.label}</span>
                <Badge variant={stageBadgeVariant[script.stage] || 'default'}>
                  {script.stage}
                </Badge>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton text={script.text} label="Copy" />
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg p-4 font-mono text-sm text-[#ccc] leading-[1.8] whitespace-pre-wrap">
                  {script.text || '(No content generated for this script)'}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
