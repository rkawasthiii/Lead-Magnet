'use client';

import CopyButton from '@/components/ui/CopyButton';
import { RefreshCw } from 'lucide-react';

export default function LeadMagnetTab({ leadMagnetResult, onRegenerate, regenerating }) {
  if (!leadMagnetResult) {
    return <div className="text-[#777] text-center py-12">Lead magnet prompt will appear here after generation.</div>;
  }

  return (
    <div className="space-y-6">
      {leadMagnetResult.title && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-[#777] mb-2">Lead Magnet Title</p>
            <CopyButton text={leadMagnetResult.title} />
          </div>
          <p className="text-xl font-medium text-white">{leadMagnetResult.title}</p>
        </div>
      )}

      {leadMagnetResult.whatItGenerates && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#777] mb-3">What this prompt will generate</p>
          <div className="text-sm text-[#ccc] whitespace-pre-wrap">{leadMagnetResult.whatItGenerates}</div>
        </div>
      )}

      <div className="bg-[#111] border border-[#F5FF5C]/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-[#F5FF5C]">Paste this into Claude or ChatGPT →</p>
            <p className="text-[11px] text-[#777] mt-0.5">
              All business context is baked in. The AI will output a complete 5-section lead magnet PDF. Zero extra input needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-[#333] text-[#aaa] hover:border-[#555] hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
              Regenerate
            </button>
            <CopyButton
              text={leadMagnetResult.runnablePrompt}
              label="Copy Prompt"
              className="!bg-[#F5FF5C] !text-black !border-[#F5FF5C] hover:!bg-[#E8F050]"
            />
          </div>
        </div>

        <div className="mt-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg p-4 font-mono text-sm text-[#ccc] leading-[1.8] max-h-[400px] overflow-y-auto whitespace-pre-wrap">
          {leadMagnetResult.runnablePrompt}
        </div>
      </div>

      <div className="bg-[#181818] border border-[#222] rounded-lg p-4 text-sm text-[#777]">
        This lead magnet is for your client to offer to their customers for free.
        It solves the homeowner's first problem, reveals the rest, and closes with a call to action.
        Deliver this as a 1-page PDF alongside the rewritten landing page copy.
      </div>
    </div>
  );
}
