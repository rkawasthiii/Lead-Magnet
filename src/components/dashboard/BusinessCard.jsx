'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Badge from '../ui/Badge';

export default function BusinessCard({ business, tracking, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const stepsCompleted = tracking
    ? [
        tracking.loom_sent,
        tracking.dm_replied,
        tracking.wise_link_sent,
        tracking.payment_received,
        tracking.google_doc_written,
        tracking.lead_magnet_created,
        tracking.delivered_via_dm,
        tracking.testimonial_asked,
        tracking.testimonial_received,
      ].filter(Boolean).length
    : 0;

  const statusLabel = tracking?.deal_status?.replace('_', ' ') || 'new';
  const timeAgo = getTimeAgo(business.updated_at || business.created_at);

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setDeleting(true);
    setError('');
    const supabase = createClient();
    const { error: deleteError, count } = await supabase
      .from('businesses')
      .delete({ count: 'exact' })
      .eq('id', business.id);

    if (deleteError) {
      setError(`Delete failed: ${deleteError.message}`);
      setDeleting(false);
      setConfirming(false);
      return;
    }

    if (count === 0) {
      setError('Delete blocked — try signing out and back in');
      setDeleting(false);
      setConfirming(false);
      return;
    }

    onDelete?.();
  }

  return (
    <Link href={`/business/${business.id}`}>
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#333] hover:-translate-y-0.5 transition-all cursor-pointer relative group">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-white">{business.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {business.niche && <Badge>{business.niche}</Badge>}
              <Badge variant={statusLabel === 'closed won' ? 'success' : 'default'}>
                {statusLabel}
              </Badge>
            </div>
            {business.website_url && (
              <p className="text-[11px] text-[#555] mt-1.5 truncate max-w-[250px]">
                {business.website_url.replace(/^https?:\/\//, '')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                confirming
                  ? 'bg-[#1A0808] border border-[#3A1212] text-[#EF4444] opacity-100'
                  : 'text-[#555] hover:text-[#EF4444] hover:bg-[#1A0808]'
              }`}
              title={confirming ? 'Click again to confirm' : 'Delete business'}
            >
              <Trash2 size={14} />
            </button>
            <ArrowRight size={16} className="text-[#555]" />
          </div>
        </div>

        {confirming && (
          <p className="text-[10px] text-[#EF4444] mt-2">Click trash again to confirm delete</p>
        )}
        {error && (
          <p className="text-[10px] text-[#EF4444] mt-2">{error}</p>
        )}

        {tracking && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-[#777] mb-1">
              <span>{stepsCompleted}/9 steps</span>
              <span>{timeAgo}</span>
            </div>
            <div className="h-1 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F5FF5C] rounded-full transition-all"
                style={{ width: `${(stepsCompleted / 9) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
