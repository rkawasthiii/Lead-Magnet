'use client';

import CopyButton from '@/components/ui/CopyButton';
import { Download } from 'lucide-react';

export default function CopyTab({ copyResult }) {
  if (!copyResult) {
    return <div className="text-[#777] text-center py-12">Rewritten copy will appear here after generation.</div>;
  }

  function handleDownload() {
    const blob = new Blob([copyResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page-copy.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#777]">Paste this into a Google Doc. Customize the [bracketed] fields.</p>
        <div className="flex items-center gap-2">
          <CopyButton text={copyResult} label="Copy All" />
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-[#333] text-[#aaa] hover:border-[#555] hover:text-white transition-colors"
          >
            <Download size={14} />
            Download .txt
          </button>
        </div>
      </div>

      <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg p-6 font-mono text-sm text-[#ccc] leading-[1.8] max-h-[600px] overflow-y-auto whitespace-pre-wrap">
        {copyResult}
      </div>
    </div>
  );
}
