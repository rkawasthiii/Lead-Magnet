'use client';

import { Check, Loader2, Circle, AlertCircle, StopCircle } from 'lucide-react';

const steps = [
  { key: 'scrape', label: 'Scraping' },
  { key: 'audit', label: 'Auditing' },
  { key: 'copy', label: 'Writing Copy' },
  { key: 'leadmagnet', label: 'Lead Magnet' },
  { key: 'outreach', label: 'Outreach Scripts' },
];

const stepOrder = ['scrape', 'audit', 'copy', 'leadmagnet', 'outreach', 'done'];

export default function ProgressStepper({ currentStep, pipelineStatus, scrapeStatus }) {
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <div className="flex items-center justify-between">
        {steps.map(({ key, label }, i) => {
          const stepIdx = stepOrder.indexOf(key);
          let status = 'pending';

          if (pipelineStatus === 'complete') {
            status = 'complete';
          } else if (pipelineStatus === 'error' && currentIdx === stepIdx) {
            status = 'error';
          } else if (pipelineStatus === 'stopped' && currentIdx === stepIdx) {
            status = 'stopped';
          } else if (pipelineStatus === 'scraping' && key === 'scrape') {
            status = 'active';
          } else if (currentIdx > stepIdx) {
            // For manual paste, mark scrape as skipped instead of complete
            if (key === 'scrape' && scrapeStatus === 'manual') {
              status = 'skipped';
            } else {
              status = 'complete';
            }
          } else if (currentIdx === stepIdx && pipelineStatus === 'running') {
            status = 'active';
          }

          return (
            <div key={key} className="flex items-center gap-2">
              {status === 'complete' && (
                <div className="w-6 h-6 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center">
                  <Check size={14} className="text-[#3ECF8E]" />
                </div>
              )}
              {status === 'skipped' && (
                <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center">
                  <Check size={14} className="text-[#777]" />
                </div>
              )}
              {status === 'active' && (
                <div className="w-6 h-6 rounded-full bg-[#F5FF5C]/20 flex items-center justify-center">
                  <Loader2 size={14} className="text-[#F5FF5C] animate-spin" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-6 h-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                  <AlertCircle size={14} className="text-[#EF4444]" />
                </div>
              )}
              {status === 'stopped' && (
                <div className="w-6 h-6 rounded-full bg-[#F0A500]/20 flex items-center justify-center">
                  <StopCircle size={14} className="text-[#F0A500]" />
                </div>
              )}
              {status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center">
                  <Circle size={10} className="text-[#555]" />
                </div>
              )}
              <span className={`text-sm ${
                status === 'complete' ? 'text-[#3ECF8E]' :
                status === 'active' ? 'text-[#F5FF5C]' :
                status === 'error' ? 'text-[#EF4444]' :
                status === 'stopped' ? 'text-[#F0A500]' :
                status === 'skipped' ? 'text-[#777]' : 'text-[#555]'
              }`}>
                {key === 'scrape' && scrapeStatus === 'manual' ? 'Manual' : label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-2 ${
                  currentIdx > stepIdx ? 'bg-[#3ECF8E]' : 'bg-[#222]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
