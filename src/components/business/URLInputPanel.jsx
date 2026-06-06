'use client';

import { useState } from 'react';
import { Globe, ClipboardPaste, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

export default function URLInputPanel({ onSubmitURL, onSubmitManual, loading, lastUrl, hasResults }) {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState(lastUrl || '');
  const [manualCopy, setManualCopy] = useState('');
  const [showInput, setShowInput] = useState(!hasResults);

  function handleURLSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    if (!url.startsWith('http')) {
      onSubmitURL('https://' + url.trim());
    } else {
      onSubmitURL(url.trim());
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCopy.trim()) return;
    onSubmitManual(manualCopy.trim());
  }

  function handleRerun() {
    if (lastUrl) {
      onSubmitURL(lastUrl);
    } else {
      setShowInput(true);
    }
  }

  // If results exist, show compact re-run bar
  if (hasResults && !showInput) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {lastUrl && (
            <span className="text-sm text-[#777] font-mono truncate max-w-[400px]">{lastUrl}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRerun}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-[#333] text-[#ccc] rounded-lg hover:border-[#F5FF5C] hover:text-[#F5FF5C] transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Re-run Pipeline
          </button>
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors text-sm"
          >
            New Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'url' ? 'bg-[#222] text-white' : 'text-[#777] hover:text-white'
          }`}
        >
          <Globe size={14} />
          Enter URL
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'manual' ? 'bg-[#222] text-white' : 'text-[#777] hover:text-white'
          }`}
        >
          <ClipboardPaste size={14} />
          Paste Copy Manually
        </button>
        {hasResults && (
          <button
            onClick={() => setShowInput(false)}
            className="ml-auto text-sm text-[#777] hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {mode === 'url' ? (
        <form onSubmit={handleURLSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="https://their-landing-page.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#0C0C0C] border border-[#222] rounded-lg text-white placeholder-[#555] focus:border-[#F5FF5C] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Analyze
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <p className="text-sm text-[#777]">
            Go to the landing page, select all text (Ctrl+A), copy it, and paste it below.
          </p>
          <textarea
            placeholder="Paste the full landing page text here..."
            value={manualCopy}
            onChange={(e) => setManualCopy(e.target.value)}
            disabled={loading}
            rows={8}
            className="w-full px-4 py-3 bg-[#0C0C0C] border border-[#222] rounded-lg text-white placeholder-[#555] focus:border-[#F5FF5C] focus:outline-none font-mono text-sm resize-y disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !manualCopy.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Continue with this copy
          </button>
        </form>
      )}
    </div>
  );
}
