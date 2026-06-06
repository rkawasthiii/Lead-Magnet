'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import Toast from '@/components/ui/Toast';
import { Save, RotateCcw, FileText } from 'lucide-react';

const SKILLS = [
  { name: 'audit', label: 'Audit', description: 'How pages are scored and what the AI looks for' },
  { name: 'copy', label: 'Copy', description: 'Landing page structure, Hormozi rules, forbidden phrases' },
  { name: 'leadmagnet', label: 'Lead Magnet', description: '5-section framework and prompt generation rules' },
  { name: 'outreach', label: 'Outreach', description: 'Tone rules, pricing framing, all 9 script templates' },
];

export default function SkillsPage() {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [businesses, setBusinesses] = useState([]);
  const [activeSkill, setActiveSkill] = useState('audit');
  const [skillContents, setSkillContents] = useState({});
  const [savedContents, setSavedContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const loadBusinesses = useCallback(async () => {
    const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
    setBusinesses(data || []);
  }, [supabase]);

  useEffect(() => {
    loadBusinesses();
    loadAllSkills();
  }, [loadBusinesses]);

  async function loadAllSkills() {
    setLoading(true);
    const res = await fetch('/api/skills-all');
    const data = await res.json();
    if (!data.error) {
      setSkillContents(data);
      setSavedContents(data);
    }
    setLoading(false);
  }

  function handleContentChange(value) {
    setSkillContents((prev) => ({ ...prev, [activeSkill]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const content = skillContents[activeSkill];

    const res = await fetch(`/api/skills/${activeSkill}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setSavedContents((prev) => ({ ...prev, [activeSkill]: content }));
      setLastSaved(new Date().toLocaleTimeString());
      setToast({ message: 'Skill saved. Applied to all future runs instantly.', type: 'success' });
    } else {
      setToast({ message: 'Failed to save skill.', type: 'error' });
    }
    setSaving(false);
  }

  async function handleReset() {
    const res = await fetch(`/api/skills/${activeSkill}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.content) {
      setSkillContents((prev) => ({ ...prev, [activeSkill]: data.content }));
      setSavedContents((prev) => ({ ...prev, [activeSkill]: data.content }));
      setLastSaved(new Date().toLocaleTimeString());
      setToast({ message: 'Skill reset to default.', type: 'success' });
    }
  }

  const currentContent = skillContents[activeSkill] || '';
  const hasChanges = currentContent !== (savedContents[activeSkill] || '');

  return (
    <Layout businesses={businesses}>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">AI Skills</h1>
            <p className="text-sm text-[#777] mt-1">Edit the prompts that control how the AI generates each output. Changes apply instantly.</p>
          </div>
          {lastSaved && (
            <span className="text-[11px] text-[#555]">Last saved: {lastSaved}</span>
          )}
        </div>

        <div className="flex gap-6">
          <div className="w-[200px] shrink-0 space-y-1">
            {SKILLS.map(({ name, label, description }) => {
              const modified = (skillContents[name] || '') !== (savedContents[name] || '');
              return (
                <button
                  key={name}
                  onClick={() => setActiveSkill(name)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeSkill === name
                      ? 'bg-[#181818] border border-[#F5FF5C]/30 text-white'
                      : 'text-[#777] hover:text-white hover:bg-[#111] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} className={activeSkill === name ? 'text-[#F5FF5C]' : ''} />
                    <span className="text-sm font-medium">{label}</span>
                    {modified && <div className="w-1.5 h-1.5 rounded-full bg-[#F5FF5C] ml-auto" />}
                  </div>
                  <p className="text-[11px] text-[#555] mt-1 leading-tight">{description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              {hasChanges && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F5FF5C]" />
                  <span className="text-[11px] text-[#F5FF5C]">Unsaved changes</span>
                </div>
              )}

              {loading ? (
                <div className="h-[500px] bg-[#0C0C0C] rounded-lg animate-pulse" />
              ) : (
                <textarea
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  spellCheck={false}
                  className="w-full h-[500px] px-4 py-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-lg text-[#ccc] font-mono text-sm leading-relaxed resize-y focus:border-[#F5FF5C] focus:outline-none"
                />
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors disabled:opacity-40"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#333] text-[#aaa] rounded-lg hover:border-[#555] hover:text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset to Default
                  </button>
                </div>

                <span className="text-[11px] text-[#555]">
                  {currentContent.length} chars
                </span>
              </div>
            </div>

            <div className="bg-[#181818] border border-[#222] rounded-lg p-4 text-sm text-[#777]">
              Changes are saved to your account and override the default skill file. Every future pipeline run uses your edited version immediately.
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
