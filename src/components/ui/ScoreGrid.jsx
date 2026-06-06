'use client';

const scoreLabels = {
  commitment_demand: 'Commitment Demand',
  emotional_trigger: 'Emotional Trigger',
  trust_signal: 'Trust Signal',
  lead_capture: 'Lead Capture',
  specificity: 'Specificity',
};

function getScoreColor(score) {
  if (score <= 4) return { bg: 'bg-[#1A0808]', border: 'border-[#3A1212]', text: 'text-[#EF4444]' };
  if (score <= 6) return { bg: 'bg-[#1A1200]', border: 'border-[#3A2800]', text: 'text-[#F0A500]' };
  return { bg: 'bg-[#081A0E]', border: 'border-[#0E3A1E]', text: 'text-[#3ECF8E]' };
}

export default function ScoreGrid({ scores }) {
  if (!scores) return (
    <div className="grid grid-cols-5 gap-3">
      {Object.entries(scoreLabels).map(([key, label]) => (
        <div key={key} className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#555]">—</p>
          <p className="text-[11px] text-[#777] mt-1 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-5 gap-3">
      {Object.entries(scoreLabels).map(([key, label]) => {
        const score = scores[key] || 0;
        const colors = getScoreColor(score);
        return (
          <div
            key={key}
            className={`${colors.bg} ${colors.border} border rounded-xl p-4 text-center`}
          >
            <p className={`text-3xl font-bold ${colors.text}`}>{score}</p>
            <p className="text-[11px] text-[#777] mt-1 leading-tight">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
