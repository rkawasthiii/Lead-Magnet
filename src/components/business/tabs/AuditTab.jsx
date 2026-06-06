'use client';

import ScoreGrid from '@/components/ui/ScoreGrid';
import CopyButton from '@/components/ui/CopyButton';

export default function AuditTab({ auditResult }) {
  if (!auditResult) {
    return <div className="text-[#777] text-center py-12">Audit results will appear here after analysis.</div>;
  }

  return (
    <div className="space-y-6">
      {auditResult.parseConfidence === 'failed' && (
        <div className="bg-[#1A0808] border border-[#3A1212] rounded-lg p-4 text-sm text-[#EF4444]">
          Warning: The AI response could not be parsed correctly. Scores may be inaccurate. Try re-running the pipeline or pasting the page content manually.
        </div>
      )}
      {auditResult.parseConfidence === 'low' && (
        <div className="bg-[#1A1200] border border-[#3A2800] rounded-lg p-4 text-sm text-[#F0A500]">
          Warning: Limited content was detected on this page. Some results may be based on incomplete data. Consider pasting the landing page copy manually for better accuracy.
        </div>
      )}
      <ScoreGrid scores={auditResult.scores} />

      <div className="bg-[#1A0808] border border-[#3A1212] rounded-xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-[#EF4444] mb-2">The #1 Money Leak</p>
        <p className="text-lg text-white font-medium">{auditResult.leak}</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-[#777] mb-3">Detected Context</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#777]">Business: </span>
            <span className="text-white">{auditResult.businessName}</span>
          </div>
          <div>
            <span className="text-[#777]">Niche: </span>
            <span className="text-white">{auditResult.niche}</span>
          </div>
          <div>
            <span className="text-[#777]">City: </span>
            <span className="text-white">{auditResult.city}</span>
          </div>
          <div>
            <span className="text-[#777]">CTA: </span>
            <span className="text-white">{auditResult.currentCta}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[#777]">Core Offer: </span>
            <span className="text-white">{auditResult.coreOffer || 'Not detected'}</span>
          </div>
        </div>
      </div>

      {auditResult.leadMagnetTitle && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#777] mb-2">Lead Magnet Title</p>
          <p className="text-white text-sm font-medium">{auditResult.leadMagnetTitle}</p>
        </div>
      )}

      <div className="bg-[#111] border border-[#F5FF5C]/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wider text-[#F5FF5C]">Loom Opening Line</p>
          <CopyButton text={auditResult.loomHook} label="Copy" />
        </div>
        <p className="text-white text-sm leading-relaxed">{auditResult.loomHook}</p>
      </div>

      {auditResult.avatarPain && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#777] mb-2">Avatar Pain</p>
          <p className="text-[#ccc] text-sm">{auditResult.avatarPain}</p>
        </div>
      )}
    </div>
  );
}
