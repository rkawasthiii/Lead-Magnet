'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import Toast from '@/components/ui/Toast';

const SKILLS = [
  { name: 'audit', label: 'Audit' },
  { name: 'copy', label: 'Copy' },
  { name: 'leadmagnet', label: 'Lead Magnet' },
  { name: 'outreach', label: 'Outreach' },
];

export default function SkillsTab() {
  const [activeSkill, setActiveSkill] = useState('audit');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSkill(activeSkill);
  }, [activeSkill]);

  async function loadSkill(name) {
    setLoading(true);
    const res = await fetch(`/api/skills/${name}`);
    const data = await res.json();
    setContent(data.content || '');
    setLoading(false);
  }

  async function handleSave() {
    const res = await fetch(`/api/skills/${activeSkill}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setToast({ message: 'Skill saved. Applied to all future runs.', type: 'success' });
    } else {
      setToast({ message: 'Failed to save skill.', type: 'error' });
    }
  }

  async function handleReset() {
    const res = await fetch(`/api/skills/${activeSkill}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.content) {
      setContent(data.content);
      setToast({ message: 'Skill reset to default.', type: 'success' });
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#1A1200] border border-[#3A2800] rounded-lg p-3 text-sm text-[#F0A500]">
        Editing these prompts changes how the AI generates output. Changes apply to all future runs.
      </div>

      <div className="flex items-center gap-2">
        {SKILLS.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => setActiveSkill(name)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeSkill === name ? 'bg-[#222] text-white' : 'text-[#777] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-[400px] bg-[#0C0C0C] rounded-lg animate-pulse" />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[400px] px-4 py-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg text-[#ccc] font-mono text-sm leading-relaxed resize-y focus:border-[#F5FF5C] focus:outline-none"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors"
        >
          <Save size={14} />
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border border-[#333] text-[#aaa] rounded-lg hover:border-[#555] hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
          Reset to Default
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
