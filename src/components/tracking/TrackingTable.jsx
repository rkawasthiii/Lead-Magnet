'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const CHECKLIST_ITEMS = [
  { key: 'loom_sent', label: 'Loom Sent' },
  { key: 'dm_replied', label: 'DM Replied' },
  { key: 'wise_link_sent', label: 'Wise Sent' },
  { key: 'payment_received', label: 'Paid' },
  { key: 'google_doc_written', label: 'Doc Written' },
  { key: 'lead_magnet_created', label: 'Lead Mag' },
  { key: 'delivered_via_dm', label: 'Delivered' },
  { key: 'testimonial_asked', label: 'Testi Asked' },
  { key: 'testimonial_received', label: 'Testi Got' },
];

const STATUS_OPTIONS = ['prospecting', 'pitched', 'negotiating', 'closed_won', 'closed_lost'];

const statusVariant = {
  prospecting: 'default',
  pitched: 'info',
  negotiating: 'warning',
  closed_won: 'success',
  closed_lost: 'danger',
};

export default function TrackingTable({ tracking, businesses, onUpdate }) {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [notes, setNotes] = useState({});
  const [showNotes, setShowNotes] = useState(null);
  const [mutationError, setMutationError] = useState('');

  async function toggleCheck(trackingId, field, currentValue) {
    setMutationError('');
    const updates = { [field]: !currentValue };
    if (!currentValue) {
      updates[field + '_at'] = new Date().toISOString();
    } else {
      updates[field + '_at'] = null;
    }
    const { error, count } = await supabase.from('deal_tracking').update(updates, { count: 'exact' }).eq('id', trackingId);
    if (error) { setMutationError(`Update failed: ${error.message}`); return; }
    if (count === 0) { setMutationError('Update failed — try refreshing the page'); return; }
    onUpdate();
  }

  async function updateStatus(trackingId, status) {
    setMutationError('');
    const { error, count } = await supabase.from('deal_tracking').update({ deal_status: status }, { count: 'exact' }).eq('id', trackingId);
    if (error) { setMutationError(`Status update failed: ${error.message}`); return; }
    if (count === 0) { setMutationError('Status update failed — try refreshing the page'); return; }
    onUpdate();
  }

  async function saveNotes(trackingId) {
    setMutationError('');
    const { error, count } = await supabase.from('deal_tracking').update({ notes: notes[trackingId] }, { count: 'exact' }).eq('id', trackingId);
    if (error) { setMutationError(`Notes save failed: ${error.message}`); return; }
    if (count === 0) { setMutationError('Notes save failed — try refreshing the page'); return; }
    setShowNotes(null);
    onUpdate();
  }

  async function updateAmount(trackingId, amount) {
    setMutationError('');
    const { error, count } = await supabase.from('deal_tracking').update({ payment_amount: parseFloat(amount) || 0 }, { count: 'exact' }).eq('id', trackingId);
    if (error) { setMutationError(`Amount update failed: ${error.message}`); return; }
    if (count === 0) { setMutationError('Amount update failed — try refreshing the page'); return; }
    onUpdate();
  }

  function getBusiness(businessId) {
    return businesses.find((b) => b.id === businessId);
  }

  function getProgress(track) {
    return CHECKLIST_ITEMS.filter((item) => track[item.key]).length;
  }

  function getTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <div className="overflow-x-auto">
      {mutationError && (
        <div className="mb-3 bg-[#1A0808] border border-[#3A1212] rounded-lg px-3 py-2 text-xs text-[#EF4444] flex items-center justify-between">
          <span>{mutationError}</span>
          <button onClick={() => setMutationError('')} className="text-[#EF4444] hover:text-white ml-2">×</button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222]">
            <th className="text-left py-3 px-3 text-[#777] font-medium text-[11px] uppercase">Business</th>
            <th className="text-left py-3 px-2 text-[#777] font-medium text-[11px] uppercase">Status</th>
            {CHECKLIST_ITEMS.map((item) => (
              <th key={item.key} className="text-center py-3 px-1 text-[#777] font-medium text-[10px] uppercase">
                {item.label}
              </th>
            ))}
            <th className="text-center py-3 px-2 text-[#777] font-medium text-[11px] uppercase">$</th>
            <th className="text-center py-3 px-2 text-[#777] font-medium text-[11px] uppercase">Notes</th>
            <th className="text-center py-3 px-2 text-[#777] font-medium text-[11px] uppercase">Progress</th>
          </tr>
        </thead>
        <tbody>
          {tracking.map((track) => {
            const biz = getBusiness(track.business_id);
            const progress = getProgress(track);
            const rowBg = track.deal_status === 'closed_won' ? 'bg-[#081A0E]/30'
              : track.deal_status === 'closed_lost' ? 'bg-[#1A0808]/30 opacity-60'
              : track.deal_status === 'negotiating' ? 'bg-[#1A1200]/20'
              : track.deal_status === 'pitched' ? 'bg-[#081018]/20'
              : '';

            return (
              <tr key={track.id} className={`border-b border-[#1A1A1A] hover:bg-[#111] ${rowBg}`}>
                <td className="py-3 px-3">
                  <span className="text-white font-medium">{biz?.name || '—'}</span>
                  {biz?.niche && <Badge className="ml-2">{biz.niche}</Badge>}
                </td>
                <td className="py-3 px-2">
                  <select
                    value={track.deal_status}
                    onChange={(e) => updateStatus(track.id, e.target.value)}
                    className="bg-[#0C0C0C] border border-[#222] rounded px-2 py-1 text-xs text-[#ccc]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
                {CHECKLIST_ITEMS.map((item) => (
                  <td key={item.key} className="text-center py-3 px-1">
                    <div className="flex flex-col items-center">
                      <input
                        type="checkbox"
                        checked={track[item.key] || false}
                        onChange={() => toggleCheck(track.id, item.key, track[item.key])}
                        className="w-4 h-4 rounded border-[#333] bg-[#0C0C0C] accent-[#F5FF5C] cursor-pointer"
                      />
                      {track[item.key + '_at'] && (
                        <span className="text-[9px] text-[#555] mt-0.5">
                          {getTimeAgo(track[item.key + '_at'])}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center py-3 px-2">
                  {track.payment_received && (
                    <input
                      type="number"
                      key={`${track.id}-amount-${track.payment_amount}`}
                      defaultValue={track.payment_amount || ''}
                      onBlur={(e) => updateAmount(track.id, e.target.value)}
                      className="w-16 bg-[#0C0C0C] border border-[#222] rounded px-1 py-0.5 text-xs text-[#3ECF8E] text-center"
                      placeholder="$"
                    />
                  )}
                </td>
                <td className="text-center py-3 px-2">
                  <button
                    onClick={() => { setShowNotes(track.id); setNotes((p) => ({ ...p, [track.id]: track.notes || '' })); }}
                    className="text-[#777] hover:text-white"
                  >
                    <MessageSquare size={14} />
                  </button>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F5FF5C] rounded-full" style={{ width: `${(progress / 9) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-[#777]">{progress}/9</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNotes(null)} />
          <div className="relative bg-[#111] border border-[#222] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-medium mb-3">Notes</h3>
            <textarea
              value={notes[showNotes] || ''}
              onChange={(e) => setNotes((p) => ({ ...p, [showNotes]: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 bg-[#0C0C0C] border border-[#222] rounded-lg text-[#ccc] text-sm focus:border-[#F5FF5C] focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowNotes(null)} className="px-3 py-1.5 text-sm text-[#777] hover:text-white">Cancel</button>
              <button onClick={() => saveNotes(showNotes)} className="px-3 py-1.5 text-sm bg-[#F5FF5C] text-black rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
